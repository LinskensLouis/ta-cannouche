# Ta Cannouche — Specs techniques & backlog

*Document de travail — v2 · périmètre resserré : canettes uniquement*

---

## 1. Positionnement

Le « Letterboxd de la bière » existe déjà : **Untappd**, 15 ans d'existence, base de données massive, communauté internationale. Refaire un clone à l'identique, c'est perdre d'avance.

En revanche, deux features de la liste d'Owen ne sont couvertes par personne :

1. **Le suivi de conso et de dépenses** — combien j'ai bu, combien j'ai dépensé, quelle moyenne par semaine. Untappd ne fait aucun tracking budgétaire.
2. **La dispo en enseigne française** — savoir que telle bière se trouve au Leclerc de Mérignac à 2,30 € l'unité. Personne ne fait ça, parce que ça ne s'automatise pas : c'est du crowdsourcing local.

**Conséquence pour le produit :** l'app n'est pas « Letterboxd + un compteur ». C'est un **carnet de dégustation avec suivi budget et repérage GMS**, dont l'interface s'inspire de Letterboxd. La nuance change les priorités du backlog.

**Positionnement retenu :** app de groupe (5–20 personnes qui se connaissent), pas plateforme publique. Ça simplifie énormément la modération, la qualité de données et l'onboarding.

### 1.1 Périmètre : la canette et rien d'autre

Restreindre aux canettes n'est pas une amputation, c'est ce qui rend le projet faisable en solo. Ce que ça règle d'un coup :

| Problème de la v1 | Ce que la canette résout |
|---|---|
| Pressions et fûts sans code-barres | Toute canette vendue en France en a un. Le scan devient le chemin unique, pas un chemin parmi d'autres |
| Contenants à saisie libre | Quatre formats couvrent 95 % du marché : 25, 33, 44, 50 cl. Fini le champ libre, place à quatre boutons |
| Couverture Open Food Facts inégale | La canette de GMS est exactement ce qu'OFF référence le mieux |
| Feature « enseigne » bancale | La canette s'achète en grande surface. E6 cesse d'être un bonus et devient cohérente avec tout le reste |
| Prix incomparables | Le prix au litre devient calculable et comparable entre tous les produits de la base |

**Corollaire assumé :** pas de bouteille, pas de pression, pas de bar. Si quelqu'un veut logger une Guinness à la tireuse, la réponse est non. C'est ce refus qui garde l'app simple.

---

## 2. Choix techniques

### 2.1 Stack recommandée

| Couche | Choix | Pourquoi |
|---|---|---|
| Front | **Next.js 15 (App Router) + TypeScript + Tailwind** | Un seul framework pour le web, rendu rapide, écosystème énorme. Les compétences se transfèrent vers React Native ensuite. |
| Backend / BDD | **Supabase** (Postgres managé) | Auth, base, stockage d'images et API REST auto-générée en une seule brique. Pour un dev solo, c'est ce qui évite d'écrire un backend complet. |
| Hébergement | **Vercel** (front) + Supabase cloud | Déploiement au push Git. Gratuit à votre échelle. |
| UI | **shadcn/ui** | Composants prêts, propres, modifiables. Évite 3 semaines de CSS. |
| Graphiques | **Recharts** | Pour les stats de conso/dépenses. |

**Coût réel :** 0 €/mois jusqu'à plusieurs milliers de check-ins. Le seul poste éventuel est un nom de domaine (~12 €/an).

### 2.2 La trajectoire web → mobile

C'est la décision qui conditionne tout le reste. Trois options :

| Option | Effort | Résultat |
|---|---|---|
| **PWA d'abord, puis Capacitor** ⭐ | Faible | Le site web devient installable sur l'écran d'accueil. Plus tard, Capacitor empaquette le même code en `.apk` / `.ipa` sans réécriture. |
| PWA seulement | Très faible | Pas de présence sur les stores, notifications push limitées sur iOS. |
| Next.js puis React Native séparé | Élevé | Deux bases de code à maintenir. À éviter en solo. |

**Recommandation : PWA installable dès le départ, Capacitor plus tard si le besoin de store se confirme.** Concrètement ça veut dire soigner le `manifest.json`, le service worker et le design mobile-first dès le sprint 1 — pas les rajouter après coup.

⚠️ **Point store à anticiper :** une app qui suit la consommation d'alcool sera classée 17+/18+ sur l'App Store et le Play Store, avec un formulaire de conformité à remplir. Rien de bloquant, mais ça rallonge la première soumission. Raison de plus pour rester en PWA tant que le produit n'est pas stabilisé.

### 2.3 Source des données bières

**Open Food Facts** — API publique, gratuite, sans clé, excellente couverture des produits vendus en GMS française.

```
GET https://world.openfoodfacts.org/api/v2/product/{code_barres}.json
```

Champs exploitables : `product_name`, `brands`, `image_url`, `quantity`, `categories_tags` (filtrer sur `en:beers`), `stores`, `nutriments.alcohol_100g`.

**Limites à assumer :**
- Le degré d'alcool et le style sont souvent absents ou mal renseignés → prévoir une saisie manuelle en complément.
- Le champ `stores` est peu rempli → c'est votre `beer_availability` qui prendra le relais.
- Les canettes de micro-brasseries locales à faible distribution manquent parfois → garder un flux de création manuelle, mais en filet de sécurité, plus en feature de premier plan.

**Alternative écartée :** l'API Untappd v4 est plafonnée à 100 appels/heure et la clé passe par une validation manuelle. Trop contraignant pour bâtir dessus.

### 2.4 Le scan code-barres

C'est la feature qui rend tout le reste indolore. Sans scan, personne ne remplira un formulaire après trois bières.

- **Android / Chrome** : API `BarcodeDetector` native, rapide, zéro dépendance.
- **iOS / Safari** : `BarcodeDetector` non supporté → fallback sur **`@zxing/library`** ou **`html5-qrcode`**.

Écris une petite abstraction qui détecte la disponibilité de l'API native et bascule sur la lib sinon. À faire une fois, proprement, au sprint 2.

---

## 3. Interface mobile-first

### 3.1 Le contexte d'usage dicte tout

Où l'app sera réellement ouverte :

- **debout dans le rayon bière d'un Leclerc**, une main sur le caddie, réseau à une barre ;
- **assis dans un bar**, une bière dans une main, lumière basse, un peu éméché ;
- **rarement** posé au calme devant un écran de 27 pouces.

Chacune de ces trois situations impose les mêmes contraintes : **une seule main, le pouce, un écran de 6 pouces, un réseau incertain, une attention faible**. Le desktop n'est pas une cible, c'est un cas dégradé qu'on gère en centrant une colonne. On conçoit à **375 px** et on élargit ensuite — jamais l'inverse.

### 3.2 Décisions de structure

**Navigation basse, jamais de hamburger.** Une barre d'onglets fixe en bas : Feed · Recherche · **[Scan]** · Stats · Profil. Le scan occupe la position centrale en bouton flottant proéminent, parce que c'est l'action qui déclenche 80 % des parcours. Un menu hamburger en haut à gauche est inatteignable au pouce sur un grand téléphone.

**Actions primaires dans le tiers inférieur.** Les titres et le contexte en haut, les boutons en bas. Concrètement : le bouton « Enregistrer » d'un formulaire est fixé en bas d'écran, pas relégué après le dernier champ.

**Feuilles remontantes, pas de modales centrées.** Un `bottom sheet` s'attrape au pouce et se ferme d'un glissement. Une boîte de dialogue centrée avec une croix en haut à droite, non.

**Aucun tableau.** Les tableaux ne survivent pas à 375 px. Les classements deviennent des listes de cartes, les stats deviennent un chiffre large avec une courbe compacte en dessous.

**Cibles tactiles à 48 px minimum.** Le piège classique de ce projet : dix demi-étoiles sur 375 px de large, ça fait 34 px par étoile, soit une erreur de saisie sur trois. Voir 3.4.

**Safe areas iOS.** La barre de navigation doit intégrer `env(safe-area-inset-bottom)`, sinon elle passe sous la barre de gestes de l'iPhone.

### 3.3 Réseau et hors-ligne

Le rayon d'un hypermarché et la cave d'un bar ont un point commun : zéro réseau exploitable. Si un check-in échoue là, il ne sera jamais ressaisi.

- **File d'attente locale** en IndexedDB : le check-in est enregistré localement puis synchronisé au retour du réseau.
- **Interface optimiste** : l'écran confirme immédiatement, la synchro se fait en tâche de fond avec un indicateur discret.
- **Compression des photos côté client** (redimensionnement canvas à ~1200 px) avant upload. Une photo d'étiquette brute fait 4 Mo, ce qui est impraticable en 4G faible.
- **Cache des fiches consultées** via le service worker : consulter une bière déjà vue doit marcher hors-ligne.

### 3.4 Le composant de notation

C'est le composant le plus utilisé de l'app et le plus facile à rater sur mobile.

Écarter les dix demi-étoiles alignées : trop petites, imprécises avec un pouce, et l'écart entre 3,5 et 4 se joue à 15 px. Retenir **l'anneau du dessus de canette que l'on remplit au glissement horizontal** — un seul geste, une cible large comme le pouce, un retour haptique léger à chaque demi-cran, et la valeur affichée en gros chiffre à côté. La note reste modifiable par tap direct pour ceux qui préfèrent viser.

### 3.5 Direction visuelle

Le monde du sujet, ce n'est ni le houblon en illustration ni le dégradé ambre sur fond noir. C'est **l'aluminium brossé, la sérigraphie imprimée dessus, et la languette**. Et la collection de languettes est une vraie manie de cour de récré française : elle donne la métaphore juste pour le profil.

**Palette** (fond sombre assumé : l'app s'ouvre surtout le soir, en lumière basse)

| Token | Hex | Usage |
|---|---|---|
| `--alu-fond` | `#14171A` | aluminium à l'ombre, fond général |
| `--alu-surface` | `#1E2227` | cartes, feuilles remontantes |
| `--alu-brosse` | `#C9CED4` | métal brossé, texte principal |
| `--alu-mat` | `#7C848C` | texte secondaire, métadonnées |
| `--serigraphie` | `#F25C1F` | orange imprimé — accent d'action, unique |
| `--condensation` | `#4FB3A5` | états positifs, dispo en rayon, synchro réussie |

Un seul accent d'action. L'orange sérigraphie est réservé aux actions et à la note : s'il sert aussi à décorer, il ne signale plus rien. Le turquoise ne fait que du statut, jamais de l'action.

**Typographie**

| Rôle | Police | Usage |
|---|---|---|
| Display | **Archivo Expanded** (700) | noms de bières, titres — une grotesque large, comme le lettrage sérigraphié qui s'enroule autour d'une canette |
| Texte | **Public Sans** | corps, libellés, commentaires |
| Données | **IBM Plex Mono** | prix, prix au litre, notes, compteurs |

Le monospace sur les chiffres n'est pas décoratif : il aligne les colonnes de prix et donne au carnet un ton d'instrument de mesure plutôt que de réseau social.

**Élément signature : la languette.** Elle sert d'anneau de notation (3.4), de puce dans les classements, et le profil affiche un **mur de languettes collectées** — une par bière distincte goûtée. Un seul objet visuel qui porte l'identité et fait un vrai travail fonctionnel. Tout le reste de l'interface reste sobre et sombre.

**Ton des textes.** Voix directe, phrases courtes, verbes d'action : « Enregistrer la dégustation », pas « Valider ». Un écran vide est une invitation, pas une excuse : « Scanne ta première cannouche » plutôt que « Aucune donnée disponible ».

### 3.6 Implémentation

- **Tailwind configuré avec ces tokens** dès le départ (`theme.extend.colors`), jamais de hex en dur dans les composants.
- **shadcn/ui** fournit `Drawer` (feuilles remontantes) et `Sheet` déjà accessibles — les utiliser plutôt que de les réécrire.
- **Breakpoints** : base 375 px → `md:` 768 px (tablette, deux colonnes) → `lg:` 1024 px (desktop : colonne centrée à 640 px max, la navigation basse passe en barre latérale). Le desktop ne reçoit aucune feature en plus.
- **Plancher de qualité** : focus clavier visible, `prefers-reduced-motion` respecté, contrastes AA sur `--etiquette` / `--fond` (ratio ~12:1, largement conforme).

---

## 4. Modèle de données

### 4.1 Le principe fondateur

**Ne jamais confondre trois choses différentes :**

| Entité | Nature | Exemple |
|---|---|---|
| **Bière** (`beers`) | Un référentiel partagé | La Chouffe 33cl |
| **Dégustation** (`checkins`) | Un événement personnel daté | J'en ai bu une vendredi, je mets 4/5 |
| **Achat** (`purchases`) | Une transaction datée avec un prix | J'ai acheté un pack de 6 à 11,40 € au Leclerc mardi |

**Pourquoi c'est critique :** tu achètes un pack de 6 le mardi et tu le bois sur deux semaines. Si tu fusionnes achat et dégustation, soit tes stats de conso comptent 6 bières le mardi, soit tes stats de dépenses sont fausses. Dans les deux cas le compteur ne sert plus à rien.

Un `checkin` peut pointer vers un `purchase` (lien facultatif), ce qui permet de calculer un coût par dégustation quand l'info existe.

### 4.2 Schéma relationnel

```
breweries ──< beers ──< checkins >── users
                │           │
                │           └──> purchases >── stores
                │                    │
                └──< beer_availability >──┘

lists ──< list_items >── beers
lists ── users
```

### 4.3 Tables

#### `users`
Géré par Supabase Auth, table `profiles` en complément.

| Colonne | Type | Note |
|---|---|---|
| `id` | uuid PK | = `auth.users.id` |
| `pseudo` | text unique | |
| `avatar_url` | text | |
| `created_at` | timestamptz | |

#### `breweries`

| Colonne | Type | Note |
|---|---|---|
| `id` | uuid PK | |
| `name` | text | |
| `country` | text | code ISO |
| `logo_url` | text | |

#### `beers` — le référentiel

| Colonne | Type | Note |
|---|---|---|
| `id` | uuid PK | |
| `barcode` | text unique nullable | null pour les pressions et les artisanales |
| `name` | text NOT NULL | |
| `brewery_id` | uuid FK | nullable |
| `style` | text | IPA, Pils, Triple, Stout… |
| `abv` | numeric(4,2) | degré d'alcool |
| `format_ml` | enum | `250` \| `330` \| `440` \| `500` — contraint, pas de saisie libre |
| `image_url` | text | |
| `off_id` | text | traçabilité Open Food Facts |
| `source` | enum | `openfoodfacts` \| `manual` |
| `created_by` | uuid FK users | |
| `created_at` | timestamptz | |

> Contrainte d'unicité : `barcode` quand il existe, sinon un index unique sur `(lower(name), brewery_id, volume_ml)` pour limiter les doublons de saisie manuelle.

#### `checkins` — le cœur de l'app

| Colonne | Type | Note |
|---|---|---|
| `id` | uuid PK | |
| `user_id` | uuid FK | |
| `beer_id` | uuid FK | |
| `rating` | numeric(2,1) | 0.5 → 5.0 par pas de 0.5 (échelle Letterboxd) |
| `comment` | text | |
| `photo_url` | text | |
| `consumed_at` | timestamptz | **saisissable**, ≠ `created_at` |
| `quantity_ml` | int | permet de gérer pinte / demi / bouteille |
| `context` | enum | `maison` \| `dehors` \| `soiree` \| `festival` \| `autre` |
| `purchase_id` | uuid FK nullable | lien vers l'achat |
| `created_at` | timestamptz | |

> `rating` doit être **nullable** : on veut pouvoir logger une conso sans la noter (le compteur et le carnet de notes ne servent pas le même usage).

#### `purchases`

| Colonne | Type | Note |
|---|---|---|
| `id` | uuid PK | |
| `user_id` | uuid FK | |
| `beer_id` | uuid FK | |
| `store_id` | uuid FK nullable | |
| `total_price_cents` | int | prix payé **en centimes, jamais en float** |
| `pack_size` | int | canettes par lot : 1, 4, 6, 12, 24 |
| `pack_count` | int | nombre de lots achetés |
| `purchased_at` | date | |

#### `stores`

| Colonne | Type | Note |
|---|---|---|
| `id` | uuid PK | |
| `chain` | text | Carrefour, Leclerc, Super U, Auchan, Lidl, cave… |
| `name` | text | « Leclerc Mérignac » |
| `city` | text | |
| `postal_code` | text | |
| `lat` / `lng` | numeric | optionnel, pour un « près de moi » plus tard |

#### `beer_availability` — la feature d'Owen

| Colonne | Type | Note |
|---|---|---|
| `id` | uuid PK | |
| `beer_id` | uuid FK | |
| `store_id` | uuid FK | |
| `reported_by` | uuid FK users | |
| `last_seen_at` | date | |
| `price_cents` | int nullable | dernier prix constaté |
| `in_stock` | boolean | permet de signaler une rupture |

> Un `UNIQUE (beer_id, store_id)` avec mise à jour de `last_seen_at` à chaque signalement. Affiche l'ancienneté : « vue il y a 3 jours » est utile, « vue il y a 8 mois » est une information différente.

#### `lists` / `list_items`

| `lists` | Type |
|---|---|
| `id` | uuid PK |
| `user_id` | uuid FK |
| `title` | text |
| `description` | text |
| `is_public` | boolean |

| `list_items` | Type |
|---|---|
| `list_id` | uuid FK |
| `beer_id` | uuid FK |
| `position` | int |
| `note` | text |

> La wishlist (« à goûter ») est simplement une liste système, pas une table dédiée.

#### `follows` — V2

`follower_id` / `followed_id`, PK composite.

### 4.4 Vues d'agrégation

À créer en vues Postgres (puis en vues matérialisées si ça rame, ce qui n'arrivera pas avant longtemps à votre échelle) :

- **`beer_stats`** : `beer_id`, `avg_rating`, `checkin_count`, `distinct_drinkers`, `avg_price_cents`
- **`user_weekly_stats`** : `user_id`, `week`, `total_ml`, `checkin_count`, `total_spent_cents`, `avg_rating_given`
- **`user_totals`** : totaux carrière, nombre de bières distinctes, style favori

### 4.5 Points d'attention

**« Classement » veut dire deux choses.** À trancher avec le groupe :
- classement **des bières** (par note moyenne) — attention à la moyenne bayésienne, une bière notée 5/5 par une seule personne ne doit pas dominer le top ;
- classement **des utilisateurs** (nb de check-ins, diversité de styles, exploration) — c'est le levier de gamification, mais si le score récompense la quantité bue, c'est un design discutable. Récompenser la **diversité** plutôt que le volume est plus sain et plus intéressant.

**Prix en centimes (entiers).** Jamais de `float` sur de la monnaie.

**RLS Supabase dès le début.** Active la Row Level Security sur toutes les tables au premier sprint. La rajouter après coup sur une base déjà remplie, c'est douloureux.

**Doublons de bières.** Inévitable avec de la saisie manuelle. Prévois un écran admin de fusion dès que vous dépassez ~100 bières.

---

## 5. Backlog

### 5.1 Epics

| # | Epic | Enjeu |
|---|---|---|
| E1 | Socle & authentification | Pouvoir se connecter, exister dans l'app |
| E2 | Référentiel bières | Alimenter la base sans friction |
| E3 | Dégustation & notation | Le cœur du produit |
| E4 | Suivi conso & dépenses | Le différenciateur n°1 |
| E5 | Classements & stats | La rétention |
| E6 | Disponibilité en enseigne | Le différenciateur n°2 |
| E7 | Social | Le liant du groupe |

### 5.2 User stories

Priorisation MoSCoW : **M** = Must (MVP), **S** = Should, **C** = Could, **W** = Won't (pas cette version).

#### E1 — Socle & authentification

| ID | Story | Prio |
|---|---|---|
| E1-1 | En tant que visiteur, je veux créer un compte avec email + mot de passe afin d'accéder à l'app | **M** |
| E1-2 | En tant qu'utilisateur, je veux choisir un pseudo et un avatar afin d'être identifiable par le groupe | **M** |
| E1-3 | En tant qu'utilisateur, je veux installer l'app sur mon écran d'accueil afin d'y accéder comme une app native | **M** |
| E1-4 | En tant qu'utilisateur, je veux naviguer d'une seule main afin d'utiliser l'app debout dans un rayon | **M** |
| E1-5 | En tant qu'utilisateur, je veux enregistrer une dégustation sans réseau afin de ne rien perdre en cave ou en rayon | **M** |
| E1-6 | En tant qu'utilisateur, je veux me connecter via Google afin d'éviter un mot de passe de plus | **S** |
| E1-7 | En tant qu'admin, je veux inviter par lien afin de garder le groupe fermé | **S** |

**Critères d'acceptation E1-4 :**
- Toutes les actions primaires sont atteignables dans le tiers inférieur de l'écran.
- Aucune cible tactile sous 48 px.
- Aucun menu hamburger, aucune navigation en haut d'écran.
- L'app est utilisable sans défaut d'affichage à partir de 375 px de large.

**Critères d'acceptation E1-5 :**
- En mode avion, un check-in est accepté et confirmé visuellement.
- Il est synchronisé automatiquement au retour du réseau, sans action de l'utilisateur.
- Un indicateur discret montre les éléments en attente de synchronisation.

#### E2 — Référentiel bières

| ID | Story | Prio |
|---|---|---|
| E2-1 | En tant qu'utilisateur, je veux scanner un code-barres afin de retrouver la bière sans rien taper | **M** |
| E2-2 | En tant qu'utilisateur, je veux que la fiche se pré-remplisse depuis Open Food Facts afin de ne saisir que ce qui manque | **M** |
| E2-3 | En tant qu'utilisateur, je veux créer une canette à la main afin de logger une micro-brasserie absente d'OFF | **S** |
| E2-4 | En tant qu'utilisateur, je veux rechercher une bière par nom afin de la retrouver sans scanner | **M** |
| E2-5 | En tant qu'utilisateur, je veux corriger une fiche incomplète afin d'améliorer la base commune | **S** |
| E2-6 | En tant qu'utilisateur, je veux prendre une photo de l'étiquette afin d'illustrer une bière absente d'OFF | **S** |
| E2-7 | En tant qu'admin, je veux fusionner deux fiches doublons afin de garder la base propre | **C** |

**Critères d'acceptation E2-1 :**
- Le scan fonctionne sur Chrome Android et Safari iOS.
- Un code inconnu d'OFF bascule automatiquement vers le formulaire de création pré-rempli avec le code-barres.
- Une erreur d'accès caméra affiche un message clair avec un lien vers la saisie manuelle.
- Temps entre l'ouverture de la caméra et la fiche affichée : < 3 s en conditions normales.

#### E3 — Dégustation & notation

| ID | Story | Prio |
|---|---|---|
| E3-1 | En tant qu'utilisateur, je veux noter une bière de 0,5 à 5 étoiles afin d'exprimer mon avis | **M** |
| E3-2 | En tant qu'utilisateur, je veux ajouter un commentaire libre afin de préciser mon ressenti | **M** |
| E3-3 | En tant qu'utilisateur, je veux enregistrer une dégustation sans la noter afin de simplement compter ma conso | **M** |
| E3-4 | En tant qu'utilisateur, je veux modifier la date de dégustation afin de rattraper une soirée non loggée | **M** |
| E3-5 | En tant qu'utilisateur, je veux choisir le format (25 / 33 / 44 / 50 cl) en un tap afin que ma conso soit juste | **M** |
| E3-6 | En tant qu'utilisateur, je veux consulter l'historique de mes dégustations d'une bière afin de voir si mon avis a évolué | **S** |
| E3-7 | En tant qu'utilisateur, je veux ajouter une photo à ma dégustation afin d'illustrer le moment | **S** |
| E3-8 | En tant qu'utilisateur, je veux noter sur plusieurs critères (amertume, corps, arômes) afin d'être plus précis | **C** |

**Critères d'acceptation E3-1 :**
- Échelle de 0,5 à 5 par pas de 0,5.
- La note est modifiable et supprimable après coup.
- La moyenne de la bière se recalcule immédiatement à l'affichage.
- Le parcours complet « scan → note → validé » tient en moins de 15 secondes et 3 taps.

#### E4 — Suivi conso & dépenses

| ID | Story | Prio |
|---|---|---|
| E4-1 | En tant qu'utilisateur, je veux enregistrer un achat avec prix, quantité et enseigne afin de suivre mon budget | **M** |
| E4-2 | En tant qu'utilisateur, je veux voir ma dépense totale sur une période afin de savoir ce que ça me coûte | **M** |
| E4-3 | En tant qu'utilisateur, je veux voir ma dépense moyenne par semaine afin de situer mon rythme | **M** |
| E4-8 | En tant qu'utilisateur, je veux voir le prix au litre de chaque canette afin de comparer un pack de 6 en 33cl à une 50cl à l'unité | **M** |
| E4-4 | En tant qu'utilisateur, je veux voir un graphique de ma conso dans le temps afin de repérer les tendances | **S** |
| E4-5 | En tant qu'utilisateur, je veux rattacher une dégustation à un achat afin de connaître le coût réel du verre | **S** |
| E4-6 | En tant qu'utilisateur, je veux comparer le prix payé au prix moyen constaté afin de savoir si j'ai bien acheté | **C** |
| E4-7 | En tant qu'utilisateur, je veux exporter mes données en CSV afin de les garder | **C** |

**Critères d'acceptation E4-3 :**
- La moyenne se calcule sur les semaines réellement actives, pas depuis l'inscription (sinon un mois d'inactivité fausse tout).
- Filtres : 30 jours / 3 mois / 1 an / tout.
- Zéro donnée = un état vide explicite, pas un « 0,00 € » trompeur.

#### E5 — Classements & stats

| ID | Story | Prio |
|---|---|---|
| E5-1 | En tant qu'utilisateur, je veux voir la note moyenne d'une bière sur le groupe afin de savoir ce qu'en pensent les autres | **M** |
| E5-2 | En tant qu'utilisateur, je veux voir le top des bières du groupe afin de trouver quoi goûter | **M** |
| E5-3 | En tant qu'utilisateur, je veux voir mon propre top afin d'avoir mon palmarès | **M** |
| E5-4 | En tant qu'utilisateur, je veux voir un classement du groupe (bières distinctes, styles explorés) afin d'avoir un défi entre nous | **S** |
| E5-5 | En tant qu'utilisateur, je veux filtrer les classements par style afin de trouver la meilleure IPA | **S** |
| E5-6 | En tant qu'utilisateur, je veux des recommandations basées sur mes goûts afin de découvrir | **C** |
| E5-7 | En tant qu'utilisateur, je veux un récap annuel façon Wrapped afin de le partager | **C** |

> Sur E5-2, applique une **moyenne bayésienne** : une bière notée 5/5 une seule fois ne doit pas devancer une bière à 4,3/5 notée douze fois. Formule simple : `(v/(v+m))·R + (m/(v+m))·C` où `v` = nb de notes, `m` = seuil minimum (ex. 3), `R` = moyenne de la bière, `C` = moyenne globale.

#### E6 — Disponibilité en enseigne

| ID | Story | Prio |
|---|---|---|
| E6-1 | En tant qu'utilisateur, je veux signaler avoir vu une bière dans une enseigne afin d'aider le groupe | **S** |
| E6-2 | En tant qu'utilisateur, je veux voir où une bière a été vue et à quel prix afin de savoir où l'acheter | **S** |
| E6-3 | En tant qu'utilisateur, je veux voir la fraîcheur de l'info (« vue il y a 5 jours ») afin de juger sa fiabilité | **S** |
| E6-4 | En tant qu'utilisateur, je veux signaler une rupture afin d'éviter un déplacement inutile | **C** |
| E6-5 | En tant qu'utilisateur, je veux voir les enseignes proches de moi afin de filtrer | **C** |

> Le remplissage automatique lors d'un achat (E4-1 alimente E6-1 sans saisie supplémentaire) est le levier clé : cette feature ne vivra que si elle ne coûte rien à l'utilisateur.

#### E7 — Social

| ID | Story | Prio |
|---|---|---|
| E7-1 | En tant qu'utilisateur, je veux voir un feed des dégustations du groupe afin de suivre ce que boivent les autres | **S** |
| E7-2 | En tant qu'utilisateur, je veux réagir à une dégustation afin d'interagir | **C** |
| E7-3 | En tant qu'utilisateur, je veux créer des listes thématiques afin de partager mes sélections | **C** |
| E7-4 | En tant qu'utilisateur, je veux débloquer des badges afin d'avoir un objectif | **C** |
| E7-5 | En tant qu'utilisateur, je veux suivre certains membres afin de filtrer mon feed | **W** |

### 5.3 Découpage suggéré

En solo et sur du temps libre, compte **4 à 6 semaines de travail effectif** pour arriver au bout du sprint 4.

| Sprint | Contenu | Objectif de fin |
|---|---|---|
| **1** | E1-1 → E1-5, socle Supabase, schéma BDD, RLS, tokens Tailwind, navigation basse | Je me connecte, la base existe, l'app s'installe sur le téléphone et la coquille mobile est en place |
| **2** | E2-1 → E2-4 | Je scanne une bière et sa fiche s'affiche |
| **3** | E3-1 → E3-5, E5-1 | Je note une bière et je vois la moyenne du groupe |
| **4** | E4-1 → E4-3, E5-2, E5-3 | Je suis mon budget et je vois les classements |
| **5** | E6-1 → E6-3, E7-1 | Les enseignes et le feed |
| **6+** | Le reste selon usage réel | |

**Fin du sprint 4 = MVP diffusable au groupe.** N'attends pas plus pour le donner à tester : les features des sprints 5+ doivent être arbitrées sur l'usage réel, pas sur les intuitions de départ.

---

## 6. Décisions à trancher avec le groupe

1. **Le « classement » désigne quoi ?** Bières, personnes, ou les deux ? Si c'est les personnes, sur quel critère — volume ou diversité ?
2. **App fermée ou publique ?** Toute cette spec suppose un groupe fermé. Ouvrir au public change la modération, la qualité des données et la charge de travail.
3. **Le suivi de dépenses est-il individuel ou partagé ?** Voir le budget bière des copains, ce n'est pas anodin. Prévois au minimum un réglage de visibilité.
4. **Le nom.** « Ta Cannouche » ou « Cannouche » tout court ? Le second se prête mieux à un logo et à un nom de domaine, le premier est plus drôle à l'oral. À trancher par le groupe, c'est leur app.
5. **Qui gère les doublons** quand la base sera sale ?

---

## 7. Risques identifiés

| Risque | Impact | Mitigation |
|---|---|---|
| Le scan ne marche pas bien sur iOS | Élevé — c'est la feature d'entrée | Tester `@zxing/library` sur un vrai iPhone dès le sprint 2, pas en fin de projet |
| Données Open Food Facts incomplètes | Moyen | Saisie manuelle assumée dès le MVP, pas en rattrapage |
| Réseau absent en rayon ou en cave | Élevé — un check-in perdu n'est jamais ressaisi | File d'attente locale + interface optimiste dès le sprint 1, pas en optimisation finale |
| Interface pensée desktop puis « rétrécie » | Moyen | Développer et tester dans un viewport 375 px par défaut ; n'ouvrir le desktop qu'en fin de sprint |
| Le groupe ne l'utilise pas après 2 semaines | Élevé | Livrer au sprint 4, pas au sprint 8. Le feed (E7-1) est le principal levier de rétention — envisager de le remonter |
| Projet solo qui s'enlise | Élevé | Scope verrouillé sur les Must. Tout le reste attend le retour d'usage |
