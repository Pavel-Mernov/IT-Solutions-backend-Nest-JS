import type { Project } from "../api";
import { ArrowIcon } from "./ArrowIcon";
interface Props {
  projects: Project[];
  total: number;
  search: string;
  onSearch: (value: string) => void;
}
export function ProjectsSection({ projects, total, search, onSearch }: Props) {
  return (
    <section id="projects" aria-labelledby="projects-title">
      <div className="projects-heading">
        <div className="section-heading">
          <span className="section-number">03</span>
          <h2 id="projects-title">
            Избранные
            <br />
            проекты <sup>{String(total).padStart(2, "0")}</sup>
          </h2>
        </div>
        <label className="search-label">
          <span>ПОИСК ПО ПРОЕКТАМ</span>
          <input
            type="search"
            placeholder="Название или технология"
            value={search}
            onChange={(event) => onSearch(event.target.value)}
          />
        </label>
      </div>
      <div className="project-grid">
        {projects.map((project, index) => (
          <article
            className={`project-card project-tone-${index % 3}`}
            key={project.url}
          >
            <div className="card-topline">
              <span>/ {String(index + 1).padStart(2, "0")}</span>
              <span>{project.technologies.slice(0, 2).join(" · ")}</span>
            </div>
            <h3>{project.name}</h3>
            <p>{project.description}</p>
            <ul
              className="project-technologies"
              aria-label="Технологии проекта"
            >
              {project.technologies.map((technology) => (
                <li key={technology}>{technology}</li>
              ))}
            </ul>
            <div className="project-links">
              <a
                href={project.url}
                target="_blank"
                rel="noreferrer"
                aria-label={`${project.name}: репозиторий`}
              >
                Репозиторий <ArrowIcon />
              </a>
              {project.website && (
                <a
                  href={project.website}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={`${project.name}: сайт`}
                >
                  Сайт <ArrowIcon />
                </a>
              )}
            </div>
          </article>
        ))}
      </div>
      {projects.length === 0 && (
        <p className="no-results" role="status">
          Проекты не найдены. Попробуйте другое название или технологию.
        </p>
      )}
    </section>
  );
}
