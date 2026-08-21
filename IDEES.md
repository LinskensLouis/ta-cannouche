# Idées — améliorations & fonctionnalités

> Réservoir d'idées à arbitrer selon l'usage réel du groupe. Rien ici n'est
> engagé : on pioche quand une idée fait consensus. Ajoute librement.

## Accès & groupe
- **Invitation par lien** (E1-7) : garder le groupe fermé proprement — lien
  d'invitation à usage unique / allowlist d'emails, plutôt que de couper
  l'inscription à la main. Alternative plus souple que `enable_signup = false`.
- **Rôle admin léger** : pouvoir retirer un compte, fusionner des doublons.

## Profil
- **Modifier son profil** : changer pseudo et **avatar** (upload + compression,
  comme les photos de dégustation). Aujourd'hui l'avatar est une initiale.
- **Statistiques perso enrichies** : style favori, brasserie la plus bue,
  évolution de la note moyenne donnée.

## Social (sprint 5)
- **Réactions** sur une dégustation du feed (E7-2).
- **Listes thématiques** partagées (« Mon top été », « À faire goûter ») (E7-3).
- **Badges** / objectifs (E7-4).
- **Suivre certains membres** pour filtrer le feed (E7-5, marqué Won't v1).

## Disponibilité en enseigne (E6, sprint 5)
- Signaler « vue au Leclerc X à Y € », alimenté automatiquement par la saisie
  d'achat. Affichage « vue il y a N jours ». Filtre « près de moi ».

## Classements & stats
- **Filtrer les classements par style** (meilleure IPA, etc.) (E5-5).
- **Récap annuel façon Wrapped** à partager (E5-7).
- **Classement des membres** par diversité (canettes/styles explorés) plutôt que
  par volume — plus sain (décision ouverte des specs).
- **Recommandations** basées sur les goûts (E5-6).

## Données & confort
- **Export CSV** de ses dégustations et achats (E4-7).
- **Notation multi-critères** (amertume, corps, arômes) (E3-8).
- **Comparer prix payé vs prix moyen constaté** (E4-6).
- **Photo hors-ligne** : mettre l'image en file IndexedDB pour l'uploader au
  retour du réseau (aujourd'hui la dégustation part sans la photo si pas de réseau).
- **Création de bière hors-ligne** : file complète (bière + dégustation + gestion
  des doublons) si le cas « zéro réseau + canette inconnue » gêne à l'usage.

## Technique / plus tard
- **Empaquetage Capacitor** : app installable sur les stores (même base de code).
- **Bucket photos privé** + URLs signées si on veut resserrer la confidentialité.
- **Confirmation d'email** via un vrai SMTP (Resend) si on ouvre au-delà du groupe.
