import Link from "next/link";

type Props = {
  slug: string;
  title: string;
  thumb: string;
};

export default function AnimeCard({ slug, title, thumb }: Props) {
  return (
    <Link href={`/anime/${slug}`}>
      <a className="card">
        <img src={thumb} alt={title} />
        <h3>{title}</h3>
        <style jsx>{`
          .card{width:180px;margin:12px;text-decoration:none;color:inherit;}
          img{width:100%;height:250px;object-fit:cover;border-radius:8px;}
          h3{font-size:14px;margin-top:8px;color:#e9ddff}
        `}</style>
      </a>
    </Link>
  );
}