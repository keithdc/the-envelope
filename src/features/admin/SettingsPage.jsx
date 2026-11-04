"use client";

import { useEffect, useState } from "react";
import {
  updateProfile,
  changePassword,
  getSettings,
  saveSettings,
} from "../../services/authApi.js";
import { ROLES } from "../../lib/permissions.js";
import { useAuth } from "./AuthProvider.jsx";

/** Profile, password, and (owners) workspace settings. */
export default function SettingsPage() {
  const { can } = useAuth();
  return (
    <div className="a-page">
      <header className="a-head">
        <div>
          <p className="a-eyebrow">Admin</p>
          <h1 className="a-title">Settings</h1>
        </div>
      </header>
      <ProfileCard />
      <PasswordCard />
      <WorkspaceCard editable={can("settings.business")} />
    </div>
  );
}

/** Small hook for a form's busy / error / success state. */
function useFormStatus() {
  const [state, setState] = useState({ busy: false, error: "", ok: "" });
  const run = async (fn, okMessage) => {
    setState({ busy: true, error: "", ok: "" });
    try {
      await fn();
      setState({ busy: false, error: "", ok: okMessage });
    } catch (e) {
      setState({ busy: false, error: e.message, ok: "" });
    }
  };
  return [state, run];
}

function Status({ state }) {
  if (state.error) return <p className="a-alert a-alert--error" role="alert">{state.error}</p>;
  if (state.ok) return <p className="a-alert a-alert--ok" role="status">{state.ok}</p>;
  return null;
}

function ProfileCard() {
  const { user, refresh } = useAuth();
  const [name, setName] = useState(user.name);
  const [state, run] = useFormStatus();

  return (
    <section className="a-card" aria-labelledby="set-profile">
      <h2 className="a-card-title" id="set-profile">Profile</h2>
      <p className="a-card-sub">How you appear to the team and in the activity log.</p>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          run(async () => {
            await updateProfile({ name });
            await refresh();
          }, "Profile saved.");
        }}
      >
        <Status state={state} />
        <label className="a-field">
          <span>Name</span>
          <input value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" />
        </label>
        <label className="a-field">
          <span>Email</span>
          <input value={user.email} disabled />
          <p className="a-hint">Ask an owner to change the email on your account.</p>
        </label>
        <label className="a-field">
          <span>Role</span>
          <input value={ROLES[user.role]?.label ?? user.role} disabled />
        </label>
        <button type="submit" className="a-btn a-btn--primary" disabled={state.busy}>
          {state.busy ? "Saving…" : "Save profile"}
        </button>
      </form>
    </section>
  );
}

function PasswordCard() {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [state, run] = useFormStatus();

  const submit = (e) => {
    e.preventDefault();
    run(async () => {
      if (next !== confirm) throw new Error("The new passwords don't match.");
      await changePassword(current, next);
      setCurrent("");
      setNext("");
      setConfirm("");
    }, "Password changed.");
  };

  return (
    <section className="a-card" aria-labelledby="set-password">
      <h2 className="a-card-title" id="set-password">Password</h2>
      <p className="a-card-sub">Use at least 8 characters.</p>
      <form onSubmit={submit}>
        <Status state={state} />
        {/* hidden username helps password managers pair the fields */}
        <input type="text" autoComplete="username" hidden readOnly />
        <label className="a-field">
          <span>Current password</span>
          <input type="password" autoComplete="current-password" value={current} onChange={(e) => setCurrent(e.target.value)} required />
        </label>
        <label className="a-field">
          <span>New password</span>
          <input type="password" autoComplete="new-password" minLength={8} value={next} onChange={(e) => setNext(e.target.value)} required />
        </label>
        <label className="a-field">
          <span>Confirm new password</span>
          <input type="password" autoComplete="new-password" minLength={8} value={confirm} onChange={(e) => setConfirm(e.target.value)} required />
        </label>
        <button type="submit" className="a-btn a-btn--primary" disabled={state.busy}>
          {state.busy ? "Updating…" : "Change password"}
        </button>
      </form>
    </section>
  );
}

function WorkspaceCard({ editable }) {
  const [settings, setSettings] = useState(null);
  const [state, run] = useFormStatus();

  useEffect(() => {
    getSettings().then(setSettings);
  }, []);

  if (!settings) return null;

  const setBiz = (k, v) => setSettings((s) => ({ ...s, business: { ...s.business, [k]: v } }));
  const days = settings.sharing.defaultLinkDays;

  return (
    <section className="a-card" aria-labelledby="set-workspace">
      <h2 className="a-card-title" id="set-workspace">Workspace</h2>
      <p className="a-card-sub">
        {editable ? "Business details and sharing defaults." : "Only owners can change these."}
      </p>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          run(() => saveSettings(settings), "Workspace settings saved.");
        }}
      >
        <Status state={state} />
        <fieldset disabled={!editable || state.busy} style={{ border: 0, padding: 0, margin: 0 }}>
          <label className="a-field">
            <span>Brand name</span>
            <input value={settings.business.brandName} onChange={(e) => setBiz("brandName", e.target.value)} />
          </label>
          <label className="a-field">
            <span>Contact email</span>
            <input type="email" value={settings.business.contactEmail} onChange={(e) => setBiz("contactEmail", e.target.value)} />
          </label>
          <label className="a-field">
            <span>Phone</span>
            <input type="tel" value={settings.business.phone} onChange={(e) => setBiz("phone", e.target.value)} />
          </label>
          <label className="a-field">
            <span>Client links expire after (days)</span>
            <input
              type="number"
              min={1}
              max={3650}
              placeholder="Never"
              value={days ?? ""}
              onChange={(e) =>
                setSettings((s) => ({
                  ...s,
                  sharing: { defaultLinkDays: e.target.value === "" ? null : Number(e.target.value) },
                }))
              }
            />
            <p className="a-hint">
              Leave empty for links that never expire. Saved now; enforced once the backend checks link expiry.
            </p>
          </label>
          {editable && (
            <button type="submit" className="a-btn a-btn--primary">
              {state.busy ? "Saving…" : "Save workspace"}
            </button>
          )}
        </fieldset>
      </form>
    </section>
  );
}
