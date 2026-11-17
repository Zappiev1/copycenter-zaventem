import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Tag, Clock, Camera, Contact, Sparkles } from "lucide-react";
import { SERVICES } from "./catalog";
import { LAUNCH_PROMO as CV_PROMO, launchActive as cvPromoActive } from "./launchpromo";

/* ============================================================
   Bannière promo de la page d'accueil : bandeau défilant + diaporama.
   Pour ajouter une promo : ajoute une entrée dans SLIDES et ses textes dans PT.
============================================================ */

const PT = {
  nl: {
    ticker: ["-20% op alles met code WELKOM20", "Visitekaartjes vanaf € 15", "Foto's afdrukken vanaf € 0,60", "Bestel online, betaal in de winkel", "Nieuwe acties komen eraan"],
    cv: { kicker: "Lanceringsactie", title: "-20% op alles", sub: "Met code", cta: "Nu bestellen", ends: "Eindigt over" },
    cards: { kicker: "Nieuw", title: "Visitekaartjes vanaf € 15", sub: "50 tot 1000 stuks, zonder extra kosten", cta: "Bestel je kaartjes" },
    photo: { kicker: "Rechtstreeks vanuit je gsm", title: "Foto's vanaf € 0,60", sub: "9x13, 10x15, 15x15 en 15x20", cta: "Foto's afdrukken" },
    soon: { kicker: "Binnenkort", title: "Meer acties komen eraan", sub: "Flyers en nieuwe promoties: kom snel terug!", cta: null },
    d: "d", h: "u", m: "min", s: "sec", prev: "Vorige", next: "Volgende", go: "Ga naar dia",
  },
  fr: {
    ticker: ["-20 % sur tout avec le code WELKOM20", "Cartes de visite dès 15 €", "Tirage photo dès 0,60 €", "Commandez en ligne, payez en magasin", "De nouvelles promos arrivent"],
    cv: { kicker: "Offre de lancement", title: "-20 % sur tout", sub: "Avec le code", cta: "Commander", ends: "Se termine dans" },
    cards: { kicker: "Nouveau", title: "Cartes de visite dès 15 €", sub: "De 50 à 1000 pièces, sans frais", cta: "Commander mes cartes" },
    photo: { kicker: "Directement depuis votre gsm", title: "Photos dès 0,60 €", sub: "9x13, 10x15, 15x15 et 15x20", cta: "Imprimer mes photos" },
    soon: { kicker: "Bientôt", title: "D'autres promos arrivent", sub: "Flyers et nouvelles offres : revenez vite !", cta: null },
    d: "j", h: "h", m: "min", s: "s", prev: "Précédent", next: "Suivant", go: "Aller à la diapositive",
  },
  en: {
    ticker: ["20% off everything with code WELKOM20", "Business cards from €15", "Photo prints from €0.60", "Order online, pay in store", "New deals coming soon"],
    cv: { kicker: "Launch offer", title: "20% off everything", sub: "With code", cta: "Order now", ends: "Ends in" },
    cards: { kicker: "New", title: "Business cards from €15", sub: "50 to 1000 cards, no extra fees", cta: "Order my cards" },
    photo: { kicker: "Straight from your phone", title: "Photos from €0.60", sub: "9x13, 10x15, 15x15 and 15x20", cta: "Print my photos" },
    soon: { kicker: "Coming soon", title: "More deals on the way", sub: "Flyers and new offers: check back soon!", cta: null },
    d: "d", h: "h", m: "min", s: "sec", prev: "Previous", next: "Next", go: "Go to slide",
  },
};

const reduced = () => typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

function useNow() {
  const [now, setNow] = useState(Date.now());
  useEffect(() => { const t = setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(t); }, []);
  return now;
}

function Countdown({ until, P }) {
  const now = useNow();
  let left = Math.max(0, Math.floor((until - now) / 1000));
  const d = Math.floor(left / 86400); left -= d * 86400;
  const h = Math.floor(left / 3600); left -= h * 3600;
  const m = Math.floor(left / 60); const s = left - m * 60;
  const box = (v, l) => (
    <div className="bg-white text-red-700 rounded-xl w-14 sm:w-16 py-1.5 text-center shadow">
      <div className="text-2xl sm:text-3xl font-extrabold tabular-nums leading-none" style={{ fontFamily: "'Sora', sans-serif" }}>{String(v).padStart(2, "0")}</div>
      <div className="text-[11px] font-semibold uppercase mt-0.5 text-red-900">{l}</div>
    </div>
  );
  return <div className="flex gap-2" aria-live="off">{box(d, P.d)}{box(h, P.h)}{box(m, P.m)}{box(s, P.s)}</div>;
}

export function PromoBanner({ lang, onPick }) {
  const P = PT[lang] || PT.nl;
  const pick = (key) => key ? onPick(SERVICES.find((s) => s.key === key)) : document.getElementById("diensten")?.scrollIntoView({ behavior: "smooth" });
  const slides = [
    cvPromoActive() && { key: "cv", bg: "bg-red-600", text: "text-white", icon: Tag, svc: null },
    { key: "cards", bg: "bg-blue-700", text: "text-white", icon: Contact, svc: "cards" },
    { key: "photo", bg: "bg-amber-300", text: "text-slate-900", icon: Camera, svc: "photo" },
    { key: "soon", bg: "bg-slate-900", text: "text-white", icon: Sparkles, svc: null },
  ].filter(Boolean);

  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);
  const touch = useRef(null);
  const n = slides.length;
  const go = (k) => setI(((k % n) + n) % n);

  useEffect(() => {
    if (paused || reduced()) return;
    const t = setTimeout(() => go(i + 1), 5500);
    return () => clearTimeout(t);
  }, [i, paused, n]);

  return (
    <div className="mb-10 -mx-5 sm:mx-0">
      {/* bandeau défilant */}
      <div className="overflow-hidden bg-amber-300 text-slate-900 sm:rounded-t-2xl">
        <div className="promo-marquee flex w-max py-2">
          {[0, 1].map((k) => (
            <div key={k} className="flex shrink-0" aria-hidden={k === 1}>
              {P.ticker.map((t, j) => (
                <span key={j} className="px-6 text-sm font-bold whitespace-nowrap flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-600" /> {t}
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* diaporama */}
      <div className="relative overflow-hidden sm:rounded-b-2xl shadow-lg"
        onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}
        onFocus={() => setPaused(true)} onBlur={() => setPaused(false)}
        onTouchStart={(e) => { touch.current = e.touches[0].clientX; setPaused(true); }}
        onTouchEnd={(e) => { const dx = e.changedTouches[0].clientX - (touch.current ?? 0); if (Math.abs(dx) > 40) go(i + (dx < 0 ? 1 : -1)); setPaused(false); }}
        aria-roledescription="carousel">
        <div className="flex transition-transform duration-700 ease-out motion-reduce:transition-none" style={{ transform: `translateX(-${i * 100}%)` }}>
          {slides.map((s, k) => {
            const t = P[s.key]; const Icon = s.icon;
            return (
              <div key={s.key} className={"w-full shrink-0 " + s.bg + " " + s.text} aria-hidden={k !== i} role="group" aria-roledescription="slide">
                <div className="relative px-6 sm:px-12 pt-8 pb-14 sm:pt-10 sm:pb-12 min-h-[260px] sm:min-h-[240px] flex flex-col sm:flex-row sm:items-center gap-6">
                  <Icon aria-hidden="true" className="absolute -right-6 -bottom-8 w-44 h-44 sm:w-56 sm:h-56 opacity-15 promo-float" strokeWidth={1.5} />
                  <div className="flex-1 relative">
                    <span className="inline-block text-xs sm:text-sm font-bold uppercase tracking-wide bg-black/15 rounded-full px-3 py-1">{t.kicker}</span>
                    <h2 className="mt-3 text-3xl sm:text-5xl font-extrabold leading-tight tracking-tight" style={{ fontFamily: "'Sora', sans-serif" }}>{t.title}</h2>
                    {s.key === "cv" ? (
                      <p className="mt-2 text-base sm:text-lg font-semibold flex items-center gap-2 flex-wrap">{t.sub}
                        <span className="promo-pulse bg-white text-red-700 font-extrabold tracking-wider rounded-lg px-3 py-1 text-lg sm:text-xl border-2 border-dashed border-red-300">{CV_PROMO.code}</span>
                      </p>
                    ) : <p className="mt-2 text-base sm:text-lg opacity-90">{t.sub}</p>}
                    {t.cta && (
                      <button type="button" tabIndex={k === i ? 0 : -1} onClick={() => pick(s.svc)}
                        className={"mt-5 rounded-full px-6 py-3 font-bold inline-flex items-center gap-2 shadow-md transition-transform hover:scale-105 " + (s.key === "photo" ? "bg-slate-900 text-white" : "bg-white text-slate-900")}>
                        {t.cta} <ChevronRight className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                  {s.key === "cv" && (
                    <div className="relative">
                      <p className="text-sm font-semibold mb-2 flex items-center gap-1.5"><Clock className="w-4 h-4" /> {t.ends}</p>
                      <Countdown until={CV_PROMO.until.getTime()} P={P} />
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {n > 1 && (<>
          <button type="button" aria-label={P.prev} onClick={() => go(i - 1)} className="hidden sm:flex absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 text-slate-800 shadow items-center justify-center hover:bg-white"><ChevronLeft className="w-5 h-5" /></button>
          <button type="button" aria-label={P.next} onClick={() => go(i + 1)} className="hidden sm:flex absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 text-slate-800 shadow items-center justify-center hover:bg-white"><ChevronRight className="w-5 h-5" /></button>
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex justify-center gap-2 bg-black/25 rounded-full px-2.5 py-1.5">
            {slides.map((s, k) => (
              <button key={s.key} type="button" aria-label={`${P.go} ${k + 1}`} aria-current={k === i} onClick={() => go(k)}
                className={"h-2.5 rounded-full transition-all " + (k === i ? "w-8 bg-white" : "w-2.5 bg-white/50 hover:bg-white/80")} />
            ))}
          </div>
        </>)}
      </div>
    </div>
  );
}
