/**
 * @typedef {{ id: string, title: string }} Vlog
 * @typedef {{ id: string, local: string, remote: string }} Drift
 */

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

  for (const remote of fetched) {
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
