import type { FlagId } from "../lib/types";
import { DIRECTORY } from "./directory";

/**
 * What to do after paying a scammer or sharing details. Order and contacts follow the Canadian
 * Anti-Fraud Centre's victim guidance:
 * https://antifraudcentre-centreantifraude.ca/scams-fraudes/victim-victime-eng.htm
 * Phone numbers come from the verified directory; nothing here comes from a caller or message.
 */

export interface Contact {
  label: string;
  phone?: string;
  url?: string;
}

export interface RecoveryStep {
  /** Stable id, so a step shared by several situations is shown once. */
  id: string;
  title: string;
  detail: string;
  contacts?: Contact[];
}

export interface Situation {
  id: SituationId;
  /** Written as the user would say it, for the checklist. */
  label: string;
  steps: RecoveryStep[];
}

export const SITUATION_IDS = [
  "gift_cards",
  "money_transfer",
  "crypto",
  "card_or_bank",
  "codes_or_passwords",
  "device_access",
  "identity",
] as const;
export type SituationId = (typeof SITUATION_IDS)[number];

const directory = (id: string) => {
  const entry = DIRECTORY.find((d) => d.id === id);
  if (!entry) throw new Error(`Directory entry ${id} is missing`);
  return entry;
};

const cafc = directory("cafc");
const serviceCanada = directory("service-canada");
const cra = directory("cra");

/** The CAFC's online reporting system, linked from its victim guidance. */
export const CAFC_ONLINE_REPORT = "https://reportcyberandfraud.canada.ca/";

const CALL_BANK: RecoveryStep = {
  id: "call-bank",
  title: "Call your bank now",
  detail:
    "Use the number on the back of your card or on your bank's official website. Tell them what happened and ask them to stop any payments, block your card and flag your account. The sooner you call, the better the chance of stopping the money.",
  contacts: [{ label: "Number on the back of your card" }],
};

const CHANGE_PASSWORDS: RecoveryStep = {
  id: "change-passwords",
  title: "Change your passwords from a device you trust",
  detail:
    "Start with your email and online banking, then any account that used the same password. Use a different password for each account, and turn on two-step verification where it is offered.",
};

export const SITUATIONS: Situation[] = [
  {
    id: "gift_cards",
    label: "I paid with gift cards",
    steps: [
      {
        id: "call-card-company",
        title: "Call the company that issued the cards right away",
        detail:
          "Use the phone number on the back of the card or on the company's official website, not one the scammer gave you. Ask them to freeze any balance left on the cards. Scammers often spend the balance within minutes, so call first.",
        contacts: [{ label: "Number on the back of the gift card" }],
      },
      {
        id: "keep-cards",
        title: "Keep the cards and the receipts",
        detail:
          "The card numbers and receipts are what the company and the police need to trace the money. Don't throw them away.",
      },
    ],
  },
  {
    id: "money_transfer",
    label: "I sent an e-transfer, a wire, or a Western Union or MoneyGram payment",
    steps: [
      CALL_BANK,
      {
        id: "call-transfer-company",
        title: "If you used Western Union or MoneyGram, call them too",
        detail:
          "Use the number on your receipt or their official website and ask them to stop the transfer before it is picked up.",
        contacts: [{ label: "Number on your receipt" }],
      },
    ],
  },
  {
    id: "crypto",
    label: "I paid with cryptocurrency or at a bitcoin ATM",
    steps: [
      {
        id: "call-crypto-operator",
        title: "Contact the ATM operator or exchange you used",
        detail:
          "Use the phone number printed on the machine or on your receipt, or the exchange's official website. Ask them to freeze the transaction.",
        contacts: [{ label: "Number on the machine or receipt" }],
      },
      {
        id: "save-crypto-details",
        title: "Save the transaction details",
        detail:
          "Keep the receipt, the wallet address you sent to and the transaction ID. Police need these to follow the payment.",
      },
    ],
  },
  {
    id: "card_or_bank",
    label: "I gave my card number or banking details",
    steps: [
      CALL_BANK,
      {
        id: "watch-statements",
        title: "Check your statements for the next few months",
        detail: "Look for payments you don't recognize and report them to your bank straight away.",
      },
    ],
  },
  {
    id: "codes_or_passwords",
    label: "I gave a code, PIN or password, or typed them into a link",
    steps: [CALL_BANK, CHANGE_PASSWORDS],
  },
  {
    id: "device_access",
    label: "I let them control my phone or computer",
    steps: [
      {
        id: "disconnect",
        title: "Disconnect from the internet",
        detail: "Turn off Wi-Fi and mobile data so they can no longer reach your device.",
      },
      {
        id: "remove-app",
        title: "Remove the app they asked you to install",
        detail:
          "Apps such as AnyDesk or TeamViewer let someone control your device. Delete it, and if you are unsure what else changed, ask a technician you trust to check the device.",
      },
      { ...CHANGE_PASSWORDS, title: "Change your passwords from a different device" },
      CALL_BANK,
    ],
  },
  {
    id: "identity",
    label: "I gave my SIN, passport number or other personal details",
    steps: [
      {
        id: "credit-bureaus",
        title: "Ask both credit bureaus to add a fraud alert",
        detail:
          "Contact Equifax and TransUnion. A fraud alert asks lenders to check with you before opening credit in your name.",
        contacts: [
          { label: "Equifax Canada", url: "https://www.equifax.ca/personal/" },
          { label: "TransUnion Canada", url: "https://www.transunion.ca/" },
        ],
      },
      {
        id: "service-canada-sin",
        title: "Tell Service Canada if you shared your SIN",
        detail: "They can help if your Social Insurance Number is being misused.",
        contacts: [
          { label: serviceCanada.organization, phone: serviceCanada.phone ?? undefined },
          {
            label: "Protecting your SIN",
            url: "https://www.canada.ca/en/employment-social-development/services/sin/protection.html",
          },
        ],
      },
      {
        id: "cra-account",
        title: "Call the CRA if your tax account may be affected",
        detail: "For example if you shared your SIN together with your date of birth or address.",
        contacts: [{ label: cra.organization, phone: cra.phone ?? undefined }],
      },
    ],
  },
];

/** Steps everyone should take, after the urgent ones for their situation. */
export const REPORT_STEPS: RecoveryStep[] = [
  {
    id: "gather",
    title: "Gather everything you have",
    detail:
      "Screenshots of messages, receipts, card numbers, the phone numbers or links used, and the dates and times. You will need them for every report.",
  },
  {
    id: "police",
    title: "Report it to your local police",
    detail:
      "Call the non-emergency line and ask for a file number. Your bank or card company may ask for it.",
  },
  {
    id: "cafc",
    title: `Report it to the ${cafc.organization}`,
    detail:
      "Report online or by phone (Monday to Friday, 10 am to 4:45 pm Eastern). Report even if you lost no money: it helps warn others.",
    contacts: [
      { label: "Report online", url: CAFC_ONLINE_REPORT },
      { label: cafc.organization, phone: cafc.phone ?? undefined },
    ],
  },
];

export const PROTECT_STEPS: RecoveryStep[] = [
  {
    id: "recovery-scams",
    title: "Watch out for a second scam",
    detail:
      "Scammers often call back pretending to be police, a lawyer or a company that can recover your money for a fee. Nobody legitimate charges you to get your money back. Hang up.",
  },
  {
    id: "talk",
    title: "Talk to someone you trust",
    detail:
      "This happens to careful people every day, and it is not your fault. Scammers are skilled at creating fear and rushing people. A friend, family member or your community organization can help you with the next steps.",
  },
];

/** Which situations a call or message most likely led to, from its warning signs. */
const FLAG_SITUATIONS: Partial<Record<FlagId, SituationId>> = {
  gift_card_payment: "gift_cards",
  crypto_payment: "crypto",
  wire_transfer: "money_transfer",
  one_time_code: "codes_or_passwords",
  personal_info: "identity",
  remote_access: "device_access",
  suspicious_link: "codes_or_passwords",
};

export function situationsForFlags(flags: readonly FlagId[]): SituationId[] {
  const ids = new Set(flags.map((f) => FLAG_SITUATIONS[f]).filter((id) => id !== undefined));
  return SITUATION_IDS.filter((id) => ids.has(id));
}

export const isSituationId = (value: string): value is SituationId =>
  (SITUATION_IDS as readonly string[]).includes(value);

/** The urgent steps for the chosen situations, in checklist order, each shown once. */
export function urgentSteps(selected: readonly SituationId[]): RecoveryStep[] {
  const seen = new Set<string>();
  const steps: RecoveryStep[] = [];
  for (const situation of SITUATIONS) {
    if (!selected.includes(situation.id)) continue;
    for (const step of situation.steps) {
      if (seen.has(step.id)) continue;
      seen.add(step.id);
      steps.push(step);
    }
  }
  return steps;
}

/** The recovery page path, with the situations to preselect. */
export function recoveryPath(situations: readonly SituationId[] = []): string {
  return situations.length > 0 ? `/recover?situations=${situations.join(",")}` : "/recover";
}
