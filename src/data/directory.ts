import type { DirectoryEntry } from "../lib/types";

/**
 * Demo data. Official channels were taken from public government and bank pages in October 2026
 * and must be re-verified before any real-world use.
 */
export const DIRECTORY: DirectoryEntry[] = [
  {
    id: "ircc",
    organization: "Immigration, Refugees and Citizenship Canada (IRCC)",
    aliases: [
      "ircc",
      "immigration canada",
      "immigration refugees and citizenship",
      "citizenship and immigration",
      "cic",
      "immigration department",
      "immigration office",
    ],
    category: "government",
    phone: "1-888-242-2100",
    url: "https://www.canada.ca/en/immigration-refugees-citizenship/corporate/contact-ircc.html",
    guidance:
      "IRCC never threatens arrest or deportation and never asks for payment by gift card or crypto.",
  },
  {
    id: "cra",
    organization: "Canada Revenue Agency (CRA)",
    aliases: ["cra", "canada revenue agency", "revenue canada", "tax agency", "revenue agency"],
    category: "government",
    phone: "1-800-959-8281",
    url: "https://www.canada.ca/en/revenue-agency/corporate/contact-information.html",
    guidance:
      "The CRA never demands immediate payment by gift card, prepaid card or cryptocurrency.",
  },
  {
    id: "cbsa",
    organization: "Canada Border Services Agency (CBSA)",
    aliases: ["cbsa", "canada border services", "border services", "border agency", "customs"],
    category: "government",
    phone: "1-800-461-9999",
    url: "https://www.cbsa-asfc.gc.ca/contact/bis-sif-eng.html",
    guidance: "The CBSA does not call to demand fines or threaten arrest over the phone.",
  },
  {
    id: "service-canada",
    organization: "Service Canada",
    aliases: ["service canada", "social insurance", "sin number"],
    category: "government",
    phone: "1-800-622-6232",
    url: "https://www.canada.ca/en/employment-social-development/corporate/contact.html",
    guidance:
      "Service Canada will not say your SIN is suspended or ask you to move money to protect it.",
  },
  {
    id: "police",
    organization: "Police (RCMP or local)",
    aliases: ["rcmp", "police", "royal canadian mounted police", "officer", "constable"],
    category: "government",
    phone: null,
    url: "https://www.rcmp-grc.gc.ca/en/contact-us",
    guidance:
      "Police do not take payment over the phone to cancel a warrant. Call your local non-emergency line.",
  },
  {
    id: "rbc",
    organization: "RBC Royal Bank",
    aliases: ["rbc", "royal bank"],
    category: "bank",
    phone: null,
    url: "https://www.rbc.com",
    guidance:
      "Call the number on the back of your card. Your bank will never ask for a one-time code.",
  },
  {
    id: "td",
    organization: "TD Bank",
    aliases: ["td", "td bank", "toronto dominion"],
    category: "bank",
    phone: null,
    url: "https://www.td.com",
    guidance:
      "Call the number on the back of your card. Your bank will never ask for a one-time code.",
  },
  {
    id: "scotiabank",
    organization: "Scotiabank",
    aliases: ["scotiabank", "scotia"],
    category: "bank",
    phone: null,
    url: "https://www.scotiabank.com",
    guidance:
      "Call the number on the back of your card. Your bank will never ask for a one-time code.",
  },
  {
    id: "bmo",
    organization: "BMO Bank of Montreal",
    aliases: ["bmo", "bank of montreal"],
    category: "bank",
    phone: null,
    url: "https://www.bmo.com",
    guidance:
      "Call the number on the back of your card. Your bank will never ask for a one-time code.",
  },
  {
    id: "cibc",
    organization: "CIBC",
    aliases: ["cibc", "canadian imperial bank"],
    category: "bank",
    phone: null,
    url: "https://www.cibc.com",
    guidance:
      "Call the number on the back of your card. Your bank will never ask for a one-time code.",
  },
  {
    id: "demo-credit-union",
    organization: "Demo Credit Union",
    aliases: ["demo credit union", "credit union"],
    category: "bank",
    phone: null,
    url: "https://example.org",
    guidance:
      "Call the number on the back of your card. Your credit union will never ask for a one-time code.",
  },
  {
    id: "cafc",
    organization: "Canadian Anti-Fraud Centre",
    aliases: ["anti-fraud centre", "anti fraud centre", "cafc"],
    category: "reporting",
    phone: "1-888-495-8501",
    url: "https://antifraudcentre-centreantifraude.ca/report-signalez-eng.htm",
    guidance: "Report scam calls here, even if you did not lose money.",
  },
];
