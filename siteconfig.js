import { useEffect, useState } from "react";
import { getSetting } from "./data";

/* ============================================================
   Réglages modifiables depuis le tableau de bord :
   horaires, services visibles, prix photos et cartes de visite.
   Valeurs par défaut ci-dessous si rien n'est enregistré.
============================================================ */

export const DAYS = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"];

// open / close en minutes depuis minuit ; open = null → fermé
export const DEFAULT_HOURS = [
  { day: "Lundi", open: 540, close: 1140 },
  { day: "Mardi", open: 540, close: 1140 },
  { day: "Mercredi", open: 540, close: 1140 },
  { day: "Jeudi", open: 540, close: 1140 },
  { day: "Vendredi", open: 840, close: 1140 },
  { day: "Samedi", open: 630, close: 1140 },
  { day: "Dimanche", open: 720, close: 1140 },
];

// "on" = commandable, "soon" = « bientôt disponible », "off" = caché
export const DEFAULT_SERVICES = { bw: "on", color: "on", poster: "on", photo: "on", cards: "on", flyers: "soon", bind: "on", lam: "on", cv: "on" };

export const DEFAULT_EXTRA = {
  photo: { "9x13": 0.6, "10x15": 0.6, "15x15": 1.25, "15x20": 1.5 },
  cards: { 50: [15, 18], 100: [25, 30], 250: [45, 55], 500: [70, 85], 1000: [110, 130] },
};

function normHours(h) {
  if (!Array.isArray(h) || h.length !== 7) return DEFAULT_HOURS;
  return DAYS.map((day, i) => {
    const d = h[i] || {};
    const open = d.open == null ? null : +d.open;
    const close = d.close == null ? null : +d.close;
    return { day, open: open != null && close != null && close > open ? open : null, close: close ?? 1140 };
  });
}

const defaults = () => ({ hours: DEFAULT_HOURS, services: { ...DEFAULT_SERVICES }, extra: DEFAULT_EXTRA, loaded: false });
let cache = null;
let pending = null;
const listeners = new Set();

export function loadSiteConfig(force = false) {
  if (pending && !force) return pending;
  pending = Promise.all([getSetting("hours", null), getSetting("services", null), getSetting("extra_prices", null)])
    .then(([h, s, e]) => {
      cache = {
        hours: normHours(h),
        services: { ...DEFAULT_SERVICES, ...(s && typeof s === "object" ? s : {}) },
        extra: {
          photo: { ...DEFAULT_EXTRA.photo, ...(e?.photo || {}) },
          cards: { ...DEFAULT_EXTRA.cards, ...(e?.cards || {}) },
        },
        loaded: true,
      };
      listeners.forEach((fn) => fn(cache));
      return cache;
    })
    .catch(() => (cache = cache || defaults()));
  return pending;
}

export function useSiteConfig() {
  const [cfg, setCfg] = useState(cache || defaults());
  useEffect(() => {
    listeners.add(setCfg);
    loadSiteConfig().then(setCfg);
    return () => listeners.delete(setCfg);
  }, []);
  return cfg;
}

export const minPhotoPrice = (cfg) => Math.min(...Object.values(cfg.extra.photo));
export const minCardPrice = (cfg) => Math.min(...Object.values(cfg.extra.cards).map((v) => v[0]));
