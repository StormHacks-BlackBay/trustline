const RULES: [RegExp, string][] = [
  [/[\w.+-]+@[\w-]+(\.[\w-]+)+/g, "[email]"],
  [/(\+?1[\s.-]?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}\b/g, "[phone]"],
  [/\b\d(?:[ -]?\d){7,18}\b/g, "[number]"],
  [/\b[A-Z]\d[A-Z][ -]?\d[A-Z]\d\b/gi, "[postal code]"],
  [
    /\b\d{1,6} [A-Z][\w'-]*( [A-Z][\w'-]*)* (Street|St|Avenue|Ave|Road|Rd|Drive|Dr|Boulevard|Blvd|Way|Crescent|Cres|Lane|Ln|Court|Ct|Place|Pl)\b\.?/g,
    "[address]",
  ],
  [
    /\b((?:[Mm]y name is|[Tt]his is|I am|I'm|speaking (?:with|to)|Mr\.?|Mrs\.?|Ms\.?|Officer|Agent|Constable|Inspector|Detective) )(?!(?:Officer|Agent|Constable|Inspector|Detective|Mr|Mrs|Ms)\b)([A-Z][a-z'-]+(?: [A-Z][a-z'-]+){0,2})/g,
    "$1[name]",
  ],
];

// Words that follow "this is" or "I'm" but are not names.
const NOT_NAMES =
  /^\[name\]$|^(the|your|a|an|calling|from|not|just|urgent|important|regarding|about|Immigration|Canada|Service|Revenue|Demo|RBC|TD|BMO|CIBC|Scotiabank|IRCC|CRA|CBSA)\b/;

/**
 * Removes contact details, account numbers, addresses and personal names before an incident leaves
 * the device. Organization names and scam wording are kept: they are what partners need to see.
 */
export function redact(text: string): string {
  let out = text;
  for (const [pattern, replacement] of RULES) {
    if (replacement === "$1[name]") {
      out = out.replace(pattern, (whole, prefix: string, name: string) =>
        NOT_NAMES.test(name) ? whole : `${prefix}[name]`,
      );
    } else {
      out = out.replace(pattern, replacement);
    }
  }
  return out;
}
