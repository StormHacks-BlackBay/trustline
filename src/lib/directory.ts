import { DIRECTORY } from "../data/directory";
import type { DirectoryEntry } from "./types";

const escape = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

interface Hit {
  entry: DirectoryEntry;
  length: number;
}

// "Immigration, Refugees and Citizenship" should match "immigration refugees and citizenship".
const normalize = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^\p{L}\p{N}'\s]+/gu, " ")
    .replace(/\s+/g, " ")
    .trim();

function bestMatch(raw: string, entries: DirectoryEntry[]): DirectoryEntry | null {
  const text = normalize(raw);
  let best: Hit | null = null;
  for (const entry of entries) {
    for (const alias of [entry.organization, ...entry.aliases].map(normalize)) {
      const pattern = new RegExp(`\\b${escape(alias)}\\b`);
      if (pattern.test(text) && (!best || alias.length > best.length)) {
        best = { entry, length: alias.length };
      }
    }
  }
  return best?.entry ?? null;
}

/**
 * Finds the organization the caller claims to represent. The LLM's claimedOrg is checked first,
 * then the transcript itself. A specific organization always wins over the generic "your bank".
 */
export function findOrganization(
  transcript: string,
  claimedOrg: string | null,
  directory: DirectoryEntry[] = DIRECTORY,
): DirectoryEntry | null {
  const claimable = directory.filter((d) => d.category !== "reporting");
  const specific = claimable.filter((d) => d.id !== "your-bank");
  const generic = claimable.filter((d) => d.id === "your-bank");
  for (const text of [claimedOrg, transcript]) {
    if (!text) continue;
    const hit = bestMatch(text, specific) ?? bestMatch(text, generic);
    if (hit) return hit;
  }
  return null;
}

export function reportingEntry(directory: DirectoryEntry[] = DIRECTORY): DirectoryEntry | null {
  return directory.find((d) => d.category === "reporting") ?? null;
}
