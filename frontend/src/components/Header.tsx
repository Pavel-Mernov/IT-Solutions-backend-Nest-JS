import { ArrowIcon } from "./ArrowIcon";
export function Header() {
  return (
    <header className="topbar">
      <a href="#main" className="brand" aria-label="К началу страницы">
        <span>ПАВЕЛ</span>
        <span>МЕРНОВ</span>
      </a>
      <nav aria-label="Разделы портфолио">
        <a href="#about">Обо мне</a>
        <a href="#experience">Опыт</a>
        <a href="#projects">Проекты</a>
        <a href="/graphql" target="_blank" rel="noreferrer">
          API <ArrowIcon />
        </a>
      </nav>
    </header>
  );
}
