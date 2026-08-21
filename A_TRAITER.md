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

### 🔵 GitHub — premier push à faire par toi
Aucun identifiant GitHub n'est en cache sur la machine et `gh` n'est pas installé.
Tant que tu n'as pas lancé `git push -u origin main` une fois (auth navigateur),
je ne peux pas pousser. Tout est committé en local en attendant.

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

### 🟡 Utilisateur de test à supprimer
Un compte `louis.ui.test@example.invalid` a été créé pour tester l'UI d'auth et
laissé connecté dans le navigateur de preview afin de visualiser les pages
protégées pendant le build. À supprimer au retour (Dashboard → Authentication →
Users), ou dis-moi et je le retire.
