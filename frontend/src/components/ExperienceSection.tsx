import type { Experience } from "../api";
import { ArrowIcon } from "./ArrowIcon";
export function ExperienceSection({
  experience,
}: {
  experience: Experience[];
}) {
  return (
    <section id="experience" aria-labelledby="experience-title">
      <div className="section-heading">
        <span className="section-number">02</span>
        <h2 id="experience-title">
          Проектный
          <br />
          опыт
        </h2>
        <p className="section-note">
          Учебные, личные и командные проекты — от desktop до fullstack.
        </p>
      </div>
      <div className="experience-subheading">
        <h3>Избранные проекты</h3>
        <span>{String(experience.length).padStart(2, "0")} / Портфолио</span>
      </div>
      <div className="experience-list">
        {experience.length === 0 ? (
          <p>Опыт пока не добавлен.</p>
        ) : (
          experience.map((item, index) => (
            <article
              className="experience"
              key={`${item.projectName}-${index}`}
            >
              <span className="experience-index">
                {String(index + 1).padStart(2, "0")}
              </span>
              <div>
                <p className="period">{item.period}</p>
                <p className="company">{item.company}</p>
              </div>
              <div>
                <h3>
                  {item.projectName ?? item.company} <ArrowIcon />
                </h3>
                <p className="position">{item.position}</p>
                <p>{item.achievements}</p>
              </div>
            </article>
          ))
        )}
      </div>
    </section>
  );
}
