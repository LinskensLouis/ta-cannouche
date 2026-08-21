import type { CheckinPayload } from "./types";

// File d'attente locale en IndexedDB (S1-10). Les écritures faites sans réseau
// y sont stockées puis rejouées au retour de la connexion. Aucune dépendance :
// petit wrapper autour de l'API IndexedDB native.

const DB_NAME = "cannouche";
const STORE = "checkin_queue";

export type QueuedCheckin = {
  id: string;
  payload: CheckinPayload;
  createdAt: number;
};

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => {
      if (!req.result.objectStoreNames.contains(STORE)) {
        req.result.createObjectStore(STORE, { keyPath: "id" });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

function tx<T>(mode: IDBTransactionMode, run: (store: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  return openDb().then(
    (db) =>
      new Promise<T>((resolve, reject) => {
        const store = db.transaction(STORE, mode).objectStore(STORE);
        const req = run(store);
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
      }),
  );
}

export async function addToQueue(payload: CheckinPayload): Promise<QueuedCheckin> {
  const item: QueuedCheckin = { id: crypto.randomUUID(), payload, createdAt: Date.now() };
  await tx("readwrite", (s) => s.add(item));
  return item;
}

export function getQueue(): Promise<QueuedCheckin[]> {
  return tx<QueuedCheckin[]>("readonly", (s) => s.getAll());
}

export async function removeFromQueue(id: string): Promise<void> {
  await tx("readwrite", (s) => s.delete(id));
}

export async function queueCount(): Promise<number> {
  return tx<number>("readonly", (s) => s.count());
}
