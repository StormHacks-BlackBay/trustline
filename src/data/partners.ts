import type { DemoUser, Partner } from "../lib/types";

export const PARTNERS: Partner[] = [
  { id: "demo-newcomer-society", name: "Demo Newcomer Society", kind: "community" },
  { id: "demo-credit-union", name: "Demo Credit Union", kind: "financial" },
  { id: "cafc", name: "Canadian Anti-Fraud Centre", kind: "government" },
];

/** Who the call summary page offers to share a report with: the government's fraud centre. */
export const AFTER_CALL_PARTNER_ID = "cafc";

export const DEMO_USERS: DemoUser[] = [
  { id: "harpreet", name: "Harpreet", partnerId: "cafc", language: "en" },
  { id: "mei", name: "Mei", partnerId: "demo-credit-union", language: "zh" },
];
