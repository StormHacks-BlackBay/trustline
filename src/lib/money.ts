/**
 * Finds the sums of money a caller or message asks for, written as digits ("$2,500", "1800
 * dollars") or spelled out the way call transcripts often are ("two thousand five hundred dollars").
 * Used to show partners how much money was at risk in the scams their members reported.
 */

const UNITS: Record<string, number> = {
  zero: 0,
  one: 1,
  two: 2,
  three: 3,
  four: 4,
  five: 5,
  six: 6,
  seven: 7,
  eight: 8,
  nine: 9,
  ten: 10,
  eleven: 11,
  twelve: 12,
  thirteen: 13,
  fourteen: 14,
  fifteen: 15,
  sixteen: 16,
  seventeen: 17,
  eighteen: 18,
  nineteen: 19,
};
const TENS: Record<string, number> = {
  twenty: 20,
  thirty: 30,
  forty: 40,
  fifty: 50,
  sixty: 60,
  seventy: 70,
  eighty: 80,
  ninety: 90,
};
const SCALES: Record<string, number> = { hundred: 100, thousand: 1_000, million: 1_000_000 };

const DIGITS_BEFORE = /\$\s?((?:\d{1,3}(?:,\d{3})+|\d+)(?:\.\d{1,2})?)/g;
const DIGITS_AFTER = /\b((?:\d{1,3}(?:,\d{3})+|\d+)(?:\.\d{1,2})?)\s?(?:dollars|bucks|cad)\b/gi;
const SPELLED = /\b((?:(?:[a-z]+)[\s-]+(?:and[\s-]+)?)+)dollars\b/gi;

/** "two thousand five hundred" to 2500; null if any word is not a number word. */
export function wordsToNumber(phrase: string): number | null {
  const words = phrase
    .toLowerCase()
    .split(/[\s-]+/)
    .filter((w) => w && w !== "and");
  if (words.length === 0) return null;
  let total = 0;
  let current = 0;
  for (const word of words) {
    if (word in UNITS) current += UNITS[word] ?? 0;
    else if (word in TENS) current += TENS[word] ?? 0;
    else if (word === "hundred") current = (current || 1) * 100;
    else if (word in SCALES) {
      total += (current || 1) * (SCALES[word] ?? 1);
      current = 0;
    } else return null;
  }
  return total + current;
}

/** The longest run of number words at the end of a phrase ("pay me two thousand" to 2000). */
function trailingNumber(phrase: string): number | null {
  const words = phrase.trim().split(/[\s-]+/);
  for (let start = 0; start < words.length; start++) {
    const value = wordsToNumber(words.slice(start).join(" "));
    if (value !== null) return value;
  }
  return null;
}

const toNumber = (digits: string) => Number(digits.replace(/,/g, ""));

/** Every positive amount of money mentioned, in the order found. */
export function amountsMentioned(text: string): number[] {
  const found: number[] = [];
  for (const match of text.matchAll(DIGITS_BEFORE)) found.push(toNumber(match[1] ?? ""));
  for (const match of text.matchAll(DIGITS_AFTER)) found.push(toNumber(match[1] ?? ""));
  for (const match of text.matchAll(SPELLED)) {
    const value = trailingNumber(match[1] ?? "");
    if (value !== null) found.push(value);
  }
  return found.filter((n) => Number.isFinite(n) && n > 0);
}

/** The largest amount mentioned, which is usually what the scammer is after, or null. */
export function largestAmount(text: string): number | null {
  const amounts = amountsMentioned(text);
  return amounts.length > 0 ? Math.max(...amounts) : null;
}

/** "$2,500" in Canadian dollars, without cents for whole amounts. */
export function formatDollars(amount: number): string {
  return new Intl.NumberFormat("en-CA", {
    style: "currency",
    currency: "CAD",
    currencyDisplay: "narrowSymbol",
    maximumFractionDigits: Number.isInteger(amount) ? 0 : 2,
  }).format(amount);
}
