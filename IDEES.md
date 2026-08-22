# Idées — améliorations & fonctionnalités

> Réservoir d'idées à arbitrer selon l'usage réel du groupe. Rien ici n'est
> engagé : on pioche quand une idée fait consensus. Ajoute librement.

## Priorité proposée

Logique : d'abord ce qui **remplit la base** (sans données, rien ne vit), puis ce
qui rend l'app **vivante socialement** (rétention), puis les **différenciateurs**,
enfin le confort. Les retours du groupe pointent tous vers la saisie facile → P1.

1. ~~**P1 — Saisie sans friction**~~ ✅ **fait** : catalogue parcourable, ajout
   manuel d'une canette absente, et case « déjà goûtée avant » (hors feed).
2. ~~**P2 — Vie sociale (quick wins)**~~ ✅ **fait** : avis du groupe sur la fiche,
   home « bières du moment ».
3. **P3 — Différenciateurs (specs)** ← *prochain* : disponibilité en enseigne (E6),
   évolution des prix.
4. **P4 — Social & profil** : stats des potes, avatar/édition de profil, réactions,
   suivre des membres.
5. **P5 — Engagement** : roulette, événements, badges, Wrapped.
6. **P6 — Confort & technique** : tags de style, filtres de classement, export CSV,
   multi-critères, photo hors-ligne, stores (Capacitor), groupes privés.

## Accès & groupe
- **Invitation par lien** (E1-7) : garder le groupe fermé proprement — lien
  d'invitation à usage unique / allowlist d'emails, plutôt que de couper
  l'inscription à la main. Alternative plus souple que `enable_signup = false`.
- **Groupes privés** : si l'app s'ouvre au public, permettre de créer plusieurs
  groupes fermés (chacun son cercle, feed / classements limités au groupe).
  Chantier structurant : ajoute une notion de groupe + appartenance dans le
  modèle de données et la RLS.
- **Rôle admin léger** : pouvoir retirer un compte, fusionner des doublons.

## Profil
- **Modifier son profil** : changer pseudo et **avatar** (upload + compression,
  comme les photos de dégustation). Aujourd'hui l'avatar est une initiale.
- **Statistiques perso enrichies** : style favori, brasserie la plus bue,
  évolution de la note moyenne donnée.

## Social (sprint 5)
- ~~**Avis du groupe sur la fiche bière**~~ ✅ **fait** : section « Avis du groupe »
  (commentaires des autres membres, note + photo + date). Reste possible : tri par
  membres les plus suivis quand il y aura un système de suivi.
- ~~**Home découverte « bières du moment »**~~ ✅ **fait** : rangée des canettes du
  moment sur l'accueil, au-dessus de l'activité récente.
- **Voir et comparer les stats de ses potes** *(retour groupe)* : consulter le
  profil et les stats des autres membres (« tu vois les stats de tes potes et les
  tiennes »). Suppose des profils consultables.
- **Réactions** sur une dégustation du feed (E7-2).
- **Listes thématiques** partagées (« Mon top été », « À faire goûter ») (E7-3).
- **Badges** / objectifs (E7-4).
- **Suivre certains membres** pour filtrer le feed (E7-5, marqué Won't v1).
- **Roulette « Qu'est-ce qu'on boit ce soir ? »** : tirage aléatoire d'une canette
  pour trancher les indécis (parmi tout le référentiel, une wishlist, ou les
  mieux notées du groupe).
- **Onglet événements** : proposer et organiser des rencontres, dégustations à
  l'aveugle, concours entre membres — avec inscriptions / présence.

## Disponibilité en enseigne (E6, sprint 5)
- Signaler « vue au Leclerc X à Y € », alimenté automatiquement par la saisie
  d'achat. Affichage « vue il y a N jours ». Filtre « près de moi ».

## Classements & stats
- **Filtrer les classements par style** (meilleure IPA, etc.) (E5-5).
- **Récap annuel façon Wrapped** à partager (E5-7).
- **Classement des membres** par diversité (canettes/styles explorés) plutôt que
  par volume — plus sain (décision ouverte des specs).
- **Recommandations** basées sur les goûts (E5-6).

## Référentiel & recherche
- ~~**Noter direct depuis le catalogue, sans scanner**~~ ✅ **fait** : catalogue
  parcourable dans l'onglet Recherche + bouton « Ajouter une canette à la main »
  pour les canettes absentes (goûtées avant l'appli).
- ~~**Distinction log récent / déjà goûté avant**~~ ✅ **fait** : case « Je l'avais
  déjà goûtée avant » → comptée dans notes/collection/totaux, exclue du feed et du
  graphique de conso.
- ~~**Fusion des doublons (admin)**~~ ✅ **fait** : écran `/admin/doublons` réservé
  aux admins pour fusionner deux fiches d'une même canette.
- **Prévention des doublons à la création** : quand on ajoute/scanne une canette,
  suggérer les fiches existantes proches (nom/marque) pour éviter d'en recréer une
  déjà présente (ex. « 8.6 cherry » vs « 86 Cherry »). Complète la fusion, en amont.
- **Liste « à ne pas racheter »** *(retour groupe)* : marquer une canette goûtée
  qu'on ne veut pas reprendre (avec photo), pour s'en souvenir en rayon (ex. « 86
  black »). Peut se faire via une note basse + une liste système « à éviter ».
- **Tags de style pour la recherche** : filtrer/chercher par type (blonde, brune,
  lager, IPA, triple…). Suppose de normaliser le champ `style` (liste de tags
  plutôt que texte libre) et de l'exposer dans la barre de recherche.

## Données & confort
- **Évolution du prix d'une canette** : graphique du prix (au litre) dans le temps,
  à partir des achats et des signalements en enseigne — repérer les hausses,
  savoir où et quand acheter.
- **Export CSV** de ses dégustations et achats (E4-7).
- **Notation multi-critères** (amertume, corps, arômes) (E3-8).
- **Comparer prix payé vs prix moyen constaté** (E4-6).
- **Photo hors-ligne** : mettre l'image en file IndexedDB pour l'uploader au
  retour du réseau (aujourd'hui la dégustation part sans la photo si pas de réseau).
- **Création de bière hors-ligne** : file complète (bière + dégustation + gestion
  des doublons) si le cas « zéro réseau + canette inconnue » gêne à l'usage.

## Technique / plus tard
- **Publication sur les stores (Android + iOS)** via Capacitor : empaqueter la
  même base de code en app native. ⚠️ classée 17+/18+ (suivi d'alcool), formulaire
  de conformité à remplir à la première soumission.
- **Bucket photos privé** + URLs signées si on veut resserrer la confidentialité.
- **Confirmation d'email** via un vrai SMTP (Resend) si on ouvre au-delà du groupe.
