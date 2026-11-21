export function Education({ education }: { education: string }) {
  return (
    <section className="education" aria-labelledby="education-title">
      <span className="section-number">04</span>
      <div>
        <p className="eyebrow">ОБРАЗОВАНИЕ</p>
        <h2 id="education-title">
          Программная
          <br />
          <em>инженерия</em>
        </h2>
      </div>
      <p>{education}</p>
      <span className="education-star" aria-hidden="true">
        ✦
      </span>
    </section>
  );
}
