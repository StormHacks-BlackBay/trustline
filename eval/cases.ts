import { DEMO_CALLS } from "../src/data/demoCalls";

export interface EvalCase {
  id: string;
  label: "scam" | "legitimate";
  /** What the case is testing, for the report. */
  note: string;
  transcript: string;
}

const demo = (id: string) => DEMO_CALLS.find((c) => c.id === id)?.lines.join("\n") ?? "";

export const CASES: EvalCase[] = [
  { id: "ircc-gift-cards", label: "scam", note: "Demo script", transcript: demo("ircc-scam") },
  {
    id: "unclear-bank-sin",
    label: "scam",
    note: "Demo script: asks for SIN and date of birth",
    transcript: demo("bank-ambiguous"),
  },
  {
    id: "cra-bitcoin-atm",
    label: "scam",
    note: "Tax agency impersonation with crypto",
    transcript: [
      "This is the Canada Revenue Agency calling about unpaid taxes from 2023.",
      "A warrant has been issued and the police will come to your home this evening.",
      "You can stop this by paying at a bitcoin ATM within the next two hours.",
    ].join("\n"),
  },
  {
    id: "bank-otp",
    label: "scam",
    note: "Bank impersonation asking for a one-time code",
    transcript: [
      "Hi, this is the fraud team at RBC. We blocked a suspicious transfer from your account.",
      "To reverse it, I just need you to read me the six digit code we just texted you.",
    ].join("\n"),
  },
  {
    id: "safe-account",
    label: "scam",
    note: "Move money to a 'secure account'",
    transcript: [
      "This is TD security. Your account has been compromised by someone at your branch.",
      "You need to transfer your savings into a secure account we have opened for you.",
      "Do not tell the branch staff, they may be involved.",
    ].join("\n"),
  },
  {
    id: "grandparent",
    label: "scam",
    note: "Family emergency with gift cards",
    transcript: [
      "Grandma, it's me. I'm in trouble, I was in a car accident and they put me in jail.",
      "Please don't tell Mom. The lawyer says you need to send three thousand dollars for bail.",
      "He said they only take gift cards, and it has to be today.",
    ].join("\n"),
  },
  {
    id: "cbsa-package",
    label: "scam",
    note: "Border agency impersonation",
    transcript: [
      "This is the Canada Border Services Agency. A package in your name with illegal items was seized.",
      "To avoid arrest, you must pay the fine immediately with Apple gift cards.",
    ].join("\n"),
  },
  {
    id: "tech-support",
    label: "scam",
    note: "Remote access and banking login",
    transcript: [
      "Hello, this is computer support. Your computer has a virus that is stealing your data.",
      "Please download the AnyDesk app so I can fix it for you.",
      "Then log into your online banking so we can send you a refund.",
    ].join("\n"),
  },
  {
    id: "sin-suspended",
    label: "scam",
    note: "Service Canada impersonation",
    transcript: [
      "This is Service Canada. Your social insurance number has been suspended due to criminal activity.",
      "To protect your funds, you must move your money to a protected account.",
      "Stay on the line while I transfer you to an officer.",
    ].join("\n"),
  },
  {
    id: "job-crypto",
    label: "scam",
    note: "Job offer with crypto payment",
    transcript: [
      "Congratulations, you were selected for our work from home position.",
      "To start, you need to buy your training equipment using cryptocurrency, and we will reimburse you on your first paycheque.",
    ].join("\n"),
  },
  {
    id: "immigration-interac",
    label: "scam",
    note: "No obvious keywords: tests what the LLM adds",
    transcript: [
      "Hi, I'm with the immigration office. There is a problem with your file.",
      "You need to send an Interac payment of eight hundred dollars to our officer this afternoon.",
      "If we don't receive it, your application will be closed.",
    ].join("\n"),
  },
  {
    id: "bank-alert",
    label: "legitimate",
    note: "Demo script: real fraud alert mentioning PIN and code",
    transcript: demo("bank-alert"),
  },
  {
    id: "pharmacy",
    label: "legitimate",
    note: "Prescription ready",
    transcript:
      "Hi, this is the pharmacy calling to let you know your prescription is ready for pickup. We're open until nine tonight.",
  },
  {
    id: "dentist",
    label: "legitimate",
    note: "Appointment reminder",
    transcript:
      "This is a reminder from Burnaby Dental about your appointment tomorrow at ten in the morning. Please call us if you need to reschedule.",
  },
  {
    id: "family-etransfer",
    label: "legitimate",
    note: "Family member asking for money for something real",
    transcript:
      "Hey, it's your brother. Can you send me fifty dollars by e-transfer for the concert tickets? I'll pay you back on Friday.",
  },
  {
    id: "cra-letter",
    label: "legitimate",
    note: "Real tax agency call with no requests",
    transcript: [
      "Hello, this is the Canada Revenue Agency. We sent you a letter about your 2025 tax return.",
      "You can review it in My Account online, or call us using the number on our website.",
    ].join("\n"),
  },
  {
    id: "courier",
    label: "legitimate",
    note: "Missed delivery",
    transcript:
      "Hi, this is Purolator. We tried to deliver a package today but nobody was home. You can book a new delivery time on our website.",
  },
];
