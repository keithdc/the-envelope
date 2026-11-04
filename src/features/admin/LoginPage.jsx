"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff, Lock } from "lucide-react";
import {
  login,
  getSession,
  requestPasswordReset,
  DEMO_ACCOUNTS,
  DEMO_PASSWORD,
  IS_MOCK_AUTH,
} from "../../services/authApi.js";
import { ROLES } from "../../lib/permissions.js";
import { safeAdminPath } from "../../lib/redirect.js";
import "./login.css";

/**
 * Staff sign-in + "forgot password". Already signed in → straight to the
 * (safe) `next` page. Errors never reveal whether an email has an account.
 */
export default function LoginPage() {
  const router = useRouter();
  const params = useSearchParams();
  const next = safeAdminPath(params.get("next"));

  const [mode, setMode] = useState("login"); // login | forgot | sent
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    getSession().then((u) => u && router.replace(next));
  }, [router, next]);

  const submitLogin = async (e) => {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setError("");
    try {
      await login(email, password);
      router.replace(next);
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  };

  const submitForgot = async (e) => {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    await requestPasswordReset(email);
    setBusy(false);
    setMode("sent");
  };

  const fillDemo = (acct) => {
    setMode("login");
    setEmail(acct.email);
    setPassword(DEMO_PASSWORD);
    setError("");
  };

  return (
    <main className="login">
      <div className="login-card">
        <p className="login-brand">
          <span aria-hidden="true">✉</span> The Envelope
        </p>

        {mode === "login" && (
          <>
            <h1 className="login-title">Sign in to the studio</h1>
            <form onSubmit={submitLogin} noValidate>
              <label className="login-field">
                <span>Email</span>
                <input
                  type="email"
                  autoComplete="username"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  aria-invalid={!!error}
                  aria-describedby={error ? "login-error" : undefined}
                />
              </label>
              <label className="login-field">
                <span>Password</span>
                <span className="login-pw">
                  <input
                    type={showPw ? "text" : "password"}
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    aria-invalid={!!error}
                    aria-describedby={error ? "login-error" : undefined}
                  />
                  <button
                    type="button"
                    className="login-pw-toggle"
                    onClick={() => setShowPw((s) => !s)}
                    aria-label={showPw ? "Hide password" : "Show password"}
                  >
                    {showPw ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                </span>
              </label>

              {error && (
                <p className="login-error" id="login-error" role="alert">
                  {error}
                </p>
              )}

              <button type="submit" className="login-submit" disabled={busy}>
                {busy ? "Signing in…" : "Sign in"}
              </button>
            </form>
            <button
              type="button"
              className="login-link"
              onClick={() => {
                setMode("forgot");
                setError("");
              }}
            >
              Forgot your password?
            </button>
          </>
        )}

        {mode === "forgot" && (
          <>
            <h1 className="login-title">Reset your password</h1>
            <p className="login-text">
              Enter your email and we'll send you a link to choose a new password.
            </p>
            <form onSubmit={submitForgot}>
              <label className="login-field">
                <span>Email</span>
                <input
                  type="email"
                  autoComplete="username"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </label>
              <button type="submit" className="login-submit" disabled={busy}>
                {busy ? "Sending…" : "Send reset link"}
              </button>
            </form>
            <button type="button" className="login-link" onClick={() => setMode("login")}>
              Back to sign in
            </button>
          </>
        )}

        {mode === "sent" && (
          <>
            <h1 className="login-title">Check your email</h1>
            <p className="login-text" role="status">
              If an account exists for that address, a reset link is on its way.
              {IS_MOCK_AUTH && " (Mock: no email is actually sent.)"}
            </p>
            <button type="button" className="login-link" onClick={() => setMode("login")}>
              Back to sign in
            </button>
          </>
        )}
      </div>

      {IS_MOCK_AUTH && (
        <aside className="login-demo" aria-label="Demo accounts">
          <p className="login-demo-title">
            <Lock size={14} aria-hidden="true" /> Mock sign-in · not secure
          </p>
          <p className="login-demo-text">
            Demo accounts (password <code>{DEMO_PASSWORD}</code>). Pick one to
            see what each role can do:
          </p>
          <div className="login-demo-list">
            {DEMO_ACCOUNTS.map((a) => (
              <button key={a.email} type="button" onClick={() => fillDemo(a)}>
                <strong>{ROLES[a.role].label}</strong>
                <span>{a.email}</span>
              </button>
            ))}
          </div>
        </aside>
      )}
    </main>
  );
}
