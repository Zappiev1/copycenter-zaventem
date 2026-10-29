import { useState, useEffect, useMemo, useRef, Component } from "react";
import {
  Upload, FileText, CheckCircle2, Circle, Loader2, ChevronRight, ChevronLeft, ChevronDown,
  Printer, Layers, Sparkles, X, User, GraduationCap, Building2, Phone, Globe,
  Search, ArrowRight, PackageCheck, AlertCircle, Tag, Pencil, MapPin, Mail, Clock,
  CreditCard, Lock, Store, ShieldCheck, LayoutDashboard, Megaphone, Users, TrendingUp,
  Trash2, Plus, KeyRound, LogOut, Euro
} from "lucide-react";
import {
  getSetting, setSetting, incrementVisitCount,
  getPromos as fetchPromos, upsertPromo, deletePromo as deletePromoRow,
  createOrder, trackOrderPublic, getAllOrders, updateOrderStatus as updateOrderStatusRow,
  adminSignIn, adminSignOut, getAdminSession, onAdminAuthChange,
} from "./data";

/* ============================================================
   DESIGN TOKENS — light SaaS surface, blue = trust, green = done,
   orange = the one committing action. Display: Sora / Body: Inter
   Data: IBM Plex Mono
============================================================ */
const GLOBAL_STYLE = `
@import url('https://fonts.googleapis.com/css2?family=Sora:wght@500;600;700&family=Inter:wght@400;500;600;700&family=IBM+Plex+Mono:wght@500;600&display=swap');

@keyframes fadeSlideUp { from{opacity:0; transform:translateY(16px);} to{opacity:1; transform:translateY(0);} }
.step-anim { animation: fadeSlideUp .5s cubic-bezier(.16,.8,.24,1); }

@keyframes fadeIn { from{opacity:0; transform:translateY(10px);} to{opacity:1; transform:translateY(0);} }
.panel-anim { animation: fadeIn .45s cubic-bezier(.16,.8,.24,1); }

@keyframes bump { 0%{transform:scale(1);} 35%{transform:scale(1.08);} 100%{transform:scale(1);} }
.price-bump { animation: bump .4s ease; }

@keyframes breathe { 0%,100%{box-shadow:0 0 0 0 rgba(37,99,235,0.10);} 50%{box-shadow:0 0 0 12px rgba(37,99,235,0);} }
.breathing { animation: breathe 2.4s ease-in-out infinite; }

@keyframes popIn { 0%{transform:scale(.4); opacity:0;} 60%{transform:scale(1.1); opacity:1;} 100%{transform:scale(1);} }
.pop-in { animation: popIn .55s cubic-bezier(.16,.8,.24,1); }

@keyframes confettiFall { 0%{transform:translateY(-6px) rotate(0deg); opacity:1;} 100%{transform:translateY(70px) rotate(220deg); opacity:0;} }
.confetti-piece { animation: confettiFall 1.15s ease-out forwards; }

@keyframes driftA { 0%,100%{ transform:translate(0,0); } 50%{ transform:translate(30px,-20px); } }
@keyframes driftB { 0%,100%{ transform:translate(0,0); } 50%{ transform:translate(-24px,26px); } }
.blob-a { animation: driftA 14s ease-in-out infinite; }
.blob-b { animation: driftB 17s ease-in-out infinite; }

@keyframes shimmer { 0%{ background-position: -200% 0; } 100%{ background-position: 200% 0; } }
.shimmer-line { background: linear-gradient(90deg, rgba(37,99,235,0.15) 25%, rgba(37,99,235,0.35) 37%, rgba(37,99,235,0.15) 63%); background-size: 200% 100%; animation: shimmer 1.4s linear infinite; }

@keyframes floatPaperA { 0%,100%{ transform:translateY(0) rotate(-8deg); } 50%{ transform:translateY(-18px) rotate(-2deg); } }
@keyframes floatPaperB { 0%,100%{ transform:translateY(0) rotate(10deg); } 50%{ transform:translateY(16px) rotate(4deg); } }
@keyframes floatPaperC { 0%,100%{ transform:translateY(0) rotate(-4deg); } 50%{ transform:translateY(-12px) rotate(3deg); } }
.float-paper-a { animation: floatPaperA 6.5s ease-in-out infinite; }
.float-paper-b { animation: floatPaperB 8s ease-in-out infinite; }
.float-paper-c { animation: floatPaperC 7.2s ease-in-out infinite; }

.cursor-halo { transition: transform 0.12s linear; }
`;
const displayFont = { fontFamily: "'Sora', ui-sans-serif, sans-serif" };
const monoFont = { fontFamily: "'IBM Plex Mono', ui-monospace, monospace" };

/* ============================================================
   PRICING — read from persistent shared storage so an eventual
   admin dashboard can edit every figure without touching code.
============================================================ */
const scaleTable = (t, f) => ({
  fixed: t.fixed.map((v) => +(v * f).toFixed(2)),
  tiers: t.tiers.map((tier) => ({ ...tier, rate: +(tier.rate * f).toFixed(2) })),
});
const A4_NB = { fixed: [0.5, 0.8, 1.0, 1.2], tiers: [
  { min: 5, max: 20, rate: 0.2 }, { min: 21, max: 50, rate: 0.15 },
  { min: 51, max: 150, rate: 0.1 }, { min: 151, max: 500, rate: 0.08 },
  { min: 501, max: 1000, rate: 0.05 },
]};
const A4_COULEUR = { fixed: [0.8, 1.5, 2.0, 2.5], tiers: [
  { min: 5, max: 20, rate: 0.6 }, { min: 21, max: 50, rate: 0.45 },
  { min: 51, max: 150, rate: 0.35 }, { min: 151, max: 500, rate: 0.3 },
  { min: 501, max: 1000, rate: 0.25 },
]};
const A3_NB = { fixed: [1.0, 0.8, 0.7, 0.5], tiers: [
  { min: 5, max: 20, rate: 0.45 }, { min: 21, max: 50, rate: 0.4 },
  { min: 51, max: 150, rate: 0.3 }, { min: 151, max: 1000, rate: 0.2 },
]};
const A3_COULEUR = { fixed: [1.5, 1.4, 1.3, 1.1], tiers: [
  { min: 5, max: 20, rate: 1.0 }, { min: 21, max: 50, rate: 0.8 },
  { min: 51, max: 150, rate: 0.5 }, { min: 151, max: 1000, rate: 0.4 },
]};
const DEFAULT_PRICING = {
  printing: {
    A4: { nb: A4_NB, couleur: A4_COULEUR },
    A3: { nb: A3_NB, couleur: A3_COULEUR },
    A5: { nb: scaleTable(A4_NB, 0.6), couleur: scaleTable(A4_COULEUR, 0.6) }, // assumption, see chat note
  },
  finishing: {
    spirale: [
      { max: 50, price: 2.5 }, { max: 100, price: 3.0 }, { max: 200, price: 3.5 },
      { max: 300, price: 4.5 }, { max: Infinity, price: 5.0 },
    ],
    thermique: [ // brief gives no tier past 201-300; carried flat, flagged as assumption
      { max: 50, price: 3.5 }, { max: 100, price: 4.0 }, { max: 200, price: 5.0 },
      { max: Infinity, price: 6.0 },
    ],
    plastification: { A5: 1.0, A4: 1.5, A3: 2.5 },
  },
  cv: { simple: 5.0, professionnel: 10.0, packEmploi: 15.0 },
  prepFee: 1.5,
  _version: 2,
};

// Demo promo codes — same "read from shared storage" pattern as pricing,
// ready to be managed from the future admin dashboard.
const DEFAULT_PROMOS = {
  BIENVENUE10: { type: "percent", value: 10, label: "-10 %" },
  ETU5: { type: "fixed", value: 1.5, label: "-1,50 €" },
};

function tierRate(tiers, pages) {
  for (const t of tiers) if (pages >= t.min && pages <= t.max) return t.rate;
  return tiers[tiers.length - 1].rate;
}
function computePrintPrice(cfg, format, color, pages) {
  const table = cfg.printing[format][color];
  if (pages <= 4) return table.fixed[Math.max(0, pages - 1)];
  return +(pages * tierRate(table.tiers, pages)).toFixed(2);
}
function computeFinishingPrice(cfg, finishing, format, pages) {
  if (finishing === "aucune") return 0;
  if (finishing === "plastification") return cfg.finishing.plastification[format] ?? 0;
  const tiers = cfg.finishing[finishing];
  for (const t of tiers) if (pages <= t.max) return t.price;
  return tiers[tiers.length - 1].price;
}
const eur = (n) => n.toLocaleString("fr-BE", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " €";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/* ============================================================
   HORAIRES — calculés en direct sur le fuseau Europe/Brussels,
   indépendamment du fuseau du visiteur.
============================================================ */
const OPENING_HOURS = [
  { day: "Lundi", open: 10 * 60, close: 19 * 60 },
  { day: "Mardi", open: 10 * 60, close: 19 * 60 },
  { day: "Mercredi", open: 10 * 60, close: 19 * 60 },
  { day: "Jeudi", open: 10 * 60, close: 19 * 60 },
  { day: "Vendredi", open: null, close: null },
  { day: "Samedi", open: 10 * 60 + 30, close: 19 * 60 },
  { day: "Dimanche", open: 10 * 60 + 30, close: 19 * 60 },
];
const fmtHM = (mins) => `${String(Math.floor(mins / 60)).padStart(2, "0")}h${String(mins % 60).padStart(2, "0")}`;
const WEEKDAY_FR = { Monday: "Lundi", Tuesday: "Mardi", Wednesday: "Mercredi", Thursday: "Jeudi", Friday: "Vendredi", Saturday: "Samedi", Sunday: "Dimanche" };
function getBrusselsNow() {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/Brussels", weekday: "long", hour: "2-digit", minute: "2-digit", hour12: false,
  }).formatToParts(new Date());
  const map = {};
  parts.forEach((p) => { map[p.type] = p.value; });
  return { day: WEEKDAY_FR[map.weekday], minutes: parseInt(map.hour, 10) * 60 + parseInt(map.minute, 10) };
}
function computeShopStatus() {
  const { day, minutes } = getBrusselsNow();
  const idx = OPENING_HOURS.findIndex((d) => d.day === day);
  const today = OPENING_HOURS[idx];
  if (today.open != null && minutes >= today.open && minutes < today.close) {
    const left = today.close - minutes;
    return { day, open: true, closesSoon: left <= 60, minutesLeft: left, closeTime: fmtHM(today.close) };
  }
  for (let i = 1; i <= 7; i++) {
    const next = OPENING_HOURS[(idx + i) % 7];
    if (next.open != null) {
      return { day, open: false, isTomorrow: i === 1, nextDay: next.day, nextOpenTime: fmtHM(next.open) };
    }
  }
  return { day, open: false };
}
function shopStatusLabel(status, T) {
  if (status.open) {
    return status.closesSoon ? T.contact.closesIn(status.minutesLeft) : T.contact.openUntil(status.closeTime);
  }
  if (status.nextOpenTime) {
    return status.isTomorrow ? T.contact.reopensTomorrow(status.nextOpenTime) : T.contact.reopensOn(T.days[status.nextDay], status.nextOpenTime);
  }
  return T.contact.closed;
}

const STATUS_KEYS = ["received", "analyzed", "queued", "printing", "binding", "qc", "ready", "done"];

const CV_PACKS = [
  { key: "simple" },
  { key: "professionnel" },
  { key: "packEmploi" },
];

const FUTURE_SERVICES = [
  { key: "cartes", Icon: Tag },
  { key: "flyers", Icon: FileText },
  { key: "brochures", Icon: Layers },
  { key: "perso", Icon: Sparkles },
];

const STUDENT_CARDS = [
  { key: "cours", Icon: FileText },
  { key: "reliure", Icon: Layers },
  { key: "cv", Icon: Pencil },
];

/* ============================================================
   TRADUCTIONS — FR / NL / EN. Tout le texte statique de
   l'interface vit ici ; la logique de tarification reste
   indépendante de la langue.
============================================================ */
const TRANSLATIONS = {
  fr: {
    langName: "Français",
    nav: { order: "Commander", pricing: "Tarifs", contact: "Contact", track: "Suivre une commande", newOrder: "Nouvelle commande" },
    storageWarning: "Impossible de joindre la base de données en ligne — des tarifs par défaut sont affichés temporairement. Vérifie ta configuration Supabase.",
    track: { title: "Suivre ma commande", subtitle: "Entrez le numéro reçu lors de votre confirmation.", placeholder: "CCZ-123456", search: "Rechercher", orderLabel: "Commande", totalLabel: "Total", statusCurrent: "Statut actuel" },
    confirm: {
      title: "Commande confirmée",
      keepNumber: "Conservez ce numéro pour suivre votre commande :",
      fileLabel: "Fichier", totalPaidLabel: "Total payé en magasin",
      emailNote: "Un email de confirmation sera envoyé une fois le système de notifications branché à un vrai backend — pour l'instant, gardez le numéro affiché ci-dessus.",
      newOrder: "Passer une nouvelle commande",
    },
    profiles: { particulier: "Particulier", etudiant: "Étudiant", entreprise: "Entreprise" },
    particulierPanel: "Impression de documents personnels, photos et souvenirs — configurez tout ci-dessous.",
    etudiant: {
      eyebrow: "Étudiant", title: "Pensé pour votre année scolaire",
      subtitle: "Cours, mémoires, CV — tout ce qu'il vous faut pour réussir, imprimé et relié avec soin.",
      cvService: "Service Création de CV",
      cvOptional: "Optionnel — s'ajoute à votre commande d'impression si vous le souhaitez.",
      removeService: "Retirer ce service",
    },
    studentCards: {
      cours: { title: "Impression de cours", desc: "Syllabus et supports de cours imprimés nets, prêts pour la rentrée." },
      reliure: { title: "Reliure mémoire & TFE", desc: "Une finition soignée pour vos mémoires et travaux de fin d'études." },
      cv: { title: "CV professionnel", desc: "Un CV mis en page avec soin, prêt à convaincre." },
    },
    cvPacks: {
      simple: { label: "CV Simple", desc: "Mise en page propre de votre CV existant." },
      professionnel: { label: "CV Professionnel", desc: "Refonte complète, design soigné, conseils de contenu." },
      packEmploi: { label: "Pack Emploi", desc: "CV + lettre de motivation + relecture complète." },
    },
    entreprise: {
      eyebrow: "Entreprise", title: "Le partenaire impression de vos équipes",
      subtitle: "Gros volumes, délais courts, qualité professionnelle constante — pour tous vos documents d'entreprise.",
      card1title: "Impression professionnelle", card1desc: "Documents commerciaux, rapports et présentations en grand volume, qualité constante.",
      card2title: "Reliure professionnelle", card2desc: "Reliure spirale ou thermique pour vos dossiers et présentations clients.",
      soon: "Bientôt disponible pour les entreprises",
    },
    futureServices: {
      cartes: { label: "Cartes de visite", sub: "Format premium" },
      flyers: { label: "Flyers", sub: "Pour vos événements" },
      brochures: { label: "Brochures", sub: "Présentations pliées" },
      perso: { label: "Personnalisation d'item", sub: "Mugs, t-shirts, stylos..." },
    },
    stepper: ["Fichier", "Options", "Coordonnées"],
    step0: {
      title: "Déposez votre fichier", subtitle: "PDF, Word, PowerPoint, JPG ou PNG.",
      dropHere: "Glissez votre fichier ici", orBrowse: "ou cliquez pour parcourir",
      autoDetectUnavailable: "(détection auto indisponible pour ce fichier — vérifiez le nombre)",
      continue: "Continuer", analyzing: "Analyse du document...", numberOfPages: "Nombre de pages :", kb: "Ko",
      pagesDetected: (n) => `${n} page${n > 1 ? "s" : ""} détectée${n > 1 ? "s" : ""}`,
    },
    step1: {
      title: "Vos options", format: "Format", color: "Couleur", bw: "Noir & Blanc", colorOpt: "Couleur",
      printing: "Impression", recto: "Recto", rectoverso: "Recto-verso",
      finishing: "Finition", none: "Sans finition", spiral: "Reliure spirale", thermal: "Reliure thermique", laminate: "Plastification",
      pages: "Pages", copies: "Exemplaires",
      promoCode: "Code promo", promoAppliedWord: "appliqué", promoPlaceholder: "Ex : BIENVENUE10", apply: "Appliquer",
      estimate: "Estimation", printingLine: "Impression ×", finishingLine: "Finition ×", cvService: "Service CV",
      prepFee: "Frais de préparation", discount: "Réduction", total: "Total",
      back: "Retour", continue: "Continuer",
    },
    step2: {
      title: "Vos coordonnées", name: "Nom", namePlaceholder: "Votre nom",
      email: "Email", emailPlaceholder: "vous@exemple.com",
      phone: "Téléphone (optionnel)", phonePlaceholder: "+32 ...",
      totalToPay: "Total à payer en magasin",
      back: "Retour", confirm: "Confirmer la commande",
    },
    payment: {
      method: "Mode de paiement",
      payInStore: "Payer sur place", payInStoreDesc: "Réglez en espèces ou par carte au retrait.",
      payOnline: "Payer en ligne par carte", payOnlineDesc: "Paiement sécurisé, votre commande sera prête à récupérer.",
      cardNumber: "Numéro de carte", cardNumberPlaceholder: "1234 5678 9012 3456",
      expiry: "Date d'expiration", expiryPlaceholder: "MM/AA",
      cvc: "CVC", cvcPlaceholder: "123",
      nameOnCard: "Nom sur la carte", nameOnCardPlaceholder: "Comme indiqué sur la carte",
      demoNotice: "Environnement de test — aucun paiement réel n'est effectué.",
      payNow: "Payer maintenant", processing: "Paiement en cours...",
      errorNumber: "Numéro de carte invalide (16 chiffres).",
      errorExpiry: "Date d'expiration invalide (MM/AA).",
      errorCvc: "CVC invalide.",
      errorName: "Nom sur la carte requis.",
      paidOnline: "Payé en ligne", toPayInStore: "À payer sur place", totalToPay: "Total à payer",
    },
    pricing: {
      title: "Tarifs & simulateur",
      subtitle: "Choisissez un format et une couleur : le tableau et le prix ci-dessous s'ajustent — et se synchronisent avec votre commande en cours.",
      pageQty: "Quantité de pages", price: "Prix", page: "page", pagesWord: "pages", perPage: "/ page",
      pages: "Pages", copies: "Exemplaires", totalEstimate: "Estimation totale",
      spiral: "Reliure spirale", thermal: "Reliure thermique", laminate: "Plastification",
      useForOrder: "Utiliser ces options pour ma commande",
    },
    contact: {
      title: "Nous trouver", subtitle: "Passez récupérer votre commande, ou contactez-nous directement.",
      openNow: "Ouvert maintenant", closedNow: "Fermé actuellement",
      hours: "Horaires d'ouverture", today: "Aujourd'hui", closed: "Fermé",
      directions: "Itinéraire vers le magasin", openMapNewTab: "Ouvrir la carte dans un nouvel onglet",
      address: "Adresse", phoneLabel: "Téléphone", email: "Email",
      closesIn: (m) => `Ferme dans ${m} min`, openUntil: (t) => `Ouvert jusqu'à ${t}`,
      reopensTomorrow: (t) => `Réouvre demain à ${t}`, reopensOn: (day, t) => `Réouvre ${day.toLowerCase()} à ${t}`,
    },
    days: { Lundi: "Lundi", Mardi: "Mardi", Mercredi: "Mercredi", Jeudi: "Jeudi", Vendredi: "Vendredi", Samedi: "Samedi", Dimanche: "Dimanche" },
    statuses: ["Commande reçue", "Fichier analysé", "En attente d'impression", "Impression en cours", "Reliure en cours", "Contrôle qualité", "Prête à récupérer", "Terminée"],
    fileFromShop: "Fichier apporté en magasin",
    promoInvalid: "Code promo invalide ou expiré.",
    orderNotFound: "Aucune commande trouvée avec ce numéro. Vérifiez le numéro reçu à la confirmation.",
    shopStatusLabel: (s) => s,
  },
  nl: {
    langName: "Nederlands",
    nav: { order: "Bestellen", pricing: "Tarieven", contact: "Contact", track: "Bestelling opvolgen", newOrder: "Nieuwe bestelling" },
    storageWarning: "Kan de online database niet bereiken — tijdelijk worden standaardtarieven getoond. Controleer je Supabase-configuratie.",
    track: { title: "Mijn bestelling opvolgen", subtitle: "Voer het nummer in dat u bij uw bevestiging kreeg.", placeholder: "CCZ-123456", search: "Zoeken", orderLabel: "Bestelling", totalLabel: "Totaal", statusCurrent: "Huidige status" },
    confirm: {
      title: "Bestelling bevestigd",
      keepNumber: "Bewaar dit nummer om uw bestelling op te volgen:",
      fileLabel: "Bestand", totalPaidLabel: "Totaal te betalen in de winkel",
      emailNote: "Er wordt een bevestigingsmail verstuurd zodra het meldingssysteem is gekoppeld aan een echte backend — bewaar voorlopig het bovenstaande nummer.",
      newOrder: "Nieuwe bestelling plaatsen",
    },
    profiles: { particulier: "Particulier", etudiant: "Student", entreprise: "Bedrijf" },
    particulierPanel: "Afdrukken van persoonlijke documenten, foto's en herinneringen — stel hieronder alles in.",
    etudiant: {
      eyebrow: "Student", title: "Ontworpen voor uw schooljaar",
      subtitle: "Cursussen, scripties, cv's — alles wat u nodig heeft, netjes afgedrukt en ingebonden.",
      cvService: "CV-opmaakservice",
      cvOptional: "Optioneel — wordt toegevoegd aan uw afdrukbestelling indien gewenst.",
      removeService: "Deze service verwijderen",
    },
    studentCards: {
      cours: { title: "Cursussen afdrukken", desc: "Syllabi en cursusmateriaal netjes afgedrukt, klaar voor het nieuwe schooljaar." },
      reliure: { title: "Inbinden thesis & scriptie", desc: "Een verzorgde afwerking voor uw thesis en eindwerken." },
      cv: { title: "Professioneel cv", desc: "Een zorgvuldig opgemaakt cv dat overtuigt." },
    },
    cvPacks: {
      simple: { label: "CV Eenvoudig", desc: "Nette opmaak van uw bestaande cv." },
      professionnel: { label: "CV Professioneel", desc: "Volledige herwerking, verzorgd design, inhoudelijk advies." },
      packEmploi: { label: "Sollicitatiepakket", desc: "CV + motivatiebrief + volledige nalezing." },
    },
    entreprise: {
      eyebrow: "Bedrijf", title: "De drukpartner voor uw teams",
      subtitle: "Grote volumes, korte termijnen, constante professionele kwaliteit — voor al uw bedrijfsdocumenten.",
      card1title: "Professioneel drukwerk", card1desc: "Commerciële documenten, rapporten en presentaties in grote oplages, constante kwaliteit.",
      card2title: "Professioneel inbinden", card2desc: "Spiraal- of thermische binding voor uw dossiers en klantpresentaties.",
      soon: "Binnenkort beschikbaar voor bedrijven",
    },
    futureServices: {
      cartes: { label: "Visitekaartjes", sub: "Premium formaat" },
      flyers: { label: "Flyers", sub: "Voor uw evenementen" },
      brochures: { label: "Brochures", sub: "Gevouwen presentaties" },
      perso: { label: "Item personalisatie", sub: "Mokken, t-shirts, pennen..." },
    },
    stepper: ["Bestand", "Opties", "Gegevens"],
    step0: {
      title: "Upload uw bestand", subtitle: "PDF, Word, PowerPoint, JPG of PNG.",
      dropHere: "Sleep uw bestand hierheen", orBrowse: "of klik om te bladeren",
      autoDetectUnavailable: "(automatische detectie niet beschikbaar voor dit bestand — controleer het aantal)",
      continue: "Verdergaan", analyzing: "Document wordt geanalyseerd...", numberOfPages: "Aantal pagina's:", kb: "KB",
      pagesDetected: (n) => `${n} pagina${n > 1 ? "'s" : ""} gedetecteerd`,
    },
    step1: {
      title: "Uw opties", format: "Formaat", color: "Kleur", bw: "Zwart-wit", colorOpt: "Kleur",
      printing: "Afdrukken", recto: "Recto", rectoverso: "Recto-verso",
      finishing: "Afwerking", none: "Zonder afwerking", spiral: "Spiraalbinding", thermal: "Thermische binding", laminate: "Lamineren",
      pages: "Pagina's", copies: "Exemplaren",
      promoCode: "Kortingscode", promoAppliedWord: "toegepast", promoPlaceholder: "Bijv.: BIENVENUE10", apply: "Toepassen",
      estimate: "Schatting", printingLine: "Afdrukken ×", finishingLine: "Afwerking ×", cvService: "CV-service",
      prepFee: "Voorbereidingskosten", discount: "Korting", total: "Totaal",
      back: "Terug", continue: "Verdergaan",
    },
    step2: {
      title: "Uw gegevens", name: "Naam", namePlaceholder: "Uw naam",
      email: "E-mail", emailPlaceholder: "u@voorbeeld.com",
      phone: "Telefoon (optioneel)", phonePlaceholder: "+32 ...",
      totalToPay: "Totaal te betalen in de winkel",
      back: "Terug", confirm: "Bestelling bevestigen",
    },
    payment: {
      method: "Betaalmethode",
      payInStore: "Betalen in de winkel", payInStoreDesc: "Contant of met kaart bij het afhalen.",
      payOnline: "Online betalen met kaart", payOnlineDesc: "Veilige betaling, uw bestelling ligt klaar om af te halen.",
      cardNumber: "Kaartnummer", cardNumberPlaceholder: "1234 5678 9012 3456",
      expiry: "Vervaldatum", expiryPlaceholder: "MM/JJ",
      cvc: "CVC", cvcPlaceholder: "123",
      nameOnCard: "Naam op de kaart", nameOnCardPlaceholder: "Zoals vermeld op de kaart",
      demoNotice: "Testomgeving — er wordt geen echte betaling uitgevoerd.",
      payNow: "Nu betalen", processing: "Betaling wordt verwerkt...",
      errorNumber: "Ongeldig kaartnummer (16 cijfers).",
      errorExpiry: "Ongeldige vervaldatum (MM/JJ).",
      errorCvc: "Ongeldige CVC.",
      errorName: "Naam op de kaart is verplicht.",
      paidOnline: "Online betaald", toPayInStore: "Te betalen in de winkel", totalToPay: "Totaal te betalen",
    },
    pricing: {
      title: "Tarieven & simulator",
      subtitle: "Kies een formaat en een kleur: de tabel en de prijs hieronder passen zich aan — en synchroniseren met uw huidige bestelling.",
      pageQty: "Aantal pagina's", price: "Prijs", page: "pagina", pagesWord: "pagina's", perPage: "/ pagina",
      pages: "Pagina's", copies: "Exemplaren", totalEstimate: "Totale schatting",
      spiral: "Spiraalbinding", thermal: "Thermische binding", laminate: "Lamineren",
      useForOrder: "Deze opties gebruiken voor mijn bestelling",
    },
    contact: {
      title: "Ons vinden", subtitle: "Kom uw bestelling ophalen, of neem rechtstreeks contact met ons op.",
      openNow: "Nu open", closedNow: "Nu gesloten",
      hours: "Openingsuren", today: "Vandaag", closed: "Gesloten",
      directions: "Route naar de winkel", openMapNewTab: "Kaart openen in nieuw tabblad",
      address: "Adres", phoneLabel: "Telefoon", email: "E-mail",
      closesIn: (m) => `Sluit over ${m} min`, openUntil: (t) => `Open tot ${t}`,
      reopensTomorrow: (t) => `Opent morgen om ${t}`, reopensOn: (day, t) => `Opent op ${day} om ${t}`,
    },
    days: { Lundi: "Maandag", Mardi: "Dinsdag", Mercredi: "Woensdag", Jeudi: "Donderdag", Vendredi: "Vrijdag", Samedi: "Zaterdag", Dimanche: "Zondag" },
    statuses: ["Bestelling ontvangen", "Bestand geanalyseerd", "Wachten op afdruk", "Wordt afgedrukt", "Wordt ingebonden", "Kwaliteitscontrole", "Klaar om af te halen", "Voltooid"],
    fileFromShop: "Bestand meegebracht naar de winkel",
    promoInvalid: "Ongeldige of verlopen kortingscode.",
    orderNotFound: "Geen bestelling gevonden met dit nummer. Controleer het nummer dat u bij bevestiging kreeg.",
  },
  en: {
    langName: "English",
    nav: { order: "Order", pricing: "Pricing", contact: "Contact", track: "Track an order", newOrder: "New order" },
    storageWarning: "Couldn't reach the online database — default pricing is shown temporarily. Check your Supabase configuration.",
    track: { title: "Track my order", subtitle: "Enter the number you received on your confirmation.", placeholder: "CCZ-123456", search: "Search", orderLabel: "Order", totalLabel: "Total", statusCurrent: "Current status" },
    confirm: {
      title: "Order confirmed",
      keepNumber: "Keep this number to track your order:",
      fileLabel: "File", totalPaidLabel: "Total to pay in store",
      emailNote: "A confirmation email will be sent once the notification system is connected to a real backend — for now, keep the number shown above.",
      newOrder: "Place a new order",
    },
    profiles: { particulier: "Individual", etudiant: "Student", entreprise: "Business" },
    particulierPanel: "Printing personal documents, photos and keepsakes — set everything up below.",
    etudiant: {
      eyebrow: "Student", title: "Built for your school year",
      subtitle: "Coursework, theses, CVs — everything you need to succeed, printed and bound with care.",
      cvService: "CV Writing Service",
      cvOptional: "Optional — added to your print order if you'd like.",
      removeService: "Remove this service",
    },
    studentCards: {
      cours: { title: "Course printing", desc: "Course notes and materials, printed crisp and ready for the school year." },
      reliure: { title: "Thesis binding", desc: "A polished finish for your thesis and final-year projects." },
      cv: { title: "Professional CV", desc: "A carefully laid-out CV, ready to impress." },
    },
    cvPacks: {
      simple: { label: "Simple CV", desc: "Clean layout of your existing CV." },
      professionnel: { label: "Professional CV", desc: "Full redesign, polished look, content advice." },
      packEmploi: { label: "Job Search Pack", desc: "CV + cover letter + full proofreading." },
    },
    entreprise: {
      eyebrow: "Business", title: "Your team's printing partner",
      subtitle: "High volumes, short turnarounds, consistent professional quality — for all your business documents.",
      card1title: "Professional printing", card1desc: "Business documents, reports and presentations at scale, consistent quality.",
      card2title: "Professional binding", card2desc: "Spiral or thermal binding for your files and client presentations.",
      soon: "Coming soon for businesses",
    },
    futureServices: {
      cartes: { label: "Business cards", sub: "Premium finish" },
      flyers: { label: "Flyers", sub: "For your events" },
      brochures: { label: "Brochures", sub: "Folded presentations" },
      perso: { label: "Item personalisation", sub: "Mugs, t-shirts, pens..." },
    },
    stepper: ["File", "Options", "Details"],
    step0: {
      title: "Drop your file", subtitle: "PDF, Word, PowerPoint, JPG or PNG.",
      dropHere: "Drag your file here", orBrowse: "or click to browse",
      autoDetectUnavailable: "(auto-detection unavailable for this file — please check the count)",
      continue: "Continue", analyzing: "Analysing document...", numberOfPages: "Number of pages:", kb: "KB",
      pagesDetected: (n) => `${n} page${n > 1 ? "s" : ""} detected`,
    },
    step1: {
      title: "Your options", format: "Format", color: "Colour", bw: "Black & White", colorOpt: "Colour",
      printing: "Printing", recto: "Single-sided", rectoverso: "Double-sided",
      finishing: "Finishing", none: "No finishing", spiral: "Spiral binding", thermal: "Thermal binding", laminate: "Lamination",
      pages: "Pages", copies: "Copies",
      promoCode: "Promo code", promoAppliedWord: "applied", promoPlaceholder: "E.g.: BIENVENUE10", apply: "Apply",
      estimate: "Estimate", printingLine: "Printing ×", finishingLine: "Finishing ×", cvService: "CV service",
      prepFee: "Prep fee", discount: "Discount", total: "Total",
      back: "Back", continue: "Continue",
    },
    step2: {
      title: "Your details", name: "Name", namePlaceholder: "Your name",
      email: "Email", emailPlaceholder: "you@example.com",
      phone: "Phone (optional)", phonePlaceholder: "+32 ...",
      totalToPay: "Total to pay in store",
      back: "Back", confirm: "Confirm order",
    },
    payment: {
      method: "Payment method",
      payInStore: "Pay in store", payInStoreDesc: "Cash or card when you pick up your order.",
      payOnline: "Pay online by card", payOnlineDesc: "Secure payment, your order will be ready for pickup.",
      cardNumber: "Card number", cardNumberPlaceholder: "1234 5678 9012 3456",
      expiry: "Expiry date", expiryPlaceholder: "MM/YY",
      cvc: "CVC", cvcPlaceholder: "123",
      nameOnCard: "Name on card", nameOnCardPlaceholder: "As shown on the card",
      demoNotice: "Test environment — no real payment is processed.",
      payNow: "Pay now", processing: "Processing payment...",
      errorNumber: "Invalid card number (16 digits).",
      errorExpiry: "Invalid expiry date (MM/YY).",
      errorCvc: "Invalid CVC.",
      errorName: "Name on card is required.",
      paidOnline: "Paid online", toPayInStore: "To pay in store", totalToPay: "Total to pay",
    },
    pricing: {
      title: "Pricing & simulator",
      subtitle: "Pick a format and a colour: the table and price below adjust — and stay in sync with your current order.",
      pageQty: "Number of pages", price: "Price", page: "page", pagesWord: "pages", perPage: "/ page",
      pages: "Pages", copies: "Copies", totalEstimate: "Total estimate",
      spiral: "Spiral binding", thermal: "Thermal binding", laminate: "Lamination",
      useForOrder: "Use these options for my order",
    },
    contact: {
      title: "Find us", subtitle: "Come pick up your order, or get in touch directly.",
      openNow: "Open now", closedNow: "Currently closed",
      hours: "Opening hours", today: "Today", closed: "Closed",
      directions: "Directions to the shop", openMapNewTab: "Open map in a new tab",
      address: "Address", phoneLabel: "Phone", email: "Email",
      closesIn: (m) => `Closes in ${m} min`, openUntil: (t) => `Open until ${t}`,
      reopensTomorrow: (t) => `Reopens tomorrow at ${t}`, reopensOn: (day, t) => `Reopens ${day} at ${t}`,
    },
    days: { Lundi: "Monday", Mardi: "Tuesday", Mercredi: "Wednesday", Jeudi: "Thursday", Vendredi: "Friday", Samedi: "Saturday", Dimanche: "Sunday" },
    statuses: ["Order received", "File analysed", "Awaiting printing", "Printing in progress", "Binding in progress", "Quality check", "Ready for pickup", "Completed"],
    fileFromShop: "File brought in-store",
    promoInvalid: "Invalid or expired promo code.",
    orderNotFound: "No order found with this number. Please check the number you received at confirmation.",
  },
};
const LANGS = ["fr", "nl", "en"];

/* ============================================================
   Small building blocks
============================================================ */
function StepDot({ index, current, label }) {
  const done = index < current;
  const active = index === current;
  return (
    <div className="flex items-center gap-2">
      <div
        className={
          "w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold border transition-all duration-300 " +
          (done ? "bg-blue-600 border-blue-600 text-white" : active ? "border-blue-600 text-blue-600 bg-blue-50 scale-105" : "border-slate-200 text-slate-400 bg-white")
        }
        style={displayFont}
      >
        {done ? <CheckCircle2 className="w-4 h-4" /> : index + 1}
      </div>
      <span className={"text-sm font-medium hidden sm:block transition-colors " + (active ? "text-slate-900" : "text-slate-400")}>{label}</span>
    </div>
  );
}

function OptionPill({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className={
        "px-4 py-2.5 rounded-xl text-sm font-semibold border transition-all duration-200 hover:scale-105 active:scale-95 " +
        (active ? "bg-slate-900 border-slate-900 text-white shadow-md" : "bg-white border-slate-200 text-slate-600 hover:border-slate-300")
      }
    >
      {children}
    </button>
  );
}

function Timeline({ status, labels, currentLabel }) {
  const currentIndex = Math.max(0, STATUS_KEYS.indexOf(status));
  return (
    <div className="space-y-0">
      {STATUS_KEYS.map((key, i) => {
        const done = i < currentIndex;
        const active = i === currentIndex;
        return (
          <div key={key} className="flex gap-3">
            <div className="flex flex-col items-center">
              <div className={
                "w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 transition-colors duration-500 " +
                (done ? "bg-green-500 text-white" : active ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-300")
              }>
                {done ? <CheckCircle2 className="w-4 h-4" /> : active ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Circle className="w-3 h-3" />}
              </div>
              {i < STATUS_KEYS.length - 1 && <div className={"w-px flex-1 min-h-6 transition-colors duration-500 " + (done ? "bg-green-400" : "bg-slate-200")} />}
            </div>
            <div className="pb-6">
              <p className={"text-sm font-semibold " + (active ? "text-blue-700" : done ? "text-slate-700" : "text-slate-400")}>{labels[i]}</p>
              {active && <p className="text-xs text-slate-400 mt-0.5">{currentLabel}</p>}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function Confetti() {
  const colors = ["bg-blue-500", "bg-orange-500", "bg-green-500", "bg-slate-400"];
  return (
    <div className="absolute inset-0 pointer-events-none overflow-visible">
      {Array.from({ length: 10 }).map((_, i) => (
        <span
          key={i}
          className={"confetti-piece absolute w-1.5 h-1.5 rounded-full " + colors[i % colors.length]}
          style={{ left: `${8 + i * 9}%`, top: "10%", animationDelay: `${i * 0.05}s` }}
        />
      ))}
    </div>
  );
}

function useInViewOnce() {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([entry]) => { if (entry.isIntersecting) { setInView(true); obs.disconnect(); } }, { threshold: 0.18 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return [ref, inView];
}

function Reveal({ children, delay = 0, className = "" }) {
  const [ref, inView] = useInViewOnce();
  return (
    <div
      ref={ref}
      className={className + " transition-all duration-700 ease-out " + (inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10")}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

const ACCENTS = [
  { bg: "from-blue-500 to-blue-700", ring: "ring-blue-200/60", glow: "bg-blue-500/20" },
  { bg: "from-orange-400 to-orange-600", ring: "ring-orange-200/60", glow: "bg-orange-500/20" },
  { bg: "from-violet-500 to-indigo-600", ring: "ring-violet-200/60", glow: "bg-violet-500/20" },
  { bg: "from-emerald-500 to-teal-600", ring: "ring-emerald-200/60", glow: "bg-emerald-500/20" },
];

function IconHero({ Icon, eyebrow, title, subtitle }) {
  return (
    <div className="relative rounded-3xl overflow-hidden mb-6 bg-gradient-to-br from-slate-900 via-slate-900 to-blue-950 px-7 py-10 sm:py-12">
      <div className="absolute -right-10 -top-10 w-56 h-56 rounded-full bg-blue-500/10 blur-2xl" />
      <div className="absolute right-6 bottom-6 sm:right-10 sm:bottom-8 w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-br from-blue-400 to-indigo-600 shadow-lg shadow-blue-900/40 flex items-center justify-center rotate-6">
        <Icon className="w-10 h-10 sm:w-12 sm:h-12 text-white" strokeWidth={1.5} />
      </div>
      <p className="text-xs font-semibold uppercase tracking-wide text-white/60 mb-2 relative">{eyebrow}</p>
      <h3 className="text-2xl sm:text-3xl text-white mb-2 relative max-w-[75%]" style={displayFont}>{title}</h3>
      <p className="text-sm text-white/75 max-w-md relative">{subtitle}</p>
    </div>
  );
}

function IconCard({ Icon, title, desc, onClick, accent = 0 }) {
  const a = ACCENTS[accent % ACCENTS.length];
  return (
    <button onClick={onClick} className="group text-left rounded-3xl border border-slate-200 bg-white p-6 hover:shadow-xl hover:-translate-y-1 transition-all duration-500 w-full relative overflow-hidden">
      <div className={"absolute -right-6 -top-6 w-24 h-24 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 " + a.glow} />
      <div className={"relative w-12 h-12 rounded-2xl bg-gradient-to-br " + a.bg + " ring-4 " + a.ring + " flex items-center justify-center mb-4 shadow-sm group-hover:rotate-6 transition-transform duration-500"}>
        <Icon className="w-5 h-5 text-white" strokeWidth={2} />
      </div>
      <p className="font-semibold text-slate-800 mb-1 relative" style={displayFont}>{title}</p>
      <p className="text-sm text-slate-500 leading-snug relative">{desc}</p>
    </button>
  );
}

const SOON_GRADIENTS = [
  "bg-gradient-to-br from-blue-50 to-white",
  "bg-gradient-to-br from-orange-50 to-white",
  "bg-gradient-to-br from-violet-50 to-white",
  "bg-gradient-to-br from-emerald-50 to-white",
];
function SoonTile({ label, sub, Icon, i }) {
  const a = ACCENTS[i % ACCENTS.length];
  return (
    <div className={"rounded-3xl p-6 border border-slate-200 hover:-translate-y-1 hover:shadow-md transition-all duration-500 " + SOON_GRADIENTS[i % SOON_GRADIENTS.length]}>
      <span className="inline-block text-[10px] font-semibold uppercase tracking-wide bg-white/80 text-slate-500 px-2.5 py-1 rounded-full mb-8">Bientôt disponible</span>
      <div className={"w-10 h-10 rounded-xl bg-gradient-to-br " + a.bg + " flex items-center justify-center mb-2 opacity-80"}>
        <Icon className="w-4 h-4 text-white" strokeWidth={2} />
      </div>
      <p className="font-semibold text-slate-700" style={displayFont}>{label}</p>
      {sub && <p className="text-xs text-slate-500">{sub}</p>}
    </div>
  );
}

/* ============================================================
   Main App
============================================================ */
function CopyCenterOrderAppInner() {
  const [pricing, setPricing] = useState(null);
  const [promos, setPromos] = useState(null);
  const [mode, setMode] = useState("order");
  const [step, setStep] = useState(0);
  const [profile, setProfile] = useState("particulier");

  const [lang, setLang] = useState("fr");
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const T = TRANSLATIONS[lang];
  useEffect(() => {
    try {
      const saved = window.localStorage.getItem("site-lang");
      if (saved && LANGS.includes(saved)) setLang(saved);
    } catch {}
  }, []);
  function changeLang(l) {
    setLang(l);
    setLangMenuOpen(false);
    try { window.localStorage.setItem("site-lang", l); } catch {}
  }

  /* ---------- Admin dashboard ---------- */
  const [adminAuthed, setAdminAuthed] = useState(false);
  const [adminChecking, setAdminChecking] = useState(true);
  const [adminEmail, setAdminEmail] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [adminError, setAdminError] = useState("");
  const [adminSigningIn, setAdminSigningIn] = useState(false);
  const [adminTab, setAdminTab] = useState("overview");
  const [orders, setOrders] = useState(null);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [visitCount, setVisitCount] = useState(null);
  const [announcement, setAnnouncement] = useState({ enabled: false, text: "" });
  const [announcementDraft, setAnnouncementDraft] = useState({ enabled: false, text: "" });
  const [newPromo, setNewPromo] = useState({ code: "", type: "percent", value: "", label: "" });
  const [newPromoError, setNewPromoError] = useState("");

  useEffect(() => {
    (async () => {
      const session = await getAdminSession();
      setAdminAuthed(!!session);
      setAdminChecking(false);
    })();
    const unsubscribe = onAdminAuthChange((session) => setAdminAuthed(!!session));

    (async () => {
      const remoteAnnouncement = await getSetting("announcement", { enabled: false, text: "" });
      setAnnouncement(remoteAnnouncement);
      setAnnouncementDraft(remoteAnnouncement);
      // simple page-load counter — not unique visitors, just total loads
      await incrementVisitCount();
    })();

    return unsubscribe;
  }, []);

  async function handleAdminSignIn() {
    setAdminSigningIn(true);
    setAdminError("");
    const res = await adminSignIn(adminEmail.trim(), adminPassword);
    setAdminSigningIn(false);
    if (res.ok) {
      setAdminAuthed(true);
      setAdminPassword("");
    } else {
      setAdminError("Email ou mot de passe incorrect.");
    }
  }

  async function handleAdminSignOut() {
    await adminSignOut();
    setAdminAuthed(false);
    window.scrollTo(0, 0);
  }

  async function loadOrders() {
    setOrdersLoading(true);
    const [loaded, count] = await Promise.all([
      getAllOrders(),
      getSetting("visit_count", 0),
    ]);
    setOrders(loaded);
    setVisitCount(typeof count === "number" ? count : 0);
    setOrdersLoading(false);
  }

  async function handleUpdateOrderStatus(id, newStatus) {
    setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status: newStatus } : o)));
    await updateOrderStatusRow(id, newStatus);
  }

  async function addPromo() {
    const code = newPromo.code.trim().toUpperCase();
    const value = parseFloat(newPromo.value);
    if (!code) { setNewPromoError("Le code est requis."); return; }
    if (!value || value <= 0) { setNewPromoError("Indiquez une valeur de réduction valide."); return; }
    const label = newPromo.label.trim() || (newPromo.type === "percent" ? `-${value} %` : `-${value.toFixed(2).replace(".", ",")} €`);
    const ok = await upsertPromo(code, newPromo.type, value, label);
    if (!ok) { setNewPromoError("Impossible d'enregistrer ce code (vérifie ta connexion admin)."); return; }
    setPromos({ ...promos, [code]: { type: newPromo.type, value, label } });
    setNewPromo({ code: "", type: "percent", value: "", label: "" });
    setNewPromoError("");
  }

  async function removePromo(code) {
    const updated = { ...promos };
    delete updated[code];
    setPromos(updated);
    await deletePromoRow(code);
  }

  async function saveAnnouncement() {
    setAnnouncement(announcementDraft);
    await setSetting("announcement", announcementDraft);
  }

  const [file, setFile] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [autoDetected, setAutoDetected] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const [format, setFormat] = useState("A4");
  const [color, setColor] = useState("nb");
  const [sides, setSides] = useState("recto");
  const [finishing, setFinishing] = useState("aucune");
  const [pages, setPages] = useState(1);
  const [quantity, setQuantity] = useState(1);
  const [cvPack, setCvPack] = useState(null);

  const [promoInput, setPromoInput] = useState("");
  const [promoApplied, setPromoApplied] = useState(null);
  const [promoError, setPromoError] = useState("");

  const [customer, setCustomer] = useState({ name: "", email: "", phone: "" });
  const [submitting, setSubmitting] = useState(false);
  const [order, setOrder] = useState(null);
  const [storageWarning, setStorageWarning] = useState(false);

  const [paymentMethod, setPaymentMethod] = useState("surplace");
  const [card, setCard] = useState({ number: "", expiry: "", cvc: "", name: "" });
  const [cardError, setCardError] = useState("");
  const [paying, setPaying] = useState(false);

  const [trackQuery, setTrackQuery] = useState("");
  const [trackResult, setTrackResult] = useState(null);
  const [trackError, setTrackError] = useState("");
  const fileInputRef = useRef(null);

  const [bump, setBump] = useState(false);
  const prevTotalRef = useRef(null);

  const [shopStatus, setShopStatus] = useState(() => computeShopStatus());
  useEffect(() => {
    const id = setInterval(() => setShopStatus(computeShopStatus()), 60000);
    return () => clearInterval(id);
  }, []);
  const [mapFailed, setMapFailed] = useState(false);

  // ambient cursor-follow halo (lerped for a smooth trailing feel)
  const haloRef = useRef(null);
  const mouseTarget = useRef({ x: 0, y: 0 });
  const mouseCurrent = useRef({ x: 0, y: 0 });
  const [parallax, setParallax] = useState({ x: 0, y: 0 });

  useEffect(() => {
    function onMove(e) {
      mouseTarget.current = { x: e.clientX, y: e.clientY };
      setParallax({ x: (e.clientX / window.innerWidth - 0.5) * 24, y: (e.clientY / window.innerHeight - 0.5) * 24 });
    }
    window.addEventListener("mousemove", onMove);
    let raf;
    function tick() {
      mouseCurrent.current.x += (mouseTarget.current.x - mouseCurrent.current.x) * 0.08;
      mouseCurrent.current.y += (mouseTarget.current.y - mouseCurrent.current.y) * 0.08;
      if (haloRef.current) {
        haloRef.current.style.transform = `translate(${mouseCurrent.current.x - 220}px, ${mouseCurrent.current.y - 220}px)`;
      }
      raf = requestAnimationFrame(tick);
    }
    raf = requestAnimationFrame(tick);
    return () => { window.removeEventListener("mousemove", onMove); cancelAnimationFrame(raf); };
  }, []);

  useEffect(() => {
    (async () => {
      const remotePricing = await getSetting("pricing", null);
      if (remotePricing) {
        setPricing(remotePricing);
      } else {
        // Rien en base (ou table pas encore initialisée) — on utilise les valeurs par
        // défaut du code le temps que le SQL de démarrage (supabase/schema.sql) soit exécuté.
        setPricing(DEFAULT_PRICING);
        setStorageWarning(true);
      }
      const remotePromos = await fetchPromos();
      setPromos(Object.keys(remotePromos).length ? remotePromos : DEFAULT_PROMOS);
    })();
  }, []);

  async function handleFile(f) {
    if (!f) return;
    setFile(f); setAnalyzing(true); setAutoDetected(false);
    if (f.type === "application/pdf") {
      try {
        const text = await f.text();
        const matches = text.match(/\/Type\s*\/Page[^s]/g);
        const count = matches ? matches.length : 0;
        await sleep(950);
        if (count > 0) { setPages(count); setAutoDetected(true); } else setPages(1);
      } catch { await sleep(950); }
    } else { await sleep(600); }
    setAnalyzing(false);
  }
  function onDrop(e) { e.preventDefault(); setDragOver(false); if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]); }

  const breakdown = useMemo(() => {
    if (!pricing) return null;
    const printPrice = computePrintPrice(pricing, format, color, pages);
    const finishPrice = computeFinishingPrice(pricing, finishing, format, pages);
    const cvPrice = cvPack ? pricing.cv[cvPack] : 0;
    const subtotal = +((printPrice + finishPrice) * quantity + cvPrice).toFixed(2);
    let discount = 0;
    if (promoApplied) discount = promoApplied.type === "percent" ? +(subtotal * promoApplied.value / 100).toFixed(2) : promoApplied.value;
    discount = Math.min(discount, subtotal);
    const total = +(subtotal - discount + pricing.prepFee).toFixed(2);
    return { printPrice, finishPrice, cvPrice, subtotal, discount, total, prepFee: pricing.prepFee };
  }, [pricing, format, color, pages, finishing, quantity, cvPack, promoApplied]);

  useEffect(() => {
    if (!breakdown) return;
    if (prevTotalRef.current !== null && prevTotalRef.current !== breakdown.total) {
      setBump(true);
      const t = setTimeout(() => setBump(false), 400);
      return () => clearTimeout(t);
    }
    prevTotalRef.current = breakdown.total;
  }, [breakdown && breakdown.total]);

  function applyPromo() {
    const code = promoInput.trim().toUpperCase();
    if (!code) return;
    const found = promos[code];
    if (found) { setPromoApplied({ ...found, code }); setPromoError(""); }
    else { setPromoApplied(null); setPromoError(T.promoInvalid); }
  }

  function validateCard() {
    const digits = card.number.replace(/\s+/g, "");
    if (!/^\d{16}$/.test(digits)) return T.payment.errorNumber;
    if (!/^\d{2}\/\d{2}$/.test(card.expiry.trim())) return T.payment.errorExpiry;
    if (!/^\d{3,4}$/.test(card.cvc.trim())) return T.payment.errorCvc;
    if (!card.name.trim()) return T.payment.errorName;
    return "";
  }

  async function submitOrder() {
    if (paymentMethod === "enligne") {
      const err = validateCard();
      if (err) { setCardError(err); return; }
      setCardError("");
      setPaying(true);
      await sleep(1400);
      setPaying(false);
    }
    setSubmitting(true);
    const id = "CCZ-" + Date.now().toString().slice(-6);
    const newOrder = {
      id, createdAt: new Date().toISOString(), profile,
      fileName: file ? file.name : T.fileFromShop,
      format, color, sides, finishing, pages, quantity, cvPack,
      promo: promoApplied ? promoApplied.code : null,
      breakdown, customer, status: STATUS_KEYS[0],
      paymentMethod, paid: paymentMethod === "enligne",
    };
    const ok = await createOrder(newOrder);
    if (!ok) setStorageWarning(true);
    setOrder(newOrder);
    setSubmitting(false);
    setStep(3);
  }

  async function trackOrder() {
    setTrackError(""); setTrackResult(null);
    const id = trackQuery.trim().toUpperCase();
    if (!id) return;
    const result = await trackOrderPublic(id);
    if (result) setTrackResult(result);
    else setTrackError(T.orderNotFound);
  }

  const canNextFromOptions = pages >= 1 && quantity >= 1;
  const canSubmit = customer.name.trim() && customer.email.trim();

  if (!pricing || !promos) {
    return <div className="min-h-96 flex items-center justify-center text-slate-400"><Loader2 className="w-6 h-6 animate-spin" /></div>;
  }
  function scrollToId(id) {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  /* ============ MODE ADMIN ============ */
  if (mode === "admin") {
    if (adminChecking) {
      return <div className="min-h-screen flex items-center justify-center text-slate-400"><Loader2 className="w-6 h-6 animate-spin" /></div>;
    }
    if (!adminAuthed) {
      return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center px-6" style={{ fontFamily: "'Inter', ui-sans-serif, sans-serif" }}>
          <style>{GLOBAL_STYLE}</style>
          <div className="bg-white border border-slate-200 rounded-2xl p-8 w-full max-w-sm step-anim">
            <div className="w-12 h-12 rounded-xl bg-slate-900 flex items-center justify-center mb-4">
              <KeyRound className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-semibold mb-1" style={displayFont}>Espace admin</h1>
            <p className="text-sm text-slate-500 mb-6">Connecte-toi avec ton compte admin Supabase.</p>
            <input
              type="email" value={adminEmail}
              onChange={(e) => setAdminEmail(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAdminSignIn()}
              placeholder="Email"
              className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm mb-3 focus:outline-none focus:border-blue-500 transition-colors"
              autoFocus
            />
            <input
              type="password" value={adminPassword}
              onChange={(e) => setAdminPassword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAdminSignIn()}
              placeholder="Mot de passe"
              className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm mb-3 focus:outline-none focus:border-blue-500 transition-colors"
            />
            {adminError && <p className="text-xs text-red-600 mb-3">{adminError}</p>}
            <button disabled={adminSigningIn} onClick={handleAdminSignIn} className="w-full bg-slate-900 disabled:opacity-60 text-white rounded-xl py-3 text-sm font-semibold hover:bg-slate-800 transition-colors mb-3 flex items-center justify-center gap-2">
              {adminSigningIn && <Loader2 className="w-4 h-4 animate-spin" />} Entrer
            </button>
            <button onClick={() => { setMode("order"); window.scrollTo(0, 0); }} className="w-full text-xs text-slate-400 hover:text-slate-600 transition-colors">
              ← Retour au site
            </button>
          </div>
        </div>
      );
    }

    const revenue = (orders || []).reduce((sum, o) => sum + (o.breakdown?.total || 0), 0);
    const today = new Date().toDateString();
    const ordersToday = (orders || []).filter((o) => new Date(o.createdAt).toDateString() === today).length;
    const avgOrder = orders && orders.length ? revenue / orders.length : 0;

    return (
      <div className="min-h-screen bg-slate-50" style={{ fontFamily: "'Inter', ui-sans-serif, sans-serif" }}>
        <style>{GLOBAL_STYLE}</style>
        <nav className="border-b border-slate-200 bg-white sticky top-0 z-20">
          <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center">
                <LayoutDashboard className="w-4 h-4 text-white" />
              </div>
              <span className="font-semibold text-slate-900" style={displayFont}>Admin <span className="text-slate-400 font-medium">Copy Center</span></span>
            </div>
            <div className="flex items-center gap-4">
              <button onClick={() => { setMode("order"); window.scrollTo(0, 0); }} className="text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors">Voir le site</button>
              <button
                onClick={handleAdminSignOut}
                className="text-sm font-medium text-red-500 hover:text-red-700 flex items-center gap-1.5 transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" /> Déconnexion
              </button>
            </div>
          </div>
        </nav>

        <div className="max-w-5xl mx-auto px-6 py-8">
          {/* Tabs */}
          <div className="flex gap-2 mb-8 overflow-x-auto pb-1">
            {[["overview", "Vue d'ensemble", TrendingUp], ["orders", "Commandes", PackageCheck], ["promos", "Codes promo", Tag], ["announcement", "Annonce", Megaphone]].map(([key, label, Icon]) => (
              <button
                key={key}
                onClick={() => { setAdminTab(key); if ((key === "orders" || key === "overview") && orders === null) loadOrders(); }}
                className={
                  "flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap transition-all " +
                  (adminTab === key ? "bg-slate-900 text-white" : "bg-white border border-slate-200 text-slate-500 hover:border-slate-300")
                }
              >
                <Icon className="w-3.5 h-3.5" /> {label}
              </button>
            ))}
          </div>

          {/* ---- Overview ---- */}
          {adminTab === "overview" && (
            <div>
              {ordersLoading || orders === null ? (
                <div className="flex items-center justify-center py-24 text-slate-400"><Loader2 className="w-6 h-6 animate-spin" /></div>
              ) : (
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                  <div className="bg-white border border-slate-200 rounded-2xl p-5">
                    <div className="w-9 h-9 rounded-lg bg-blue-100 flex items-center justify-center mb-3"><Euro className="w-4 h-4 text-blue-600" /></div>
                    <p className="text-xs text-slate-400 mb-1">Chiffre d'affaires total</p>
                    <p className="text-2xl font-semibold" style={monoFont}>{eur(revenue)}</p>
                  </div>
                  <div className="bg-white border border-slate-200 rounded-2xl p-5">
                    <div className="w-9 h-9 rounded-lg bg-orange-100 flex items-center justify-center mb-3"><PackageCheck className="w-4 h-4 text-orange-600" /></div>
                    <p className="text-xs text-slate-400 mb-1">Commandes (total / aujourd'hui)</p>
                    <p className="text-2xl font-semibold" style={monoFont}>{orders.length} <span className="text-sm text-slate-400 font-normal">/ {ordersToday}</span></p>
                  </div>
                  <div className="bg-white border border-slate-200 rounded-2xl p-5">
                    <div className="w-9 h-9 rounded-lg bg-green-100 flex items-center justify-center mb-3"><TrendingUp className="w-4 h-4 text-green-600" /></div>
                    <p className="text-xs text-slate-400 mb-1">Panier moyen</p>
                    <p className="text-2xl font-semibold" style={monoFont}>{eur(avgOrder)}</p>
                  </div>
                  <div className="bg-white border border-slate-200 rounded-2xl p-5">
                    <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center mb-3"><Users className="w-4 h-4 text-slate-600" /></div>
                    <p className="text-xs text-slate-400 mb-1">Visites du site</p>
                    <p className="text-2xl font-semibold" style={monoFont}>{visitCount ?? "–"}</p>
                    <p className="text-[10px] text-slate-300 mt-1">Nombre de chargements de page, pas de visiteurs uniques</p>
                  </div>
                </div>
              )}
              {orders && orders.length > 0 && (
                <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
                  <p className="px-5 py-3 text-xs font-semibold text-slate-500 border-b border-slate-100">Dernières commandes</p>
                  {orders.slice(0, 5).map((o) => (
                    <div key={o.id} className="flex items-center justify-between px-5 py-3 border-b border-slate-50 last:border-0 text-sm">
                      <span style={monoFont} className="text-slate-600">{o.id}</span>
                      <span className="text-slate-400 text-xs">{o.customer?.name}</span>
                      <span className="font-semibold" style={monoFont}>{eur(o.breakdown?.total || 0)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ---- Orders ---- */}
          {adminTab === "orders" && (
            <div>
              {ordersLoading || orders === null ? (
                <div className="flex items-center justify-center py-24 text-slate-400"><Loader2 className="w-6 h-6 animate-spin" /></div>
              ) : orders.length === 0 ? (
                <p className="text-sm text-slate-400 py-12 text-center">Aucune commande pour l'instant.</p>
              ) : (
                <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-slate-50 text-slate-500 text-left">
                        <th className="px-4 py-3 font-semibold">Commande</th>
                        <th className="px-4 py-3 font-semibold">Client</th>
                        <th className="px-4 py-3 font-semibold">Total</th>
                        <th className="px-4 py-3 font-semibold">Paiement</th>
                        <th className="px-4 py-3 font-semibold">Statut</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.map((o) => (
                        <tr key={o.id} className="border-t border-slate-100">
                          <td className="px-4 py-3" style={monoFont}>{o.id}</td>
                          <td className="px-4 py-3">
                            <p className="font-medium text-slate-700">{o.customer?.name}</p>
                            <p className="text-xs text-slate-400">{o.customer?.email}</p>
                          </td>
                          <td className="px-4 py-3 font-semibold" style={monoFont}>{eur(o.breakdown?.total || 0)}</td>
                          <td className="px-4 py-3">
                            {o.paid ? (
                              <span className="text-xs font-semibold text-green-700 bg-green-50 border border-green-200 rounded-full px-2.5 py-1">Payé en ligne</span>
                            ) : (
                              <span className="text-xs font-semibold text-slate-500 bg-slate-50 border border-slate-200 rounded-full px-2.5 py-1">Sur place</span>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <select
                              value={o.status}
                              onChange={(e) => handleUpdateOrderStatus(o.id, e.target.value)}
                              className="border border-slate-200 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:border-blue-500"
                            >
                              {STATUS_KEYS.map((s, i) => <option key={s} value={s}>{T.statuses[i]}</option>)}
                            </select>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* ---- Promo codes ---- */}
          {adminTab === "promos" && (
            <div>
              <div className="bg-white border border-slate-200 rounded-2xl p-6 mb-6">
                <p className="text-sm font-semibold text-slate-700 mb-4">Créer un nouveau code</p>
                <div className="grid sm:grid-cols-4 gap-3 mb-3">
                  <input
                    value={newPromo.code} onChange={(e) => setNewPromo({ ...newPromo, code: e.target.value.toUpperCase() })}
                    placeholder="CODE" className="border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-blue-500" style={monoFont}
                  />
                  <select
                    value={newPromo.type} onChange={(e) => setNewPromo({ ...newPromo, type: e.target.value })}
                    className="border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-blue-500"
                  >
                    <option value="percent">Pourcentage (%)</option>
                    <option value="fixed">Montant fixe (€)</option>
                  </select>
                  <input
                    type="number" value={newPromo.value} onChange={(e) => setNewPromo({ ...newPromo, value: e.target.value })}
                    placeholder={newPromo.type === "percent" ? "10" : "1.50"} className="border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-blue-500"
                  />
                  <input
                    value={newPromo.label} onChange={(e) => setNewPromo({ ...newPromo, label: e.target.value })}
                    placeholder="Libellé (auto si vide)" className="border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-blue-500"
                  />
                </div>
                {newPromoError && <p className="text-xs text-red-600 mb-3">{newPromoError}</p>}
                <button onClick={addPromo} className="bg-blue-600 text-white rounded-xl px-5 py-2.5 text-sm font-semibold flex items-center gap-1.5 hover:bg-blue-700 transition-colors">
                  <Plus className="w-4 h-4" /> Ajouter le code
                </button>
              </div>

              <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
                <p className="px-5 py-3 text-xs font-semibold text-slate-500 border-b border-slate-100">Codes actifs</p>
                {Object.keys(promos).length === 0 ? (
                  <p className="text-sm text-slate-400 px-5 py-6">Aucun code actif.</p>
                ) : (
                  Object.entries(promos).map(([code, p]) => (
                    <div key={code} className="flex items-center justify-between px-5 py-3 border-b border-slate-50 last:border-0">
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-semibold text-slate-800" style={monoFont}>{code}</span>
                        <span className="text-xs text-slate-400">{p.label}</span>
                      </div>
                      <button onClick={() => removePromo(code)} className="text-slate-300 hover:text-red-600 transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* ---- Announcement ---- */}
          {adminTab === "announcement" && (
            <div className="bg-white border border-slate-200 rounded-2xl p-6 max-w-xl">
              <p className="text-sm font-semibold text-slate-700 mb-1">Bannière d'annonce</p>
              <p className="text-xs text-slate-400 mb-4">Affichée en haut du site pour tous les visiteurs (promo en cours, fermeture exceptionnelle, etc.).</p>
              <label className="flex items-center gap-2 mb-4 cursor-pointer">
                <input type="checkbox" checked={announcementDraft.enabled} onChange={(e) => setAnnouncementDraft({ ...announcementDraft, enabled: e.target.checked })} className="w-4 h-4" />
                <span className="text-sm text-slate-600">Afficher la bannière sur le site</span>
              </label>
              <textarea
                value={announcementDraft.text}
                onChange={(e) => setAnnouncementDraft({ ...announcementDraft, text: e.target.value })}
                placeholder="Ex : -10% sur toutes les reliures cette semaine avec le code RELIURE10 !"
                rows={3}
                className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm mb-4 focus:outline-none focus:border-blue-500 resize-none"
              />
              <button onClick={saveAnnouncement} className="bg-blue-600 text-white rounded-xl px-5 py-2.5 text-sm font-semibold hover:bg-blue-700 transition-colors">
                Enregistrer
              </button>
              {announcement.enabled && announcement.text && (
                <div className="mt-5 pt-5 border-t border-slate-100">
                  <p className="text-xs text-slate-400 mb-2">Aperçu actuel sur le site :</p>
                  <div className="bg-slate-900 text-white text-sm rounded-xl px-4 py-3 flex items-center gap-2">
                    <Megaphone className="w-4 h-4 flex-shrink-0" /> {announcement.text}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 relative overflow-hidden" style={{ fontFamily: "'Inter', ui-sans-serif, sans-serif" }}>
      <style>{GLOBAL_STYLE}</style>

      {/* ambient cursor-follow halo */}
      <div ref={haloRef} className="fixed top-0 left-0 rounded-full bg-blue-200 blur-3xl opacity-25 pointer-events-none z-0 cursor-halo" style={{ width: 440, height: 440 }} />

      {/* ambient background blobs — light only, kept subtle, with a touch of cursor parallax */}
      <div
        className="absolute -top-24 -right-24 w-96 h-96 bg-blue-100 rounded-full blur-3xl opacity-50 blob-a pointer-events-none"
        style={{ transform: `translate(${parallax.x * 0.6}px, ${parallax.y * 0.6}px)` }}
      />
      <div
        className="absolute top-1/3 -left-24 w-80 h-80 bg-orange-100 rounded-full blur-3xl opacity-40 blob-b pointer-events-none"
        style={{ transform: `translate(${-parallax.x * 0.5}px, ${-parallax.y * 0.5}px)` }}
      />

      {/* continuously floating paper decorations — always alive, even without interaction */}
      <div className="absolute top-24 right-10 text-blue-200 opacity-60 pointer-events-none float-paper-a hidden md:block"><FileText className="w-10 h-10" /></div>
      <div className="absolute top-96 left-6 text-orange-200 opacity-60 pointer-events-none float-paper-b hidden md:block"><FileText className="w-7 h-7" /></div>
      <div className="absolute bottom-24 right-1/4 text-slate-200 opacity-70 pointer-events-none float-paper-c hidden md:block"><FileText className="w-8 h-8" /></div>

      <div className="relative">
        <nav className="border-b border-slate-100 bg-white/80 backdrop-blur sticky top-0 z-20">
          <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between gap-4">
            <button onClick={() => { setMode("order"); scrollToId("commander"); }} className="flex items-center gap-2.5 flex-shrink-0">
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
                <Printer className="w-4 h-4 text-white" />
              </div>
              <span className="font-semibold text-slate-900 whitespace-nowrap" style={displayFont}>Copy Center <span className="text-slate-400 font-medium">Zaventem</span></span>
            </button>
            <div className="hidden md:flex items-center gap-7">
              <button onClick={() => { setMode("order"); scrollToId("commander"); }} className="text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors">{T.nav.order}</button>
              <button onClick={() => scrollToId("tarifs")} className="text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors">{T.nav.pricing}</button>
              <button onClick={() => scrollToId("contact")} className="text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors">{T.nav.contact}</button>
            </div>
            <div className="flex items-center gap-4 flex-shrink-0">
              {/* Sélecteur de langue */}
              <div className="relative">
                <button
                  onClick={() => setLangMenuOpen((v) => !v)}
                  className="flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
                >
                  <Globe className="w-4 h-4" />
                  <span className="uppercase">{lang}</span>
                  <ChevronDown className={"w-3.5 h-3.5 transition-transform " + (langMenuOpen ? "rotate-180" : "")} />
                </button>
                {langMenuOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setLangMenuOpen(false)} />
                    <div className="absolute right-0 top-full mt-3 w-44 bg-white border border-slate-200 rounded-2xl shadow-xl py-1.5 z-20 step-anim">
                      {LANGS.map((l) => (
                        <button
                          key={l}
                          onClick={() => changeLang(l)}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-slate-50 transition-colors"
                        >
                          <span className={"text-xs font-semibold w-6 " + (l === lang ? "text-orange-600" : "text-slate-400")}>{l.toUpperCase()}</span>
                          <span className={"text-sm " + (l === lang ? "font-semibold text-slate-900" : "text-slate-600")}>{TRANSLATIONS[l].langName}</span>
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
              <button
                onClick={() => { setMode(mode === "order" ? "track" : "order"); scrollToId("commander"); }}
                className="text-sm font-medium text-slate-500 hover:text-slate-900 flex items-center gap-1.5 transition-colors"
              >
                <Search className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{mode === "order" ? T.nav.track : T.nav.newOrder}</span>
              </button>
            </div>
          </div>
        </nav>

        {announcement.enabled && announcement.text && (
          <div className="bg-slate-900 text-white">
            <div className="max-w-5xl mx-auto px-6 py-2.5 flex items-center gap-2 text-sm">
              <Megaphone className="w-4 h-4 flex-shrink-0 text-orange-400" />
              <span>{announcement.text}</span>
            </div>
          </div>
        )}

        {storageWarning && (
          <div className="max-w-5xl mx-auto px-6 pt-4">
            <div className="bg-orange-50 border border-orange-200 text-orange-700 text-sm rounded-xl px-4 py-3 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {T.storageWarning}
            </div>
          </div>
        )}

        <section id="commander">
        {mode === "track" ? (
          <div className="max-w-2xl mx-auto px-6 py-16 step-anim">
            <h1 className="text-3xl mb-2" style={displayFont}>{T.track.title}</h1>
            <p className="text-slate-500 mb-8">{T.track.subtitle}</p>
            <div className="flex gap-3 mb-8">
              <input
                value={trackQuery} onChange={(e) => setTrackQuery(e.target.value)}
                placeholder={T.track.placeholder}
                className="flex-1 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 transition-colors"
                style={monoFont}
              />
              <button onClick={trackOrder} className="bg-slate-900 text-white rounded-xl px-6 py-3 text-sm font-semibold hover:bg-slate-800 hover:scale-105 active:scale-95 transition-all">
                {T.track.search}
              </button>
            </div>
            {trackError && <p className="text-sm text-red-600 mb-6">{trackError}</p>}
            {trackResult && (
              <div className="bg-white border border-slate-200 rounded-2xl p-8 step-anim">
                <div className="flex items-center justify-between mb-8">
                  <div><p className="text-xs text-slate-400 mb-1">{T.track.orderLabel}</p><p className="text-lg font-semibold" style={monoFont}>{trackResult.id}</p></div>
                  <div className="text-right"><p className="text-xs text-slate-400 mb-1">{T.track.totalLabel}</p><p className="text-lg font-semibold" style={monoFont}>{eur(trackResult.total)}</p></div>
                </div>
                <Timeline status={trackResult.status} labels={T.statuses} currentLabel={T.track.statusCurrent} />
              </div>
            )}
          </div>
        ) : step === 3 && order ? (
          <div className="max-w-2xl mx-auto px-6 py-16 step-anim">
            <div className="relative w-14 h-14 rounded-2xl bg-green-100 flex items-center justify-center mb-6 pop-in">
              <PackageCheck className="w-7 h-7 text-green-600" />
              <Confetti />
            </div>
            <h1 className="text-3xl mb-2" style={displayFont}>{T.confirm.title}</h1>
            <p className="text-slate-500 mb-8">
              {T.confirm.keepNumber} <span className="font-semibold text-slate-900" style={monoFont}>{order.id}</span>
            </p>
            <div className="bg-white border border-slate-200 rounded-2xl p-8 mb-6">
              <div className="flex items-center justify-between pb-6 mb-6 border-b border-slate-100">
                <div><p className="text-xs text-slate-400 mb-1">{T.confirm.fileLabel}</p><p className="text-sm font-medium">{order.fileName}</p></div>
                <div className="text-right">
                  <p className="text-xs text-slate-400 mb-1 flex items-center justify-end gap-1">
                    {order.paid && <CheckCircle2 className="w-3 h-3 text-green-500" />}
                    {order.paid ? T.payment.paidOnline : T.payment.toPayInStore}
                  </p>
                  <p className="text-2xl font-semibold" style={monoFont}>{eur(order.breakdown.total)}</p>
                </div>
              </div>
              <Timeline status={order.status} labels={T.statuses} currentLabel={T.track.statusCurrent} />
            </div>
            <p className="text-xs text-slate-400 mb-6">
              {T.confirm.emailNote}
            </p>
            <button
              onClick={() => { setStep(0); setFile(null); setOrder(null); setCustomer({ name: "", email: "", phone: "" }); setPages(1); setQuantity(1); setCvPack(null); setPromoApplied(null); setPromoInput(""); setPaymentMethod("surplace"); setCard({ number: "", expiry: "", cvc: "", name: "" }); setCardError(""); }}
              className="text-sm font-semibold text-blue-600 flex items-center gap-1.5 hover:gap-2.5 transition-all"
            >
              {T.confirm.newOrder} <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <div className="max-w-3xl mx-auto px-6 py-12">
            {/* profile selector */}
            <div className="flex gap-2 mb-6">
              {[["particulier", T.profiles.particulier, User], ["etudiant", T.profiles.etudiant, GraduationCap], ["entreprise", T.profiles.entreprise, Building2]].map(([key, label, Icon]) => (
                <button
                  key={key} onClick={() => setProfile(key)}
                  className={
                    "flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold border transition-all duration-200 hover:scale-[1.02] active:scale-95 " +
                    (profile === key ? "border-blue-600 bg-blue-50 text-blue-700 shadow-sm" : "border-slate-200 text-slate-500 bg-white hover:border-slate-300")
                  }
                >
                  <Icon className="w-4 h-4" /> {label}
                </button>
              ))}
            </div>

            {/* persona-specific panel — this is what actually changes per profile */}
            <div key={profile} className="mb-10 panel-anim">
              {profile === "particulier" && (
                <div className="bg-white border border-slate-100 rounded-2xl px-5 py-4 text-sm text-slate-500">
                  {T.particulierPanel}
                </div>
              )}

              {profile === "etudiant" && (
                <div>
                  <Reveal>
                    <IconHero
                      Icon={GraduationCap}
                      eyebrow={T.etudiant.eyebrow}
                      title={T.etudiant.title}
                      subtitle={T.etudiant.subtitle}
                    />
                  </Reveal>
                  <div className="grid sm:grid-cols-3 gap-4 mb-6">
                    {STUDENT_CARDS.map((c, i) => (
                      <Reveal key={c.key} delay={i * 100}>
                        <IconCard
                          Icon={c.Icon}
                          title={T.studentCards[c.key].title}
                          desc={T.studentCards[c.key].desc}
                          accent={i}
                          onClick={() => {
                            if (c.key === "reliure") setFinishing("spirale");
                            if (c.key === "cv") setCvPack("professionnel");
                            scrollToId("commander-tool");
                          }}
                        />
                      </Reveal>
                    ))}
                  </div>

                  <Reveal>
                    <div className="bg-white border border-slate-200 rounded-2xl p-6">
                      <div className="flex items-center gap-2 mb-1">
                        <Pencil className="w-4 h-4 text-blue-600" />
                        <p className="font-semibold text-slate-800" style={displayFont}>{T.etudiant.cvService}</p>
                      </div>
                      <p className="text-sm text-slate-400 mb-4">{T.etudiant.cvOptional}</p>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        {CV_PACKS.map((p) => (
                          <button
                            key={p.key}
                            onClick={() => setCvPack(cvPack === p.key ? null : p.key)}
                            className={
                              "text-left rounded-xl border p-4 transition-all duration-200 hover:scale-[1.02] active:scale-95 " +
                              (cvPack === p.key ? "border-blue-600 bg-blue-50 shadow-sm" : "border-slate-200 hover:border-slate-300")
                            }
                          >
                            <p className="text-sm font-semibold text-slate-800">{T.cvPacks[p.key].label}</p>
                            <p className="text-lg font-semibold text-blue-700 my-1" style={monoFont}>{eur(pricing.cv[p.key])}</p>
                            <p className="text-xs text-slate-400 leading-snug">{T.cvPacks[p.key].desc}</p>
                          </button>
                        ))}
                      </div>
                      {cvPack && (
                        <button onClick={() => setCvPack(null)} className="text-xs text-slate-400 hover:text-slate-600 mt-3">{T.etudiant.removeService}</button>
                      )}
                    </div>
                  </Reveal>
                </div>
              )}

              {profile === "entreprise" && (
                <div>
                  <Reveal>
                    <IconHero
                      Icon={Building2}
                      eyebrow={T.entreprise.eyebrow}
                      title={T.entreprise.title}
                      subtitle={T.entreprise.subtitle}
                    />
                  </Reveal>
                  <div className="grid sm:grid-cols-2 gap-4 mb-4">
                    <Reveal>
                      <IconCard
                        Icon={Printer}
                        title={T.entreprise.card1title}
                        desc={T.entreprise.card1desc}
                        accent={1}
                        onClick={() => scrollToId("commander-tool")}
                      />
                    </Reveal>
                    <Reveal delay={100}>
                      <IconCard
                        Icon={Layers}
                        title={T.entreprise.card2title}
                        desc={T.entreprise.card2desc}
                        accent={2}
                        onClick={() => { setFinishing("spirale"); scrollToId("commander-tool"); }}
                      />
                    </Reveal>
                  </div>
                  <p className="text-xs uppercase tracking-wide text-slate-400 font-semibold mb-3">{T.entreprise.soon}</p>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {FUTURE_SERVICES.map((s, i) => (
                      <Reveal key={s.key} delay={i * 80}>
                        <SoonTile label={T.futureServices[s.key].label} sub={T.futureServices[s.key].sub} Icon={s.Icon} i={i} />
                      </Reveal>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div id="commander-tool" />

            {/* stepper */}
            <div className="flex items-center gap-6 mb-8 overflow-x-auto pb-1">
              {T.stepper.map((label, i) => (
                <div key={label} className="flex items-center gap-6">
                  <StepDot index={i} current={step} label={label} />
                  {i < 2 && <div className="w-8 h-px bg-slate-200 hidden sm:block" />}
                </div>
              ))}
            </div>

            <div key={step} className="bg-white border border-slate-200 rounded-3xl shadow-sm p-8 step-anim">
              {step === 0 && (
                <div>
                  <h2 className="text-2xl mb-1" style={displayFont}>{T.step0.title}</h2>
                  <p className="text-sm text-slate-500 mb-6">{T.step0.subtitle}</p>

                  {!file ? (
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                      onDragLeave={() => setDragOver(false)}
                      onDrop={onDrop}
                      className={
                        "border-2 border-dashed rounded-2xl py-16 flex flex-col items-center gap-3 cursor-pointer transition-all duration-300 " +
                        (dragOver ? "border-blue-500 bg-blue-50 scale-[1.01]" : "border-slate-200 bg-slate-50 hover:border-slate-300 breathing")
                      }
                    >
                      <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                        <Upload className="w-5 h-5 text-blue-600" />
                      </div>
                      <p className="font-semibold text-slate-700">{T.step0.dropHere}</p>
                      <p className="text-sm text-slate-400">{T.step0.orBrowse}</p>
                      <input ref={fileInputRef} type="file" hidden accept=".pdf,.doc,.docx,.ppt,.pptx,.jpg,.jpeg,.png"
                        onChange={(e) => handleFile(e.target.files[0])} />
                    </div>
                  ) : (
                    <div className="border border-slate-200 rounded-2xl p-6 step-anim">
                      <div className="flex items-center gap-4">
                        <div className="w-11 h-11 rounded-xl bg-slate-100 flex items-center justify-center flex-shrink-0">
                          <FileText className="w-5 h-5 text-slate-500" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-slate-800 truncate">{file.name}</p>
                          <p className="text-xs text-slate-400">{(file.size / 1024).toFixed(0)} {T.step0.kb}</p>
                        </div>
                        <button onClick={() => { setFile(null); setAutoDetected(false); }} className="text-slate-300 hover:text-slate-600 transition-colors">
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="mt-5 pt-5 border-t border-slate-100">
                        {analyzing ? (
                          <div>
                            <div className="flex items-center gap-2 text-sm text-blue-600 mb-2">
                              <Loader2 className="w-4 h-4 animate-spin" /> {T.step0.analyzing}
                            </div>
                            <div className="h-1.5 rounded-full shimmer-line" />
                          </div>
                        ) : autoDetected ? (
                          <div className="flex items-center gap-2 text-sm text-green-600 font-medium step-anim">
                            <CheckCircle2 className="w-4 h-4" /> {T.step0.pagesDetected(pages)}
                          </div>
                        ) : (
                          <div className="flex items-center gap-3 flex-wrap step-anim">
                            <span className="text-sm text-slate-500">{T.step0.numberOfPages}</span>
                            <input type="number" min="1" value={pages}
                              onChange={(e) => setPages(Math.max(1, parseInt(e.target.value) || 1))}
                              className="w-20 border border-slate-200 rounded-lg px-2 py-1 text-sm focus:outline-none focus:border-blue-500" />
                            <span className="text-xs text-slate-400">{T.step0.autoDetectUnavailable}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="flex justify-end mt-8">
                    <button
                      disabled={!file || analyzing}
                      onClick={() => setStep(1)}
                      className="bg-blue-600 disabled:bg-slate-200 disabled:text-slate-400 disabled:hover:scale-100 text-white rounded-xl px-6 py-3 text-sm font-semibold flex items-center gap-1.5 hover:bg-blue-700 hover:scale-105 active:scale-95 transition-all"
                    >
                      {T.step0.continue} <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {step === 1 && (
                <div>
                  <h2 className="text-2xl mb-6" style={displayFont}>{T.step1.title}</h2>

                  <div className="mb-6">
                    <p className="text-sm font-semibold text-slate-700 mb-2.5">{T.step1.format}</p>
                    <div className="flex gap-2">{["A5", "A4", "A3"].map((f) => <OptionPill key={f} active={format === f} onClick={() => setFormat(f)}>{f}</OptionPill>)}</div>
                  </div>
                  <div className="mb-6">
                    <p className="text-sm font-semibold text-slate-700 mb-2.5">{T.step1.color}</p>
                    <div className="flex gap-2">
                      <OptionPill active={color === "nb"} onClick={() => setColor("nb")}>{T.step1.bw}</OptionPill>
                      <OptionPill active={color === "couleur"} onClick={() => setColor("couleur")}>{T.step1.colorOpt}</OptionPill>
                    </div>
                  </div>
                  <div className="mb-6">
                    <p className="text-sm font-semibold text-slate-700 mb-2.5">{T.step1.printing}</p>
                    <div className="flex gap-2">
                      <OptionPill active={sides === "recto"} onClick={() => setSides("recto")}>{T.step1.recto}</OptionPill>
                      <OptionPill active={sides === "rectoverso"} onClick={() => setSides("rectoverso")}>{T.step1.rectoverso}</OptionPill>
                    </div>
                  </div>
                  <div className="mb-6">
                    <p className="text-sm font-semibold text-slate-700 mb-2.5">{T.step1.finishing}</p>
                    <div className="flex gap-2 flex-wrap">
                      <OptionPill active={finishing === "aucune"} onClick={() => setFinishing("aucune")}>{T.step1.none}</OptionPill>
                      <OptionPill active={finishing === "spirale"} onClick={() => setFinishing("spirale")}>{T.step1.spiral}</OptionPill>
                      <OptionPill active={finishing === "thermique"} onClick={() => setFinishing("thermique")}>{T.step1.thermal}</OptionPill>
                      <OptionPill active={finishing === "plastification"} onClick={() => setFinishing("plastification")}>{T.step1.laminate}</OptionPill>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div>
                      <p className="text-sm font-semibold text-slate-700 mb-2.5">{T.step1.pages}</p>
                      <input type="number" min="1" value={pages} onChange={(e) => setPages(Math.max(1, parseInt(e.target.value) || 1))}
                        className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500 transition-colors" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-700 mb-2.5">{T.step1.copies}</p>
                      <input type="number" min="1" value={quantity} onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                        className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500 transition-colors" />
                    </div>
                  </div>

                  {/* promo code */}
                  <div className="mb-2">
                    <p className="text-sm font-semibold text-slate-700 mb-2.5 flex items-center gap-1.5"><Tag className="w-3.5 h-3.5" /> {T.step1.promoCode}</p>
                    {promoApplied ? (
                      <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-xl px-4 py-2.5 step-anim">
                        <span className="text-sm text-green-700 font-medium flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4" /> {promoApplied.code} {T.step1.promoAppliedWord} ({promoApplied.label})</span>
                        <button onClick={() => { setPromoApplied(null); setPromoInput(""); }} className="text-green-600 hover:text-green-800"><X className="w-4 h-4" /></button>
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <input value={promoInput} onChange={(e) => setPromoInput(e.target.value)} placeholder={T.step1.promoPlaceholder}
                          className="flex-1 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500 transition-colors" />
                        <button onClick={applyPromo} className="bg-slate-900 text-white rounded-xl px-5 py-2.5 text-sm font-semibold hover:bg-slate-800 hover:scale-105 active:scale-95 transition-all">{T.step1.apply}</button>
                      </div>
                    )}
                    {promoError && <p className="text-xs text-red-600 mt-2">{promoError}</p>}
                  </div>

                  {/* live price */}
                  <div className="mt-8 bg-slate-50 rounded-2xl p-6">
                    <p className="text-xs uppercase tracking-wide text-slate-400 font-semibold mb-4">{T.step1.estimate}</p>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-slate-500">{T.step1.printingLine} {quantity}</span>
                      <span style={monoFont}>{eur(breakdown.printPrice * quantity)}</span>
                    </div>
                    {finishing !== "aucune" && (
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-slate-500">{T.step1.finishingLine} {quantity}</span>
                        <span style={monoFont}>{eur(breakdown.finishPrice * quantity)}</span>
                      </div>
                    )}
                    {cvPack && (
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-slate-500">{T.step1.cvService} ({T.cvPacks[cvPack].label})</span>
                        <span style={monoFont}>{eur(breakdown.cvPrice)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-slate-500">{T.step1.prepFee}</span>
                      <span style={monoFont}>{eur(breakdown.prepFee)}</span>
                    </div>
                    {breakdown.discount > 0 && (
                      <div className="flex justify-between text-sm mb-2 text-green-600">
                        <span>{T.step1.discount} ({promoApplied.code})</span>
                        <span style={monoFont}>-{eur(breakdown.discount)}</span>
                      </div>
                    )}
                    <div className="flex justify-between items-baseline pt-4 border-t border-slate-200">
                      <span className="font-semibold text-slate-800">{T.step1.total}</span>
                      <span className={"text-2xl font-semibold " + (bump ? "price-bump" : "")} style={monoFont}>{eur(breakdown.total)}</span>
                    </div>
                  </div>

                  <div className="flex justify-between mt-8">
                    <button onClick={() => setStep(0)} className="text-slate-500 rounded-xl px-4 py-3 text-sm font-semibold flex items-center gap-1.5 hover:text-slate-800 transition-colors">
                      <ChevronLeft className="w-4 h-4" /> {T.step1.back}
                    </button>
                    <button disabled={!canNextFromOptions} onClick={() => setStep(2)}
                      className="bg-blue-600 text-white rounded-xl px-6 py-3 text-sm font-semibold flex items-center gap-1.5 hover:bg-blue-700 hover:scale-105 active:scale-95 transition-all">
                      {T.step1.continue} <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {step === 2 && (
                <div>
                  <h2 className="text-2xl mb-6" style={displayFont}>{T.step2.title}</h2>
                  <div className="space-y-4 mb-8">
                    <div>
                      <label className="text-sm font-semibold text-slate-700 mb-2 block">{T.step2.name}</label>
                      <input value={customer.name} onChange={(e) => setCustomer({ ...customer, name: e.target.value })}
                        placeholder={T.step2.namePlaceholder} className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 transition-colors" />
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-slate-700 mb-2 block">{T.step2.email}</label>
                      <input type="email" value={customer.email} onChange={(e) => setCustomer({ ...customer, email: e.target.value })}
                        placeholder={T.step2.emailPlaceholder} className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 transition-colors" />
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-slate-700 mb-2 block">{T.step2.phone}</label>
                      <input value={customer.phone} onChange={(e) => setCustomer({ ...customer, phone: e.target.value })}
                        placeholder={T.step2.phonePlaceholder} className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 transition-colors" />
                    </div>
                  </div>

                  <div className="bg-slate-50 rounded-2xl p-6 mb-6 flex items-center justify-between">
                    <span className="font-semibold text-slate-700">{T.step2.totalToPay}</span>
                    <span className={"text-2xl font-semibold " + (bump ? "price-bump" : "")} style={monoFont}>{eur(breakdown.total)}</span>
                  </div>

                  {/* Mode de paiement */}
                  <div className="mb-6">
                    <p className="text-sm font-semibold text-slate-700 mb-2.5">{T.payment.method}</p>
                    <div className="grid sm:grid-cols-2 gap-3">
                      <button
                        onClick={() => setPaymentMethod("surplace")}
                        className={
                          "text-left rounded-xl border p-4 flex items-start gap-3 transition-all duration-200 hover:scale-[1.01] active:scale-95 " +
                          (paymentMethod === "surplace" ? "border-blue-600 bg-blue-50 shadow-sm" : "border-slate-200 hover:border-slate-300")
                        }
                      >
                        <Store className={"w-5 h-5 mt-0.5 flex-shrink-0 " + (paymentMethod === "surplace" ? "text-blue-600" : "text-slate-400")} />
                        <div>
                          <p className={"text-sm font-semibold " + (paymentMethod === "surplace" ? "text-blue-700" : "text-slate-800")}>{T.payment.payInStore}</p>
                          <p className="text-xs text-slate-400 leading-snug mt-0.5">{T.payment.payInStoreDesc}</p>
                        </div>
                      </button>
                      <button
                        onClick={() => setPaymentMethod("enligne")}
                        className={
                          "text-left rounded-xl border p-4 flex items-start gap-3 transition-all duration-200 hover:scale-[1.01] active:scale-95 " +
                          (paymentMethod === "enligne" ? "border-blue-600 bg-blue-50 shadow-sm" : "border-slate-200 hover:border-slate-300")
                        }
                      >
                        <CreditCard className={"w-5 h-5 mt-0.5 flex-shrink-0 " + (paymentMethod === "enligne" ? "text-blue-600" : "text-slate-400")} />
                        <div>
                          <p className={"text-sm font-semibold " + (paymentMethod === "enligne" ? "text-blue-700" : "text-slate-800")}>{T.payment.payOnline}</p>
                          <p className="text-xs text-slate-400 leading-snug mt-0.5">{T.payment.payOnlineDesc}</p>
                        </div>
                      </button>
                    </div>

                    {paymentMethod === "enligne" && (
                      <div className="mt-4 border border-slate-200 rounded-2xl p-5 step-anim">
                        <div className="flex items-center gap-2 mb-4 text-xs text-orange-600 bg-orange-50 border border-orange-200 rounded-lg px-3 py-2">
                          <ShieldCheck className="w-3.5 h-3.5 flex-shrink-0" /> {T.payment.demoNotice}
                        </div>
                        <div className="mb-3">
                          <label className="text-xs font-semibold text-slate-600 mb-1.5 block">{T.payment.cardNumber}</label>
                          <div className="relative">
                            <CreditCard className="w-4 h-4 text-slate-300 absolute left-3 top-1/2 -translate-y-1/2" />
                            <input
                              value={card.number}
                              onChange={(e) => {
                                const digits = e.target.value.replace(/\D/g, "").slice(0, 16);
                                setCard({ ...card, number: digits.replace(/(.{4})/g, "$1 ").trim() });
                              }}
                              placeholder={T.payment.cardNumberPlaceholder}
                              className="w-full border border-slate-200 rounded-xl pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:border-blue-500 transition-colors"
                              style={monoFont}
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3 mb-3">
                          <div>
                            <label className="text-xs font-semibold text-slate-600 mb-1.5 block">{T.payment.expiry}</label>
                            <input
                              value={card.expiry}
                              onChange={(e) => {
                                const digits = e.target.value.replace(/\D/g, "").slice(0, 4);
                                const formatted = digits.length > 2 ? `${digits.slice(0, 2)}/${digits.slice(2)}` : digits;
                                setCard({ ...card, expiry: formatted });
                              }}
                              placeholder={T.payment.expiryPlaceholder}
                              className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500 transition-colors"
                              style={monoFont}
                            />
                          </div>
                          <div>
                            <label className="text-xs font-semibold text-slate-600 mb-1.5 block">{T.payment.cvc}</label>
                            <div className="relative">
                              <Lock className="w-3.5 h-3.5 text-slate-300 absolute left-3 top-1/2 -translate-y-1/2" />
                              <input
                                value={card.cvc}
                                onChange={(e) => setCard({ ...card, cvc: e.target.value.replace(/\D/g, "").slice(0, 4) })}
                                placeholder={T.payment.cvcPlaceholder}
                                className="w-full border border-slate-200 rounded-xl pl-8 pr-3 py-2.5 text-sm focus:outline-none focus:border-blue-500 transition-colors"
                                style={monoFont}
                              />
                            </div>
                          </div>
                        </div>
                        <div>
                          <label className="text-xs font-semibold text-slate-600 mb-1.5 block">{T.payment.nameOnCard}</label>
                          <input
                            value={card.name}
                            onChange={(e) => setCard({ ...card, name: e.target.value })}
                            placeholder={T.payment.nameOnCardPlaceholder}
                            className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500 transition-colors"
                          />
                        </div>
                        {cardError && <p className="text-xs text-red-600 mt-3">{cardError}</p>}
                      </div>
                    )}
                  </div>

                  <div className="flex justify-between">
                    <button onClick={() => setStep(1)} className="text-slate-500 rounded-xl px-4 py-3 text-sm font-semibold flex items-center gap-1.5 hover:text-slate-800 transition-colors">
                      <ChevronLeft className="w-4 h-4" /> {T.step2.back}
                    </button>
                    <button disabled={!canSubmit || submitting || paying} onClick={submitOrder}
                      className="bg-orange-600 disabled:bg-slate-200 disabled:text-slate-400 disabled:hover:scale-100 text-white rounded-xl px-6 py-3 text-sm font-semibold flex items-center gap-1.5 hover:bg-orange-700 hover:scale-105 active:scale-95 transition-all">
                      {paying ? <Loader2 className="w-4 h-4 animate-spin" /> : submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : paymentMethod === "enligne" ? <Lock className="w-4 h-4" /> : <PackageCheck className="w-4 h-4" />}
                      {paying ? T.payment.processing : paymentMethod === "enligne" ? T.payment.payNow : T.step2.confirm}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
        </section>

        {/* ============ TARIFS : table + simulateur unifié ============ */}
        <section id="tarifs" className="max-w-3xl mx-auto px-6 py-16 border-t border-slate-100">
          <h2 className="text-2xl mb-1" style={displayFont}>{T.pricing.title}</h2>
          <p className="text-sm text-slate-500 mb-8">{T.pricing.subtitle}</p>

          <div className="flex gap-2 mb-4 flex-wrap">
            {["A5", "A4", "A3"].map((f) => <OptionPill key={f} active={format === f} onClick={() => setFormat(f)}>{f}</OptionPill>)}
          </div>
          <div className="flex gap-2 mb-8 flex-wrap">
            <OptionPill active={color === "nb"} onClick={() => setColor("nb")}>{T.step1.bw}</OptionPill>
            <OptionPill active={color === "couleur"} onClick={() => setColor("couleur")}>{T.step1.colorOpt}</OptionPill>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden mb-4">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 text-slate-500 text-left">
                  <th className="px-5 py-3 font-semibold">{T.pricing.pageQty}</th>
                  <th className="px-5 py-3 font-semibold text-right">{T.pricing.price}</th>
                </tr>
              </thead>
              <tbody>
                {pricing.printing[format][color].fixed.map((price, i) => {
                  const active = pages === i + 1;
                  return (
                    <tr key={i} className={"border-t border-slate-100 transition-colors " + (active ? "bg-blue-50" : "")}>
                      <td className={"px-5 py-3 " + (active ? "text-blue-700 font-semibold" : "text-slate-600")}>{i + 1} {i > 0 ? T.pricing.pagesWord : T.pricing.page}</td>
                      <td className={"px-5 py-3 text-right " + (active ? "text-blue-700 font-semibold" : "text-slate-600")} style={monoFont}>{eur(price)}</td>
                    </tr>
                  );
                })}
                {pricing.printing[format][color].tiers.map((t, i) => {
                  const active = pages >= t.min && pages <= t.max;
                  const label = t.max === Infinity ? `${t.min}+ ${T.pricing.pagesWord}` : `${t.min}–${t.max} ${T.pricing.pagesWord}`;
                  return (
                    <tr key={i} className={"border-t border-slate-100 transition-colors " + (active ? "bg-blue-50" : "")}>
                      <td className={"px-5 py-3 " + (active ? "text-blue-700 font-semibold" : "text-slate-600")}>{label}</td>
                      <td className={"px-5 py-3 text-right " + (active ? "text-blue-700 font-semibold" : "text-slate-600")} style={monoFont}>{eur(t.rate)} {T.pricing.perPage}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="flex items-center gap-4 mb-8 flex-wrap">
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-500">{T.pricing.pages}</span>
              <input type="number" min="1" value={pages} onChange={(e) => setPages(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-20 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500" />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-500">{T.pricing.copies}</span>
              <input type="number" min="1" value={quantity} onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-20 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500" />
            </div>
            <div className="ml-auto text-right">
              <p className="text-xs text-slate-400">{T.pricing.totalEstimate}</p>
              <p className={"text-2xl font-semibold text-blue-700 " + (bump ? "price-bump" : "")} style={monoFont}>{eur(breakdown.total)}</p>
            </div>
          </div>

          <div className="grid sm:grid-cols-3 gap-4 mb-8">
            <div className="bg-white border border-slate-200 rounded-xl p-4">
              <p className="text-xs font-semibold text-slate-700 mb-2">{T.pricing.spiral}</p>
              {pricing.finishing.spirale.map((t, i) => (
                <p key={i} className="text-xs text-slate-500 flex justify-between"><span>{t.max === Infinity ? `300+ ${T.pricing.pagesWord}` : `≤ ${t.max} ${T.pricing.pagesWord}`}</span><span style={monoFont}>{eur(t.price)}</span></p>
              ))}
            </div>
            <div className="bg-white border border-slate-200 rounded-xl p-4">
              <p className="text-xs font-semibold text-slate-700 mb-2">{T.pricing.thermal}</p>
              {pricing.finishing.thermique.map((t, i) => (
                <p key={i} className="text-xs text-slate-500 flex justify-between"><span>{t.max === Infinity ? `200+ ${T.pricing.pagesWord}` : `≤ ${t.max} ${T.pricing.pagesWord}`}</span><span style={monoFont}>{eur(t.price)}</span></p>
              ))}
            </div>
            <div className="bg-white border border-slate-200 rounded-xl p-4">
              <p className="text-xs font-semibold text-slate-700 mb-2">{T.pricing.laminate}</p>
              {Object.entries(pricing.finishing.plastification).map(([f, p]) => (
                <p key={f} className="text-xs text-slate-500 flex justify-between"><span>{f}</span><span style={monoFont}>{eur(p)}</span></p>
              ))}
            </div>
          </div>

          <button onClick={() => { setMode("order"); setStep(0); scrollToId("commander"); }}
            className="text-sm font-semibold text-blue-600 flex items-center gap-1.5 hover:gap-2.5 transition-all">
            {T.pricing.useForOrder} <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </section>

        {/* ============ CONTACT ============ */}
        <section id="contact" className="max-w-3xl mx-auto px-6 py-16 border-t border-slate-100">
          <h2 className="text-2xl mb-1" style={displayFont}>{T.contact.title}</h2>
          <p className="text-sm text-slate-500 mb-6">{T.contact.subtitle}</p>

          {/* Badge ouvert / fermé, calculé en direct */}
          <div className={"flex items-center gap-3 rounded-2xl border px-5 py-4 mb-6 transition-colors duration-500 " + (shopStatus.open ? "bg-green-50 border-green-200" : "bg-slate-50 border-slate-200")}>
            <span className="relative flex h-3 w-3 flex-shrink-0">
              {shopStatus.open && <span className="absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75 animate-ping" />}
              <span className={"relative inline-flex rounded-full h-3 w-3 " + (shopStatus.open ? "bg-green-500" : "bg-slate-400")} />
            </span>
            <div>
              <p className={"text-sm font-semibold " + (shopStatus.open ? "text-green-700" : "text-slate-600")}>
                {shopStatus.open ? T.contact.openNow : T.contact.closedNow}
              </p>
              <p className="text-xs text-slate-500">{shopStatusLabel(shopStatus, T)}</p>
            </div>
          </div>

          <div className="grid lg:grid-cols-5 gap-6 mb-6">
            {/* Carte */}
            <div className="lg:col-span-3 rounded-2xl overflow-hidden border border-slate-200 relative" style={{ height: 320 }}>
              {!mapFailed ? (
                <img
                  src="https://staticmap.openstreetmap.de/staticmap.php?center=50.8697,4.4718&zoom=16&size=640x480&maptype=mapnik&markers=50.8697,4.4718,red-pushpin"
                  alt="Copy Center Zaventem — Stationsstraat 46A, 1930 Zaventem"
                  onError={() => setMapFailed(true)}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center gap-3 text-center px-6 bg-gradient-to-br from-blue-50 via-white to-slate-50">
                  <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center shadow-sm">
                    <MapPin className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-800">Stationsstraat 46A</p>
                    <p className="text-xs text-slate-500">1930 Zaventem, Belgique</p>
                  </div>
                  <a
                    href="https://www.google.com/maps/dir/?api=1&destination=Stationsstraat+46A%2C+1930+Zaventem"
                    target="_blank" rel="noreferrer"
                    className="text-xs font-semibold text-blue-600 hover:text-blue-700 underline underline-offset-2"
                  >
                    {T.contact.openMapNewTab}
                  </a>
                </div>
              )}
            </div>

            {/* Horaires détaillés */}
            <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-5">
              <p className="text-sm font-semibold text-slate-800 mb-3 flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-600" /> {T.contact.hours}
              </p>
              <div className="space-y-1">
                {OPENING_HOURS.map((d) => {
                  const isToday = d.day === shopStatus.day;
                  return (
                    <div key={d.day} className={"flex items-center justify-between text-xs px-2.5 py-1.5 rounded-lg transition-colors " + (isToday ? "bg-blue-50" : "")}>
                      <span className={isToday ? "font-semibold text-blue-700" : "text-slate-600"}>
                        {T.days[d.day]}
                        {isToday && <span className="ml-1.5 text-[9px] font-semibold uppercase tracking-wide text-blue-500">{T.contact.today}</span>}
                      </span>
                      <span className={isToday ? "font-semibold text-blue-700" : "text-slate-500"} style={monoFont}>
                        {d.open == null ? T.contact.closed : `${fmtHM(d.open)} – ${fmtHM(d.close)}`}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="flex justify-end mb-8">
            <a
              href="https://www.google.com/maps/dir/?api=1&destination=Stationsstraat+46A%2C+1930+Zaventem"
              target="_blank" rel="noreferrer"
              className="text-sm font-semibold text-blue-600 flex items-center gap-1.5 hover:gap-2.5 transition-all"
            >
              {T.contact.directions} <ArrowRight className="w-3.5 h-3.5" />
            </a>
          </div>

          <div className="grid sm:grid-cols-3 gap-4">
            <div className="bg-white border border-slate-200 rounded-xl p-5 flex gap-3 items-start">
              <MapPin className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
              <div><p className="text-sm font-semibold text-slate-800 mb-0.5">{T.contact.address}</p><p className="text-xs text-slate-500">Stationsstraat 46A<br />1930 Zaventem</p></div>
            </div>
            <div className="bg-white border border-slate-200 rounded-xl p-5 flex gap-3 items-start">
              <Phone className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
              <div><p className="text-sm font-semibold text-slate-800 mb-0.5">{T.contact.phoneLabel}</p><a href="tel:+32465959260" className="text-xs text-slate-500 hover:text-blue-600 transition-colors">+32 465 95 92 60</a></div>
            </div>
            <div className="bg-white border border-slate-200 rounded-xl p-5 flex gap-3 items-start">
              <Mail className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
              <div><p className="text-sm font-semibold text-slate-800 mb-0.5">{T.contact.email}</p><p className="text-xs text-slate-500 break-all">copycenter.a46@gmail.com</p></div>
            </div>
          </div>
        </section>

        <footer className="border-t border-slate-100 py-8">
          <div className="max-w-5xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-400">
            <span>© {new Date().getFullYear()} Copy Center Zaventem</span>
            <span>Stationsstraat 46A, 1930 Zaventem · copycenter.a46@gmail.com</span>
            <button onClick={() => { setMode("admin"); window.scrollTo(0, 0); }} className="text-slate-300 hover:text-slate-500 transition-colors">Admin</button>
          </div>
        </footer>
      </div>
    </div>
  );
}

/* ============================================================
   Filet de sécurité : si un bug fait planter un rendu quelque
   part dans l'app, on affiche un écran d'erreur lisible avec un
   bouton pour réessayer, plutôt qu'une page blanche silencieuse.
============================================================ */
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }
  static getDerivedStateFromError(error) {
    return { error };
  }
  componentDidCatch(error, info) {
    console.error("Copy Center app crashed:", error, info?.componentStack);
  }
  render() {
    if (this.state.error) {
      return (
        <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 24, fontFamily: "ui-sans-serif, sans-serif", background: "#f8fafc" }}>
          <div style={{ maxWidth: 480, background: "white", border: "1px solid #e2e8f0", borderRadius: 16, padding: 32 }}>
            <p style={{ fontWeight: 600, fontSize: 18, marginBottom: 8, color: "#0f172a" }}>Une erreur est survenue</p>
            <p style={{ fontSize: 14, color: "#64748b", marginBottom: 16 }}>
              L'application a rencontré un problème inattendu au lieu de s'afficher. Détail technique (utile pour le corriger) :
            </p>
            <pre style={{ fontSize: 12, color: "#dc2626", background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 8, padding: 12, overflowX: "auto", marginBottom: 16 }}>
              {String(this.state.error?.message || this.state.error)}
            </pre>
            <button
              onClick={() => { this.setState({ error: null }); window.location.reload?.(); }}
              style={{ background: "#0f172a", color: "white", border: "none", borderRadius: 10, padding: "10px 20px", fontSize: 14, fontWeight: 600, cursor: "pointer" }}
            >
              Recharger
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function CopyCenterOrderApp() {
  return (
    <ErrorBoundary>
      <CopyCenterOrderAppInner />
    </ErrorBoundary>
  );
}
