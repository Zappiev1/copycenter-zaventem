import { supabase } from "./supabase";

/* ============================================================
   Réglages partagés (config tarifs, annonce, compteur de visites)
============================================================ */
export async function getSetting(key, fallback = null) {
  try {
    const { data, error } = await supabase.from("settings").select("value").eq("key", key).maybeSingle();
    if (error || !data) return fallback;
    return data.value;
  } catch { return fallback; }
}

export async function setSetting(key, value) {
  try {
    const { error } = await supabase.from("settings").upsert({ key, value });
    return !error;
  } catch { return false; }
}

export async function incrementVisitCount() {
  try {
    const { data, error } = await supabase.rpc("increment_visit_count");
    if (error) return null;
    return data;
  } catch { return null; }
}

/* ============================================================
   Codes promo
============================================================ */
export async function getPromos() {
  try {
    const { data, error } = await supabase.from("promo_codes").select("*");
    if (error || !data) return {};
    const obj = {};
    for (const row of data) obj[row.code] = { type: row.type, value: Number(row.value), label: row.label };
    return obj;
  } catch { return {}; }
}

export async function upsertPromo(code, type, value, label) {
  try {
    const { error } = await supabase.from("promo_codes").upsert({ code, type, value, label });
    return !error;
  } catch { return false; }
}

export async function deletePromo(code) {
  try {
    const { error } = await supabase.from("promo_codes").delete().eq("code", code);
    return !error;
  } catch { return false; }
}

/* ============================================================
   Commandes
============================================================ */
function rowToOrder(row) {
  return {
    id: row.id,
    createdAt: row.created_at,
    profile: row.profile,
    fileName: row.file_name,
    format: row.format,
    color: row.color,
    sides: row.sides,
    finishing: row.finishing,
    pages: row.pages,
    quantity: row.quantity,
    cvPack: row.cv_pack,
    promo: row.promo,
    breakdown: row.breakdown,
    customer: row.customer,
    status: row.status,
    paymentMethod: row.payment_method,
    paid: row.paid,
  };
}

export async function createOrder(order) {
  try {
    const { error } = await supabase.from("orders").insert({
      id: order.id,
      created_at: order.createdAt,
      profile: order.profile,
      file_name: order.fileName,
      format: order.format,
      color: order.color,
      sides: order.sides,
      finishing: order.finishing,
      pages: order.pages,
      quantity: order.quantity,
      cv_pack: order.cvPack,
      promo: order.promo,
      breakdown: order.breakdown,
      customer: order.customer,
      status: order.status,
      payment_method: order.paymentMethod,
      paid: order.paid,
    });
    return !error;
  } catch { return false; }
}

// Suivi public : uniquement les infos non sensibles (pas email/téléphone),
// consultable par n'importe qui connaissant le numéro de commande.
export async function trackOrderPublic(id) {
  try {
    const { data, error } = await supabase.rpc("track_order", { p_id: id });
    if (error || !data || data.length === 0) return null;
    const row = data[0];
    return { id: row.id, createdAt: row.created_at, status: row.status, total: Number(row.total) };
  } catch { return null; }
}

// Réservé à l'admin connecté (RLS: authenticated uniquement).
export async function getAllOrders() {
  try {
    const { data, error } = await supabase.from("orders").select("*").order("created_at", { ascending: false });
    if (error || !data) return [];
    return data.map(rowToOrder);
  } catch { return []; }
}

export async function updateOrderStatus(id, status) {
  try {
    const { error } = await supabase.from("orders").update({ status }).eq("id", id);
    return !error;
  } catch { return false; }
}

/* ============================================================
   Authentification admin (vrai compte Supabase, pas un mot de
   passe codé en dur côté client)
============================================================ */
export async function adminSignIn(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { ok: false, error: error.message };
  return { ok: true, session: data.session };
}

export async function adminSignOut() {
  try { await supabase.auth.signOut(); } catch {}
}

export async function getAdminSession() {
  try {
    const { data } = await supabase.auth.getSession();
    return data.session || null;
  } catch { return null; }
}

export function onAdminAuthChange(callback) {
  const { data } = supabase.auth.onAuthStateChange((_event, session) => callback(session));
  return () => data.subscription.unsubscribe();
}
