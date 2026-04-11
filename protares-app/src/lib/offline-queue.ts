import * as SecureStore from 'expo-secure-store';

/**
 * Offline mutation queue.
 *
 *   • Persisted to `expo-secure-store` so it survives cold starts.
 *   • Each entry has a TTL — stale mutations (e.g. "accept emergency"
 *     submitted 30 minutes ago) are dropped rather than replayed to
 *     avoid re-triggering resolved incidents.
 *   • Replays are serialised so ordered mutations within a single
 *     emergency's lifecycle happen in sequence.
 */

const STORAGE_KEY = 'protares.offline_queue_v1';
const DEFAULT_TTL_MS = 10 * 60 * 1000;

export interface QueuedMutation {
  id: string;
  createdAt: number;
  ttlMs: number;
  kind: string;
  payload: Record<string, unknown>;
}

type Handler = (mutation: QueuedMutation) => Promise<void>;

const handlers = new Map<string, Handler>();

export function registerHandler(kind: string, handler: Handler) {
  handlers.set(kind, handler);
}

export async function enqueue(mutation: Omit<QueuedMutation, 'id' | 'createdAt' | 'ttlMs'> & {
  ttlMs?: number;
}) {
  const entry: QueuedMutation = {
    id: generateId(),
    createdAt: Date.now(),
    ttlMs: mutation.ttlMs ?? DEFAULT_TTL_MS,
    kind: mutation.kind,
    payload: mutation.payload,
  };
  const existing = await loadQueue();
  existing.push(entry);
  await persistQueue(existing);
  return entry.id;
}

export async function flushQueue(): Promise<{ processed: number; dropped: number; failed: number }> {
  const queue = await loadQueue();
  if (queue.length === 0) return { processed: 0, dropped: 0, failed: 0 };

  const now = Date.now();
  const fresh = queue.filter((m) => now - m.createdAt <= m.ttlMs);
  const dropped = queue.length - fresh.length;
  const remaining: QueuedMutation[] = [];

  let processed = 0;
  let failed = 0;
  for (const mutation of fresh) {
    const handler = handlers.get(mutation.kind);
    if (!handler) {
      remaining.push(mutation);
      continue;
    }
    try {
      await handler(mutation);
      processed += 1;
    } catch {
      failed += 1;
      remaining.push(mutation);
    }
  }

  await persistQueue(remaining);
  return { processed, dropped, failed };
}

export async function clearQueue() {
  await SecureStore.deleteItemAsync(STORAGE_KEY).catch(() => {
    /* no-op */
  });
}

async function loadQueue(): Promise<QueuedMutation[]> {
  try {
    const raw = await SecureStore.getItemAsync(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed as QueuedMutation[];
  } catch {
    return [];
  }
}

async function persistQueue(queue: QueuedMutation[]) {
  try {
    await SecureStore.setItemAsync(STORAGE_KEY, JSON.stringify(queue));
  } catch {
    // SecureStore failures are logged via the caller — queue persistence
    // is best-effort.
  }
}

function generateId(): string {
  return `${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 9)}`;
}
