import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="nav">
      <div className="container">
        <Link href="/"><a className="logo">Zikanime</a></Link>
        <div className="right">
          <Link href="/"><a>Home</a></Link>
        </div>
      </div>
      <style jsx>{`
        .nav{background:linear-gradient(90deg,#0b0b0b, #0f0710);border-bottom:1px solid rgba(255,255,255,0.03);}
        .container{display:flex;justify-content:space-between;align-items:center;padding:12px 18px;}
        .logo{color:#d6b3ff;font-weight:700;font-size:20px;text-decoration:none;}
        .right a{color:#bbb;margin-left:14px;text-decoration:none}
      `}</style>
    </nav>
  );
}
