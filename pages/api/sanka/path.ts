import type { NextApiRequest, NextApiResponse } from "next";

const BASE = "https://www.sankavollerei.com/anime";

type CacheEntry = { ts: number; data: any };
const cache = new Map<string, CacheEntry>();
const CACHE_TTL = 30 * 1000; // 30s, adjust as needed

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { path = [] } = req.query as { path: string[] };
    const qs = req.url?.split("?")[1] ?? "";
    const fullPath = path.join("/");
    const target = `${BASE}/${fullPath}${qs ? "?" + qs : ""}`;

    // rate-limit protection (basic)
    const cacheKey = `${req.method}:${target}`;
    const now = Date.now();
    const cached = cache.get(cacheKey);
    if (cached && now - cached.ts < CACHE_TTL) {
      return res.status(200).json(cached.data);
    }

    const fetchRes = await fetch(target, {
      method: req.method,
      headers: {
        "User-Agent": "Zikanime/1.0 (by you)",
        accept: "application/json, text/plain, */*",
      },
    });

    const text = await fetchRes.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }

    // cache GET responses
    if (req.method === "GET") {
      cache.set(cacheKey, { ts: now, data });
    }

    res.status(fetchRes.status).setHeader("content-type", fetchRes.headers.get("content-type") ?? "application/json").send(data);
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: "proxy_error", message: err.message ?? String(err) });
  }
}