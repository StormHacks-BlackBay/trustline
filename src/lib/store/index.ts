import { createLocalStore } from "./localStore";
import { createSupabaseStore } from "./supabaseStore";
import type { DataStore } from "./types";

const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

/** Supabase when configured (works across phones), otherwise a same-browser demo store. */
export const store: DataStore =
  url && anonKey ? createSupabaseStore(url, anonKey) : createLocalStore();

export type { DataStore, NewAdvisory, NewIncident } from "./types";
