export interface Piece {
  text: string;
  marked: boolean;
}

const escape = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/** Splits a line into marked and unmarked pieces for every evidence phrase it contains. */
export function highlight(line: string, evidence: string[]): Piece[] {
  const phrases = evidence.filter((e) => e.trim().length > 0).sort((a, b) => b.length - a.length);
  if (phrases.length === 0) return [{ text: line, marked: false }];
  const pattern = new RegExp(`(${phrases.map(escape).join("|")})`, "gi");
  return line
    .split(pattern)
    .filter((part) => part.length > 0)
    .map((part) => ({
      text: part,
      marked: phrases.some((p) => p.toLowerCase() === part.toLowerCase()),
    }));
}
