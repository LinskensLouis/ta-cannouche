# Déploiement

## 1. GitHub (à faire une fois)

Aucun identifiant GitHub n'est en cache sur la machine, donc le premier push se
fait **depuis ton terminal** (une fenêtre de connexion GitHub s'ouvrira) :

```bash
git push -u origin main
```

Les push suivants (les miens compris) passeront ensuite sans re-demander.

## 2. Vercel

1. Va sur https://vercel.com → **Add New… → Project**.
2. Importe le dépôt `LinskensLouis/ta-cannouche`.
3. Framework : **Next.js** (détecté automatiquement, ne rien changer).
4. **Environment Variables** — ajoute **les deux** (valeurs dans ton `.env.local`) :
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

   > ⚠️ **Ne PAS** ajouter `SUPABASE_SERVICE_ROLE_KEY` : l'app ne l'utilise pas,
   > il doit rester sur ta machine uniquement.
5. **Deploy**. Au bout d'une minute tu as une URL `https://ta-cannouche-xxx.vercel.app`.

## 3. Après le premier déploiement

Aligner Supabase sur l'URL de prod (sinon liens d'email / OAuth casseront plus
tard — sans effet tant que la confirmation d'email est désactivée, mais autant
le faire) :

1. Dans `supabase/config.toml`, remplace
   `site_url = "http://127.0.0.1:3000"` par l'URL Vercel.
2. `npx supabase config push`.

## 4. Test sur mobile (Android en priorité)

Ouvre l'URL Vercel sur le téléphone (HTTPS obligatoire pour la caméra) :

- [ ] Inscription + connexion.
- [ ] Installation PWA : menu Chrome → « Ajouter à l'écran d'accueil » →
      l'app s'ouvre en plein écran sans barre d'adresse.
- [ ] Scan d'un vrai code-barres de **canette** → fiche en moins de 3 s.
- [ ] Scan d'une **bouteille** → message de refus.
- [ ] Noter une canette (languette), avec **photo** prise à la caméra.
- [ ] Mode avion : noter une dégustation → acceptée + « en attente de synchro » →
      réactiver le réseau → synchro automatique.
- [ ] Enregistrer un achat → prix au litre → écran Stats.
