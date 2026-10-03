import type { DemoUser, Partner } from "../lib/types";

export const PARTNERS: Partner[] = [
  { id: "demo-newcomer-society", name: "Demo Newcomer Society", kind: "community" },
  { id: "demo-credit-union", name: "Demo Credit Union", kind: "financial" },
];

export const DEMO_USERS: DemoUser[] = [
  { id: "harpreet", name: "Harpreet", partnerId: "demo-newcomer-society", language: "pa" },
  { id: "mei", name: "Mei", partnerId: "demo-credit-union", language: "zh" },
];
