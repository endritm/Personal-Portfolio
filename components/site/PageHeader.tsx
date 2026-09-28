import s from "./page.module.css";

export function PageHeader({ eyebrow, title, intro }: { eyebrow?: string; title: string; intro?: string }) {
  return (
    <header className={`wrap ${s.header}`}>
      {eyebrow && <p className="eyebrow">{eyebrow}</p>}
      <h1 className={s.title}>{title}</h1>
      {intro && <p className={s.intro}>{intro}</p>}
    </header>
  );
}

export function Empty({ children }: { children: React.ReactNode }) {
  return <p className={`wrap ${s.empty}`}>{children}</p>;
}
