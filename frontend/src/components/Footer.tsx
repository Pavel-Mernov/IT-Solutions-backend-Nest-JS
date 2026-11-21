import { ArrowIcon } from "./ArrowIcon";
export function Footer() {
  return (
    <footer>
      <div className="footer-title">
        Давайте создавать
        <br />
        <em>что-то полезное.</em>
      </div>
      <div className="footer-links">
        <a href="mailto:paulmernov@gmail.com">
          paulmernov@gmail.com <ArrowIcon />
        </a>
        <a
          href="https://github.com/Pavel-Mernov"
          target="_blank"
          rel="noreferrer"
        >
          GitHub <ArrowIcon />
        </a>
      </div>
      <span>Павел Мернов © 2026</span>
    </footer>
  );
}
