// pages/api/anime/[...slug].js
export default async function handler(req, res) {
    try {
        const { slug = [], ...query } = req.query;
        const path = Array.isArray(slug) ? slug.join("/") : slug || "";

        const queryString = new URLSearchParams(query).toString();
        const target = `https://www.sankavollerei.com/anime/${path}${
            queryString ? `?${queryString}` : ""
        }`;
        console.log("PROXY TARGET:", target);

        // forward headers/method/body if needed (GET suffices for most)
        const options = { method: req.method || "GET" };
        if (req.method !== "GET" && req.method !== "HEAD") {
            options.body = JSON.stringify(req.body);
            options.headers = { "content-type": "application/json" };
        }

        const r = await fetch(target, options);

        // jika response bukan json, direct stream (mis. file)
        const contentType = r.headers.get("content-type") || "";
        if (!contentType.includes("application/json")) {
            const buffer = await r.arrayBuffer();
            res.setHeader("content-type", contentType);
            res.status(r.status).send(Buffer.from(buffer));
            return;
        }

        const json = await r.json();

        // bypass filter untuk endpoint episode biar semua server + quality ikut
        if (path.startsWith("episode/")) {
            res.setHeader("content-type", "application/json");
            res.status(r.status || 200).json(json);
            return;
        }
        // helper: cek apakah object/array mengandung kata "otakudesu" di properti string
        const hasOtakudesu = obj => {
            if (!obj) return false;
            if (typeof obj === "string")
                return obj.toLowerCase().includes("otakudesu");
            if (typeof obj === "number" || typeof obj === "boolean")
                return false;
            if (Array.isArray(obj)) return obj.some(hasOtakudesu);
            if (typeof obj === "object") {
                for (const k in obj) {
                    if (hasOtakudesu(obj[k])) return true;
                }
            }
            return false;
        };

        // recursive filter: jika data adalah array of objects -> keep only items with otakudesu
        const filterData = node => {
            if (Array.isArray(node)) {
                // if array of objects, filter; else pass through
                const maybeObj = node.find(i => typeof i === "object");
                if (maybeObj) {
                    return node.filter(item => hasOtakudesu(item));
                }
                return node;
            }
            if (node && typeof node === "object") {
                const out = Array.isArray(node) ? [] : {};
                for (const k in node) {
                    out[k] = filterData(node[k]);
                }
                return out;
            }
            return node;
        };

        // Try to filter common shapes: data.data.* arrays or top-level data arrays
        let transformed = json;
        try {
            if (json && typeof json === "object") {
                // if top-level has data which is array or object with arrays
                if (Array.isArray(json.data)) {
                    transformed = {
                        ...json,
                        data: json.data.filter(item => hasOtakudesu(item))
                    };
                } else if (json.data && typeof json.data === "object") {
                    // walk and filter sub-arrays
                    transformed = { ...json, data: filterData(json.data) };
                } else {
                    // fallback: run filterData on entire payload (safe)
                    transformed = filterData(json);
                }
            }
        } catch (err) {
            transformed = json; // if anything gagal, return original
        }

        // return with same status code from upstream (or 200)
        res.setHeader("content-type", "application/json");
        res.status(r.status || 200).json(transformed);
        console.log(r.data);
    } catch (err) {
        console.error("Proxy error:", err);
        res.status(500).json({
            success: false,
            message: "Proxy error",
            error: String(err)
        });
    }
}
