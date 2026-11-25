import { useEffect, useState } from "react";
import { Megaphone, Eye, Clock, Euro, Loader2, Check } from "lucide-react";
import { getSetting } from "./data";
import { dashSettingSet } from "./analytics";
import { DAYS, DEFAULT_HOURS, DEFAULT_SERVICES, DEFAULT_EXTRA, loadSiteConfig } from "./siteconfig";

/* ============================================================
   Réglages du site dans le tableau de bord : annonce, services, horaires, prix.
============================================================ */

const field = "w-full rounded-xl border border-slate-300 px-3 py-2 bg-white focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100";
const num = (v) => { const n = parseFloat(String(v).replace(",", ".")); return Number.isFinite(n) ? n : 0; };
const toHM = (m) => (m == null ? "" : `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`);
const fromHM = (s) => { const [h, m] = String(s || "").split(":").map(Number); return Number.isFinite(h) ? h * 60 + (m || 0) : null; };

function Card({ icon: Icon, title, sub, children }) {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5">
      <h3 className="font-semibold text-slate-900 flex items-center gap-2"><Icon className="w-4 h-4 text-slate-500" /> {title}</h3>
      {sub && <p className="text-sm text-slate-500 mt-1">{sub}</p>}
      <div className="mt-4">{children}</div>
    </div>
  );
}

function useSaver(dashKey, name) {
  const [state, setState] = useState("idle"); // idle | saving | saved | error
  const [msg, setMsg] = useState("");
  async function save(value) {
    setState("saving"); setMsg("");
    try { await dashSettingSet(dashKey, name, value); setState("saved"); loadSiteConfig(true); setTimeout(() => setState("idle"), 2500); }
    catch (e) { setState("error"); setMsg(e.message); }
  }
  const Btn = ({ onClick, label = "Enregistrer" }) => (
    <div className="flex items-center gap-3 mt-4">
      <button type="button" onClick={onClick} disabled={state === "saving"} className="rounded-xl bg-slate-900 disabled:opacity-50 text-white font-semibold px-5 py-2.5 flex items-center gap-2">
        {state === "saving" && <Loader2 className="w-4 h-4 animate-spin" />} {label}
      </button>
      {state === "saved" && <span className="text-sm text-green-700 flex items-center gap-1"><Check className="w-4 h-4" /> Enregistré, visible sur le site</span>}
      {state === "error" && <span className="text-sm text-red-600" role="alert">Pas enregistré : {msg}</span>}
    </div>
  );
  return { save, Btn };
}

/* ---------- Annonce ---------- */
export function AnnouncementAdmin({ dashKey }) {
  const [a, setA] = useState(null);
  const { save, Btn } = useSaver(dashKey, "announcement");
  useEffect(() => { getSetting("announcement", { enabled: false, text: "" }).then((v) => setA(v || { enabled: false, text: "" })); }, []);
  if (!a) return <Card icon={Megaphone} title="Bandeau d'annonce"><Loader2 className="w-5 h-5 animate-spin text-slate-400" /></Card>;
  return (
    <Card icon={Megaphone} title="Bandeau d'annonce" sub="Un message affiché tout en haut du site, par exemple une fermeture exceptionnelle.">
      <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-3">
        <input type="checkbox" className="w-4 h-4" checked={!!a.enabled} onChange={(e) => setA({ ...a, enabled: e.target.checked })} /> Afficher le bandeau
      </label>
      <label htmlFor="ann-text" className="text-xs font-semibold text-slate-600">Texte (en néerlandais, c'est la langue du site)</label>
      <textarea id="ann-text" rows={2} maxLength={200} className={field} placeholder="Bijv.: Gesloten op 25 december." value={a.text || ""} onChange={(e) => setA({ ...a, text: e.target.value })} />
      <Btn onClick={() => save({ enabled: !!a.enabled && !!a.text.trim(), text: a.text.trim() })} />
    </Card>
  );
}

/* ---------- Services ---------- */
const SVC_NAMES = { bw: "Noir et blanc", color: "Couleur", poster: "Impression A3", photo: "Photos", cards: "Cartes de visite", flyers: "Flyers", bind: "Reliure", lam: "Plastification", cv: "Service CV" };
export function ServicesAdmin({ dashKey }) {
  const [sv, setSv] = useState(null);
  const { save, Btn } = useSaver(dashKey, "services");
  useEffect(() => { getSetting("services", null).then((v) => setSv({ ...DEFAULT_SERVICES, ...(v || {}) })); }, []);
  if (!sv) return <Card icon={Eye} title="Services sur le site"><Loader2 className="w-5 h-5 animate-spin text-slate-400" /></Card>;
  return (
    <Card icon={Eye} title="Services sur le site" sub="Choisis pour chaque service s'il peut être commandé, s'il est annoncé « bientôt », ou s'il est caché.">
      <ul className="divide-y divide-slate-100">
        {Object.keys(DEFAULT_SERVICES).map((k) => (
          <li key={k} className="py-2.5 flex flex-wrap items-center justify-between gap-2">
            <span className="text-sm font-medium text-slate-800">{SVC_NAMES[k]}</span>
            <div className="inline-flex bg-slate-100 rounded-lg p-0.5" role="group" aria-label={SVC_NAMES[k]}>
              {[["on", "Disponible"], ["soon", "Bientôt"], ["off", "Caché"]].map(([v, l]) => {
                const disabled = k === "flyers" && v === "on";
                return (
                  <button key={v} type="button" disabled={disabled} aria-pressed={sv[k] === v} onClick={() => setSv({ ...sv, [k]: v })}
                    title={disabled ? "Le formulaire de commande des flyers n'existe pas encore" : undefined}
                    className={"px-3 py-1.5 rounded-md text-xs font-semibold " + (sv[k] === v ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-800") + (disabled ? " opacity-40 cursor-not-allowed" : "")}>{l}</button>
                );
              })}
            </div>
          </li>
        ))}
      </ul>
      <p className="text-xs text-slate-500 mt-2">Pour les flyers, « Disponible » sera possible quand on aura créé leur formulaire de commande.</p>
      <Btn onClick={() => save(sv)} />
    </Card>
  );
}

/* ---------- Horaires ---------- */
export function HoursAdmin({ dashKey }) {
  const [h, setH] = useState(null);
  const { save, Btn } = useSaver(dashKey, "hours");
  useEffect(() => { getSetting("hours", null).then((v) => setH(Array.isArray(v) && v.length === 7 ? v : DEFAULT_HOURS)); }, []);
  if (!h) return <Card icon={Clock} title="Horaires d'ouverture"><Loader2 className="w-5 h-5 animate-spin text-slate-400" /></Card>;
  const upd = (i, patch) => setH(h.map((d, j) => (j === i ? { ...d, ...patch } : d)));
  return (
    <Card icon={Clock} title="Horaires d'ouverture" sub="Affichés sur le site, avec « ouvert / fermé » en direct.">
      <div className="space-y-2">
        {DAYS.map((day, i) => {
          const d = h[i] || {}; const closed = d.open == null;
          return (
            <div key={day} className="grid grid-cols-[90px_1fr] sm:grid-cols-[110px_auto_1fr] items-center gap-2">
              <span className="text-sm font-medium text-slate-800">{day}</span>
              <label className="text-xs text-slate-600 flex items-center gap-1.5 sm:order-none order-last col-span-2 sm:col-span-1">
                <input type="checkbox" className="w-4 h-4" checked={closed} onChange={(e) => upd(i, e.target.checked ? { open: null } : { open: 540, close: d.close || 1140 })} /> Fermé
              </label>
              {!closed ? (
                <div className="flex items-center gap-2">
                  <input type="time" aria-label={`${day} ouverture`} className={field + " max-w-[150px]"} value={toHM(d.open)} onChange={(e) => upd(i, { open: fromHM(e.target.value) })} />
                  <span className="text-slate-400">–</span>
                  <input type="time" aria-label={`${day} fermeture`} className={field + " max-w-[150px]"} value={toHM(d.close)} onChange={(e) => upd(i, { close: fromHM(e.target.value) })} />
                </div>
              ) : <span className="text-sm text-slate-400">Fermé toute la journée</span>}
            </div>
          );
        })}
      </div>
      <p className="text-xs text-slate-500 mt-3">Pense aussi à changer les horaires sur ta fiche Google.</p>
      <Btn onClick={() => {
        const bad = h.find((d) => d.open != null && !(d.close > d.open));
        if (bad) { alert(`${bad.day} : l'heure de fermeture doit être après l'ouverture.`); return; }
        save(DAYS.map((day, i) => ({ day, open: h[i].open ?? null, close: h[i].close ?? 1140 })));
      }} />
    </Card>
  );
}

/* ---------- Prix ---------- */
function Price({ label, value, onChange }) {
  return (
    <label className="block">
      <span className="text-xs text-slate-600">{label}</span>
      <div className="relative">
        <input inputMode="decimal" className={field + " pr-7"} value={value} onChange={(e) => onChange(e.target.value)} />
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">€</span>
      </div>
    </label>
  );
}
const tierLabel = (t) => (t.max == null || t.max === Infinity || t.max > 100000 ? `${t.min} pages et +` : `${t.min} à ${t.max} pages`);

export function PricesAdmin({ dashKey }) {
  const [p, setP] = useState(null);
  const [x, setX] = useState(null);
  const main = useSaver(dashKey, "pricing");
  const extra = useSaver(dashKey, "extra_prices");
  useEffect(() => {
    getSetting("pricing", null).then((v) => setP(v ? JSON.parse(JSON.stringify(v)) : null));
    getSetting("extra_prices", null).then((v) => setX({ photo: { ...DEFAULT_EXTRA.photo, ...(v?.photo || {}) }, cards: { ...DEFAULT_EXTRA.cards, ...(v?.cards || {}) } }));
  }, []);
  if (!p || !x) return <Card icon={Euro} title="Prix"><Loader2 className="w-5 h-5 animate-spin text-slate-400" /></Card>;

  const set = (path, v) => {   // path : ["printing","A4","nb","fixed",0]
    const n = JSON.parse(JSON.stringify(p)); let o = n;
    for (let i = 0; i < path.length - 1; i++) o = o[path[i]];
    o[path.at(-1)] = v; setP(n);
  };
  const clean = (o) => JSON.parse(JSON.stringify(o), (k, v) => (typeof v === "string" && /^[\d.,]+$/.test(v) ? num(v) : v));
  const COLORS = { nb: "Noir et blanc", couleur: "Couleur" };

  return (<div className="space-y-4">
    <Card icon={Euro} title="Prix des impressions" sub="1 à 4 pages : prix total. À partir de 5 pages : prix par page.">
      {["A4", "A3", "A5"].filter((f) => p.printing?.[f]).map((f) => (
        <div key={f} className="mb-5">
          {Object.keys(COLORS).filter((c) => p.printing[f][c]).map((c) => {
            const t = p.printing[f][c];
            return (
              <details key={c} className="border border-slate-200 rounded-xl mb-2 group">
                <summary className="cursor-pointer px-4 py-3 font-semibold text-sm text-slate-800 flex justify-between">{f} · {COLORS[c]} <span className="text-slate-400 font-normal">1 page : {String(t.fixed[0]).replace(".", ",")} €</span></summary>
                <div className="px-4 pb-4 grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {t.fixed.map((v, i) => <Price key={"f" + i} label={`${i + 1} page${i ? "s" : ""} (total)`} value={v} onChange={(nv) => set(["printing", f, c, "fixed", i], nv)} />)}
                  {t.tiers.map((tr, i) => <Price key={"t" + i} label={`${tierLabel(tr)} (par page)`} value={tr.rate} onChange={(nv) => set(["printing", f, c, "tiers", i, "rate"], nv)} />)}
                </div>
              </details>
            );
          })}
        </div>
      ))}
    </Card>

    <Card icon={Euro} title="Finitions, CV et frais">
      <p className="text-sm font-semibold text-slate-700 mb-2">Plastification</p>
      <div className="grid grid-cols-3 gap-2 mb-4">
        {Object.keys(p.finishing.plastification).map((k) => <Price key={k} label={k} value={p.finishing.plastification[k]} onChange={(v) => set(["finishing", "plastification", k], v)} />)}
      </div>
      {[["spirale", "Reliure spirale"], ["thermique", "Reliure thermique"]].filter(([k]) => p.finishing[k]).map(([k, l]) => (
        <div key={k} className="mb-4">
          <p className="text-sm font-semibold text-slate-700 mb-2">{l}</p>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            {p.finishing[k].map((tr, i) => <Price key={i} label={tr.max == null || tr.max > 100000 ? "Plus de pages" : `Jusqu'à ${tr.max} p.`} value={tr.price} onChange={(v) => set(["finishing", k, i, "price"], v)} />)}
          </div>
        </div>
      ))}
      <p className="text-sm font-semibold text-slate-700 mb-2">Service CV</p>
      <div className="grid grid-cols-3 gap-2 mb-4">
        {[["simple", "Simple"], ["professionnel", "Professionnel"], ["packEmploi", "Pack emploi"]].map(([k, l]) => <Price key={k} label={l} value={p.cv[k]} onChange={(v) => set(["cv", k], v)} />)}
      </div>
      <p className="text-sm font-semibold text-slate-700 mb-2">Supplément papier cartonné 250 g (par feuille)</p>
      <div className="grid grid-cols-3 gap-2 mb-4">
        {["A5", "A4", "A3"].map((k) => <Price key={k} label={k} value={(p.carton || { A5: 0.2, A4: 0.3, A3: 0.5 })[k]} onChange={(v) => setP({ ...p, carton: { ...(p.carton || { A5: 0.2, A4: 0.3, A3: 0.5 }), [k]: v } })} />)}
      </div>
      <div className="max-w-[220px]"><Price label="Frais de préparation (impressions et photos)" value={p.prepFee} onChange={(v) => set(["prepFee"], v)} /></div>
      <main.Btn onClick={() => main.save(clean(p))} label="Enregistrer les prix" />
    </Card>

    <Card icon={Euro} title="Photos et cartes de visite">
      <p className="text-sm font-semibold text-slate-700 mb-2">Photos (prix par photo)</p>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
        {Object.keys(x.photo).map((k) => <Price key={k} label={k} value={x.photo[k]} onChange={(v) => setX({ ...x, photo: { ...x.photo, [k]: v } })} />)}
      </div>
      <p className="text-sm font-semibold text-slate-700 mb-2">Cartes de visite</p>
      <div className="space-y-2">
        {Object.keys(x.cards).map((q) => (
          <div key={q} className="grid grid-cols-[80px_1fr_1fr] gap-2 items-end">
            <span className="text-sm font-medium text-slate-800 pb-2.5">{q} cartes</span>
            <Price label="Recto" value={x.cards[q][0]} onChange={(v) => setX({ ...x, cards: { ...x.cards, [q]: [v, x.cards[q][1]] } })} />
            <Price label="Recto-verso" value={x.cards[q][1]} onChange={(v) => setX({ ...x, cards: { ...x.cards, [q]: [x.cards[q][0], v] } })} />
          </div>
        ))}
      </div>
      <extra.Btn onClick={() => extra.save({ photo: Object.fromEntries(Object.entries(x.photo).map(([k, v]) => [k, num(v)])), cards: Object.fromEntries(Object.entries(x.cards).map(([k, v]) => [k, v.map(num)])) })} label="Enregistrer ces prix" />
    </Card>
  </div>);
}
