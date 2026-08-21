# Ta Cannouche — Contexte projet

> Ce fichier est le point d'entrée du projet. Lis-le en entier au début de chaque session, ainsi que `JOURNAL.md` pour savoir où en est le travail. Les spécifications détaillées sont dans `SPECS.md`, les tâches dans `TACHES.md`.

---

## 1. Contexte

**Qui je suis.** Louis, Scrum Master / PMO Agile en alternance. Je suis à l'aise avec la conduite de projet, le découpage en backlog et les environnements techniques, mais **je ne suis pas développeur de métier**. J'ai déjà construit et exploité un site e-commerce de bout en bout, donc les bases ne sont pas à réexpliquer — en revanche, je veux comprendre ce que je déploie. Du code que je ne peux pas relire est du code que je ne pourrai pas maintenir.

**D'où vient le projet.** Un groupe d'amis veut une app pour noter les bières qu'on boit, avec un suivi de conso et de dépenses. Les features de départ ont été listées par Owen dans une conversation de groupe. Ce n'est pas un projet client : c'est un outil pour nous, développé en solo, sur du temps libre.

**Conditions de travail.** Sessions courtes et espacées, menées en parallèle d'un mémoire à rendre. Le travail doit donc être **incrémental et reprenable** : chaque session doit se terminer sur un état fonctionnel, jamais sur un chantier ouvert. Une tâche à moitié faite qui reste en plan trois semaines est une tâche perdue.

---

## 2. But du projet

Livrer une **application web mobile-first, utilisable par 5 à 20 amis**, qui permet de :

1. scanner une canette de bière et retrouver sa fiche automatiquement ;
2. la noter et la commenter ;
3. suivre sa consommation et ses dépenses dans le temps ;
4. voir les classements du groupe ;
5. savoir dans quelle enseigne telle canette a été vue, et à quel prix.

**Objectif de la première version :** que le groupe l'utilise réellement pendant un mois. Pas qu'elle soit complète — qu'elle soit adoptée. Le MVP diffusable correspond à la fin du sprint 4 (voir `TACHES.md`).

**Ce que le projet n'est pas :** ni une plateforme publique, ni un concurrent d'Untappd. Untappd existe déjà et fait très bien le catalogue social. Notre valeur tient dans deux choses qu'il ne fait pas : **le suivi budgétaire** et **la dispo en grande surface française**.

---

## 3. Périmètre

### Dans le périmètre
- Canettes de bière uniquement : formats 25, 33, 44 et 50 cl
- Scan de code-barres comme voie d'entrée principale
- Notation, commentaire, photo
- Suivi de conso et de dépenses, avec prix au litre
- Classements bières et membres
- Signalement de disponibilité en enseigne

### Hors périmètre — à refuser explicitement
- **Bouteilles, pressions, fûts, bars.** Ce refus est structurant, pas un oubli : c'est lui qui garantit qu'un code-barres existe toujours et que les formats restent contraints. Si une demande d'évolution le remet en cause, signale-le-moi avant d'implémenter quoi que ce soit.
- Ouverture au public, modération, signalements
- Application native sur les stores (plus tard, via Capacitor, sur la même base de code)
- Recommandations algorithmiques, IA, social graph élaboré

---

## 4. Spécifications attendues

Les specs complètes sont dans **`SPECS.md`**. Les points sur lesquels tu ne dois jamais dévier sans me demander :

### 4.1 Stack

| Couche | Choix |
|---|---|
| Front | Next.js 16 (App Router) + TypeScript strict |
| Style | Tailwind CSS v4 + shadcn/ui |
| Backend / BDD | Supabase (Postgres, Auth, Storage) |
| Graphiques | Recharts |
| Hébergement | Vercel + Supabase cloud |
| Données bières | API Open Food Facts (publique, sans clé) |

### 4.2 Règles de modélisation non négociables

- **Un achat n'est pas une dégustation.** Deux tables distinctes, liées de façon facultative. Fusionner les deux casse soit les stats de conso, soit celles de dépenses.
- **Tous les montants en centimes, en entiers.** Jamais de `float` sur de la monnaie.
- **`rating` est nullable.** On doit pouvoir logger une conso sans la noter.
- **RLS activée sur toutes les tables dès la première migration.** La rajouter plus tard sur une base remplie est douloureux.
- **`format_ml` est un enum contraint**, pas un champ libre.

### 4.3 Règles d'interface

- **Mobile-first strict.** On développe et on teste dans un viewport de **375 px**. Le desktop est un cas dégradé traité en fin de tâche, jamais le point de départ.
- **Navigation basse à 5 onglets**, scan au centre. Aucun menu hamburger, aucune action primaire en haut d'écran.
- **Cibles tactiles à 48 px minimum.**
- **Aucun tableau de données** dans l'UI : listes de cartes.
- **Feuilles remontantes** (`Drawer` de shadcn) plutôt que modales centrées.
- **Safe areas iOS** prises en compte sur la barre basse.
- **Aucune couleur en dur.** Tout passe par les tokens Tailwind définis en 4.4.

### 4.4 Tokens de design

```
--alu-fond       #14171A   fond général
--alu-surface    #1E2227   cartes, feuilles
--alu-brosse     #C9CED4   texte principal
--alu-mat        #7C848C   texte secondaire
--serigraphie    #F25C1F   accent d'action, unique
--condensation   #4FB3A5   états positifs, statuts uniquement
```

Polices : **Archivo Expanded** (display) · **Public Sans** (texte) · **IBM Plex Mono** (chiffres, prix, dates).

Élément signature : **la languette de canette**. Elle sert d'anneau de notation, de puce dans les classements, et de vignette de collection sur le profil.

---

## 5. Conventions de code

- **Code, noms de variables, tables et commentaires en anglais. Interface et contenus en français.** Pas de franglais dans le code.
- TypeScript strict, **`any` interdit**. Les types de la base sont générés depuis Supabase, jamais écrits à la main.
- Composants serveur par défaut ; `"use client"` uniquement quand un état ou un événement l'exige.
- **Un fichier au-delà de 200 lignes se découpe.**
- Les appels à Supabase passent par `src/lib/` , jamais directement depuis un composant de page.
- Migrations SQL versionnées dans `supabase/migrations/`, nommées `NNN_description.sql`. On ne modifie jamais une migration déjà appliquée : on en ajoute une nouvelle.
- Un commit par tâche, message en français à l'impératif : « Ajoute la navigation basse ».

## 6. Structure du dépôt

```
ta-cannouche/
├── CLAUDE.md              ce fichier
├── SPECS.md               spécifications détaillées
├── TACHES.md              backlog opérationnel
├── JOURNAL.md             état d'avancement, à tenir à jour
├── .env.local.example
├── supabase/
│   └── migrations/
└── src/
    ├── app/               routes App Router
    ├── components/        composants réutilisables
    │   └── ui/            shadcn
    ├── lib/               accès données, clients, helpers
    └── types/             types générés
```

---

## 7. Comment travailler avec moi

**Avant d'écrire du code :**
- Sur une tâche non triviale, **propose d'abord un plan court** (fichiers touchés, approche, points d'incertitude) et attends ma validation. Ne pars pas sur 300 lignes sans accord.
- **Ne jamais ajouter une dépendance sans me demander**, en justifiant pourquoi la stack existante ne suffit pas.
- Si une spec est ambiguë ou te semble mauvaise, **dis-le avant de coder**. Je préfère un désaccord argumenté à une implémentation silencieuse d'une idée bancale.

**Pendant :**
- Une tâche à la fois, dans l'ordre de `TACHES.md`.
- Explique les choix non évidents en une ou deux phrases. Pas de cours magistral, mais pas de boîte noire non plus.
- Signale ce que tu n'as pas pu tester toi-même et ce que je dois vérifier sur un vrai téléphone.

**En fin de session :**
- Mets `JOURNAL.md` à jour : ce qui est fait, ce qui reste, les décisions prises, les points bloquants.
- Laisse le projet dans un état qui compile et qui démarre.

**Ton.** Direct et concis. Pas de félicitations de politesse, pas de récapitulatif de ce que je viens de dire. Si quelque chose est une mauvaise idée, dis-le franchement.

---

## 8. Garde-fous

- **Aucune clé, aucun secret dans le code ou dans un commit.** Tout passe par `.env.local`, avec `.env.local.example` tenu à jour.
- La clé `service_role` de Supabase ne doit **jamais** apparaître côté client.
- **Aucune migration destructive** (`DROP`, `TRUNCATE`, suppression de colonne) sans me prévenir explicitement et sans sauvegarde préalable.
- Ne modifie ni `SPECS.md` ni `CLAUDE.md` de ta propre initiative : propose la modification, je tranche.
- Rappel de conformité : une app qui suit la consommation d'alcool sera classée 17+/18+ le jour d'une soumission sur les stores. Ne pas s'en préoccuper maintenant, ne pas l'oublier plus tard.

---

## 9. Définition de terminé

Une tâche est terminée quand :

1. la fonctionnalité marche dans un viewport 375 px ;
2. elle marche aussi à 1024 px sans être cassée ;
3. le typage passe (`tsc --noEmit`) et le build passe ;
4. aucune couleur ni aucun secret en dur ;
5. les cibles tactiles font au moins 48 px ;
6. `JOURNAL.md` est à jour.
