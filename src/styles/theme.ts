import { DARK, LIGHT, paletteToCss } from "./tokens";

/** Writes the palette to CSS custom properties so tokens.ts stays the single source of truth. */
export function applyTheme(): void {
  const style = document.createElement("style");
  style.dataset.tokens = "";
  style.textContent = `:root { ${paletteToCss(LIGHT)} }
@media (prefers-color-scheme: dark) { :root { ${paletteToCss(DARK)} } }`;
  document.head.append(style);
}
