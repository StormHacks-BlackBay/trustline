import { describe, expect, it } from "vitest";
import { contrastRatio } from "./contrast";
import { DARK, LIGHT, TEXT_PAIRS } from "./tokens";

describe.each([
  ["light", LIGHT],
  ["dark", DARK],
])("%s palette", (_name, palette) => {
  it.each(TEXT_PAIRS)("%s on %s meets 4.5:1", (fg, bg) => {
    expect(contrastRatio(palette[fg], palette[bg])).toBeGreaterThanOrEqual(4.5);
  });

  it("accent controls meet 3:1 non-text contrast against the surface", () => {
    expect(contrastRatio(palette.accent, palette.surface)).toBeGreaterThanOrEqual(3);
  });
});
