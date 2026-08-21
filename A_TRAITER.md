# À traiter / décisions

> Journal des points ouverts et des décisions prises. Mis à jour au fil des
> sessions. Le gros est réglé ; ce qui reste est côté dashboard ou en réserve.

---

## Actions restantes (de ton côté, pas de code)

- 🔵 **Activer Analytics + Speed Insights** dans le dashboard Vercel :
  Projet → onglet **Analytics** → *Enable*, puis onglet **Speed Insights** → *Enable*.
  Le code est déjà en place ; sans activation, pas de données (ni d'erreur).
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

## Livré (rappel)

MVP complet (sprints 1→4) + tier list du groupe + recherche par marque et
instantanée + Vercel Analytics/Speed Insights. Détail par tâche dans `TACHES.md`,
historique dans `JOURNAL.md`. Base propre : compte **Loulou** + la **8.6**.

Points connexes déjà réglés : GitHub + Vercel en prod, `site_url` calé sur la
prod, filtre bouteilles, file d'attente hors-ligne (+ correctif mode avion),
photo de dégustation. Données et comptes de test tous supprimés.
