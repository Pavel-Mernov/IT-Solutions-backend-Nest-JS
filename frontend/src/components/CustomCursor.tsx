import { useEffect, useState } from "react";
export function CustomCursor() {
  const [point, setPoint] = useState({ x: -40, y: -40, active: false });
  useEffect(() => {
    if (!window.matchMedia("(pointer: fine)").matches) return;
    const move = (event: PointerEvent) =>
      setPoint((value) => ({ ...value, x: event.clientX, y: event.clientY }));
    const over = (event: PointerEvent) =>
      setPoint((value) => ({
        ...value,
        active:
          event.target instanceof Element &&
          Boolean(event.target.closest("a, button, input, .project-card")),
      }));
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerover", over);
    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerover", over);
    };
  }, []);
  return (
    <div
      className={`custom-cursor${point.active ? " is-active" : ""}`}
      style={{ transform: `translate3d(${point.x}px, ${point.y}px, 0)` }}
      aria-hidden="true"
    >
      <span>↗</span>
    </div>
  );
}
