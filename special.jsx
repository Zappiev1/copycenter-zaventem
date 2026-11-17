import { useState, useEffect } from "react";
import { Upload, X, Minus, Plus, Loader2, PackageCheck, ImageIcon, FileText } from "lucide-react";
import { uploadOrderFile, createOrder } from "./data";
import { LAUNCH_PROMO, PROMO_T, launchDiscount, LaunchPromoField } from "./launchpromo";

/* ============================================================
   Commandes de photos et de cartes de visite
   Prix à modifier ici.
============================================================ */
export const PHOTO_SIZES = [
  { k: "9x13", price: 0.6 },
  { k: "10x15", price: 0.6 },
  { k: "15x15", price: 1.25 },
  { k: "15x20", price: 1.5 },
];
// [recto, recto-verso]
export const CARD_PRICES = { 50: [15, 18], 100: [25, 30], 250: [45, 55], 500: [70, 85], 1000: [110, 130] };

export const MAX = 50 * 1024 * 1024;
export const eur = (n) => n.toLocaleString("fr-BE", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " €";
export const r2 = (n) => Math.round((n + Number.EPSILON) * 100) / 100;

const ST = {
  nl: {
    addPhotos: "Foto's kiezen", photosHint: "Uit je galerij of sleep ze hierheen – JPG, PNG of HEIC",
    forAll: "Formaat voor alle foto's", photos: "foto's", prints: "afdrukken", remove: "Verwijderen", each: "/ st.",
    cardMode: "Heb je al een ontwerp?", have: "Ja, ik heb een ontwerp", make: "Nee, maak het voor mij",
    design: "Ontwerp kiezen", designHint: "PDF of afbeelding – voorkant en eventueel achterkant",
    fName: "Naam op de kaart", fJob: "Functie", fCompany: "Bedrijf", fPhone: "Telefoon", fEmail: "E-mail", fWeb: "Website", fAddr: "Adres",
    fLogo: "Logo (optioneel)", fWish: "Wensen (kleuren, stijl…)", qty: "Aantal", sides: "Bedrukking", recto: "Enkel voorkant", rv: "Voor- en achterkant",
    you: "Jouw gegevens", yourName: "Je naam", yourPhone: "Gsm-nummer", yourEmail: "E-mail (optioneel)", phoneHint: "We sturen je een bericht als het klaar is.",
    note: "Opmerking (optioneel)", sub: "Subtotaal", prep: "Voorbereidingskosten", total: "Totaal", pay: "Je betaalt bij het afhalen, contant of met kaart.",
    send: "Bestelling versturen", sending: "Versturen", errName: "Vul je naam in.", errPhone: "Vul een geldig gsm-nummer in.",
    errEmpty: "Voeg eerst foto's toe.", errDesign: "Kies eerst je ontwerp.", errCardName: "Vul de naam op de kaart in.", errBig: "is groter dan 50 MB en werd niet toegevoegd.",
    errSend: "Versturen is mislukt. Controleer je internetverbinding en probeer opnieuw.",
    photoLabel: (n) => `${n} foto${n > 1 ? "'s" : ""}`, cardLabel: (q) => `Visitekaartjes (${q} st.)`,
  },
  fr: {
    addPhotos: "Choisir des photos", photosHint: "Depuis votre galerie ou glissez-les ici – JPG, PNG ou HEIC",
    forAll: "Format pour toutes les photos", photos: "photos", prints: "tirages", remove: "Supprimer", each: "/ pièce",
    cardMode: "Avez-vous déjà un design ?", have: "Oui, j'ai un design", make: "Non, créez-la pour moi",
    design: "Choisir le design", designHint: "PDF ou image – recto et éventuellement verso",
    fName: "Nom sur la carte", fJob: "Fonction", fCompany: "Société", fPhone: "Téléphone", fEmail: "E-mail", fWeb: "Site web", fAddr: "Adresse",
    fLogo: "Logo (facultatif)", fWish: "Souhaits (couleurs, style…)", qty: "Quantité", sides: "Impression", recto: "Recto seulement", rv: "Recto et verso",
    you: "Vos coordonnées", yourName: "Votre nom", yourPhone: "Numéro de gsm", yourEmail: "E-mail (facultatif)", phoneHint: "Nous vous envoyons un message quand c'est prêt.",
    note: "Remarque (facultatif)", sub: "Sous-total", prep: "Frais de préparation", total: "Total", pay: "Vous payez au retrait, en espèces ou par carte.",
    send: "Envoyer la commande", sending: "Envoi", errName: "Indiquez votre nom.", errPhone: "Indiquez un numéro de gsm valide.",
    errEmpty: "Ajoutez d'abord des photos.", errDesign: "Choisissez d'abord votre design.", errCardName: "Indiquez le nom sur la carte.", errBig: "dépasse 50 Mo et n'a pas été ajouté.",
    errSend: "L'envoi a échoué. Vérifiez votre connexion internet et réessayez.",
    photoLabel: (n) => `${n} photo${n > 1 ? "s" : ""}`, cardLabel: (q) => `Cartes de visite (${q} pcs)`,
  },
  en: {
    addPhotos: "Choose photos", photosHint: "From your gallery or drag them here – JPG, PNG or HEIC",
    forAll: "Size for all photos", photos: "photos", prints: "prints", remove: "Remove", each: "/ pc",
    cardMode: "Do you already have a design?", have: "Yes, I have a design", make: "No, design it for me",
    design: "Choose design", designHint: "PDF or image – front and optional back",
    fName: "Name on the card", fJob: "Job title", fCompany: "Company", fPhone: "Phone", fEmail: "Email", fWeb: "Website", fAddr: "Address",
    fLogo: "Logo (optional)", fWish: "Wishes (colours, style…)", qty: "Quantity", sides: "Printing", recto: "Front only", rv: "Front and back",
    you: "Your details", yourName: "Your name", yourPhone: "Mobile number", yourEmail: "Email (optional)", phoneHint: "We'll message you when it's ready.",
    note: "Note (optional)", sub: "Subtotal", prep: "Preparation fee", total: "Total", pay: "You pay when you collect, in cash or by card.",
    send: "Send order", sending: "Sending", errName: "Please enter your name.", errPhone: "Please enter a valid mobile number.",
    errEmpty: "Add some photos first.", errDesign: "Choose your design first.", errCardName: "Please fill in the name on the card.", errBig: "is larger than 50 MB and was not added.",
    errSend: "Sending failed. Check your internet connection and try again.",
    photoLabel: (n) => `${n} photo${n > 1 ? "s" : ""}`, cardLabel: (q) => `Business cards (${q} pcs)`,
  },
};

export const input = "w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm bg-white focus:outline-none focus:border-blue-500 transition-colors";
export function Chip({ on, onClick, children }) {
  return (
    <button type="button" onClick={onClick}
      className={"px-4 py-2.5 rounded-xl text-sm font-semibold border-2 transition-colors " + (on ? "border-blue-700 bg-blue-700 text-white" : "border-slate-200 bg-white text-slate-700 hover:border-blue-300")}>
      {children}
    </button>
  );
}
export function Field({ label, children, hint }) {
  return (
    <label className="block">
      <span className="block text-sm font-semibold text-slate-700 mb-1.5">{label}</span>
      {children}
      {hint && <span className="block text-xs text-slate-400 mt-1">{hint}</span>}
    </label>
  );
}
function Stepper({ value, onChange }) {
  return (
    <span className="inline-flex items-center border border-slate-200 rounded-xl overflow-hidden bg-white">
      <button type="button" aria-label="-" onClick={() => onChange(Math.max(1, value - 1))} className="w-9 h-9 flex items-center justify-center hover:bg-slate-100"><Minus className="w-4 h-4" /></button>
      <input type="number" min="1" value={value} onChange={(e) => onChange(Math.max(1, Math.min(999, parseInt(e.target.value) || 1)))}
        className="w-12 h-9 text-center text-sm font-semibold border-x border-slate-200 focus:outline-none" />
      <button type="button" aria-label="+" onClick={() => onChange(Math.min(999, value + 1))} className="w-9 h-9 flex items-center justify-center hover:bg-slate-100"><Plus className="w-4 h-4" /></button>
    </span>
  );
}
function Drop({ accept, multiple, onFiles, title, hint }) {
  const [over, setOver] = useState(false);
  return (
    <label
      onDragOver={(e) => { e.preventDefault(); setOver(true); }} onDragLeave={() => setOver(false)}
      onDrop={(e) => { e.preventDefault(); setOver(false); onFiles([...e.dataTransfer.files]); }}
      className={"border-2 border-dashed rounded-2xl py-10 px-4 flex flex-col items-center gap-2 cursor-pointer text-center transition-colors " + (over ? "border-blue-500 bg-blue-50" : "border-slate-300 bg-slate-50 hover:border-blue-400")}>
      <span className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center"><Upload className="w-5 h-5 text-blue-700" /></span>
      <span className="font-semibold text-slate-800">{title}</span>
      <span className="text-sm text-slate-500">{hint}</span>
      <input type="file" hidden accept={accept} multiple={multiple} onChange={(e) => { onFiles([...e.target.files]); e.target.value = ""; }} />
    </label>
  );
}

export function SpecialOrder({ kind, lang, profile, prepFee = 0, onDone, onStorageError }) {
  const S = ST[lang] || ST.nl;
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(null);   // {done,total}
  const [cust, setCust] = useState({ name: "", phone: "", email: "", note: "" });

  // --- photos ---
  const [photos, setPhotos] = useState([]);
  const [allSize, setAllSize] = useState("10x15");
  useEffect(() => () => photos.forEach((p) => p.url && URL.revokeObjectURL(p.url)), []); // eslint-disable-line
  function addPhotos(files) {
    const ok = [], big = [];
    files.forEach((f) => (f.size > MAX ? big.push(f.name) : ok.push(f)));
    setErr(big.length ? big.join(", ") + " " + S.errBig : "");
    setPhotos((list) => [...list, ...ok.map((f) => ({
      id: Math.random().toString(36).slice(2), file: f, size: allSize, qty: 1,
      url: /heic|heif/i.test(f.type + f.name) ? null : URL.createObjectURL(f),
    }))]);
  }
  const priceOf = (k) => PHOTO_SIZES.find((s) => s.k === k).price;
  const upd = (id, patch) => setPhotos((l) => l.map((p) => (p.id === id ? { ...p, ...patch } : p)));

  // --- cartes ---
  const [mode, setMode] = useState("have");
  const [design, setDesign] = useState([]);
  const [logo, setLogo] = useState(null);
  const [fields, setFields] = useState({ name: "", job: "", company: "", phone: "", email: "", web: "", addr: "", wish: "" });
  const [cardQty, setCardQty] = useState(250);
  const [cardSides, setCardSides] = useState(0);

  const subtotal = kind === "photo"
    ? r2(photos.reduce((a, p) => a + priceOf(p.size) * p.qty, 0))
    : CARD_PRICES[cardQty][cardSides];
  // Pas de frais de préparation pour les cartes de visite (prix tout compris).
  const fee = subtotal > 0 && kind !== "cards" ? prepFee : 0;
  const [promoOk, setPromoOk] = useState(false);
  const discount = launchDiscount(subtotal, promoOk);
  const total = r2(subtotal - discount + fee);

  async function send() {
    setErr("");
    const phone = cust.phone.replace(/[^0-9+]/g, "");
    if (kind === "photo" && !photos.length) return setErr(S.errEmpty);
    if (kind === "cards" && mode === "have" && !design.length) return setErr(S.errDesign);
    if (kind === "cards" && mode === "make" && !fields.name.trim()) return setErr(S.errCardName);
    if (cust.name.trim().length < 2) return setErr(S.errName);
    if (phone.length < 9) return setErr(S.errPhone);

    const id = "CCZ-" + Date.now().toString().slice(-6);
    const files = kind === "photo" ? photos.map((p) => p.file) : mode === "have" ? design : logo ? [logo] : [];
    const paths = [];
    setBusy({ done: 0, total: files.length });
    for (let i = 0; i < files.length; i++) {
      const f = files[i];
      const named = new File([f], `${String(i + 1).padStart(3, "0")}-${f.name}`, { type: f.type });
      const path = await uploadOrderFile(id, named);
      if (!path) { setBusy(null); setErr(S.errSend); onStorageError?.(); return; }
      paths.push(path);
      setBusy({ done: i + 1, total: files.length });
    }

    let order;
    const customer = { name: cust.name.trim(), phone: cust.phone.trim(), email: cust.email.trim(), note: cust.note.trim() || undefined };
    if (kind === "photo") {
      const bySize = {};
      photos.forEach((p) => { bySize[p.size] = (bySize[p.size] || 0) + p.qty; });
      const nPrints = photos.reduce((a, p) => a + p.qty, 0);
      order = {
        fileName: S.photoLabel(photos.length),
        format: "Foto " + Object.entries(bySize).map(([k, q]) => `${k} ×${q}`).join(", "),
        color: "couleur", sides: "recto", finishing: "aucune", pages: photos.length, quantity: nPrints,
        breakdown: {
          kind: "photo", files: paths, subtotal, prepFee: fee, discount, promo: discount ? LAUNCH_PROMO.code : null, total,
          items: photos.map((p, i) => ({ file: paths[i], name: p.file.name, size: p.size, qty: p.qty, price: r2(priceOf(p.size) * p.qty) })),
        },
      };
    } else {
      order = {
        fileName: S.cardLabel(cardQty),
        format: `Visitekaartjes ${cardQty} st.`,
        color: "couleur", sides: cardSides ? "rectoverso" : "recto", finishing: "aucune", pages: 1, quantity: cardQty,
        breakdown: {
          kind: "card", files: paths, subtotal, prepFee: fee, discount, promo: discount ? LAUNCH_PROMO.code : null, total, mode, qty: cardQty, sides: cardSides ? 2 : 1,
          fields: mode === "make" ? fields : null,
        },
      };
    }
    const full = {
      id, createdAt: new Date().toISOString(), profile, filePath: paths[0] || null,
      cvPack: null, promo: discount ? LAUNCH_PROMO.code : null, customer, status: "received", paymentMethod: "surplace", paid: false, ...order,
    };
    const ok = await createOrder(full);
    setBusy(null);
    if (!ok) { setErr(S.errSend); onStorageError?.(); return; }
    onDone(full);
  }

  const nPrints = photos.reduce((a, p) => a + p.qty, 0);

  return (
    <div className="bg-white border border-slate-200 rounded-3xl shadow-sm p-5 sm:p-8 space-y-8">
      {kind === "photo" ? (
        <div className="space-y-5">
          <Drop accept="image/*,.heic,.heif" multiple onFiles={addPhotos} title={S.addPhotos} hint={S.photosHint} />
          <div>
            <p className="text-sm font-semibold text-slate-700 mb-2">{S.forAll}</p>
            <div className="flex flex-wrap gap-2">
              {PHOTO_SIZES.map((s) => (
                <Chip key={s.k} on={allSize === s.k} onClick={() => { setAllSize(s.k); setPhotos((l) => l.map((p) => ({ ...p, size: s.k }))); }}>
                  {s.k} · {eur(s.price)}
                </Chip>
              ))}
            </div>
          </div>
          {photos.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {photos.map((p) => (
                <div key={p.id} className="border border-slate-200 rounded-2xl overflow-hidden">
                  <div className="relative aspect-square bg-slate-100 flex items-center justify-center">
                    {p.url ? <img src={p.url} alt="" className="w-full h-full object-cover" /> : <span className="text-slate-400 text-xs font-semibold flex flex-col items-center gap-1"><ImageIcon className="w-6 h-6" />HEIC</span>}
                    <button type="button" aria-label={S.remove} onClick={() => setPhotos((l) => l.filter((x) => x.id !== p.id))}
                      className="absolute top-2 right-2 w-8 h-8 rounded-full bg-white/95 shadow flex items-center justify-center hover:bg-red-50"><X className="w-4 h-4" /></button>
                  </div>
                  <div className="p-3 space-y-2">
                    <select value={p.size} onChange={(e) => upd(p.id, { size: e.target.value })} className="w-full border border-slate-200 rounded-lg px-2 py-2 text-sm bg-white">
                      {PHOTO_SIZES.map((s) => <option key={s.k} value={s.k}>{s.k} — {eur(s.price)}</option>)}
                    </select>
                    <div className="flex items-center justify-between gap-2">
                      <Stepper value={p.qty} onChange={(q) => upd(p.id, { qty: q })} />
                      <span className="text-sm font-semibold text-slate-800">{eur(priceOf(p.size) * p.qty)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          <div>
            <p className="text-sm font-semibold text-slate-700 mb-2">{S.cardMode}</p>
            <div className="flex flex-wrap gap-2"><Chip on={mode === "have"} onClick={() => setMode("have")}>{S.have}</Chip><Chip on={mode === "make"} onClick={() => setMode("make")}>{S.make}</Chip></div>
          </div>
          {mode === "have" ? (
            <div className="space-y-3">
              <Drop accept=".pdf,image/*" multiple onFiles={(fs) => { const ok = fs.filter((f) => f.size <= MAX); setDesign((d) => [...d, ...ok].slice(0, 4)); }} title={S.design} hint={S.designHint} />
              {design.map((f, i) => (
                <div key={i} className="flex items-center gap-3 border border-slate-200 rounded-xl px-4 py-3">
                  <FileText className="w-5 h-5 text-slate-400" /><span className="flex-1 text-sm font-medium truncate">{f.name}</span>
                  <button type="button" onClick={() => setDesign((d) => d.filter((_, j) => j !== i))} className="text-slate-400 hover:text-red-600"><X className="w-4 h-4" /></button>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 gap-4">
              {[["name", S.fName], ["job", S.fJob], ["company", S.fCompany], ["phone", S.fPhone], ["email", S.fEmail], ["web", S.fWeb]].map(([k, l]) => (
                <Field key={k} label={l}><input className={input} maxLength={80} value={fields[k]} onChange={(e) => setFields({ ...fields, [k]: e.target.value })} /></Field>
              ))}
              <div className="sm:col-span-2"><Field label={S.fAddr}><input className={input} maxLength={120} value={fields.addr} onChange={(e) => setFields({ ...fields, addr: e.target.value })} /></Field></div>
              <div className="sm:col-span-2"><Field label={S.fWish}><textarea className={input + " min-h-20"} maxLength={500} value={fields.wish} onChange={(e) => setFields({ ...fields, wish: e.target.value })} /></Field></div>
              <div className="sm:col-span-2"><Field label={S.fLogo}><input type="file" accept="image/*,.pdf,.svg" onChange={(e) => setLogo(e.target.files[0] || null)} className="text-sm" /></Field></div>
            </div>
          )}
          <div>
            <p className="text-sm font-semibold text-slate-700 mb-2">{S.sides}</p>
            <div className="flex flex-wrap gap-2"><Chip on={cardSides === 0} onClick={() => setCardSides(0)}>{S.recto}</Chip><Chip on={cardSides === 1} onClick={() => setCardSides(1)}>{S.rv}</Chip></div>
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-700 mb-2">{S.qty}</p>
            <div className="flex flex-wrap gap-2">
              {Object.keys(CARD_PRICES).map((q) => <Chip key={q} on={+q === cardQty} onClick={() => setCardQty(+q)}>{q} · {eur(CARD_PRICES[q][cardSides])}</Chip>)}
            </div>
          </div>
        </div>
      )}

      <div className="border-t border-slate-100 pt-6 space-y-4">
        <p className="text-lg font-semibold text-slate-800" style={{ fontFamily: "'Sora', sans-serif" }}>{S.you}</p>
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label={S.yourName}><input className={input} autoComplete="name" maxLength={80} value={cust.name} onChange={(e) => setCust({ ...cust, name: e.target.value })} /></Field>
          <Field label={S.yourPhone} hint={S.phoneHint}><input className={input} type="tel" autoComplete="tel" maxLength={20} placeholder="04xx xx xx xx" value={cust.phone} onChange={(e) => setCust({ ...cust, phone: e.target.value })} /></Field>
          <Field label={S.yourEmail}><input className={input} type="email" autoComplete="email" maxLength={80} value={cust.email} onChange={(e) => setCust({ ...cust, email: e.target.value })} /></Field>
          <Field label={S.note}><input className={input} maxLength={300} value={cust.note} onChange={(e) => setCust({ ...cust, note: e.target.value })} /></Field>
        </div>
      </div>

      <div className="bg-slate-50 rounded-2xl p-5">
        <div className="flex justify-between text-sm text-slate-600"><span>{S.sub}{kind === "photo" && nPrints ? ` (${nPrints} ${S.prints})` : ""}</span><span>{eur(subtotal)}</span></div>
        {fee > 0 && <div className="flex justify-between text-sm text-slate-600 mt-1"><span>{S.prep}</span><span>{eur(fee)}</span></div>}
        <LaunchPromoField lang={lang} on={promoOk} setOn={setPromoOk} />
        {discount > 0 && <div className="flex justify-between text-sm font-semibold text-green-700 mt-2"><span>{(PROMO_T[lang] || PROMO_T.nl).disc} {LAUNCH_PROMO.code} (-{LAUNCH_PROMO.pct}%)</span><span>-{eur(discount)}</span></div>}
        <div className="flex justify-between items-end mt-3 pt-3 border-t border-slate-200">
          <span className="font-semibold text-slate-800">{S.total}</span>
          <span className="text-3xl font-bold text-slate-900" style={{ fontFamily: "'Sora', sans-serif" }}>{eur(total)}</span>
        </div>
        <p className="text-xs text-slate-500 mt-2">{S.pay}</p>
      </div>

      {err && <p className="text-sm font-semibold text-red-600" role="alert">{err}</p>}
      <button type="button" disabled={!!busy} onClick={send}
        className="w-full bg-orange-600 hover:bg-orange-700 disabled:bg-slate-300 text-white rounded-2xl px-6 py-4 text-base font-bold flex items-center justify-center gap-2 transition-colors">
        {busy ? <><Loader2 className="w-5 h-5 animate-spin" /> {S.sending} {busy.total ? `${busy.done}/${busy.total}` : ""}</> : <><PackageCheck className="w-5 h-5" /> {S.send}</>}
      </button>
    </div>
  );
}
