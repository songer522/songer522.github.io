/**
 * @typedef {{ id: string, title: string }} Vlog
 * @typedef {{ id: string, local: string, remote: string }} Drift
 */

/**
 * Decide what to do with playlist entries YouTube reports as deleted or private.
 *
 * Skipping them outright makes them indistinguishable from "removed from the
 * playlist", so the entry is dropped, its thumbnail deleted, and if the video later
 * comes back it returns under YouTube's title — silently undoing a title edited here
 * to keep someone's name off a public page. So a video we already know is held at its
 * local title; one we have never seen is dropped, since there is nothing to show.
 *
 * @param {{ id: string, title: string, unavailable?: boolean }[]} items playlist order
 * @param {Vlog[]} existing entries currently in the file
 * @returns {{ items: Vlog[], held: string[] }} `held` is for warning the operator
 */
export function resolveUnavailable(items, existing) {
  const byId = new Map(existing.map((v) => [v.id, v]));
  const resolved = [];
  const held = [];

  for (const item of items) {
    if (!item.unavailable) {
      resolved.push({ id: item.id, title: item.title });
      continue;
    }
    const local = byId.get(item.id);
    if (!local) continue;
    resolved.push({ id: local.id, title: local.title });
    held.push(local.id);
  }

  return { items: resolved, held };
}

/**
 * Reconcile the committed vlog list against what the playlist currently holds.
 *
 * Existing entries keep whatever title is in the file: that is what makes a local
 * rename stick, since several of these videos are titled only in emoji on YouTube
 * and read better renamed here. A title that has since changed upstream is
 * reported as drift for a human to judge, never silently applied.
 *
 * @param {Vlog[]} existing entries currently in src/data/vlogs.ts
 * @param {Vlog[]} fetched entries from the playlist, in playlist order
 * @returns {{ vlogs: Vlog[], added: Vlog[], removed: Vlog[], drifted: Drift[] }}
 */
export function mergeVlogs(existing, fetched) {
  const byId = new Map(existing.map((v) => [v.id, v]));
  const fetchedIds = new Set(fetched.map((v) => v.id));

  const vlogs = [];
  const added = [];
  const drifted = [];
  // A playlist can hold the same video twice; keep the first appearance only, or the
  // site renders duplicate cards and downloads the thumbnail twice.
  const seen = new Set();

  for (const remote of fetched) {
    if (seen.has(remote.id)) continue;
    seen.add(remote.id);

    const local = byId.get(remote.id);
    if (!local) {
      vlogs.push({ id: remote.id, title: remote.title });
      added.push({ id: remote.id, title: remote.title });
      continue;
    }
    vlogs.push({ id: local.id, title: local.title });
    if (local.title !== remote.title) {
      drifted.push({ id: local.id, local: local.title, remote: remote.title });
    }
  }

  const removed = existing.filter((v) => !fetchedIds.has(v.id));

  return { vlogs, added, removed, drifted };
}
