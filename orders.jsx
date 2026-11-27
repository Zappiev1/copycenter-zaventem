import { useEffect, useRef, useState } from "react";
import { Loader2, RefreshCw, FileText, ExternalLink, Download, Printer, Phone, MessageCircle, StickyNote } from "lucide-react";
import { supabase } from "./supabase";

/* ============================================================
   Onglet « Commandes » du tableau de bord : voir les commandes du site,
   ouvrir / télécharger / imprimer les fichiers et changer le statut.
============================================================ */

const STATUS = [
  ["received", "Reçue", "bg-blue-600"],
  ["analyzed", "Fichier analysé", "bg-indigo-500"],
  ["waiting", "En attente", "bg-amber-500"],
  ["printing", "En impression", "bg-violet-600"],
  ["binding", "En reliure", "bg-fuchsia-600"],
  ["quality", "Contrôle", "bg-cyan-600"],
  ["ready", "Prête à retirer", "bg-green-600"],
  ["done", "Terminée", "bg-slate-500"],
  ["cancelled", "Annulée", "bg-red-600"],
];
const ST = Object.fromEntries(STATUS.map(([k, l, c]) => [k, { l, c }]));
const OPEN = (s) => !["ready", "done", "cancelled"].includes(s);
const eur = (v) => (+v || 0).toFixed(2).replace(".", ",") + " €";
const COLOR = { bw: "noir et blanc", nb: "noir et blanc", color: "couleur", couleur: "couleur" };
const SIDES = { recto: "recto", rectoverso: "recto-verso" };
const FINISH = { aucune: "", none: "", spirale: "reliure spirale", plastification: "plastification", agrafe: "agrafage", agrafage: "agrafage" };

async function signFiles(key, paths, action) {
  const { data, error } = await supabase.functions.invoke("web-file", { body: { key, action, paths } });
  if (error) throw error;
  const urls = (data?.urls || []).map((u) => u.signedUrl).filter(Boolean);
  if (!urls.length) throw new Error("aucun_fichier");
  return urls;
}

const fileName = (p) => decodeURIComponent(String(p).split("/").pop() || "fichier").replace(/^\d{10,}[-_]/, "");

function waLink(phone, id) {
  let p = String(phone || "").replace(/[^0-9+]/g, "");
  if (!p) return null;
  if (p.startsWith("+")) p = p.slice(1); else if (p.startsWith("00")) p = p.slice(2); else if (p.startsWith("0")) p = "32" + p.slice(1);
  const msg = `Hallo, uw bestelling ${id} bij Copy Center Zaventem is klaar. U kunt ze komen afhalen en betalen in de winkel (Stationsstraat 46, Zaventem). Tot straks!`;
  return `https://wa.me/${p}?text=${encodeURIComponent(msg)}`;
}

function describe(o) {
  const b = o.breakdown || {};
  if (b.kind === "card") return `Cartes de visite ${b.qty} pcs · ${b.sides === 2 ? "recto-verso" : "recto"} · ${b.mode === "make" ? "à créer par nous" : "design du client"}`;
  if (b.kind === "photo") return "Photos : " + (b.items || []).map((it) => `${it.size} ×${it.qty}`).join(" · ");
  if (b.kind === "cv") return `CV ${b.pack || ""}`.trim();
  return [o.format, COLOR[o.color] || o.color, SIDES[o.sides] || o.sides, `${o.pages || 0} page${o.pages > 1 ? "s" : ""} × ${o.quantity || 0} ex.`, FINISH[o.finishing] ?? o.finishing].filter(Boolean).join(" · ");
}

function FileRow({ dashKey, path }) {
  const [busy, setBusy] = useState("");
  const [err, setErr] = useState("");
  const frame = useRef(null);

  async function run(kind) {
    setBusy(kind); setErr("");
    try {
      if (kind === "open") {
        const w = window.open("", "_blank");
        const [u] = await signFiles(dashKey, [path], "view");
        if (w) w.location.href = u; else window.location.href = u;
      } else if (kind === "download") {
        const [u] = await signFiles(dashKey, [path], "sign");
        const a = document.createElement("a"); a.href = u; a.download = fileName(path); document.body.appendChild(a); a.click(); a.remove();
      } else if (kind === "print") {
        const [u] = await signFiles(dashKey, [path], "view");
        const blob = await (await fetch(u)).blob();
        const url = URL.createObjectURL(blob);
        const f = frame.current;
        f.onload = () => { setTimeout(() => { try { f.contentWindow.focus(); f.contentWindow.print(); } catch { window.open(url, "_blank"); } }, 300); };
        f.src = url;
        setTimeout(() => URL.revokeObjectURL(url), 10 * 60 * 1000);
      }
    } catch {
      setErr("Impossible d'ouvrir le fichier (connexion ?)");
    }
    setBusy("");
  }

  const Btn = ({ k, icon: Icon, label, primary }) => (
    <button type="button" disabled={!!busy} onClick={() => run(k)}
      className={"inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold disabled:opacity-50 " + (primary ? "bg-slate-900 text-white hover:bg-slate-700" : "bg-white border border-slate-300 text-slate-700 hover:border-slate-500")}>
      {busy === k ? <Loader2 className="w-4 h-4 animate-spin" /> : <Icon className="w-4 h-4" />} {label}
    </button>
  );

  return (
    <div className="flex flex-wrap items-center gap-2 py-2 border-t border-slate-100 first:border-0">
      <span className="flex items-center gap-2 text-sm text-slate-800 min-w-0 flex-1 basis-48"><FileText className="w-4 h-4 text-slate-400 shrink-0" /><span className="truncate" title={fileName(path)}>{fileName(path)}</span></span>
      <Btn k="open" icon={ExternalLink} label="Ouvrir" />
      <Btn k="download" icon={Download} label="Télécharger" />
      <Btn k="print" icon={Printer} label="Imprimer" primary />
      {err && <span className="text-xs text-red-600 basis-full" role="alert">{err}</span>}
      <iframe ref={frame} title="impression" aria-hidden="true" tabIndex={-1} style={{ position: "fixed", left: "-10000px", top: 0, width: "800px", height: "600px", border: 0 }} />
    </div>
  );
}

function OrderCard({ o, dashKey, onStatus }) {
  const b = o.breakdown || {}, c = o.customer || {};
  const files = (b.files && b.files.length ? b.files : o.file_path ? [o.file_path] : []);
  const st = ST[o.status] || { l: o.status, c: "bg-slate-500" };
  const wa = waLink(c.phone, o.id);
  const [saving, setSaving] = useState(false);

  async function setStatus(s) {
    setSaving(true);
    try { await onStatus(o.id, s); } catch { alert("Le statut n'a pas pu être changé (connexion ?)"); }
    setSaving(false);
  }

  return (
    <article className="bg-white border border-slate-200 rounded-2xl p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-mono font-semibold text-slate-900">{o.id}</h3>
            <span className={"text-xs font-semibold text-white px-2 py-0.5 rounded-full " + st.c}>{st.l}</span>
          </div>
          <p className="text-sm text-slate-500 mt-0.5">{new Date(o.created_at).toLocaleString("fr-BE", { weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}</p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-slate-900 tabular-nums">{eur(b.total)}</div>
          <div className="text-xs text-slate-500">à payer au retrait</div>
        </div>
      </div>

      <div className="mt-3 text-sm text-slate-800">
        <p className="font-semibold">{c.name}</p>
        {c.phone && <p className="flex items-center gap-1.5 text-slate-600"><Phone className="w-3.5 h-3.5" /> <a href={`tel:${c.phone}`} className="hover:underline">{c.phone}</a></p>}
      </div>

      <p className="mt-3 text-sm text-slate-700">{describe(o)}</p>
      {b.paper === "carton" && <p className="mt-1 text-sm font-semibold text-amber-800">Papier cartonné 250 g</p>}
      {(o.promo || b.discount) && <p className="mt-1 text-sm font-semibold text-green-700">Code {b.promo || o.promo}{b.discount ? ` : −${eur(b.discount)}` : ""}</p>}
      {c.note && <p className="mt-2 text-sm text-slate-600 flex gap-1.5"><StickyNote className="w-4 h-4 shrink-0 mt-0.5" /> {c.note}</p>}

      {files.length > 0 && (
        <div className="mt-4 bg-slate-50 rounded-xl px-3 py-1">
          {files.map((p) => <FileRow key={p} dashKey={dashKey} path={p} />)}
        </div>
      )}

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <label className="text-sm text-slate-600" htmlFor={"st-" + o.id}>Statut</label>
        <select id={"st-" + o.id} value={o.status} disabled={saving} onChange={(e) => setStatus(e.target.value)}
          className="rounded-lg border border-slate-300 px-2.5 py-2 text-sm font-semibold bg-white">
          {STATUS.map(([k, l]) => <option key={k} value={k}>{l}</option>)}
        </select>
        {OPEN(o.status) && <button type="button" disabled={saving} onClick={() => setStatus("ready")} className="px-3 py-2 rounded-lg text-sm font-semibold bg-green-600 text-white hover:bg-green-700 disabled:opacity-50">Marquer prête</button>}
        {o.status === "ready" && <button type="button" disabled={saving} onClick={() => setStatus("done")} className="px-3 py-2 rounded-lg text-sm font-semibold bg-white border border-slate-300 text-slate-700 hover:border-slate-500">Retirée par le client</button>}
        {wa && <a href={wa} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold bg-[#25D366] text-white"><MessageCircle className="w-4 h-4" /> Prévenir sur WhatsApp</a>}
      </div>
    </article>
  );
}

export function OrdersAdmin({ dashKey }) {
  const [orders, setOrders] = useState(null);
  const [filter, setFilter] = useState("todo");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  async function load() {
    setLoading(true); setErr("");
    const { data, error } = await supabase.rpc("dash_orders_list", { p_key: dashKey });
    if (error) setErr("Impossible de charger les commandes (connexion ?)"); else setOrders(data || []);
    setLoading(false);
  }
  useEffect(() => { load(); const t = setInterval(load, 30000); return () => clearInterval(t); }, [dashKey]);

  async function onStatus(id, s) {
    const { error } = await supabase.rpc("dash_order_set_status", { p_key: dashKey, p_id: id, p_status: s });
    if (error) throw error;
    setOrders((list) => list.map((o) => (o.id === id ? { ...o, status: s } : o)));
  }

  const all = orders || [];
  const counts = { todo: all.filter((o) => OPEN(o.status)).length, ready: all.filter((o) => o.status === "ready").length, all: all.length };
  const list = all.filter((o) => filter === "all" || (filter === "ready" ? o.status === "ready" : OPEN(o.status)));

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div className="inline-flex bg-white border border-slate-200 rounded-xl p-1" role="group" aria-label="Filtre">
          {[["todo", "À faire"], ["ready", "Prêtes"], ["all", "Toutes"]].map(([k, l]) => (
            <button key={k} type="button" aria-pressed={filter === k} onClick={() => setFilter(k)}
              className={"px-3 py-1.5 rounded-lg text-sm font-semibold " + (filter === k ? "bg-slate-900 text-white" : "text-slate-600 hover:text-slate-900")}>{l} <span className="tabular-nums opacity-70">{counts[k]}</span></button>
          ))}
        </div>
        <button type="button" onClick={load} className="text-sm text-slate-600 hover:text-slate-900 flex items-center gap-1.5"><RefreshCw className={"w-4 h-4 " + (loading ? "animate-spin" : "")} /> Actualiser</button>
      </div>
      {err && <p className="text-sm text-red-600 mb-3" role="alert">{err}</p>}
      {orders === null ? <div className="py-12 flex justify-center text-slate-400"><Loader2 className="w-6 h-6 animate-spin" /></div> :
        list.length === 0 ? <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center text-slate-500">{filter === "todo" ? "Rien à faire pour l'instant." : "Aucune commande."}</div> :
          <div className="space-y-3">{list.map((o) => <OrderCard key={o.id} o={o} dashKey={dashKey} onStatus={onStatus} />)}</div>}
      <p className="text-xs text-slate-400 mt-4">Mis à jour toutes les 30 secondes. Le client voit le statut sur le site avec « Bestelling opvolgen ». Pour encaisser, utilise la caisse.</p>
    </div>
  );
}
