import { LIGHT, paletteToCss } from "./tokens";

/**
 * Writes the palette to CSS custom properties so tokens.ts stays the single source of truth.
 * TrustLine has one, light theme: it does not follow the device's dark mode.
 */
export function applyTheme(): void {
  const style = document.createElement("style");
  style.dataset.tokens = "";
  style.textContent = `:root { ${paletteToCss(LIGHT)} }`;
  document.head.append(style);
}
