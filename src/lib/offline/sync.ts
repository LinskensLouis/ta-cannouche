import type { CheckinPayload } from "./types";
import { addToQueue, getQueue, removeFromQueue, queueCount } from "./queue";

// Synchronisation de la file (S1-10). Rejoue les dégustations en attente vers
// l'endpoint serveur, et prévient l'UI du nombre d'éléments restants.

const COUNT_EVENT = "cannouche:queue-count";

async function emitCount() {
  const n = await queueCount().catch(() => 0);
  window.dispatchEvent(new CustomEvent<number>(COUNT_EVENT, { detail: n }));
}

export function onQueueCount(listener: (n: number) => void): () => void {
  const handler = (e: Event) => listener((e as CustomEvent<number>).detail);
  window.addEventListener(COUNT_EVENT, handler);
  return () => window.removeEventListener(COUNT_EVENT, handler);
}

let syncing = false;

// Rejoue toute la file. S'arrête au premier échec réseau (on réessaiera plus
// tard). Renvoie true si la file est entièrement vidée.
export async function syncQueue(): Promise<boolean> {
  if (syncing) return false;
  syncing = true;
  try {
    const items = await getQueue();
    for (const item of items) {
      try {
        const res = await fetch("/api/checkins", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(item.payload),
        });
        if (res.ok) {
          await removeFromQueue(item.id);
          await emitCount();
        } else if (res.status >= 400 && res.status < 500 && res.status !== 401) {
          // Charge utile invalide et non ré-essayable : on la retire pour ne pas
          // bloquer la file indéfiniment.
          await removeFromQueue(item.id);
          await emitCount();
        } else {
          return false; // 401/5xx : on retentera plus tard
        }
      } catch {
        return false; // hors-ligne : on garde la file intacte
      }
    }
    return true;
  } finally {
    syncing = false;
  }
}

// Ajoute une dégustation à la file puis tente une synchro immédiate.
// Renvoie true si elle a été synchronisée tout de suite, false si mise en attente.
export async function submitCheckin(payload: CheckinPayload): Promise<boolean> {
  await addToQueue(payload);
  await emitCount();
  const before = await queueCount();
  await syncQueue();
  const after = await queueCount();
  return after < before;
}

let started = false;

// Démarre la synchro : au chargement et à chaque retour de réseau.
// Idempotent : l'écouteur `online` n'est enregistré qu'une fois.
export function startSync() {
  void emitCount();
  void syncQueue();
  if (started) return;
  started = true;
  window.addEventListener("online", () => void syncQueue());
}
