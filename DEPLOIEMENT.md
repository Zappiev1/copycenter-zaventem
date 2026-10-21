# Copy Center Zaventem — Guide de mise en ligne

Suis ces 5 étapes dans l'ordre. Ça prend environ 20-30 minutes la première fois.

---

## 1. Base de données Supabase

1. Va sur [supabase.com](https://supabase.com) et ouvre ton projet (ou crées-en un nouveau : "New project", choisis un nom, un mot de passe de base de données — note-le quelque part — et une région proche de la Belgique, ex. "West EU (Ireland)").
2. Une fois le projet créé, dans le menu de gauche : **SQL Editor** → **New query**.
3. Ouvre le fichier `supabase/schema.sql` (fourni dans ce dossier), copie tout son contenu, colle-le dans l'éditeur SQL.
4. Clique **Run**. Tu dois voir "Success. No rows returned" (ou similaire) — ça crée toutes les tables, les règles de sécurité, et charge tes tarifs/codes promo actuels.

### Créer ton compte admin
1. Toujours dans Supabase : menu de gauche → **Authentication** → **Users** → **Add user** → **Create new user**.
2. Mets ton email et un mot de passe solide. Décoche "Auto confirm user" si présent, ou confirme-le manuellement — le plus simple est de cocher "Auto Confirm User" pour ne pas avoir à valider par email.
3. C'est cet email + mot de passe que tu utiliseras pour te connecter sur `/admin` du site une fois en ligne.

### Récupérer les clés API
1. Menu de gauche → **Project Settings** (icône engrenage) → **API**.
2. Note deux valeurs :
   - **Project URL** (ressemble à `https://xxxxxxxxxxxx.supabase.co`)
   - **anon public key** (une longue chaîne commençant par `eyJ...`)

Tu en auras besoin à l'étape 4.

---

## 2. Pousser le code sur GitHub

Si tu n'as jamais fait ça avec ce projet précis :

```bash
cd copycenter-site
git init
git add .
git commit -m "Site Copy Center Zaventem"
```

Puis va sur [github.com/new](https://github.com/new), crée un nouveau repo (par exemple `copycenter-zaventem`), **sans** cocher "Add a README" (pour éviter un conflit), puis suis les instructions GitHub affichées après création, du style :

```bash
git remote add origin https://github.com/TON-NOM-UTILISATEUR/copycenter-zaventem.git
git branch -M main
git push -u origin main
```

---

## 3. Déployer sur Vercel

1. Va sur [vercel.com](https://vercel.com), connecte-toi avec ton compte GitHub.
2. **Add New** → **Project** → choisis le repo `copycenter-zaventem` que tu viens de créer → **Import**.
3. Vercel détecte automatiquement que c'est un projet Vite — ne change rien aux réglages de build.
4. Avant de cliquer "Deploy", ouvre la section **Environment Variables** et ajoute :
   - `VITE_SUPABASE_URL` → colle ton Project URL (étape 1)
   - `VITE_SUPABASE_ANON_KEY` → colle ta anon public key (étape 1)
5. Clique **Deploy**. Après 1-2 minutes, ton site est en ligne sur une adresse du style `copycenter-zaventem.vercel.app` — teste-le !

---

## 4. Brancher ton nom de domaine

1. Dans Vercel, ouvre ton projet → onglet **Settings** → **Domains**.
2. Tape ton nom de domaine (ex. `copycenterzaventem.be`) → **Add**.
3. Vercel affiche des instructions DNS précises (un enregistrement de type A et/ou CNAME à ajouter).
4. Va chez le registrar où tu as acheté ton domaine (Namecheap, OVH, Ionos, etc.), cherche la section **DNS** ou **Zone DNS**, et ajoute exactement les enregistrements que Vercel t'a montrés.
5. Ça peut prendre de quelques minutes à quelques heures pour se propager. Vercel affiche un ✅ une fois que c'est bon.

*(Dis-moi le nom de ton domaine et chez qui tu l'as acheté si tu veux que je t'écrive les étapes DNS exactes pour ce registrar précis.)*

---

## 5. Vérifications finales

Une fois le domaine actif :
- [ ] Passe une commande test (choisis "payer sur place") → vérifie qu'elle apparaît dans `/admin` (onglet Commandes)
- [ ] Connecte-toi sur `/admin` avec ton email/mot de passe créé à l'étape 1
- [ ] Crée un code promo test dans l'admin, vérifie qu'il s'applique bien dans le tunnel de commande
- [ ] Active l'annonce et vérifie qu'elle s'affiche en haut du site
- [ ] Teste le suivi de commande avec le numéro reçu

---

## Pour mettre à jour le site plus tard

Après toute modification du code (avec moi ou seul), il suffit de :
```bash
git add .
git commit -m "description du changement"
git push
```
Vercel redéploie automatiquement à chaque `push` sur la branche `main`.

## Rappel important : paiement en ligne

Le paiement par carte est actuellement en **mode démonstration** (aucun vrai débit). Pour un vrai paiement en ligne avec ton compte Stripe, il faudra ajouter une petite fonction serveur (Vercel Functions ou Supabase Edge Functions) qui crée la session de paiement — on pourra s'y attaquer dès que tu es prêt.
