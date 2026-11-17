import { ArrowRight, ChevronRight, Home } from "lucide-react";

/* ============================================================
   CATALOGUE — grandes tuiles avec image, inspirées de Print Press.
   Pour mettre une vraie photo : place le fichier dans /public/services/
   (ex. public/services/bw.jpg) et indique "photo: '/services/bw.jpg'" ci-dessous.
============================================================ */
export const SERVICES = [
  { key: "bw",     group: "print",  photo: null, preset: { color: "nb", format: "A4", finishing: "aucune" } },
  { key: "color",  group: "print",  photo: null, preset: { color: "couleur", format: "A4", finishing: "aucune" } },
  { key: "poster", group: "print",  photo: null, preset: { color: "couleur", format: "A3", finishing: "aucune" } },
  { key: "bind",   group: "finish", photo: null, preset: { finishing: "spirale" } },
  { key: "lam",    group: "finish", photo: null, preset: { finishing: "plastification" } },
  { key: "cv",     group: "finish", photo: null },
  { key: "photo",  group: "photo",  photo: null, special: true },
  { key: "cards",  group: "photo",  photo: null, special: true },
  { key: "flyers", group: "photo",  photo: null, soon: true },
];

export const CAT_T = {
  nl: {
    heroTitle: "Online printen, afhalen in Zaventem",
    heroSub: "Kies een dienst, stuur je bestand en betaal pas als je het komt ophalen.",
    groups: { print: "Printen & kopiëren", photo: "Foto's, visitekaartjes & flyers", finish: "Afwerking & extra's" },
    tag: { print: "Online bestellen", photo: "Online bestellen", finish: "Online bestellen", soon: "Binnenkort beschikbaar" },
    home: "Home", shop: "Online bestellen", back: "Alle diensten", order: "Bestellen",
    clientType: "Kies je klanttype",
    s: {
      bw:     { name: "Printen in zwart-wit", t1: "Zwart-wit", t2: "printen", sub: "Scherpe, duidelijke documenten.", desc: "Cursussen, verslagen, formulieren of contracten: we printen je documenten scherp in zwart-wit, in A5, A4 of A3. Enkelzijdig of recto-verso, met inbinden of plastificeren als je wil.", pts: ["Vanaf € 0,05 per pagina bij grote aantallen", "PDF, Word, PowerPoint, JPG of PNG", "Klaar om af te halen in de winkel"] },
      color:  { name: "Printen in kleur", t1: "Kleur", t2: "printen", sub: "Levendige prints in A4 & A3.", desc: "Presentaties, foto's op papier, flyers of schoolwerk: heldere kleuren op A5, A4 of A3.", pts: ["Echte kleuren, ook voor foto's en grafieken", "Enkelzijdig of recto-verso", "Afwerking met spiraal, thermisch of plastificeren"] },
      poster: { name: "Printen op A3", t1: "Printen", t2: "op A3", sub: "Dubbel zo groot als A4.", desc: "We printen je document op gewoon A3-papier (29,7 × 42 cm), in zwart-wit of in kleur. Handig voor plannen, schema's, tekeningen of een grote affiche.", pts: ["Formaat A3: 29,7 × 42 cm", "Zwart-wit of kleur", "Enkelzijdig of recto-verso"] },
      bind:   { name: "Inbinden", t1: "Inbinden", t2: "spiraal & thermisch", sub: "Een net boekje van je document.", desc: "We printen je document en binden het in met een spiraal of een thermische rug. Perfect voor cursussen, thesissen en dossiers.", pts: ["Spiraal of thermische rug", "Doorzichtige voorkant en kartonnen achterkant", "Ook voor eindwerken en thesissen"] },
      lam:    { name: "Plastificeren", t1: "Plastificeren", t2: "A5 · A4 · A3", sub: "Beschermd tegen water en vlekken.", desc: "Menukaarten, uurroosters, bordjes of documenten die lang mee moeten: we printen en plastificeren ze.", pts: ["A5, A4 of A3", "Stevig en waterbestendig", "Ideaal voor horeca en winkels"] },
      cv:     { name: "CV-service", t1: "Jouw cv,", t2: "professioneel", sub: "Opgemaakt en geprint.", desc: "Je hoeft niets zelf te maken: vul gewoon de vragen in, en wij maken je cv op. De vragen zijn aangepast aan je situatie, student of werkzoekende.", pts: ["Vanaf € 5", "Foto op je cv als je wil", "Op papier en als PDF"] },
      photo:  { name: "Foto's afdrukken", t1: "Foto's", t2: "afdrukken", sub: "Vanuit je gsm, klaar in de winkel.", desc: "Kies je foto's uit je galerij, kies per foto het formaat en het aantal, en haal je afdrukken af in de winkel.", pts: ["9x13 en 10x15: € 0,60 per foto", "15x15: € 1,25 · 15x20: € 1,50", "Rechtstreeks vanuit je gsm"] },
      flyers: { name: "Flyers", t1: "Flyers", t2: "& folders", sub: "Binnenkort beschikbaar.", desc: "", pts: [] },
      cards:  { name: "Visitekaartjes", t1: "Visite-", t2: "kaartjes", sub: "Jouw ontwerp of door ons gemaakt.", desc: "Stuur je eigen ontwerp, of vul je gegevens in en wij maken je visitekaartje op.", pts: ["50 tot 1000 stuks, vanaf € 15", "Enkel voorkant of voor- en achterkant", "Opmaak door ons mogelijk"] },
    },
  },
  fr: {
    heroTitle: "Imprimez en ligne, retirez à Zaventem",
    heroSub: "Choisissez un service, envoyez votre fichier et payez seulement au retrait.",
    groups: { print: "Impression & copies", photo: "Photos, cartes de visite & flyers", finish: "Finitions & extras" },
    tag: { print: "Commande en ligne", photo: "Commande en ligne", finish: "Commande en ligne", soon: "Bientôt disponible" },
    home: "Accueil", shop: "Commande en ligne", back: "Tous les services", order: "Commander",
    clientType: "Choisissez votre type de client",
    s: {
      bw:     { name: "Impression noir et blanc", t1: "Noir et blanc", t2: "impression", sub: "Des documents nets et clairs.", desc: "Cours, rapports, formulaires ou contrats : nous imprimons vos documents en noir et blanc, en A5, A4 ou A3. Recto ou recto-verso, avec reliure ou plastification si vous le souhaitez.", pts: ["À partir de 0,05 € la page pour les grandes quantités", "PDF, Word, PowerPoint, JPG ou PNG", "Prêt à retirer au magasin"] },
      color:  { name: "Impression couleur", t1: "Couleur", t2: "impression", sub: "Des couleurs vives en A4 & A3.", desc: "Présentations, photos sur papier, flyers ou travaux scolaires : des couleurs éclatantes en A5, A4 ou A3.", pts: ["De vraies couleurs, aussi pour les photos et graphiques", "Recto ou recto-verso", "Finition spirale, thermique ou plastification"] },
      poster: { name: "Impression A3", t1: "Impression", t2: "en A3", sub: "Deux fois plus grand que l'A4.", desc: "Nous imprimons votre document sur du papier A3 normal (29,7 × 42 cm), en noir et blanc ou en couleur. Pratique pour les plans, schémas, dessins ou une grande affiche.", pts: ["Format A3 : 29,7 × 42 cm", "Noir et blanc ou couleur", "Recto ou recto-verso"] },
      bind:   { name: "Reliure", t1: "Reliure", t2: "spirale & thermique", sub: "Un livret propre de votre document.", desc: "Nous imprimons votre document et le relions avec une spirale ou un dos thermique. Parfait pour les cours, mémoires et dossiers.", pts: ["Spirale ou dos thermique", "Couverture transparente et dos en carton", "Aussi pour les TFE et mémoires"] },
      lam:    { name: "Plastification", t1: "Plastification", t2: "A5 · A4 · A3", sub: "Protégé de l'eau et des taches.", desc: "Menus, horaires, panneaux ou documents qui doivent durer : nous les imprimons et les plastifions.", pts: ["A5, A4 ou A3", "Solide et résistant à l'eau", "Idéal pour l'horeca et les commerces"] },
      cv:     { name: "Service CV", t1: "Votre CV,", t2: "professionnel", sub: "Mis en page et imprimé.", desc: "Vous n'avez rien à préparer : répondez simplement aux questions, et nous créons votre CV. Les questions sont adaptées à votre situation, étudiant ou chercheur d'emploi.", pts: ["À partir de 5 €", "Avec votre photo si vous le souhaitez", "Sur papier et en PDF"] },
      photo:  { name: "Tirage de photos", t1: "Tirage", t2: "de photos", sub: "Depuis votre gsm, prêt en magasin.", desc: "Choisissez vos photos dans votre galerie, le format et le nombre pour chaque photo, et venez chercher vos tirages au magasin.", pts: ["9x13 et 10x15 : 0,60 € la photo", "15x15 : 1,25 € · 15x20 : 1,50 €", "Directement depuis votre gsm"] },
      flyers: { name: "Flyers", t1: "Flyers", t2: "& dépliants", sub: "Bientôt disponible.", desc: "", pts: [] },
      cards:  { name: "Cartes de visite", t1: "Cartes", t2: "de visite", sub: "Votre design ou créé par nous.", desc: "Envoyez votre propre design, ou remplissez vos informations et nous créons votre carte de visite.", pts: ["De 50 à 1000 pièces, dès 15 €", "Recto seulement ou recto-verso", "Mise en page par nous possible"] },
    },
  },
  en: {
    heroTitle: "Print online, pick up in Zaventem",
    heroSub: "Choose a service, send your file and only pay when you pick it up.",
    groups: { print: "Printing & copies", photo: "Photos, business cards & flyers", finish: "Finishing & extras" },
    tag: { print: "Order online", photo: "Order online", finish: "Order online", soon: "Coming soon" },
    home: "Home", shop: "Order online", back: "All services", order: "Order",
    clientType: "Choose your customer type",
    s: {
      bw:     { name: "Black & white printing", t1: "Black & white", t2: "print", sub: "Sharp, clear documents.", desc: "Course notes, reports, forms or contracts: we print your documents in sharp black and white, in A5, A4 or A3. Single or double-sided, with binding or laminating if you like.", pts: ["From € 0.05 per page for large quantities", "PDF, Word, PowerPoint, JPG or PNG", "Ready for pick-up in the shop"] },
      color:  { name: "Colour printing", t1: "Colour", t2: "print", sub: "Vibrant prints in A4 & A3.", desc: "Presentations, photos on paper, flyers or school work: bright colours in A5, A4 or A3.", pts: ["True colours, also for photos and charts", "Single or double-sided", "Spiral, thermal binding or laminating"] },
      poster: { name: "A3 printing", t1: "A3", t2: "printing", sub: "Twice the size of A4.", desc: "We print your document on regular A3 paper (29.7 × 42 cm), in black and white or colour. Handy for plans, diagrams, drawings or a large poster.", pts: ["A3 format: 29.7 × 42 cm", "Black & white or colour", "Single or double-sided"] },
      bind:   { name: "Binding", t1: "Binding", t2: "spiral & thermal", sub: "A neat booklet of your document.", desc: "We print your document and bind it with a spiral or a thermal spine. Perfect for course notes, theses and reports.", pts: ["Spiral or thermal spine", "Clear front cover and card back", "Also for theses and final projects"] },
      lam:    { name: "Laminating", t1: "Laminating", t2: "A5 · A4 · A3", sub: "Protected from water and stains.", desc: "Menus, timetables, signs or documents that need to last: we print and laminate them.", pts: ["A5, A4 or A3", "Sturdy and water-resistant", "Great for restaurants and shops"] },
      cv:     { name: "CV service", t1: "Your CV,", t2: "professional", sub: "Designed and printed.", desc: "Nothing to prepare: just answer the questions and we'll create your CV. The questions are adapted to your situation, student or job seeker.", pts: ["From € 5", "With your photo if you like", "On paper and as a PDF"] },
      photo:  { name: "Photo prints", t1: "Photo", t2: "prints", sub: "From your phone, ready in the shop.", desc: "Pick your photos from your gallery, choose the size and number for each one, and collect your prints in the shop.", pts: ["9x13 and 10x15: € 0.60 per photo", "15x15: € 1.25 · 15x20: € 1.50", "Straight from your phone"] },
      flyers: { name: "Flyers", t1: "Flyers", t2: "& leaflets", sub: "Coming soon.", desc: "", pts: [] },
      cards:  { name: "Business cards", t1: "Business", t2: "cards", sub: "Your design or made by us.", desc: "Send your own design, or fill in your details and we'll design your business card.", pts: ["50 to 1000 cards, from €15", "Front only or front and back", "Design by us available"] },
    },
  },
};

/* ---------- Illustrations (remplacées par une vraie photo si "photo" est rempli) ---------- */
const INK = "#0F172A", ACC = "#E11D48", MUTE = "#475569";
function Sheet({ x, y, w, h, r = 0, fill = "#fff", children, shadow = true }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${r})`}>
      {shadow && <rect x="6" y="10" width={w} height={h} rx="4" fill="#0F172A" opacity=".10" />}
      <rect width={w} height={h} rx="4" fill={fill} stroke="#E2E8F0" />
      {children}
    </g>
  );
}
const lines = (n, x, y, w, gap = 14, c = "#CBD5E1") =>
  Array.from({ length: n }, (_, i) => <rect key={i} x={x} y={y + i * gap} width={i % 4 === 3 ? w * 0.6 : w} height="6" rx="3" fill={c} />);

function Object_({ k }) {
  switch (k) {
    case "bw":
      return (<g>
        <Sheet x={250} y={300} w={200} h={260} r={-8}>{lines(9, 22, 30, 150)}</Sheet>
        <Sheet x={330} y={270} w={200} h={260} r={6}>
          <rect x="20" y="24" width="160" height="96" rx="3" fill="#334155" />
          <path d="M20 120 L70 70 L110 105 L140 80 L180 118 L180 120 Z" fill="#94A3B8" />
          <circle cx="150" cy="50" r="12" fill="#E2E8F0" />
          {lines(6, 20, 140, 160)}
        </Sheet>
      </g>);
    case "color":
      return (<g>
        <Sheet x={240} y={310} w={200} h={260} r={-10}>{lines(10, 22, 30, 150)}</Sheet>
        <Sheet x={330} y={262} w={210} h={270} r={7}>
          <defs><linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#38BDF8" /><stop offset="1" stopColor="#FDE68A" /></linearGradient></defs>
          <rect x="18" y="20" width="174" height="150" rx="3" fill="url(#sky)" />
          <circle cx="150" cy="60" r="20" fill="#F59E0B" />
          <path d="M18 170 L80 95 L120 140 L150 112 L192 170 Z" fill="#059669" />
          <rect x="18" y="186" width="40" height="40" rx="3" fill="#06B6D4" /><rect x="64" y="186" width="40" height="40" rx="3" fill="#DB2777" />
          <rect x="110" y="186" width="40" height="40" rx="3" fill="#FACC15" /><rect x="156" y="186" width="36" height="40" rx="3" fill={INK} />
        </Sheet>
      </g>);
    case "poster":
      return (<g>
        <Sheet x={230} y={330} w={150} h={210} r={-6}>{lines(8, 16, 24, 110, 13)}</Sheet>
        <Sheet x={320} y={232} w={250} h={345} r={4}>
          <rect x="20" y="22" width="130" height="14" rx="4" fill={INK} />
          {lines(3, 20, 50, 210)}
          <rect x="20" y="100" width="210" height="130" rx="3" fill="#F1F5F9" stroke="#CBD5E1" />
          <path d="M40 210 L40 150 L90 150 L90 120 L150 120 L150 180 L210 180 L210 210 Z" fill="none" stroke="#2563EB" strokeWidth="4" strokeLinejoin="round" />
          <circle cx="120" cy="165" r="10" fill="#E11D48" />
          {lines(5, 20, 248, 210)}
          <g transform="translate(178 18)"><rect width="56" height="30" rx="8" fill={ACC} /><text x="28" y="21" textAnchor="middle" fontFamily="Sora, sans-serif" fontWeight="800" fontSize="17" fill="#fff">A3</text></g>
        </Sheet>
      </g>);
    case "bind":
      return (<g>
        <Sheet x={270} y={270} w={240} h={300} r={-4} fill="#F8FAFC">
          <rect x="34" y="24" width="190" height="60" rx="4" fill="#1D4ED8" />
          <rect x="50" y="40" width="120" height="10" rx="4" fill="#fff" /><rect x="50" y="58" width="80" height="8" rx="4" fill="#BFDBFE" />
          {lines(10, 44, 110, 170)}
          {Array.from({ length: 13 }, (_, i) => <g key={i}><ellipse cx="14" cy={22 + i * 21} rx="12" ry="6" fill="none" stroke="#334155" strokeWidth="4" /></g>)}
        </Sheet>
      </g>);
    case "lam":
      return (<g>
        <g transform="translate(275 270) rotate(-5)">
          <rect x="6" y="10" width="250" height="310" rx="18" fill="#0F172A" opacity=".10" />
          <rect width="250" height="310" rx="18" fill="#E0F2FE" opacity=".9" stroke="#7DD3FC" strokeWidth="2" />
          <rect x="18" y="18" width="214" height="274" rx="4" fill="#fff" />
          <rect x="38" y="40" width="130" height="16" rx="4" fill={INK} />
          {lines(3, 38, 76, 170)}
          <rect x="38" y="128" width="174" height="1.5" fill="#CBD5E1" />
          {lines(5, 38, 146, 120)}
          {[146, 160, 174, 188, 202].map((y) => <rect key={y} x="178" y={y} width="34" height="6" rx="3" fill="#F59E0B" />)}
          <path d="M18 18 L120 18 L18 150 Z" fill="#fff" opacity=".55" />
        </g>
      </g>);
    case "cv":
      return (<g>
        <Sheet x={280} y={260} w={230} h={300} r={4}>
          <rect width="70" height="300" fill="#0F766E" />
          <circle cx="35" cy="50" r="22" fill="#CCFBF1" />
          {lines(6, 14, 96, 42, 14, "#5EEAD4")}
          <rect x="88" y="26" width="120" height="14" rx="4" fill={INK} />
          <rect x="88" y="48" width="80" height="8" rx="4" fill="#0F766E" />
          {lines(4, 88, 80, 120)}{lines(4, 88, 150, 120)}{lines(4, 88, 220, 120)}
        </Sheet>
        <g transform="translate(470 470)"><circle r="34" fill="#16A34A" /><path d="M-15 0 L-4 11 L16 -11" stroke="#fff" strokeWidth="7" fill="none" strokeLinecap="round" strokeLinejoin="round" /></g>
      </g>);
    case "photo":
      return (<g>
        {[[250, 330, -12, "#0EA5E9"], [320, 300, 4, "#F97316"], [380, 340, 14, "#22C55E"]].map(([x, y, r, c], i) => (
          <Sheet key={i} x={x} y={y} w={160} h={190} r={r}>
            <rect x="12" y="12" width="136" height="136" rx="2" fill={c} />
            <circle cx="105" cy="50" r="14" fill="#FEF3C7" />
            <path d="M12 148 L60 92 L95 125 L120 100 L148 148 Z" fill="#0F172A" opacity=".55" />
          </Sheet>
        ))}
      </g>);
    case "flyers":
      return (<g>
        {[[245, 330, -14, "#F59E0B"], [300, 300, -4, "#06B6D4"], [360, 270, 8, "#E11D48"]].map(([x, y, r, col], i) => (
          <Sheet key={i} x={x} y={y} w={170} h={240} r={r}>
            <rect x="0" y="0" width="170" height="110" rx="4" fill={col} />
            <circle cx="130" cy="38" r="18" fill="#fff" opacity=".85" />
            <rect x="16" y="26" width="80" height="14" rx="4" fill="#fff" />
            <rect x="16" y="48" width="56" height="9" rx="4" fill="#fff" opacity=".8" />
            {lines(4, 16, 128, 138)}
            <rect x="16" y="196" width="70" height="24" rx="6" fill={col} />
          </Sheet>
        ))}
      </g>);
    case "cards":
      return (<g>
        {[[260, 360, -10], [300, 330, -3], [340, 300, 5]].map(([x, y, r], i) => (
          <Sheet key={i} x={x} y={y} w={230} h={135} r={r} fill={i === 2 ? "#0F172A" : "#fff"}>
            {i === 2 ? (<g><rect x="22" y="30" width="110" height="14" rx="4" fill="#fff" /><rect x="22" y="52" width="70" height="8" rx="4" fill="#F59E0B" />{lines(3, 22, 84, 120, 12, "#475569")}<circle cx="190" cy="44" r="18" fill="#F59E0B" /></g>) : lines(4, 22, 30, 140)}
          </Sheet>
        ))}
      </g>);
    default: return null;
  }
}

export function ServiceArt({ k, t, className = "" }) {
  return (
    <svg viewBox="0 0 600 600" className={className} role="img" aria-label={t.name} preserveAspectRatio="xMidYMid slice">
      <defs>
        <linearGradient id={`bg-${k}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#F1F5F9" /><stop offset="1" stopColor="#E2E8F0" /></linearGradient>
      </defs>
      <rect width="600" height="600" fill={`url(#bg-${k})`} />
      <rect y="470" width="600" height="130" fill="#CBD5E1" opacity=".35" />
      <rect x="0" y="0" width="600" height="10" fill={k === "bw" ? INK : ACC} opacity=".9" />
      <text x="40" y="100" fontFamily="Sora, sans-serif" fontWeight="800" fontSize={t.t1.length > 11 ? 50 : 62} fill={INK} letterSpacing="-1.5">{t.t1}</text>
      <text x="40" y="165" fontFamily="Sora, sans-serif" fontWeight="800" fontSize={t.t2.length > 14 ? 40 : 58} fill={ACC} letterSpacing="-1.5">{t.t2}</text>
      <text x="42" y="208" fontFamily="Inter, sans-serif" fontWeight="500" fontSize="24" fill={MUTE}>{t.sub}</text>
      <Object_ k={k} />
    </svg>
  );
}

function Cover({ s, t, className }) {
  return s.photo
    ? <img src={s.photo} alt={t.name} className={className + " object-cover"} loading="lazy" />
    : <ServiceArt k={s.key} t={t} className={className} />;
}

function Band({ children }) {
  return (
    <h2 className="bg-blue-700 text-white text-center rounded-2xl py-3 px-4 text-xl sm:text-2xl font-bold mb-6" style={{ fontFamily: "'Sora', sans-serif" }}>
      « {children} »
    </h2>
  );
}

export function Catalog({ lang, onPick }) {
  const C = CAT_T[lang];
  return (
    <div className="max-w-5xl mx-auto px-5 sm:px-6 py-8 sm:py-10">
      <div className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight" style={{ fontFamily: "'Sora', sans-serif" }}>{C.heroTitle}</h1>
        <p className="text-slate-500 mt-2 max-w-xl">{C.heroSub}</p>
      </div>
      {["print", "photo", "finish"].map((g) => (
        <section key={g} className="mb-12">
          <Band>{C.groups[g]}</Band>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {SERVICES.filter((s) => s.group === g).map((s) => {
              const t = C.s[s.key];
              return (
                <button
                  key={s.key}
                  onClick={() => !s.soon && onPick(s)}
                  disabled={s.soon}
                  className={"group text-left focus:outline-none " + (s.soon ? "cursor-default" : "")}
                >
                  <div className="relative aspect-square rounded-xl overflow-hidden bg-slate-100 shadow-sm ring-1 ring-slate-200 group-focus-visible:ring-4 group-focus-visible:ring-blue-500">
                    <Cover s={s} t={t} className={"w-full h-full transition-transform duration-500 " + (s.soon ? "opacity-60 grayscale" : "group-hover:scale-105")} />
                    {s.soon ? (
                      <span className="absolute top-3 right-3 bg-white/95 text-slate-700 text-xs font-semibold px-2.5 py-1 rounded-full shadow">{C.tag.soon}</span>
                    ) : (
                      <span className="absolute bottom-2 right-2 sm:bottom-3 sm:right-3 w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-white shadow-md flex items-center justify-center text-slate-800 group-hover:bg-blue-700 group-hover:text-white transition-colors">
                        <ArrowRight className="w-5 h-5" />
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 mt-3">{s.soon ? C.tag.soon : C.tag[g]}</p>
                  <p className="text-base sm:text-lg font-semibold text-slate-900 leading-snug group-hover:text-blue-700 transition-colors">{t.name}</p>
                </button>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}

export function ServiceHeader({ lang, service, onBack }) {
  const C = CAT_T[lang];
  const t = C.s[service.key];
  return (
    <div className="mb-8">
      <nav className="flex items-center gap-2 text-sm mb-5 flex-wrap">
        <button onClick={onBack} className="text-blue-700 hover:underline flex items-center gap-1"><Home className="w-4 h-4" /> {C.home}</button>
        <ChevronRight className="w-4 h-4 text-slate-400" />
        <button onClick={onBack} className="text-blue-700 hover:underline">{C.shop}</button>
        <ChevronRight className="w-4 h-4 text-slate-400" />
        <span className="text-slate-700 font-medium">{t.name}</span>
      </nav>
      <div className="grid md:grid-cols-2 gap-6 md:gap-8 items-start">
        <div className="rounded-2xl overflow-hidden ring-1 ring-slate-200 shadow-sm aspect-square bg-slate-100">
          <Cover s={service} t={t} className="w-full h-full" />
        </div>
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight mb-4" style={{ fontFamily: "'Sora', sans-serif" }}>{t.name}</h1>
          <p className="text-slate-600 leading-relaxed mb-5">{t.desc}</p>
          <ul className="space-y-2 mb-6">
            {t.pts.map((p) => (
              <li key={p} className="flex items-start gap-2 text-slate-700"><span className="mt-2 w-1.5 h-1.5 rounded-full bg-blue-700 flex-shrink-0" />{p}</li>
            ))}
          </ul>
          <button onClick={() => document.getElementById("commander-tool")?.scrollIntoView({ behavior: "smooth" })}
            className="bg-blue-700 hover:bg-blue-800 text-white rounded-xl px-6 py-3 font-semibold inline-flex items-center gap-2 transition-colors">
            {C.order} <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
