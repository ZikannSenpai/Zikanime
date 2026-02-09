import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import AnimeCard from "../components/AnimeCard";

export default function Home() {
  const [data, setData] = useState<any[]>([]);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(false);

  async function fetchHome() {
    setLoading(true);
    const r = await fetch("/api/sanka/home");
    const j = await r.json();
    // depending on API structure, adapt. Usually data property holds list
    // safe fallback:
    const list = j?.data ?? j;
    setData(Array.isArray(list) ? list : []);
    setLoading(false);
  }

  async function search() {
    if (!q) return fetchHome();
    setLoading(true);
    const r = await fetch(`/api/sanka/search/${encodeURIComponent(q)}`);
    const j = await r.json();
    const list = j?.data ?? j;
    setData(Array.isArray(list) ? list : []);
    setLoading(false);
  }

  useEffect(() => {
    fetchHome();
  }, []);

  return (
    <>
      <Navbar />
      <main className="page">
        <header className="hero">
          <h1>Zikanime</h1>
          <div className="search">
            <input placeholder="Cari anime..." value={q} onChange={(e)=>setQ(e.target.value)} />
            <button onClick={search}>Search</button>
          </div>
        </header>

        <section>
          {loading ? <p>loading...</p> : null}
          <div className="grid">
            {data.map((item: any, i: number) => (
              <AnimeCard key={i} slug={item.slug ?? item.animeId ?? item.id} title={item.title ?? item.name ?? item.judul} thumb={item.thumbnail ?? item.thumb ?? item.image ?? "/placeholder.png"} />
            ))}
          </div>
        </section>
      </main>

      <style jsx>{`
        .page{padding:16px;color:#ddd;background:#050406;min-height:100vh}
        .hero{display:flex;flex-direction:column;gap:12px;align-items:flex-start;margin-bottom:18px}
        h1{color:#d6b3ff}
        .search{display:flex;gap:8px}
        input{padding:10px;border-radius:8px;border:1px solid rgba(255,255,255,0.06);background:#0b0710;color:#fff}
        button{padding:10px;border-radius:8px;background:linear-gradient(90deg,#6b3cff,#b78cff);border:none;color:#fff}
        .grid{display:flex;flex-wrap:wrap}
        @media (max-width:600px){ .grid{justify-content:center} .card{width:140px} }
      `}</style>
    </>
  );
}