import { supabase } from "./supabase";

/* ============================================================
   Statistiques anonymes du site (aucune donnée personnelle) :
   un identifiant aléatoire par navigateur, le type d'appareil,
   la provenance (Google, Facebook, direct…) et la langue.
   Les appareils du magasin (tableau de bord ouvert une fois) ne sont pas comptés.
============================================================ */

const store = {
  get(k, s = localStorage) { try { return s.getItem(k); } catch { return null; } },
  set(k, v, s = localStorage) { try { s.setItem(k, v); } catch { /* navigation privée */ } },
};

export const isOwnDevice = () => store.get("ccz_own_device") === "1";
export const markOwnDevice = () => store.set("ccz_own_device", "1");

function sid() {
  let id = store.get("ccz_sid");
  if (!id) {
    id = (crypto.randomUUID?.() || String(Math.random()).slice(2) + Date.now()).slice(0, 40);
    store.set("ccz_sid", id);
  }
  return id;
}

function device() {
  const ua = navigator.userAgent || "";
  if (/iPad|Tablet/i.test(ua) || (/Android/i.test(ua) && !/Mobile/i.test(ua))) return "tablette";
  if (/Mobi|iPhone|Android/i.test(ua)) return "mobile";
  return "ordinateur";
}

function source() {
  const p = new URLSearchParams(location.search);
  const tag = p.get("src") || p.get("utm_source");
  if (tag) return tag.toLowerCase().slice(0, 40);
  let host = "";
  try { host = new URL(document.referrer).hostname.replace(/^www\./, ""); } catch { return "direct"; }
  if (!host || host.includes("copycenterzaventem")) return "direct";
  if (host.includes("google")) return "google";
  if (host.includes("facebook") || host === "fb.com" || host.includes("fb.me")) return "facebook";
  if (host.includes("instagram")) return "instagram";
  if (host.includes("whatsapp") || host === "wa.me") return "whatsapp";
  if (host.includes("bing")) return "bing";
  if (host.includes("tiktok")) return "tiktok";
  return host.slice(0, 60);
}

export async function trackVisit(lang) {
  if (isOwnDevice()) return;
  if (store.get("ccz_visit_sent", sessionStorage)) return;   // une visite par session
  store.set("ccz_visit_sent", "1", sessionStorage);
  try { await supabase.rpc("track_visit", { p_sid: sid(), p_device: device(), p_ref: source(), p_lang: lang || "" }); } catch { /* ignore */ }
}

export async function trackEvent(name) {
  if (isOwnDevice()) return;
  try { await supabase.rpc("track_event", { p_sid: sid(), p_name: String(name).toLowerCase().replace(/[^a-z0-9:_-]/g, "").slice(0, 40) }); } catch { /* ignore */ }
}

export async function fetchStats(key, days) {
  const { data, error } = await supabase.rpc("site_stats", { p_key: key, p_days: days });
  if (error) throw error;
  return data;
}

export const looksLikeShopCode = (s) => /^[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/.test(String(s || "").trim().toUpperCase());

/* ---------- Gestion depuis le tableau de bord (protégé par le code) ---------- */
async function rpcOrThrow(fn, args) {
  const { data, error } = await supabase.rpc(fn, args);
  if (error) throw new Error(error.message || "Erreur");
  return data;
}
export const dashPromoList = (key) => rpcOrThrow("dash_promo_list", { p_key: key });
export const dashPromoSave = (key, code, type, value, until) => rpcOrThrow("dash_promo_save", { p_key: key, p_code: code, p_type: type, p_value: value, p_until: until });
export const dashPromoDelete = (key, code) => rpcOrThrow("dash_promo_delete", { p_key: key, p_code: code });
export const dashResetStats = (key) => rpcOrThrow("dash_reset_stats", { p_key: key });
