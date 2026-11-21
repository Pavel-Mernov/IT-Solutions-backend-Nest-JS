export function SkillsSection({ skills }: { skills: { name: string }[] }) {
  return (
    <section className="skills-section" aria-labelledby="skills-title">
      <div className="section-heading">
        <span className="section-number">01</span>
        <h2 id="skills-title">
          Инструменты
          <br />и навыки
        </h2>
      </div>
      <div className="tags">
        {skills.map((skill) => (
          <span key={skill.name} className="tag">
            {skill.name}
          </span>
        ))}
      </div>
    </section>
  );
}
