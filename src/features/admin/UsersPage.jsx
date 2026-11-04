"use client";

import { useCallback, useEffect, useState } from "react";
import { UserPlus } from "lucide-react";
import { listUsers, inviteUser, updateUser } from "../../services/authApi.js";
import { ROLES, assignableRoles, canManageUser } from "../../lib/permissions.js";
import Dialog from "../builder/Dialog.jsx";
import { useAuth } from "./AuthProvider.jsx";
import { RequirePermission } from "./AdminGuard.jsx";
import { initials } from "./AdminShell.jsx";

const fmtDate = (iso) =>
  iso ? new Date(iso).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" }) : "—";

/** Team management: list, invite, change role, disable/enable. */
export default function UsersPage() {
  return (
    <RequirePermission permission="users.view">
      <UsersInner />
    </RequirePermission>
  );
}

function UsersInner() {
  const { user: me, can } = useAuth();
  const [users, setUsers] = useState(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [inviting, setInviting] = useState(false);
  const [invited, setInvited] = useState(null); // { user, tempPassword }
  const [busyId, setBusyId] = useState(null);

  const load = useCallback(() => {
    listUsers().then(setUsers).catch((e) => setError(e.message));
  }, []);
  useEffect(load, [load]);

  const change = async (target, patch, message) => {
    setBusyId(target.id);
    setError("");
    setNotice("");
    try {
      await updateUser(target.id, patch);
      setNotice(message);
      load();
    } catch (e) {
      setError(e.message);
    } finally {
      setBusyId(null);
    }
  };

  const sorted = users
    ? [...users].sort(
        (a, b) =>
          Object.keys(ROLES).indexOf(a.role) - Object.keys(ROLES).indexOf(b.role) ||
          a.name.localeCompare(b.name),
      )
    : [];

  return (
    <div className="a-page">
      <header className="a-head">
        <div>
          <p className="a-eyebrow">Admin</p>
          <h1 className="a-title">Team</h1>
          <p className="a-sub">Who can sign in to the studio, and what they can do.</p>
        </div>
        {can("users.manage") && (
          <button type="button" className="a-btn a-btn--primary" onClick={() => setInviting(true)}>
            <UserPlus size={15} aria-hidden="true" /> Invite teammate
          </button>
        )}
      </header>

      {error && <p className="a-alert a-alert--error" role="alert">{error}</p>}
      {notice && <p className="a-alert a-alert--ok" role="status">{notice}</p>}

      <section className="a-card">
        {users === null ? (
          <p className="a-empty" role="status">Loading team…</p>
        ) : (
          <div className="a-table-wrap">
            <table className="a-table">
              <thead>
                <tr>
                  <th scope="col">Person</th>
                  <th scope="col">Role</th>
                  <th scope="col">Status</th>
                  <th scope="col">Last sign-in</th>
                  <th scope="col"><span className="sr-only">Actions</span></th>
                </tr>
              </thead>
              <tbody>
                {sorted.map((u) => {
                  const manageable = canManageUser(me, u);
                  const busy = busyId === u.id;
                  return (
                    <tr key={u.id}>
                      <td>
                        <span className="a-person">
                          <span className="a-avatar" aria-hidden="true">{initials(u.name)}</span>
                          <span className="a-person-text">
                            <strong>
                              {u.name}
                              {u.id === me.id && <span className="a-you">(you)</span>}
                            </strong>
                            <span>{u.email}</span>
                          </span>
                        </span>
                      </td>
                      <td>
                        {manageable ? (
                          <select
                            className="a-select"
                            value={u.role}
                            disabled={busy}
                            aria-label={`Role for ${u.name}`}
                            onChange={(e) =>
                              change(u, { role: e.target.value }, `${u.name} is now ${ROLES[e.target.value].label}.`)
                            }
                          >
                            {assignableRoles(me).map((r) => (
                              <option key={r} value={r}>{ROLES[r].label}</option>
                            ))}
                          </select>
                        ) : (
                          ROLES[u.role]?.label
                        )}
                      </td>
                      <td>
                        <span className={`a-badge a-badge--${u.status}`}>{u.status}</span>
                      </td>
                      <td>{fmtDate(u.lastLoginAt)}</td>
                      <td style={{ textAlign: "right" }}>
                        {manageable &&
                          (u.status === "disabled" ? (
                            <button
                              type="button"
                              className="a-btn"
                              disabled={busy}
                              onClick={() => change(u, { status: "active" }, `${u.name} can sign in again.`)}
                            >
                              Enable
                            </button>
                          ) : (
                            <button
                              type="button"
                              className="a-btn a-btn--danger"
                              disabled={busy}
                              onClick={() => change(u, { status: "disabled" }, `${u.name} can no longer sign in.`)}
                            >
                              Disable
                            </button>
                          ))}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="a-card">
        <h2 className="a-card-title">Roles</h2>
        <p className="a-card-sub">People are never deleted. Disabling keeps their history in the activity log.</p>
        <dl className="a-roles">
          {Object.entries(ROLES).map(([key, r]) => (
            <div key={key}>
              <dt>{r.label}</dt>
              <dd>{r.description}</dd>
            </div>
          ))}
        </dl>
      </section>

      {inviting && (
        <InviteDialog
          me={me}
          onClose={() => setInviting(false)}
          onInvited={(result) => {
            setInviting(false);
            setInvited(result);
            load();
          }}
        />
      )}

      {invited && (
        <Dialog
          title="Invitation created"
          submitLabel="Done"
          onClose={() => setInvited(null)}
          onSubmit={() => setInvited(null)}
        >
          <p>
            <strong>{invited.user.name}</strong> was added as{" "}
            {ROLES[invited.user.role].label}. Share this temporary password with them.
            It's shown only once:
          </p>
          <code className="a-temp-pw">{invited.tempPassword}</code>
          <p className="a-hint">
            Mock only. With the backend, they get an email with a one-time link to
            set their own password instead.
          </p>
        </Dialog>
      )}
    </div>
  );
}

function InviteDialog({ me, onClose, onInvited }) {
  const roles = assignableRoles(me);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState(roles.includes("designer") ? "designer" : roles[0]);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    if (busy) return;
    setBusy(true);
    setError("");
    try {
      onInvited(await inviteUser({ name, email, role }));
    } catch (e) {
      setError(e.message);
      setBusy(false);
    }
  };

  return (
    <Dialog
      title="Invite a teammate"
      submitLabel={busy ? "Inviting…" : "Send invite"}
      onClose={onClose}
      onSubmit={submit}
    >
      {error && <p className="a-alert a-alert--error" role="alert">{error}</p>}
      <label className="dlg-field">
        <span>Name</span>
        <input value={name} onChange={(e) => setName(e.target.value)} autoComplete="off" />
      </label>
      <label className="dlg-field">
        <span>Email</span>
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="off" />
      </label>
      <label className="dlg-field">
        <span>Role</span>
        <select value={role} onChange={(e) => setRole(e.target.value)}>
          {roles.map((r) => (
            <option key={r} value={r}>{ROLES[r].label}: {ROLES[r].description}</option>
          ))}
        </select>
      </label>
    </Dialog>
  );
}
