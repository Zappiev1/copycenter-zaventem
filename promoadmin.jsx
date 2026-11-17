import { useEffect, useState } from "react";
import { Tag, Trash2, Plus, Loader2 } from "lucide-react";
import { dashPromoList, dashPromoSave, dashPromoDelete } from "./analytics";

/* Section « Codes promo » du tableau de bord : créer, modifier, supprimer. */
const fmtDate = (s) => new Date(s).toLocaleDateString("fr-BE", { day: "numeric", month: "long", year: "numeric" });

export function PromoAdmin({ dashKey }) {
  const [list, setList] = useState(null);
  const [form, setForm] = useState({ code: "", type: "percent", value: "", until: "" });
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  const load = () => dashPromoList(dashKey).then((l) => setList(l || [])).catch(() => setList([]));
  useEffect(() => { load(); }, [dashKey]);

  async function save() {
    setErr("");
    const code = form.code.trim().toUpperCase();
    const value = parseFloat(String(form.value).replace(",", "."));
    if (!/^[A-Z0-9]{3,20}$/.test(code)) return setErr("Le code doit faire 3 à 20 lettres ou chiffres, sans espace.");
    if (!(value > 0)) return setErr("Indique le montant de la réduction.");
    if (form.type === "percent" && value > 90) return setErr("Maximum 90 %.");
    const until = form.until ? new Date(form.until + "T23:59:59").toISOString() : null;
    setBusy(true);
    try { await dashPromoSave(dashKey, code, form.type, value, until); setForm({ code: "", type: "percent", value: "", until: "" }); await load(); }
    catch (e) { setErr("Impossible d'enregistrer : " + e.message); }
    setBusy(false);
  }

  async function remove(code) {
    if (!confirm(`Supprimer le code ${code} ? Les clients ne pourront plus l'utiliser.`)) return;
    try { await dashPromoDelete(dashKey, code); await load(); } catch (e) { setErr("Impossible de supprimer : " + e.message); }
  }

  const now = Date.now();
  const field = "w-full rounded-xl border border-slate-300 px-3 py-2.5 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100";

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5">
      <h3 className="font-semibold text-slate-900 flex items-center gap-2 mb-1"><Tag className="w-4 h-4 text-slate-500" /> Codes promo</h3>
      <p className="text-sm text-slate-500 mb-4">Valables sur tout le site : impressions, photos, cartes de visite et CV.</p>

      <div className="grid sm:grid-cols-[1.3fr_1fr_0.8fr_1.2fr_auto] gap-2 items-end mb-2">
        <div><label htmlFor="pc-code" className="text-xs font-semibold text-slate-600">Code</label>
          <input id="pc-code" className={field + " uppercase"} maxLength={20} placeholder="Ex. : NOEL15" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} /></div>
        <div><label htmlFor="pc-type" className="text-xs font-semibold text-slate-600">Type</label>
          <select id="pc-type" className={field + " bg-white"} value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
            <option value="percent">Pourcentage (%)</option><option value="fixed">Montant (€)</option>
          </select></div>
        <div><label htmlFor="pc-val" className="text-xs font-semibold text-slate-600">{form.type === "percent" ? "Réduction %" : "Réduction €"}</label>
          <input id="pc-val" inputMode="decimal" className={field} placeholder={form.type === "percent" ? "15" : "2,00"} value={form.value} onChange={(e) => setForm({ ...form, value: e.target.value })} /></div>
        <div><label htmlFor="pc-until" className="text-xs font-semibold text-slate-600">Fin (facultatif)</label>
          <input id="pc-until" type="date" className={field} value={form.until} onChange={(e) => setForm({ ...form, until: e.target.value })} /></div>
        <button type="button" disabled={busy} onClick={save} className="h-[46px] rounded-xl bg-slate-900 disabled:opacity-50 text-white font-semibold px-4 flex items-center justify-center gap-1.5">
          {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />} Ajouter
        </button>
      </div>
      <p className="text-xs text-slate-500 mb-4">Sans date de fin, le code reste valable jusqu'à ce que tu le supprimes. Pour modifier un code, ajoute-le de nouveau avec le même nom.</p>
      {err && <p className="text-sm text-red-600 mb-3" role="alert">{err}</p>}

      {list === null ? <Loader2 className="w-5 h-5 animate-spin text-slate-400" /> : list.length === 0 ? <p className="text-sm text-slate-400">Aucun code pour l'instant.</p> : (
        <ul className="divide-y divide-slate-100 border-t border-slate-100">
          {list.map((p) => {
            const expired = p.valid_until && new Date(p.valid_until).getTime() < now;
            return (
              <li key={p.code} className="py-3 flex items-center gap-3">
                <span className={"font-mono font-bold px-2.5 py-1 rounded-lg text-sm " + (expired ? "bg-slate-100 text-slate-400 line-through" : "bg-amber-100 text-amber-900")}>{p.code}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-900">{p.label}</p>
                  <p className="text-xs text-slate-500">{expired ? `Expiré le ${fmtDate(p.valid_until)}` : p.valid_until ? `Jusqu'au ${fmtDate(p.valid_until)}` : "Sans date de fin"} · utilisé {p.uses} fois</p>
                </div>
                <button type="button" onClick={() => remove(p.code)} aria-label={`Supprimer ${p.code}`} className="w-9 h-9 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-600 flex items-center justify-center"><Trash2 className="w-4 h-4" /></button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
