"use client";

import { useEffect, useState } from "react";
import { listActivity } from "../../services/activityApi.js";
import { RequirePermission } from "./AdminGuard.jsx";

/** Human labels for each ActivityAction. */
const ACTION_LABELS = {
  "auth.login": "Signed in",
  "auth.logout": "Signed out",
  "auth.password_changed": "Changed their password",
  "user.invited": "Invited",
  "user.role_changed": "Changed the role of",
  "user.disabled": "Disabled",
  "user.enabled": "Re-enabled",
  "profile.updated": "Updated their profile",
  "settings.updated": "Updated",
  "template.created": "Created template",
  "template.saved": "Saved template",
  "template.published": "Published template",
  "project.created": "Created project",
  "project.saved": "Saved project",
  "version.rolled_back": "Rolled back",
  "share.created": "Shared with client",
  "share.regenerated": "Issued a new link for",
  "share.stopped": "Stopped sharing",
};

const FILTERS = [
  ["", "Everything"],
  ["auth.", "Sign-ins"],
  ["user.", "Team"],
  ["template.", "Templates"],
  ["project.", "Projects"],
  ["share.", "Client links"],
  ["version.", "Rollbacks"],
  ["settings.", "Settings"],
];

const fmt = (iso) =>
  new Date(iso).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });

/** Append-only log of what staff did, newest first. */
export default function ActivityPage() {
  return (
    <RequirePermission permission="activity.view">
      <ActivityInner />
    </RequirePermission>
  );
}

function ActivityInner() {
  const [filter, setFilter] = useState("");
  const [events, setEvents] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    setEvents(null);
    listActivity({ action: filter || undefined })
      .then(setEvents)
      .catch((e) => setError(e.message));
  }, [filter]);

  return (
    <div className="a-page">
      <header className="a-head">
        <div>
          <p className="a-eyebrow">Admin</p>
          <h1 className="a-title">Activity</h1>
          <p className="a-sub">Every change, who made it, and when. Entries can't be edited or deleted.</p>
        </div>
        <label>
          <span className="sr-only">Filter activity</span>
          <select className="a-select" value={filter} onChange={(e) => setFilter(e.target.value)}>
            {FILTERS.map(([v, l]) => (
              <option key={v} value={v}>{l}</option>
            ))}
          </select>
        </label>
      </header>

      {error && <p className="a-alert a-alert--error" role="alert">{error}</p>}

      <section className="a-card">
        {events === null ? (
          <p className="a-empty" role="status">Loading activity…</p>
        ) : events.length === 0 ? (
          <div className="a-empty">
            <p className="a-empty-title">Nothing yet</p>
            <p>Actions like publishing, sharing and team changes will appear here.</p>
          </div>
        ) : (
          <div className="a-table-wrap">
            <table className="a-table">
              <thead>
                <tr>
                  <th scope="col">When</th>
                  <th scope="col">Who</th>
                  <th scope="col">What</th>
                </tr>
              </thead>
              <tbody>
                {events.map((e) => (
                  <tr key={e.id}>
                    <td style={{ whiteSpace: "nowrap" }}>
                      <time dateTime={e.at}>{fmt(e.at)}</time>
                    </td>
                    <td>{e.actorName}</td>
                    <td>
                      {ACTION_LABELS[e.action] ?? e.action}
                      {e.targetTitle && <strong> {e.targetTitle}</strong>}
                      {e.detail && <span className="a-hint"> · {e.detail}</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
