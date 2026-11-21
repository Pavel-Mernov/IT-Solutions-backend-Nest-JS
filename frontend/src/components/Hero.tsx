import type { Profile } from "../api";
import { ArrowIcon } from "./ArrowIcon";
export function Hero({ profile }: { profile: Profile }) {
  return (
    <section className="hero" id="about" aria-labelledby="profile-name">
      <div className="hero-kicker">
        <span className="spark">✦</span>
        <span>
          FULLSTACK
          <br />
          DEVELOPER
        </span>
      </div>
      <div className="hero-copy">
        <p className="eyebrow">ПОРТФОЛИО / 2026</p>
        <h1 id="profile-name">
          Создаю интерфейсы
          <br />и <em>работающие</em>
          <br />
          продукты.
        </h1>
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
            Смотреть проекты <span>↓</span>
          </a>
        </div>
      </div>
      <aside className="portrait-wrap">
        <span className="portrait-sticker">
          OPEN TO
          <br />
          WORK
        </span>
        <img src="/profile.jpg" alt={`Портрет — ${profile.name}`} />
        <div className="portrait-caption">
          <span>{profile.name}</span>
          <span>{profile.location}</span>
        </div>
      </aside>
      <div className="hero-meta">
        <span>{profile.title}</span>
        <span>{profile.languages}</span>
      </div>
    </section>
  );
}
