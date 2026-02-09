import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Navbar from "../../components/Navbar";

export default function Watch() {
  const router = useRouter();
  const { episode } = router.query;
  const [embedUrl, setEmbedUrl] = useState<string | null>(null);

  useEffect(()=>{
    if(!episode) return;
    (async ()=>{
      // First get episode detail to find serverId (api path may vary per source)
      const detailRes = await fetch(`/api/sanka/episode/${episode}`);
      const detailJson = await detailRes.json();
      const server = detailJson?.data?.serverList?.[0] ?? detailJson?.servers?.[0] ?? detailJson?.data?.server ?? null;
      // adapt depending on response shape
      const serverId = server?.id ?? server?.serverId ?? server ?? null;
      if(!serverId){
        // maybe the API returns serverId as something like "187226-0-720p"
        // attempt to find first server key:
        const alt = detailJson?.data;
        // fallback: try to parse any string in response that looks like server id (not robust)
      } else {
        const r = await fetch(`/api/sanka/server/${serverId}`);
        const js = await r.json();
        // the server endpoint usually returns an embed url or direct iframe src
        const url = js?.data?.embed ?? js?.embed ?? js?.url ?? js;
        setEmbedUrl(typeof url === "string" ? url : null);
      }
    })();
  },[episode]);

  return (
    <>
      <Navbar />
      <main className="page">
        {!embedUrl ? <p>Loading player...</p> : (
          <div className="player">
            <iframe src={embedUrl} frameBorder={0} allowFullScreen width="100%" height="540"></iframe>
          </div>
        )}
      </main>

      <style jsx>{`
        .page{padding:16px;background:#050406;min-height:100vh;color:#ddd}
        .player{max-width:1000px;margin:0 auto;border-radius:12px;overflow:hidden}
        @media (max-width:600px){ iframe{height:320px} }
      `}</style>
    </>
  );
}