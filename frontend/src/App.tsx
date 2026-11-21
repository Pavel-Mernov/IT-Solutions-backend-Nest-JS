import { useEffect, useMemo, useState } from "react";
import { fetchProfile, type Profile } from "./api";
import { CustomCursor } from "./components/CustomCursor";
import { Education } from "./components/Education";
import { ExperienceSection } from "./components/ExperienceSection";
import { Footer } from "./components/Footer";
import { Header } from "./components/Header";
import { Hero } from "./components/Hero";
import { ProjectsSection } from "./components/ProjectsSection";
import { SkillsSection } from "./components/SkillsSection";

type LoadState =
  | { status: "loading" }
  | { status: "ready"; profile: Profile | null }
  | { status: "error"; message: string };

export function App() {
  const [state, setState] = useState<LoadState>({ status: "loading" });
  const [attempt, setAttempt] = useState(0);
  const [search, setSearch] = useState("");
  useEffect(() => {
    const controller = new AbortController();
    setState({ status: "loading" });
    fetchProfile(controller.signal)
      .then(
        (profile) =>
          !controller.signal.aborted && setState({ status: "ready", profile }),
      )
      .catch(
        (error: unknown) =>
          !controller.signal.aborted &&
          setState({
            status: "error",
            message:
              error instanceof Error
                ? error.message
                : "Не удалось загрузить профиль.",
          }),
      );
    return () => controller.abort();
  }, [attempt]);
  const profile = state.status === "ready" ? state.profile : null;
  const projects = useMemo(() => {
    const query = search.trim().toLocaleLowerCase();
    return (
      profile?.projects.filter((project) =>
        `${project.name} ${project.technologies.join(" ")}`
          .toLocaleLowerCase()
          .includes(query),
      ) ?? []
    );
  }, [profile, search]);
  return (
    <>
      <CustomCursor />
      <Header />
      <main id="main">
        {state.status === "loading" && (
          <div className="state-panel" role="status">
            <span className="loading-dot" /> Загружаем портфолио…
          </div>
        )}
        {state.status === "error" && (
          <div className="state-panel" role="alert">
            <h1>Не удалось загрузить портфолио</h1>
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
            <Hero profile={profile} />
            <SkillsSection skills={profile.skills} />
            <ExperienceSection experience={profile.experience} />
            <ProjectsSection
              projects={projects}
              total={profile.projects.length}
              search={search}
              onSearch={setSearch}
            />
            <Education education={profile.education} />
          </>
        )}
      </main>
      <Footer />
    </>
  );
}
