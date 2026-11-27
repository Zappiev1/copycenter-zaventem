import { useEffect, useState } from "react";
import { Loader2, LogOut, RefreshCw, Users, Eye, ShoppingBag, Euro, TrendingUp, Tag, Smartphone, Globe2, MousePointerClick, KeyRound, X } from "lucide-react";
import { fetchStats, markOwnDevice, dashResetStats } from "./analytics";
import { PromoAdmin } from "./promoadmin";
import { OrdersAdmin } from "./orders";
import { AnnouncementAdmin, ServicesAdmin, HoursAdmin, PricesAdmin } from "./settingsadmin";
import { getSetting } from "./data";

/* ============================================================
   Tableau de bord caché (français, pour le magasin).
   Accès : taper le code du magasin dans « Bestelling opvolgen », ou ouvrir le site avec #beheer.
============================================================ */

const SVC = { bw: "Noir et blanc", color: "Couleur", poster: "Impression A3", bind: "Reliure", lam: "Plastification", cv: "CV", photo: "Photos", cards: "Cartes de visite", flyers: "Flyers" };
const KIND = { print: "Impressions", photo: "Photos", card: "Cartes de visite", cv: "CV" };
const STATUS = { received: "Reçue", analyzed: "Analysée", waiting: "En attente", printing: "Impression", binding: "Reliure", quality: "Contrôle", ready: "Prête", done: "Terminée", cancelled: "Annulée" };
const SRC = { direct: "Direct / QR code / favori", google: "Google", facebook: "Facebook", instagram: "Instagram", whatsapp: "WhatsApp", bing: "Bing", tiktok: "TikTok" };
const LANG = { nl: "Néerlandais", fr: "Français", en: "Anglais", ar: "Arabe", tr: "Turc", de: "Allemand", es: "Espagnol" };
const eur = (v) => (+v || 0).toFixed(2).replace(".", ",") + " €";
const ss = { get: (k) => { try { return sessionStorage.getItem(k); } catch { return null; } }, set: (k, v) => { try { v == null ? sessionStorage.removeItem(k) : sessionStorage.setItem(k, v); } catch { /* ignore */ } } };

function Tile({ icon: Icon, label, value, sub }) {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-4">
      <div className="flex items-center gap-2 text-slate-500 text-sm"><Icon className="w-4 h-4" /> {label}</div>
      <div className="mt-2 text-3xl font-bold text-slate-900 tabular-nums" style={{ fontFamily: "'Sora', sans-serif" }}>{value}</div>
      {sub && <div className="text-xs text-slate-500 mt-1">{sub}</div>}
    </div>
  );
}

function BarList({ title, icon: Icon, rows, empty = "Pas encore de données" }) {
  const max = Math.max(1, ...rows.map((r) => r.n));
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5">
      <h3 className="font-semibold text-slate-900 flex items-center gap-2 mb-3"><Icon className="w-4 h-4 text-slate-500" /> {title}</h3>
      {rows.length === 0 ? <p className="text-sm text-slate-400">{empty}</p> : (
        <ul className="space-y-2.5">
          {rows.map((r) => (
            <li key={r.label}>
              <div className="flex justify-between text-sm"><span className="text-slate-700">{r.label}</span><span className="font-semibold tabular-nums text-slate-900">{r.n}</span></div>
              <div className="h-2 bg-slate-100 rounded-full mt-1 overflow-hidden"><div className="h-full bg-blue-600 rounded-full" style={{ width: `${(r.n / max) * 100}%` }} /></div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function DayChart({ days }) {
  const [hover, setHover] = useState(null);
  const max = Math.max(1, ...days.map((d) => d.visitors));
  const fmt = (s) => new Date(s + "T12:00:00").toLocaleDateString("fr-BE", { day: "numeric", month: "short" });
  const h = hover ?? days.length - 1;
  const cur = days[h];
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5">
      <div className="flex flex-wrap items-baseline justify-between gap-2 mb-4">
        <h3 className="font-semibold text-slate-900">Visiteurs par jour</h3>
        {cur && <p className="text-sm text-slate-600"><span className="font-semibold text-slate-900">{fmt(cur.day)}</span> : {cur.visitors} visiteur{cur.visitors > 1 ? "s" : ""} · {cur.visits} visite{cur.visits > 1 ? "s" : ""} · {cur.orders} commande{cur.orders > 1 ? "s" : ""}</p>}
      </div>
      <div className="relative h-44 flex items-end gap-[2px]" onMouseLeave={() => setHover(null)}>
        {[0.5, 1].map((f) => <div key={f} className="absolute left-0 right-0 border-t border-dashed border-slate-200" style={{ bottom: `${f * 100}%` }}><span className="absolute -top-2.5 right-0 text-[10px] text-slate-400 bg-white pl-1">{Math.round(max * f)}</span></div>)}
        {days.map((d, i) => (
          <button key={d.day} type="button" aria-label={`${fmt(d.day)} : ${d.visitors} visiteurs, ${d.orders} commandes`}
            onMouseEnter={() => setHover(i)} onFocus={() => setHover(i)} onClick={() => setHover(i)}
            className="relative flex-1 h-full flex items-end group focus:outline-none">
            <div className={"w-full rounded-t-[4px] transition-colors " + (i === h ? "bg-blue-700" : "bg-blue-300 group-hover:bg-blue-500")} style={{ height: `${Math.max(d.visitors ? 3 : 0, (d.visitors / max) * 100)}%` }} />
            {d.orders > 0 && <span className="absolute left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-amber-500 ring-2 ring-white" style={{ bottom: `calc(${(d.visitors / max) * 100}% + 4px)` }} />}
          </button>
        ))}
      </div>
      <div className="flex justify-between text-[11px] text-slate-400 mt-2"><span>{days[0] && fmt(days[0].day)}</span><span>{days.at(-1) && fmt(days.at(-1).day)}</span></div>
      <p className="text-xs text-slate-500 mt-3 flex items-center gap-4"><span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-blue-300" /> Visiteurs</span><span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-amber-500" /> Jour avec commande</span></p>
    </div>
  );
}

export function Dashboard({ initialKey, onClose }) {
  const [key, setKey] = useState(initialKey || ss.get("ccz_dash") || "");
  const [input, setInput] = useState("");
  const [days, setDays] = useState(30);
  const [tab, setTab] = useState("orders");
  const [data, setData] = useState(null);
  const [allTime, setAllTime] = useState(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  async function load(k = key, d = days) {
    if (!k) return;
    setLoading(true); setErr("");
    try {
      const s = await fetchStats(k, d);
      setData(s); setKey(k); ss.set("ccz_dash", k); markOwnDevice();
    } catch {
      setData(null); setKey(""); ss.set("ccz_dash", null);
      setErr("Code incorrect ou pas de connexion internet.");
    }
    setLoading(false);
  }

  useEffect(() => { if (key) load(key, days); getSetting("visit_count", null).then(setAllTime).catch(() => {}); }, []);
  useEffect(() => { if (!key) return; const t = setInterval(() => load(key, days), 60000); return () => clearInterval(t); }, [key, days]);

  const shell = (children) => (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-5 h-16 flex items-center justify-between">
          <span className="font-semibold text-slate-900" style={{ fontFamily: "'Sora', sans-serif" }}>Tableau de bord <span className="text-slate-400 font-medium">Copy Center</span></span>
          <div className="flex items-center gap-2">
            {key && <button type="button" onClick={() => { ss.set("ccz_dash", null); setKey(""); setData(null); }} className="text-sm text-slate-500 hover:text-slate-800 flex items-center gap-1.5 px-2 py-1"><LogOut className="w-4 h-4" /> Verrouiller</button>}
            <button type="button" onClick={onClose} aria-label="Retour au site" className="w-9 h-9 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-500"><X className="w-5 h-5" /></button>
          </div>
        </div>
      </header>
      <main className="max-w-5xl mx-auto px-5 py-6">{children}</main>
    </div>
  );

  if (!data) {
    return shell(
      <div className="max-w-sm mx-auto mt-12 bg-white border border-slate-200 rounded-2xl p-6">
        <div className="w-11 h-11 rounded-xl bg-slate-900 text-white flex items-center justify-center mb-4"><KeyRound className="w-5 h-5" /></div>
        <h1 className="text-xl font-semibold text-slate-900 mb-1">Accès réservé</h1>
        <p className="text-sm text-slate-500 mb-5">Entre ton code d'accès.</p>
        <label htmlFor="dash-code" className="text-sm font-semibold text-slate-700">Code d'accès</label>
        <input id="dash-code" autoFocus value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && load(input.trim())}
          type="password" autoComplete="off" className="mt-1 w-full rounded-xl border border-slate-300 px-3.5 py-2.5 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100" />
        {err && <p className="text-sm text-red-600 mt-2" role="alert">{err}</p>}
        <button type="button" disabled={loading || !input.trim()} onClick={() => load(input.trim())} className="mt-4 w-full rounded-xl bg-slate-900 disabled:opacity-50 text-white font-semibold py-3 flex items-center justify-center gap-2">
          {loading && <Loader2 className="w-4 h-4 animate-spin" />} Ouvrir
        </button>
      </div>
    );
  }

  const conv = data.visitors ? Math.round((data.orders / data.visitors) * 1000) / 10 : 0;
  const map = (obj, names) => Object.entries(obj || {}).map(([k, n]) => ({ label: names[k] || k, n })).sort((a, b) => b.n - a.n);

  const TABS = [["orders", "Commandes"], ["stats", "Statistiques"], ["promos", "Codes promo"], ["prices", "Prix"], ["site", "Site"]];
  return shell(<>
    <nav className="flex gap-1 mb-5 overflow-x-auto -mx-1 px-1" aria-label="Sections">
      {TABS.map(([k, l]) => (
        <button key={k} type="button" aria-current={tab === k ? "page" : undefined} onClick={() => setTab(k)}
          className={"px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap " + (tab === k ? "bg-blue-700 text-white" : "bg-white border border-slate-200 text-slate-600 hover:text-slate-900")}>{l}</button>
      ))}
    </nav>
    {tab === "orders" && <OrdersAdmin dashKey={key} />}
    {tab === "promos" && <PromoAdmin dashKey={key} />}
    {tab === "prices" && <PricesAdmin dashKey={key} />}
    {tab === "site" && <div className="space-y-4"><AnnouncementAdmin dashKey={key} /><ServicesAdmin dashKey={key} /><HoursAdmin dashKey={key} /></div>}
    {tab === "stats" && <>
    <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
      <div className="inline-flex bg-white border border-slate-200 rounded-xl p-1" role="group" aria-label="Période">
        {[[1, "Aujourd'hui"], [7, "7 jours"], [30, "30 jours"], [90, "90 jours"]].map(([d, l]) => (
          <button key={d} type="button" aria-pressed={days === d} onClick={() => { setDays(d); load(key, d); }}
            className={"px-3 py-1.5 rounded-lg text-sm font-semibold " + (days === d ? "bg-slate-900 text-white" : "text-slate-600 hover:text-slate-900")}>{l}</button>
        ))}
      </div>
      <button type="button" onClick={() => load()} className="text-sm text-slate-600 hover:text-slate-900 flex items-center gap-1.5"><RefreshCw className={"w-4 h-4 " + (loading ? "animate-spin" : "")} /> Actualiser</button>
    </div>

    <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 mb-4">
      <Tile icon={Users} label="Visiteurs aujourd'hui" value={data.today_visitors} sub={`${data.today_visits} visite${data.today_visits > 1 ? "s" : ""}`} />
      <Tile icon={Eye} label={days === 1 ? "Visiteurs" : `Visiteurs (${days} j)`} value={data.visitors} sub={`${data.visits} visites${allTime ? ` · ${allTime} pages vues depuis le lancement` : ""}`} />
      <Tile icon={ShoppingBag} label={days === 1 ? "Commandes" : `Commandes (${days} j)`} value={data.orders} sub={`dont ${data.orders_today} aujourd'hui`} />
      <Tile icon={Euro} label="Montant des commandes" value={eur(data.revenue)} sub="hors commandes annulées" />
      <Tile icon={TrendingUp} label="Taux de commande" value={`${String(conv).replace(".", ",")} %`} sub="visiteurs qui ont commandé" />
      <Tile icon={Tag} label="Codes promo utilisés" value={data.promo_uses} sub="dont WELKOM20" />
    </div>

    {data.per_day?.length > 1 && <div className="mb-4"><DayChart days={data.per_day} /></div>}

    <div className="grid md:grid-cols-2 gap-4 mb-4">
      <BarList title="Services les plus regardés" icon={MousePointerClick} rows={(data.services || []).map((r) => ({ label: SVC[r.svc] || r.svc, n: r.n }))} />
      <BarList title="D'où viennent les visiteurs" icon={Globe2} rows={(data.sources || []).map((r) => ({ label: SRC[r.src] || r.src, n: r.n }))} />
      <BarList title="Appareils" icon={Smartphone} rows={map(data.devices, { mobile: "Téléphone", ordinateur: "Ordinateur", tablette: "Tablette" })} />
      <BarList title="Langue de l'appareil" icon={Globe2} rows={map(data.langs, LANG)} />
      <BarList title="Types de commandes" icon={ShoppingBag} rows={map(data.by_kind, KIND)} />
    </div>

    <div className="bg-white border border-slate-200 rounded-2xl p-5">
      <h3 className="font-semibold text-slate-900 mb-3">Dernières commandes</h3>
      {(data.recent || []).length === 0 ? <p className="text-sm text-slate-400">Aucune commande pour l'instant.</p> : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="text-left text-slate-500 border-b border-slate-200"><th className="py-2 font-medium">N°</th><th className="font-medium">Date</th><th className="font-medium">Client</th><th className="font-medium">Type</th><th className="font-medium">Statut</th><th className="font-medium text-right">Total</th></tr></thead>
            <tbody>
              {data.recent.map((o) => (
                <tr key={o.id} className="border-b border-slate-100 last:border-0">
                  <td className="py-2 font-mono text-xs">{o.id}</td>
                  <td className="text-slate-600 whitespace-nowrap">{new Date(o.created_at).toLocaleString("fr-BE", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}</td>
                  <td className="text-slate-800">{o.name}</td>
                  <td className="text-slate-600">{KIND[o.kind] || o.kind}</td>
                  <td className="text-slate-600">{STATUS[o.status] || o.status}</td>
                  <td className="text-right font-semibold tabular-nums">{eur(o.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
    <div className="flex flex-wrap items-center justify-between gap-3 mt-4">
      <p className="text-xs text-slate-400">Mis à jour automatiquement chaque minute. Tes propres visites, depuis cet appareil, ne sont pas comptées.</p>
      <button type="button" onClick={async () => {
        if (!confirm("Remettre toutes les statistiques à zéro ? Les visites et commandes d'avant ne seront plus comptées ici (les commandes restent dans la caisse).")) return;
        try { await dashResetStats(key); await load(); } catch { alert("Pas de connexion internet."); }
      }} className="text-xs text-slate-500 hover:text-red-600 underline">Remettre les statistiques à zéro</button>
    </div>
    </>}
  </>);
}
