/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL?: string;
  readonly VITE_SUPABASE_ANON_KEY?: string;
  readonly VITE_CALL_SERVER_URL?: string;
  readonly VITE_TRUSTLINE_NUMBER?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
