import { useState } from "react";

/* ============================================================
   Actie bij de lancering : -20 % op alles met code WELKOM20, 3 dagen geldig.
   Pour la prolonger : change la date "until". Pour l'arrêter : mets une date passée.
============================================================ */
export const LAUNCH_PROMO = { code: "WELKOM20", pct: 20, until: new Date("2026-11-20T23:59:59+01:00") };
export const launchActive = () => Date.now() <= LAUNCH_PROMO.until.getTime();
export const isLaunchCode = (c) => launchActive() && String(c || "").trim().toUpperCase() === LAUNCH_PROMO.code;
export const launchDiscount = (subtotal, on) => (on && launchActive() ? Math.round(subtotal * LAUNCH_PROMO.pct) / 100 : 0);

export const PROMO_T = {
  nl: { banner: "Lanceringsactie: -20% op alles met code", until: "t/m vrijdag 20 november", label: "Kortingscode", ph: "Bijv.: WELKOM20", apply: "Toepassen", bad: "Ongeldige of verlopen kortingscode.", disc: "Korting" },
  fr: { banner: "Offre de lancement : -20 % sur tout avec le code", until: "jusqu'au vendredi 20 novembre", label: "Code promo", ph: "Ex. : WELKOM20", apply: "Appliquer", bad: "Code promo invalide ou expiré.", disc: "Réduction" },
  en: { banner: "Launch offer: 20% off everything with code", until: "until Friday 20 November", label: "Promo code", ph: "E.g.: WELKOM20", apply: "Apply", bad: "Invalid or expired promo code.", disc: "Discount" },
};

/* Champ « code promo » réutilisé par les photos, les cartes de visite et le CV. */
export function LaunchPromoField({ lang, on, setOn }) {
  const PT = PROMO_T[lang] || PROMO_T.nl;
  const [val, setVal] = useState("");
  const [err, setErr] = useState("");
  if (!launchActive()) return null;
  const apply = () => { const ok = isLaunchCode(val); setOn(ok); setErr(ok ? "" : PT.bad); };
  return (
    <div className="mt-3">
      <label className="text-sm font-semibold text-slate-700" htmlFor={"promo-" + lang}>{PT.label}</label>
      <div className="flex gap-2 mt-1">
        <input id={"promo-" + lang} className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-base uppercase focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
          maxLength={20} value={val} placeholder={PT.ph}
          onChange={(e) => { setVal(e.target.value); setErr(""); if (on) setOn(false); }} onKeyDown={(e) => e.key === "Enter" && apply()} />
        <button type="button" onClick={apply} className="flex-shrink-0 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-semibold px-4">{PT.apply}</button>
      </div>
      {err && <p className="text-sm text-red-600 mt-1" role="alert">{err}</p>}
    </div>
  );
}

export function LaunchPromoBanner({ lang }) {
  const PT = PROMO_T[lang] || PROMO_T.nl;
  if (!launchActive()) return null;
  return (
    <div className="rounded-2xl bg-amber-300 text-slate-900 px-5 py-4">
      <p className="font-semibold leading-snug">{PT.banner} <span className="font-extrabold bg-white rounded-lg px-2 py-0.5 tracking-wide">{LAUNCH_PROMO.code}</span> <span className="font-normal">{PT.until}</span></p>
    </div>
  );
}
