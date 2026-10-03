export interface Palette {
  background: string;
  surface: string;
  /** Recessed areas inside a surface, such as the transcript. */
  surfaceSunken: string;
  border: string;
  text: string;
  mutedText: string;
  accent: string;
  onAccent: string;
  lowBackground: string;
  lowText: string;
  mediumBackground: string;
  mediumText: string;
  highBackground: string;
  highText: string;
  highlight: string;
}

export const LIGHT: Palette = {
  // Warm paper rather than cool grey: calm, and less like a default dashboard.
  background: "#f6f4ef",
  surface: "#ffffff",
  surfaceSunken: "#efebe3",
  border: "#d6d0c4",
  text: "#1a1f1e",
  mutedText: "#565c59",
  accent: "#0d5c5a",
  onAccent: "#ffffff",
  lowBackground: "#e2f2e7",
  lowText: "#14532d",
  mediumBackground: "#fdf0cc",
  mediumText: "#6b4500",
  highBackground: "#fbe2dd",
  highText: "#8a1c12",
  highlight: "#ffdf80",
};

export const DARK: Palette = {
  background: "#121614",
  surface: "#1a201e",
  surfaceSunken: "#0e1211",
  border: "#323b38",
  text: "#f1efe9",
  mutedText: "#a9b1ad",
  accent: "#6fcfc6",
  onAccent: "#06221f",
  lowBackground: "#12301f",
  lowText: "#a3e3bb",
  mediumBackground: "#3a2c06",
  mediumText: "#ffd57a",
  highBackground: "#3d1410",
  highText: "#ffb7ab",
  highlight: "#6b5410",
};

/** Text and background pairs that appear in the UI. Each must meet WCAG AA for body text. */
export const TEXT_PAIRS: [keyof Palette, keyof Palette][] = [
  ["text", "background"],
  ["text", "surface"],
  ["mutedText", "background"],
  ["mutedText", "surface"],
  ["text", "surfaceSunken"],
  ["mutedText", "surfaceSunken"],
  ["accent", "background"],
  ["accent", "surface"],
  ["onAccent", "accent"],
  ["lowText", "lowBackground"],
  ["mediumText", "mediumBackground"],
  ["highText", "highBackground"],
  ["text", "mediumBackground"],
  ["text", "highBackground"],
  ["accent", "surfaceSunken"],
  ["text", "highlight"],
];

const kebab = (key: string) => key.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`);

export function paletteToCss(palette: Palette): string {
  return Object.entries(palette)
    .map(([key, value]) => `--color-${kebab(key)}: ${value};`)
    .join(" ");
}
