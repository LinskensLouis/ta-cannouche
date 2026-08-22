# À traiter / décisions

> Journal des points ouverts et des décisions prises. Mis à jour au fil des
> sessions. Le gros est réglé ; ce qui reste est côté dashboard ou en réserve.

---

## Actions restantes (de ton côté, pas de code)

- 🟠 **Couper l'inscription publique quand tout le groupe est inscrit.** L'app est
  ouverte : n'importe qui avec le lien peut créer un compte. Un `noindex` limite
  la découverte (fait), mais pour verrouiller vraiment, une fois tous les potes
  dedans : dans `supabase/config.toml`, passer `[auth] enable_signup = false` **et**
  `[auth.email] enable_signup = false`, puis `npx supabase config push`. Pour
  ajouter quelqu'un ensuite : le recréer côté dashboard, ou rouvrir temporairement.
  Dis-moi quand vous êtes au complet et je le fais.

- 🟢 **Analytics + Speed Insights** activés dans Vercel (fait par Louis). Données
  visibles dans les onglets dédiés ; me les partager (capture/chiffres) pour analyse.
- 🔵 **(Optionnel) Tester sur iPhone** l'installation PWA et le scan caméra.
  Sur **Android** c'est déjà validé (scan OK, mode avion OK, bouteille refusée OK).

---

## Décisions actées (2026-08-21)

- **Inscription sans confirmation d'email** — *gardé*. Simple pour un groupe fermé.
  Pour resserrer plus tard : brancher un SMTP (ex. Resend) puis réactiver
  `enable_confirmations` dans `supabase/config.toml`.
- **Photos en bucket public** — *gardé*. URL non devinable, suffisant pour le
  groupe. Passable en privé + URLs signées si besoin.
- **Filtre « canettes uniquement »** — *gardé tel quel*. On rejette les bières
  explicitement en bouteille (packaging OFF) ; celles au conditionnement non
  renseigné passent (sinon on perdrait de vraies canettes mal taguées). Format
  toujours borné aux 4 tailles canette.
- **Photo hors-ligne** — *limite acceptée*. Sans réseau, la dégustation part en
  file mais **sans** la photo (message affiché). À revoir si l'usage le réclame.
- **Création de bière hors-ligne** — *reportée*. Sans réseau, le scan lit le code
  mais retrouver/créer la canette exige une connexion → message clair pour
  l'instant. On fera la file complète (bière + dégustation + gestion des doublons)
  seulement si le cas « zéro réseau + canette inconnue » gêne vraiment le groupe.
  Rappel : navigation limitée hors-ligne (pages rendues côté serveur ; seul le
  feed « / » est mis en cache par le service worker).

---

## Performance — optimisations à prévoir (audit build mobile, 2026-08-22)

> Audit fait sur le build (je n'ai pas accès au dashboard Speed Insights). À
> l'échelle actuelle (peu de données, 2 comptes) l'app est déjà rapide : ces
> points sont surtout **préventifs** pour la fluidité mobile et la montée en
> charge. Priorité décroissante. Rien n'est encore fait — à arbitrer.

**Fort impact (fluidité perçue)**
- 🟠 **Proxy : `getUser()` → `getClaims()`.** Le proxy valide la session à
  *chaque* navigation via un aller-retour réseau vers Supabase Auth (`getUser()`).
  `getClaims()` valide le JWT **localement** (signature) sans round-trip → chaque
  changement d'écran plus rapide. C'est probablement le gain le plus net.
  (À valider : dispo dans `@supabase/ssr` 0.12, projet sur les nouvelles clés.)
- 🟠 **Agrégations en vues Postgres** (prévues SPECS §4.4). Aujourd'hui la note de
  groupe (`getBeerRating`), la tier list et les classements **rapatrient tous les
  checkins et recalculent en JS** à chaque affichage → coût qui grossit
  linéairement avec les données. Remplacer par des vues SQL (`beer_stats`, etc.)
  ou des agrégations `count/avg` côté base.

**Impact moyen (poids téléchargé)**
- 🟠 **Polices : 378 Ko** dont ~172 Ko pour Archivo (axe de largeur variable).
  Pistes : figer la largeur « expanded » en instance statique plutôt que l'axe
  variable complet ; réduire IBM Plex Mono à 1-2 graisses ; `preload` de la seule
  police d'affichage. Gros levier sur le LCP mobile.
- 🟡 **Lazy-load du graphique Recharts** (338 Ko) via `next/dynamic` (`ssr:false`) :
  déjà isolé à l'écran Stats, mais on peut le différer pour alléger son 1er rendu.

**Petit impact / à surveiller**
- 🟡 **Fiche bière : requêtes séquentielles** (bière, note[2 req], historique,
  achats) → paralléliser (`Promise.all`) ; `getBeerRating` fait 2 requêtes à la
  suite dont un scan global.
- 🔵 Client Supabase (254 Ko) : inhérent, peu d'action.
- 🔵 Envisager un `revalidate` court / cache-tags sur le feed pour éviter des
  refetch redondants entre navigations.

---

## Livré (rappel)

MVP complet (sprints 1→4) + tier list du groupe + recherche par marque et
instantanée + Vercel Analytics/Speed Insights. Détail par tâche dans `TACHES.md`,
historique dans `JOURNAL.md`. Base réelle : comptes **Loulou** + **Jules**
(le groupe a commencé à l'utiliser).

Points connexes déjà réglés : GitHub + Vercel en prod, `site_url` calé sur la
prod, filtre bouteilles, file d'attente hors-ligne (+ correctif mode avion),
photo de dégustation. Données et comptes de test tous supprimés.
