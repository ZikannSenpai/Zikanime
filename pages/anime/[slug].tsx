import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Navbar from "../../components/Navbar";
import Link from "next/link";

export default function AnimeDetail() {
  const router = useRouter();
  const { slug } = router.query;
  const [anime, setAnime] = useState<any>(null);
  const [episodes, setEpisodes] = useState<any[]>([]);
  useEffect(()=>{
    if(!slug) return;
    (async ()=>{
      const r = await fetch(`/api/sanka/anime/${slug}`);
      const j = await r.json();
      // API returns detail object; adapt to actual shape
      setAnime(j?.data ?? j);
      // some endpoints include episodes at data.episodes
      const eps = (j?.data?.episodes ?? j?.episodes ?? []);
      setEpisodes(Array.isArray(eps) ? eps : []);
    })();
  },[slug]);

  return (
    <>
      <Navbar />
      <main className="page">
        {!anime ? <p>loading...</p> : (
          <>
            <div className="header">
              <img src={anime.thumbnail ?? anime.image} alt={anime.title ?? anime.name} />
              <div>
                <h1>{anime.title ?? anime.name}</h1>
                <p>{anime.sinopsis ?? anime.description ?? ""}</p>
              </div>
            </div>

            <h2>Episodes</h2>
            <div className="eps">
              {episodes.map((ep:any, idx:number)=>(
                <Link key={idx} href={`/watch/${ep.slug ?? ep.episodeId ?? ep.id}`}>
                  <a className="ep">{ep.title ?? `Episode ${ep.episode}`}</a>
                </Link>
              ))}
            </div>
          </>
        )}
      </main>

      <style jsx>{`
        .page{padding:16px;color:#ddd;background:#050406;min-height:100vh}
        .header{display:flex;gap:16px}
        img{width:200px;height:280px;object-fit:cover;border-radius:8px}
        .eps{display:flex;flex-wrap:wrap;gap:8px;margin-top:8px}
        .ep{background:#120818;padding:8px 12px;border-radius:8px;color:#e9ddff;text-decoration:none}
      `}</style>
    </>
  );
}