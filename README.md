# Ta Cannouche

Application web mobile-first de notation de canettes de bière, pour un groupe d'amis :
scan du code-barres, note, suivi de la consommation et des dépenses, classements,
et repérage des canettes en grande surface.

## Démarrer

```bash
npm install
npm run dev
```

L'app tourne sur http://localhost:3000. Elle se développe et se teste dans un
viewport de **375 px** : le desktop est un cas dégradé, jamais le point de départ.

## Scripts

| Commande | Rôle |
|---|---|
| `npm run dev` | serveur de développement |
| `npm run build` | build de production |
| `npm run start` | sert le build de production |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run lint` | ESLint |

## Variables d'environnement

Copier `.env.local.example` en `.env.local` et renseigner les valeurs.
`.env.local` n'est jamais versionné, et la clé `service_role` de Supabase ne sort
jamais du serveur.

## Documentation

| Fichier | Contenu |
|---|---|
| `CLAUDE.md` | contexte, périmètre, conventions, garde-fous |
| `SPECS.md` | spécifications détaillées et modèle de données |
| `TACHES.md` | backlog opérationnel, dans l'ordre d'exécution |
| `JOURNAL.md` | état d'avancement, tenu à jour à chaque session |
