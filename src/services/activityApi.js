/**
 * ACTIVITY LOG API (mock)
 * =========================================================================
 * An append-only record of what staff did. In the mock, services call
 * logActivity() after each change. On the backend the SERVER writes these
 * rows inside the same request that performs the change — the client never
 * writes activity itself (it could forge it).
 *
 * Future backend mapping:
 *   listActivity({ limit, action })  -> GET /api/activity?limit=&action=   (activity.view)
 *
 * @typedef {import('@/types').ActivityEvent} ActivityEvent
 */
import { assertCan, currentUserSync, readJSON, writeJSON } from "./session.js";

const ACTIVITY_KEY = "envelope:activity";
const MAX_EVENTS = 500; // mock cap; the backend keeps everything
const delay = (ms = 100) => new Promise((r) => setTimeout(r, ms));

/**
 * Record an event for the signed-in user. Silently skipped when nobody is
 * signed in (e.g. public pages). Never throws — logging must not break the
 * action it describes.
 * @param {Omit<ActivityEvent,'id'|'at'|'actorId'|'actorName'>} event
 * @param {import('@/types').User} [actor]  defaults to the session user
 */
export function logActivity(event, actor = currentUserSync()) {
  try {
    if (!actor) return;
    const events = readJSON(ACTIVITY_KEY, []);
    events.unshift({
      id: `act_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`,
      at: new Date().toISOString(),
      actorId: actor.id,
      actorName: actor.name,
      ...event,
    });
    writeJSON(ACTIVITY_KEY, events.slice(0, MAX_EVENTS));
  } catch {
    /* never let logging break the real action */
  }
}

/**
 * Newest first. Requires activity.view.
 * @param {{ limit?: number, action?: string }} [opts]
 * @returns {Promise<ActivityEvent[]>}
 */
export async function listActivity({ limit = 200, action } = {}) {
  await delay();
  assertCan("activity.view");
  const events = readJSON(ACTIVITY_KEY, []);
  return (action ? events.filter((e) => e.action.startsWith(action)) : events)
    .slice(0, limit);
}
