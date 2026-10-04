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
