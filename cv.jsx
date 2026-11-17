import { useState } from "react";
import { Loader2, PackageCheck, Plus, X, GraduationCap, Briefcase, Camera } from "lucide-react";
import { uploadOrderFile, createOrder } from "./data";
import { MAX, eur, r2, input, Chip, Field } from "./special";
import { LAUNCH_PROMO, launchDiscount, LaunchPromoField, LaunchPromoBanner } from "./launchpromo";

/* ============================================================
   Service CV : le client remplit un questionnaire, c'est le magasin qui crée le CV.
   Les questions changent selon le statut (étudiant ou particulier).
============================================================ */
export const CV_PRICES = { simple: 5, professionnel: 10, packEmploi: 15 };

export { LAUNCH_PROMO as CV_PROMO, launchActive as cvPromoActive } from "./launchpromo";

const T = {
  nl: {
    status: "Wat is je situatie?", student: "Ik ben student", worker: "Ik zoek werk / ik werk",
    pack: "Kies je cv-formule",
    packs: {
      simple: ["CV Eenvoudig", "Een net en duidelijk cv op basis van jouw gegevens."],
      professionnel: ["CV Professioneel", "Verzorgd design en advies over de inhoud."],
      packEmploi: ["Sollicitatiepakket", "CV + motivatiebrief + volledige nalezing."],
    },
    sPersonal: "Over jou", first: "Voornaam", last: "Naam", birth: "Geboortedatum (optioneel)", city: "Woonplaats", address: "Adres (optioneel)",
    email: "E-mail", phone: "Gsm-nummer", license: "Rijbewijs", none: "Geen", photo: "Foto voor op je cv (optioneel)", photoHint: "Een duidelijke foto van je gezicht, liefst met een effen achtergrond.",
    sStudies: "Je studies", school: "School / hogeschool / universiteit", field: "Richting of opleiding", year: "Jaar (bv. 2de bachelor)", diploma: "Verwacht diploma en jaar",
    seek: "Wat zoek je?", seekOpts: ["Studentenjob", "Stage", "Eerste job", "Vakantiejob"],
    sJobs: "Studentenjobs of stages (optioneel)", sExp: "Werkervaring", job: "Functie", employer: "Werkgever", from: "Van (maand/jaar)", to: "Tot (of 'nu')", tasks: "Wat deed je daar?",
    addJob: "Nog een ervaring toevoegen", sEdu: "Diploma's en opleidingen", eduItem: "Diploma of opleiding + school + jaar", addEdu: "Nog een opleiding toevoegen",
    target: "Welke job zoek je?", targetHint: "Bijvoorbeeld: verkoper, magazijnier, administratief bediende…",
    sSkills: "Talen en vaardigheden", langs: "Talen en niveau", langsHint: "Bijvoorbeeld: Nederlands moedertaal, Frans goed, Engels basis",
    skills: "Vaardigheden", skillsHint: "Bijvoorbeeld: Word & Excel, kassa, klantvriendelijk, heftruck…", hobbies: "Hobby's (optioneel)",
    about: "Vertel kort iets over jezelf (optioneel)", aboutHint: "Wie ben je, wat zijn je sterke punten? Wij maken er een mooie tekst van.",
    letter: "Voor welke job of welk bedrijf is de motivatiebrief?",
    note: "Opmerking (optioneel)", sub: "Formule", prep: "Voorbereidingskosten", total: "Totaal", pay: "Je betaalt vooraf via overschrijving (de gegevens krijg je na je bestelling). We beginnen zodra je betaling binnen is en laten je weten wanneer je cv klaar is.",
    send: "Aanvraag versturen", sending: "Versturen", req: "Vul de verplichte velden in: voornaam, naam, e-mail en gsm-nummer.", errSend: "Versturen is mislukt. Controleer je internetverbinding en probeer opnieuw.", errBig: "De foto is groter dan 50 MB.",
    label: "CV-service",
  },
  fr: {
    status: "Quelle est votre situation ?", student: "Je suis étudiant", worker: "Je cherche un emploi / je travaille",
    pack: "Choisissez votre formule CV",
    packs: {
      simple: ["CV Simple", "Un CV propre et clair à partir de vos informations."],
      professionnel: ["CV Professionnel", "Design soigné et conseils sur le contenu."],
      packEmploi: ["Pack Emploi", "CV + lettre de motivation + relecture complète."],
    },
    sPersonal: "Vous", first: "Prénom", last: "Nom", birth: "Date de naissance (facultatif)", city: "Commune", address: "Adresse (facultatif)",
    email: "E-mail", phone: "Numéro de gsm", license: "Permis de conduire", none: "Aucun", photo: "Photo pour votre CV (facultatif)", photoHint: "Une photo nette de votre visage, de préférence sur un fond uni.",
    sStudies: "Vos études", school: "École / haute école / université", field: "Section ou formation", year: "Année (ex. 2e bachelier)", diploma: "Diplôme prévu et année",
    seek: "Que cherchez-vous ?", seekOpts: ["Job étudiant", "Stage", "Premier emploi", "Job de vacances"],
    sJobs: "Jobs étudiants ou stages (facultatif)", sExp: "Expérience professionnelle", job: "Fonction", employer: "Employeur", from: "Du (mois/année)", to: "Au (ou « aujourd'hui »)", tasks: "Qu'avez-vous fait ?",
    addJob: "Ajouter une expérience", sEdu: "Diplômes et formations", eduItem: "Diplôme ou formation + école + année", addEdu: "Ajouter une formation",
    target: "Quel emploi cherchez-vous ?", targetHint: "Par exemple : vendeur, magasinier, employé administratif…",
    sSkills: "Langues et compétences", langs: "Langues et niveau", langsHint: "Par exemple : français langue maternelle, néerlandais bon, anglais de base",
    skills: "Compétences", skillsHint: "Par exemple : Word & Excel, caisse, sens du contact, chariot élévateur…", hobbies: "Loisirs (facultatif)",
    about: "Parlez-nous un peu de vous (facultatif)", aboutHint: "Qui êtes-vous, quels sont vos points forts ? Nous en ferons un beau texte.",
    letter: "Pour quel emploi ou quelle entreprise est la lettre de motivation ?",
    note: "Remarque (facultatif)", sub: "Formule", prep: "Frais de préparation", total: "Total", pay: "Vous payez à l'avance par virement (les informations s'affichent après la commande). Nous commençons dès réception du paiement et vous prévenons quand votre CV est prêt.",
    send: "Envoyer la demande", sending: "Envoi", req: "Remplissez les champs obligatoires : prénom, nom, e-mail et numéro de gsm.", errSend: "L'envoi a échoué. Vérifiez votre connexion internet et réessayez.", errBig: "La photo dépasse 50 Mo.",
    label: "Service CV",
  },
  en: {
    status: "What is your situation?", student: "I'm a student", worker: "I'm looking for work / I work",
    pack: "Choose your CV package",
    packs: {
      simple: ["Simple CV", "A clean, clear CV based on your details."],
      professionnel: ["Professional CV", "Polished design and advice on the content."],
      packEmploi: ["Job Search Pack", "CV + cover letter + full proofreading."],
    },
    sPersonal: "About you", first: "First name", last: "Last name", birth: "Date of birth (optional)", city: "Town", address: "Address (optional)",
    email: "Email", phone: "Mobile number", license: "Driving licence", none: "None", photo: "Photo for your CV (optional)", photoHint: "A clear photo of your face, ideally on a plain background.",
    sStudies: "Your studies", school: "School / college / university", field: "Field of study", year: "Year (e.g. 2nd year bachelor)", diploma: "Expected degree and year",
    seek: "What are you looking for?", seekOpts: ["Student job", "Internship", "First job", "Holiday job"],
    sJobs: "Student jobs or internships (optional)", sExp: "Work experience", job: "Job title", employer: "Employer", from: "From (month/year)", to: "To (or 'now')", tasks: "What did you do there?",
    addJob: "Add another experience", sEdu: "Degrees and training", eduItem: "Degree or training + school + year", addEdu: "Add another training",
    target: "What job are you looking for?", targetHint: "For example: sales assistant, warehouse worker, office clerk…",
    sSkills: "Languages and skills", langs: "Languages and level", langsHint: "For example: Dutch native, French good, English basic",
    skills: "Skills", skillsHint: "For example: Word & Excel, till, customer-friendly, forklift…", hobbies: "Hobbies (optional)",
    about: "Tell us a little about yourself (optional)", aboutHint: "Who are you, what are your strengths? We'll turn it into a nice text.",
    letter: "Which job or company is the cover letter for?",
    note: "Note (optional)", sub: "Package", prep: "Preparation fee", total: "Total", pay: "You pay in advance by bank transfer (details shown after ordering). We start once your payment arrives and let you know when your CV is ready.",
    send: "Send request", sending: "Sending", req: "Please fill in the required fields: first name, last name, email and mobile number.", errSend: "Sending failed. Check your internet connection and try again.", errBig: "The photo is larger than 50 MB.",
    label: "CV service",
  },
};

const LICENSES = ["B", "AM", "A", "C", "-"];
const emptyJob = () => ({ job: "", employer: "", from: "", to: "", tasks: "" });

function Section({ title, children }) {
  return (
    <div className="space-y-4">
      <p className="text-lg font-semibold text-slate-800 border-b border-slate-100 pb-2" style={{ fontFamily: "'Sora', sans-serif" }}>{title}</p>
      {children}
    </div>
  );
}

export function CvOrder({ lang, prepFee = 0, prices = CV_PRICES, onDone, onStorageError, initialStatus = "worker" }) {
  const S = T[lang] || T.nl;
  const P = { ...CV_PRICES, ...(prices || {}) };
  const [status, setStatus] = useState(initialStatus);
  const [pack, setPack] = useState("professionnel");
  const [p, setP] = useState({ first: "", last: "", birth: "", city: "", address: "", email: "", phone: "", license: "B",
    school: "", field: "", year: "", diploma: "", seek: [], target: "", langs: "", skills: "", hobbies: "", about: "", letter: "", note: "" });
  const [jobs, setJobs] = useState([emptyJob()]);
  const [edu, setEdu] = useState([""]);
  const [photo, setPhoto] = useState(null);
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setP({ ...p, [k]: e.target.value });
  const txt = (k, label, opts = {}) => (
    <Field label={label} hint={opts.hint}>
      {opts.area
        ? <textarea className={input + " min-h-24"} maxLength={opts.max || 800} value={p[k]} onChange={set(k)} />
        : <input className={input} type={opts.type || "text"} maxLength={opts.max || 120} value={p[k]} onChange={set(k)} autoComplete={opts.ac} placeholder={opts.ph} />}
    </Field>
  );

  const PT = { nl: { disc: "Korting" }, fr: { disc: "Réduction" }, en: { disc: "Discount" } }[lang] || { disc: "Korting" };
  const [promoOk, setPromoOk] = useState(false);

  // Pas de frais de préparation pour le service CV : prix tout compris.
  const subtotal = P[pack];
  const fee = 0;
  const discount = launchDiscount(subtotal, promoOk);
  const total = r2(subtotal - discount);

  async function send() {
    setErr("");
    if (!p.first.trim() || !p.last.trim() || !p.email.includes("@") || p.phone.replace(/[^0-9]/g, "").length < 9) return setErr(S.req);
    setBusy(true);
    const id = "CCZ-" + Date.now().toString().slice(-6);
    let photoPath = null;
    if (photo) {
      photoPath = await uploadOrderFile(id, new File([photo], "foto-" + photo.name, { type: photo.type }));
      if (!photoPath) { setBusy(false); setErr(S.errSend); onStorageError?.(); return; }
    }
    const clean = (o) => Object.fromEntries(Object.entries(o).filter(([, v]) => (Array.isArray(v) ? v.length : String(v).trim() !== "")));
    const answers = clean({
      ...p, seek: status === "student" ? p.seek : [],
      jobs: jobs.filter((j) => j.job.trim() || j.employer.trim()).map(clean),
      edu: edu.map((x) => x.trim()).filter(Boolean),
    });
    delete answers.note;
    const order = {
      id, createdAt: new Date().toISOString(), profile: status === "student" ? "etudiant" : "particulier",
      fileName: S.label + " – " + T[lang].packs[pack][0], filePath: photoPath,
      format: "CV", color: "couleur", sides: "recto", finishing: "aucune", pages: 1, quantity: 1,
      cvPack: pack, promo: discount ? LAUNCH_PROMO.code : null,
      customer: { name: `${p.first.trim()} ${p.last.trim()}`, email: p.email.trim(), phone: p.phone.trim(), note: p.note.trim() || undefined },
      breakdown: { kind: "cv", status, pack, answers, files: photoPath ? [photoPath] : [], subtotal, prepFee: fee, discount, promo: discount ? LAUNCH_PROMO.code : null, total },
      status: "received", paymentMethod: "virement", paid: false,
    };
    const ok = await createOrder(order);
    setBusy(false);
    if (!ok) { setErr(S.errSend); onStorageError?.(); return; }
    onDone(order);
  }

  const JobList = (
    <div className="space-y-4">
      {jobs.map((j, i) => (
        <div key={i} className="relative border border-slate-200 rounded-2xl p-4 grid sm:grid-cols-2 gap-3">
          {jobs.length > 1 && (
            <button type="button" aria-label="X" onClick={() => setJobs(jobs.filter((_, k) => k !== i))} className="absolute top-2 right-2 w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400"><X className="w-4 h-4" /></button>
          )}
          {[["job", S.job], ["employer", S.employer], ["from", S.from], ["to", S.to]].map(([k, l]) => (
            <Field key={k} label={l}><input className={input} maxLength={80} value={j[k]} onChange={(e) => setJobs(jobs.map((x, n) => (n === i ? { ...x, [k]: e.target.value } : x)))} /></Field>
          ))}
          <div className="sm:col-span-2"><Field label={S.tasks}><textarea className={input + " min-h-20"} maxLength={500} value={j.tasks} onChange={(e) => setJobs(jobs.map((x, n) => (n === i ? { ...x, tasks: e.target.value } : x)))} /></Field></div>
        </div>
      ))}
      {jobs.length < 6 && (
        <button type="button" onClick={() => setJobs([...jobs, emptyJob()])} className="text-sm font-semibold text-blue-700 flex items-center gap-1.5 hover:underline"><Plus className="w-4 h-4" /> {S.addJob}</button>
      )}
    </div>
  );

  return (
    <div className="bg-white border border-slate-200 rounded-3xl shadow-sm p-5 sm:p-8 space-y-8">
      <LaunchPromoBanner lang={lang} />
      {/* statut */}
      <div>
        <p className="text-lg font-semibold text-slate-800 mb-3" style={{ fontFamily: "'Sora', sans-serif" }}>{S.status}</p>
        <div className="grid grid-cols-2 gap-3">
          {[["student", S.student, GraduationCap], ["worker", S.worker, Briefcase]].map(([k, l, Icon]) => (
            <button key={k} type="button" onClick={() => setStatus(k)}
              className={"flex flex-col items-center gap-2 py-5 px-3 rounded-2xl border-2 text-sm font-semibold text-center transition-colors " + (status === k ? "border-blue-700 bg-blue-700 text-white" : "border-slate-200 text-slate-700 hover:border-blue-300")}>
              <Icon className="w-7 h-7" /> {l}
            </button>
          ))}
        </div>
      </div>

      {/* formule */}
      <div>
        <p className="text-lg font-semibold text-slate-800 mb-3" style={{ fontFamily: "'Sora', sans-serif" }}>{S.pack}</p>
        <div className="grid sm:grid-cols-3 gap-3">
          {Object.keys(CV_PRICES).map((k) => (
            <button key={k} type="button" onClick={() => setPack(k)}
              className={"text-left rounded-2xl border-2 p-4 transition-colors " + (pack === k ? "border-blue-700 bg-blue-50" : "border-slate-200 hover:border-blue-300")}>
              <p className="text-sm font-semibold text-slate-800">{S.packs[k][0]}</p>
              <p className="text-xl font-bold text-blue-700 my-1">{eur(P[k])}</p>
              <p className="text-xs text-slate-500 leading-snug">{S.packs[k][1]}</p>
            </button>
          ))}
        </div>
      </div>

      <Section title={S.sPersonal}>
        <div className="grid sm:grid-cols-2 gap-4">
          {txt("first", S.first + " *", { ac: "given-name", max: 60 })}
          {txt("last", S.last + " *", { ac: "family-name", max: 60 })}
          {txt("email", S.email + " *", { type: "email", ac: "email", max: 80 })}
          {txt("phone", S.phone + " *", { type: "tel", ac: "tel", max: 20, ph: "04xx xx xx xx" })}
          {txt("city", S.city, { ac: "address-level2", max: 60 })}
          {txt("birth", S.birth, { type: "date" })}
          <div className="sm:col-span-2">{txt("address", S.address, { ac: "street-address" })}</div>
        </div>
        <div>
          <p className="text-sm font-semibold text-slate-700 mb-2">{S.license}</p>
          <div className="flex flex-wrap gap-2">{LICENSES.map((l) => <Chip key={l} on={p.license === l} onClick={() => setP({ ...p, license: l })}>{l === "-" ? S.none : l}</Chip>)}</div>
        </div>
        <Field label={S.photo} hint={S.photoHint}>
          <label className="flex items-center gap-3 border border-dashed border-slate-300 rounded-xl px-4 py-3 cursor-pointer hover:border-blue-400">
            <Camera className="w-5 h-5 text-blue-700" />
            <span className="text-sm text-slate-700 flex-1 truncate">{photo ? photo.name : "JPG / PNG"}</span>
            {photo && <button type="button" onClick={(e) => { e.preventDefault(); setPhoto(null); }} className="text-slate-400 hover:text-red-600"><X className="w-4 h-4" /></button>}
            <input type="file" hidden accept="image/*,.heic,.heif" onChange={(e) => { const f = e.target.files[0]; if (f && f.size > MAX) setErr(S.errBig); else setPhoto(f || null); e.target.value = ""; }} />
          </label>
        </Field>
      </Section>

      {status === "student" ? (
        <>
          <Section title={S.sStudies}>
            <div className="grid sm:grid-cols-2 gap-4">
              {txt("school", S.school)}
              {txt("field", S.field)}
              {txt("year", S.year, { max: 60 })}
              {txt("diploma", S.diploma, { max: 80 })}
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-700 mb-2">{S.seek}</p>
              <div className="flex flex-wrap gap-2">
                {S.seekOpts.map((o) => (
                  <Chip key={o} on={p.seek.includes(o)} onClick={() => setP({ ...p, seek: p.seek.includes(o) ? p.seek.filter((x) => x !== o) : [...p.seek, o] })}>{o}</Chip>
                ))}
              </div>
            </div>
          </Section>
          <Section title={S.sJobs}>{JobList}</Section>
        </>
      ) : (
        <>
          <Section title={S.target}>{txt("target", S.target, { hint: S.targetHint })}</Section>
          <Section title={S.sExp}>{JobList}</Section>
          <Section title={S.sEdu}>
            {edu.map((x, i) => (
              <div key={i} className="flex gap-2">
                <input className={input} maxLength={150} placeholder={S.eduItem} value={x} onChange={(e) => setEdu(edu.map((y, n) => (n === i ? e.target.value : y)))} />
                {edu.length > 1 && <button type="button" aria-label="X" onClick={() => setEdu(edu.filter((_, n) => n !== i))} className="text-slate-400 hover:text-red-600 px-2"><X className="w-4 h-4" /></button>}
              </div>
            ))}
            {edu.length < 6 && <button type="button" onClick={() => setEdu([...edu, ""])} className="text-sm font-semibold text-blue-700 flex items-center gap-1.5 hover:underline"><Plus className="w-4 h-4" /> {S.addEdu}</button>}
          </Section>
        </>
      )}

      <Section title={S.sSkills}>
        {txt("langs", S.langs, { hint: S.langsHint, max: 200 })}
        {txt("skills", S.skills, { hint: S.skillsHint, area: true, max: 500 })}
        {txt("hobbies", S.hobbies, { max: 200 })}
        {txt("about", S.about, { hint: S.aboutHint, area: true })}
        {pack === "packEmploi" && txt("letter", S.letter, { area: true, max: 500 })}
        {txt("note", S.note, { max: 300 })}
      </Section>

      <div className="bg-slate-50 rounded-2xl p-5">
        <div className="flex justify-between text-sm text-slate-600"><span>{S.sub}: {S.packs[pack][0]}</span><span>{eur(subtotal)}</span></div>
        <LaunchPromoField lang={lang} on={promoOk} setOn={setPromoOk} />
        {discount > 0 && <div className="flex justify-between text-sm font-semibold text-green-700 mt-2"><span>{PT.disc} {LAUNCH_PROMO.code} (-{LAUNCH_PROMO.pct}%)</span><span>-{eur(discount)}</span></div>}
        <div className="flex justify-between items-end mt-3 pt-3 border-t border-slate-200">
          <span className="font-semibold text-slate-800">{S.total}</span>
          <span className="text-3xl font-bold text-slate-900" style={{ fontFamily: "'Sora', sans-serif" }}>{eur(total)}</span>
        </div>
        <p className="text-xs text-slate-500 mt-2">{S.pay}</p>
      </div>

      {err && <p className="text-sm font-semibold text-red-600" role="alert">{err}</p>}
      <button type="button" disabled={busy} onClick={send}
        className="w-full bg-orange-600 hover:bg-orange-700 disabled:bg-slate-300 text-white rounded-2xl px-6 py-4 text-base font-bold flex items-center justify-center gap-2 transition-colors">
        {busy ? <><Loader2 className="w-5 h-5 animate-spin" /> {S.sending}</> : <><PackageCheck className="w-5 h-5" /> {S.send}</>}
      </button>
    </div>
  );
}
