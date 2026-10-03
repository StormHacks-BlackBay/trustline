export interface Palette {
  background: string;
  surface: string;
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
  background: "#f4f6f5",
  surface: "#ffffff",
  border: "#c5cfcd",
  text: "#13201f",
  mutedText: "#475654",
  accent: "#0f5c5e",
  onAccent: "#ffffff",
  lowBackground: "#e2f3e8",
  lowText: "#14532d",
  mediumBackground: "#fff2d1",
  mediumText: "#6b4500",
  highBackground: "#fde3df",
  highText: "#8a1c12",
  highlight: "#ffe08a",
};

export const DARK: Palette = {
  background: "#0e1514",
  surface: "#18211f",
  border: "#34423f",
  text: "#eef3f2",
  mutedText: "#a9b7b4",
  accent: "#5fc4c0",
  onAccent: "#062625",
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
  ["accent", "surface"],
  ["onAccent", "accent"],
  ["lowText", "lowBackground"],
  ["mediumText", "mediumBackground"],
  ["highText", "highBackground"],
  ["text", "highlight"],
];

const kebab = (key: string) => key.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`);

export function paletteToCss(palette: Palette): string {
  return Object.entries(palette)
    .map(([key, value]) => `--color-${kebab(key)}: ${value};`)
    .join(" ");
}
