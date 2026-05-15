type PlaceholderPageProps = {
  eyebrow: string;
  title: string;
};

export function PlaceholderPage({ eyebrow, title }: PlaceholderPageProps) {
  return (
    <section className="placeholder-panel">
      <p className="eyebrow">{eyebrow}</p>
      <h2>{title}</h2>
      <p>Modulo preparado para integracion posterior.</p>
    </section>
  );
}
