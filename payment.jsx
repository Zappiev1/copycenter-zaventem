import { useEffect, useState } from "react";
import QRCode from "qrcode";
import { Copy, Check, Landmark, Smartphone } from "lucide-react";

/* ============================================================
   Paiement par virement (sans commission) : QR code SEPA (EPC) que le client
   scanne avec l'appli de sa banque. Le montant et la communication sont déjà remplis.
   La caisse marque la commande « Virement reçu » quand l'argent est arrivé.
============================================================ */
export const BANK = { name: "Imran Achahbar", iban: "BE16739026061574" };
const ibanPretty = (i) => i.replace(/(.{4})/g, "$1 ").trim();
const eur = (v) => (+v || 0).toFixed(2).replace(".", ",") + " €";

export function epcPayload(amount, reference) {
  return ["BCD", "002", "1", "SCT", "", BANK.name, BANK.iban, "EUR" + (+amount).toFixed(2), "", "", reference, ""].join("\n");
}

const PT = {
  nl: {
    title: "Betaal nu via overschrijving", lead: "We beginnen aan je bestelling zodra je betaling binnen is.",
    scan: "Scan deze code met je bank-app (KBC, Belfius, ING, BNP Paribas Fortis, Argenta…). Bedrag en mededeling staan al ingevuld.",
    phone: "Bestel je op je gsm? Kopieer de gegevens hieronder in je bank-app.",
    to: "Begunstigde", iban: "IBAN", amount: "Bedrag", ref: "Mededeling", copy: "Kopiëren", copied: "Gekopieerd",
    instant: "Tip: kies een directe overschrijving (instant), dan is je betaling meteen binnen.",
  },
  fr: {
    title: "Payez maintenant par virement", lead: "Nous commençons votre commande dès réception du paiement.",
    scan: "Scannez ce code avec l'appli de votre banque (KBC, Belfius, ING, BNP Paribas Fortis, Argenta…). Le montant et la communication sont déjà remplis.",
    phone: "Vous commandez sur votre gsm ? Copiez les informations ci-dessous dans votre appli bancaire.",
    to: "Bénéficiaire", iban: "IBAN", amount: "Montant", ref: "Communication", copy: "Copier", copied: "Copié",
    instant: "Astuce : choisissez un virement instantané, le paiement arrive tout de suite.",
  },
  en: {
    title: "Pay now by bank transfer", lead: "We start on your order as soon as your payment arrives.",
    scan: "Scan this code with your banking app. The amount and reference are already filled in.",
    phone: "Ordering on your phone? Copy the details below into your banking app.",
    to: "Beneficiary", iban: "IBAN", amount: "Amount", ref: "Reference", copy: "Copy", copied: "Copied",
    instant: "Tip: choose an instant transfer so your payment arrives right away.",
  },
};

function CopyRow({ label, value, copyValue, P }) {
  const [ok, setOk] = useState(false);
  const copy = async () => {
    try { await navigator.clipboard.writeText(copyValue ?? value); setOk(true); setTimeout(() => setOk(false), 1500); } catch { /* ignore */ }
  };
  return (
    <div className="flex items-center justify-between gap-3 py-2.5 border-b border-slate-100 last:border-0">
      <div className="min-w-0">
        <p className="text-xs text-slate-500">{label}</p>
        <p className="font-semibold text-slate-900 break-all">{value}</p>
      </div>
      {copyValue !== null && (
        <button type="button" onClick={copy} className="flex-shrink-0 inline-flex items-center gap-1.5 text-sm font-semibold text-blue-700 border border-blue-200 rounded-lg px-3 py-1.5 hover:bg-blue-50">
          {ok ? <><Check className="w-4 h-4" /> {P.copied}</> : <><Copy className="w-4 h-4" /> {P.copy}</>}
        </button>
      )}
    </div>
  );
}

export function PayTransfer({ order, lang }) {
  const P = PT[lang] || PT.nl;
  const amount = +(order?.breakdown?.total) || 0;
  const [src, setSrc] = useState(null);
  useEffect(() => {
    QRCode.toDataURL(epcPayload(amount, order.id), { errorCorrectionLevel: "M", margin: 2, width: 520 }).then(setSrc).catch(() => setSrc(null));
  }, [amount, order.id]);
  if (!amount) return null;
  return (
    <div className="bg-white border-2 border-blue-700 rounded-2xl p-6 sm:p-8 mb-6">
      <div className="flex items-start gap-3 mb-5">
        <div className="w-10 h-10 rounded-xl bg-blue-700 text-white flex items-center justify-center flex-shrink-0"><Landmark className="w-5 h-5" /></div>
        <div>
          <h2 className="text-xl font-bold text-slate-900" style={{ fontFamily: "'Sora', sans-serif" }}>{P.title}</h2>
          <p className="text-slate-600 mt-0.5">{P.lead}</p>
        </div>
      </div>
      <div className="grid sm:grid-cols-[220px_1fr] gap-6 items-start">
        <div className="hidden sm:block">
          {src && <img src={src} alt={P.scan} className="w-[220px] h-[220px] rounded-xl border border-slate-200" />}
          <p className="text-xs text-slate-500 mt-2 leading-snug">{P.scan}</p>
        </div>
        <div>
          <p className="sm:hidden text-sm text-slate-600 mb-2 flex items-start gap-2"><Smartphone className="w-4 h-4 mt-0.5 flex-shrink-0" /> {P.phone}</p>
          <CopyRow label={P.to} value={BANK.name} copyValue={BANK.name} P={P} />
          <CopyRow label={P.iban} value={ibanPretty(BANK.iban)} copyValue={BANK.iban} P={P} />
          <CopyRow label={P.amount} value={eur(amount)} copyValue={amount.toFixed(2).replace(".", ",")} P={P} />
          <CopyRow label={P.ref} value={order.id} copyValue={order.id} P={P} />
          <p className="text-xs text-slate-500 mt-3">{P.instant}</p>
          <details className="sm:hidden mt-3">
            <summary className="text-sm font-semibold text-blue-700 cursor-pointer">QR-code</summary>
            {src && <img src={src} alt={P.scan} className="w-56 h-56 mt-2 rounded-xl border border-slate-200" />}
          </details>
        </div>
      </div>
    </div>
  );
}
