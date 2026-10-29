import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!url || !anonKey) {
  // eslint-disable-next-line no-console
  console.error(
    "Variables Supabase manquantes. Vérifie ton fichier .env (VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY) " +
    "et, sur Vercel, les variables d'environnement du projet."
  );
}

export const supabase = createClient(url, anonKey);
