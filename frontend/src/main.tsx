import { StrictMode, useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { fetchProfile, type Profile } from "./api";
import "./styles.css";

type LoadState =
  | { status: "loading" }
  | { status: "ready"; profile: Profile | null }
  | { status: "error"; message: string };

function ArrowIcon() {
  return (
    <svg
      className="arrow-icon"
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      aria-hidden="true"
    >
      <path d="M7 17 17 7M7 7h10v10" />
    </svg>
  );
}

function App() {
  const [state, setState] = useState<LoadState>({ status: "loading" });
  const [attempt, setAttempt] = useState(0);
  const [search, setSearch] = useState("");
  useEffect(() => {
    const controller = new AbortController();
    setState({ status: "loading" });
    fetchProfile(controller.signal)
      .then((profile) => {
        if (!controller.signal.aborted) setState({ status: "ready", profile });
      })
      .catch((error: unknown) => {
        if (!controller.signal.aborted)
          setState({
            status: "error",
            message:
              error instanceof Error
                ? error.message
                : "Не удалось загрузить профиль.",
          });
      });
    return () => controller.abort();
  }, [attempt]);

  const profile = state.status === "ready" ? state.profile : null;
  const projects =
    profile?.projects.filter((project) =>
      `${project.name} ${project.technologies.join(" ")}`
        .toLocaleLowerCase()
        .includes(search.trim().toLocaleLowerCase()),
    ) ?? [];

  return (
    <>
      <header className="topbar">
        <a href="#main" className="brand" aria-label="К началу страницы">
          <span className="brand-mark">PM</span> digital card
          <span className="brand-dot">.</span>
        </a>
        <nav aria-label="Разделы визитки">
          <a href="#experience">Опыт</a>
          <a href="#projects">Проекты</a>
          <a href="/graphql" target="_blank" rel="noreferrer">
            API <ArrowIcon />
          </a>
        </nav>
      </header>
      <main id="main">
        {state.status === "loading" && (
          <div className="state-panel" role="status">
            <span className="loading-dot" /> Загружаем визитку…
          </div>
        )}
        {state.status === "error" && (
          <div className="state-panel" role="alert">
            <h1>Не удалось загрузить визитку</h1>
            <p>{state.message}</p>
            <button onClick={() => setAttempt((value) => value + 1)}>
              Попробовать снова
            </button>
          </div>
        )}
        {state.status === "ready" && !profile && (
          <div className="state-panel">
            <h1>Профиль пока не заполнен</h1>
            <p>Данные появятся после подготовки базы.</p>
            <button onClick={() => setAttempt((value) => value + 1)}>
              Обновить
            </button>
          </div>
        )}
        {profile && (
          <>
            <section className="hero" aria-labelledby="profile-name">
              <div className="hero-copy">
                <p className="eyebrow">
                  <span className="status-dot" /> FULLSTACK DEVELOPER
                </p>
                <h1 id="profile-name">{profile.name}</h1>
                <p className="hero-title">{profile.title}</p>
                <p className="hero-description">{profile.description}</p>
                <div className="hero-links">
                  {profile.links.map((link) => (
                    <a
                      className="button-link"
                      key={link.url}
                      href={link.url}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {link.label} <ArrowIcon />
                    </a>
                  ))}
                  <a className="text-link" href="#projects">
                    Смотреть проекты ↓
                  </a>
                </div>
              </div>
              <aside className="hero-aside">
                <div className="monogram" aria-hidden="true">
                  ПМ<span>✳</span>
                </div>
                <p className="aside-label">БАЗИРУЮСЬ В</p>
                <p>{profile.location}</p>
                <div className="aside-rule" />
                <p className="aside-label">ЯЗЫКИ</p>
                <p>{profile.languages}</p>
              </aside>
            </section>
            <section className="skills-section" aria-labelledby="skills-title">
              <div className="section-heading">
                <span className="section-number">01 /</span>
                <h2 id="skills-title">Инструменты и навыки</h2>
              </div>
              <div className="tags">
                {profile.skills.map((skill) => (
                  <span key={skill.name} className="tag">
                    {skill.name}
                  </span>
                ))}
              </div>
            </section>
            <section id="experience" aria-labelledby="experience-title">
              <div className="section-heading">
                <span className="section-number">02 /</span>
                <h2 id="experience-title">Проектный опыт</h2>
              </div>
              <p className="section-note">
                Учебные и личные проекты — от desktop до fullstack.
              </p>
              <div className="experience-list">
                {profile.experience.length === 0 ? (
                  <p>Опыт пока не добавлен.</p>
                ) : (
                  profile.experience.map((item, index) => (
                    <article
                      className="experience"
                      key={`${item.projectName}-${index}`}
                    >
                      <div>
                        <p className="period">{item.period}</p>
                        <p className="company">{item.company}</p>
                      </div>
                      <div>
                        <h3>{item.projectName ?? item.company}</h3>
                        <p className="position">{item.position}</p>
                        <p>{item.achievements}</p>
                      </div>
                    </article>
                  ))
                )}
              </div>
            </section>
            <section id="projects" aria-labelledby="projects-title">
              <div className="projects-heading">
                <div className="section-heading">
                  <span className="section-number">03 /</span>
                  <h2 id="projects-title">
                    Проекты
                    <span className="count">
                      {profile.projects.length.toString().padStart(2, "0")}
                    </span>
                  </h2>
                </div>
                <label className="search-label">
                  Поиск проектов
                  <input
                    type="search"
                    placeholder="Название или технология"
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                  />
                </label>
              </div>
              <div className="project-grid">
                {projects.map((project, index) => (
                  <article className="project-card" key={project.url}>
                    <div className="card-topline">
                      <span className="project-index">
                        / {(index + 1).toString().padStart(2, "0")}
                      </span>
                      <span aria-hidden="true">
                        <ArrowIcon />
                      </span>
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
            <section className="education" aria-labelledby="education-title">
              <div>
                <p className="eyebrow">ОБРАЗОВАНИЕ</p>
                <h2 id="education-title">Программная инженерия</h2>
              </div>
              <p>{profile.education}</p>
            </section>
          </>
        )}
      </main>
      <footer>
        <span>Павел Мернов · Цифровая визитка</span>
        <a href="/graphql" target="_blank" rel="noreferrer">
          Открыть Apollo Sandbox <ArrowIcon />
        </a>
      </footer>
    </>
  );
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
