# À traiter au retour

> Fichier tenu pendant la session autonome du 2026-08-21. Chaque point est une
> erreur, un blocage, un raccourci assumé ou une décision incertaine à valider.
> Rien ici n'est bloquant pour l'aperçu ; tout est réversible.

## Légende
- 🔴 **Bloquant** : empêche une fonctionnalité de marcher, à traiter en priorité.
- 🟠 **À décider** : un choix a été fait par défaut, à confirmer ou infirmer.
- 🟡 **Raccourci** : implémentation partielle / données de démo à remplacer.
- 🔵 **Info** : à savoir, pas d'action requise.

---

## Points ouverts

<!-- Les entrées sont ajoutées au fil de la session, plus récentes en bas. -->

### 🔵 Activer Analytics + Speed Insights côté Vercel
Le code est en place (`<Analytics />` + `<SpeedInsights />` dans le layout), mais
il faut **activer** les deux dans le dashboard Vercel pour voir les données :
- Projet → onglet **Analytics** → *Enable Web Analytics*
- Projet → onglet **Speed Insights** → *Enable*
Gratuit sur le plan Hobby (avec des limites). Sans activation, les composants ne
collectent rien (pas d'erreur, juste pas de data).

### 🟢 GitHub + Vercel — faits
Dépôt poussé sur https://github.com/LinskensLouis/ta-cannouche (le README
auto-généré par GitHub a été fusionné en gardant le nôtre). Déployé sur
**https://ta-cannouche.vercel.app** (2 variables publiques, pas de service_role).
`site_url` Supabase calé sur la prod. Identifiants GitHub en cache : je peux
pousser directement les prochains correctifs.
**Reste : le test terrain sur Android** (checklist dans `DEPLOY.md`).

### 🟠 Confirmation d'email désactivée (S1-07)
La confirmation d'email était **activée** par défaut sur le projet Supabase, et le
service email intégré est plafonné à ~2 envois/heure → les inscriptions
échouaient en `429 email rate limit exceeded`. Je l'ai **désactivée** via
`supabase config push` (`enable_confirmations = false`, versionné dans
`supabase/config.toml`). Conséquence : n'importe qui avec le lien d'inscription
crée un compte sans vérifier son email. Pour une app de potes fermée c'est le bon
choix ; si tu veux resserrer plus tard, il faudra configurer un SMTP (ex. Resend).
**À décider :** OK pour rester sans confirmation d'email ?

### 🟠 site_url Supabase = localhost
`supabase/config.toml` a `site_url = "http://127.0.0.1:3000"`. Sans effet tant
qu'on n'envoie pas d'emails (confirmation off), mais **à mettre à jour avec l'URL
Vercel** au moment du déploiement (sinon liens de reset de mot de passe / OAuth
casseront). Ligne à changer puis `npx supabase config push`.

### 🔵 PWA — installation à vérifier sur appareil (S1-09)
Manifeste, icônes (motif languette), service worker et balises iOS sont en place
et servis (vérifié en local). L'**installation réelle** (ajout à l'écran d'accueil,
ouverture plein écran sans barre de navigateur) ne se teste que sur un appareil
via HTTPS — donc **après déploiement Vercel**, sur ton iPhone et un Android.
Le service worker n'est enregistré qu'en **production** (il gênerait le hot-reload
en dev).

### 🔵 Scan caméra — à tester sur appareil (S2-01/02)
Le scan par caméra (`BarcodeDetector` natif Android + repli `@zxing/browser`
iOS) est codé mais **non testable ici** (pas de caméra dans l'environnement).
La **saisie manuelle** du code-barres, elle, est testée et fonctionne de bout en
bout (code → Open Food Facts → fiche créée). **À vérifier sur ton iPhone**
(risque n°1 du projet) : ouverture caméra, lecture d'un vrai code-barres,
temps < 3 s jusqu'à la fiche.

### 🟢 Périmètre canettes : filtre bouteilles ajouté (ta reprécision)
À ta demande (canettes uniquement, pas les bouteilles), l'intégration Open Food
Facts **rejette désormais les bières explicitement en bouteille** (via
`packaging_tags` : `en:bottle` / `en:bouteille` sans marqueur canette). Le scan
d'une bouteille affiche « cette bière est vendue en bouteille — Ta Cannouche ne
référence que les canettes ». Testé : bouteille 1664 rejetée, canette 1664 acceptée.
**Limite assumée :** une bière au conditionnement **non renseigné** dans OFF passe
(bénéfice du doute — sinon on rejetterait trop de vraies canettes mal taguées), et
le format reste borné aux 4 tailles de canette. Le formulaire manuel ne propose
aussi que des formats canette. À voir si tu veux durcir (rejeter aussi l'inconnu).

### 🟡 Donnée de test laissée en base
Le parcours a créé une vraie **canette** « 1664 » 33 cl (via Open Food Facts),
laissée comme donnée d'aperçu. L'ancienne « 1664 » qui était en fait une
**bouteille** a été supprimée. Supprime la canette aussi si tu veux une base vierge.

### 🟠 Ajout de bière hors-ligne — décision : reporté (décidé avec Louis)
Sans réseau, le **scan lit bien le code-barres** (local), mais **retrouver ou créer
la canette demande une connexion** (base du groupe + Open Food Facts). Décision :
on **ne construit pas** la création de bière hors-ligne maintenant (ça exigerait
de mettre bière + dégustation en file avec identifiants temporaires et réconciliation
au retour, plus la gestion des doublons). À la place, un **message clair** s'affiche
hors-ligne. À réévaluer selon l'usage réel du groupe : si le cas « zéro réseau +
canette inconnue » gêne vraiment, on fera la file complète.
Rappel connexe : navigation limitée hors-ligne (pages rendues côté serveur ;
seul le feed « / » est mis en cache par le service worker).

### 🟢 File d'attente hors-ligne (S1-10) — faite + corrigée
**Correctif (test terrain Loulou) :** en vrai mode avion, l'app redirigeait après
enregistrement vers la fiche bière (rendue côté serveur) qui ne peut pas se
charger sans réseau → écran cassé. Corrigé : hors-ligne, on n'effectue plus de
navigation serveur, on affiche une confirmation sur place et le bandeau de
synchro. En ligne, comportement inchangé. Re-testé (simulation) : OK.
E1-5 est couvert. Les dégustations passent par une file **IndexedDB**
(`src/lib/offline/`) + un endpoint de rejeu (`/api/checkins`) : interface
optimiste, mise en file si le réseau manque, rejeu automatique au retour
(événement `online`), indicateur discret « X en attente de synchro ». Testé en
simulant une panne réseau : dégustation mise en file → retour réseau → insérée
sans action. **À revalider sur un vrai téléphone en mode avion** (le vrai test
terrain). Note : seules les **dégustations** passent par la file ; les **achats**
restent en ligne (moins critiques, on les saisit rarement sans réseau).

### 🟢 Photo de dégustation (S3-06) — faite
Bucket Storage `checkin-photos` (public en lecture, écriture réservée au dossier
`<user_id>/` de chacun), compression client à ~1200 px avant upload, affichage
dans le feed et l'historique. **Deux limites à connaître :**
- 🟠 **Bucket public** : n'importe qui avec l'URL d'une photo peut la voir (pas
  d'énumération, mais URL devinable = non). Acceptable pour un groupe fermé ; si
  tu veux resserrer, passer en bucket privé + URLs signées.
- 🟠 **Photo non mise en file hors-ligne** : contrairement à la dégustation
  elle-même, l'upload de la photo exige le réseau. Sans réseau, la dégustation est
  enregistrée **sans** la photo (message affiché). Mettre l'image en file
  IndexedDB serait faisable mais alourdit ; à voir selon l'usage réel.

### 🟡 Utilisateur de test à supprimer
Un compte `louis.ui.test@example.invalid` a été créé pour tester l'UI d'auth et
laissé connecté dans le navigateur de preview afin de visualiser les pages
protégées pendant le build. À supprimer au retour (Dashboard → Authentication →
Users), ou dis-moi et je le retire.
