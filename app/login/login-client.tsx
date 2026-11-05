"use client";

import { startAuthentication } from "@simplewebauthn/browser";
import { FormEvent, useEffect, useState } from "react";

export function LoginClient({
  demo,
  initialStep,
  initialError,
  notice,
  nextPath,
}: {
  demo: boolean;
  initialStep: "id" | "2fa";
  initialError?: string;
  notice?: string;
  nextPath?: string;
}) {
  const [step, setStep] = useState(initialStep);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [demoCode, setDemoCode] = useState<string | null>(null);
  const [error, setError] = useState(initialError ?? "");
  const [pending, setPending] = useState(false);

  useEffect(() => {
    if (initialStep !== "2fa") return;
    fetch("/api/auth/demo-code")
      .then((response) => response.json())
      .then((data: { code?: string | null }) => {
        if (data.code) setDemoCode(data.code);
      })
      .catch(() => undefined);
  }, [initialStep]);

  async function finish(response: Response) {
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      setError(data.error || "Sign-in failed.");
      setPending(false);
      return;
    }
    if (data.redirect) {
      window.location.href = data.redirect;
      return;
    }
    setDemoCode(data.demoCode ?? null);
    setStep("2fa");
    setPending(false);
  }

  async function onPassword(event: FormEvent) {
    event.preventDefault();
    setPending(true);
    setError("");
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    await finish(response);
  }

  async function onCode(event: FormEvent) {
    event.preventDefault();
    setPending(true);
    setError("");
    const response = await fetch("/api/auth/verify-2fa", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code, next: nextPath }),
    });
    await finish(response);
  }

  async function onPasskey() {
    setPending(true);
    setError("");
    try {
      const optionsResponse = await fetch("/api/auth/passkey/login/options", { method: "POST" });
      const options = await optionsResponse.json();
      if (!optionsResponse.ok) throw new Error(options.error || "Passkey sign-in is unavailable.");
      const assertion = await startAuthentication({ optionsJSON: options });
      const response = await fetch("/api/auth/passkey/login/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(assertion),
      });
      await finish(response);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Passkey sign-in was cancelled.");
      setPending(false);
    }
  }

  return (
    <div className="auth-card">
      <p className="kicker">EFI&gt; member desk</p>
      <h1 style={{ fontSize: 46, margin: "8px 0 12px" }}>{step === "2fa" ? "Email code" : "Sign in"}</h1>
      {notice ? <p className="ok-note">{notice}</p> : null}
      {error ? <p className="error">{error}</p> : null}

      {step === "id" ? (
        <form className="stack" onSubmit={onPassword}>
          <label className="field">
            <span>Email</span>
            <input type="email" autoComplete="username" value={email} onChange={(event) => setEmail(event.target.value)} required />
          </label>
          <label className="field">
            <span>Password</span>
            <input type="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} required />
          </label>
          <button className="btn full" type="submit" disabled={pending}>Continue</button>
          <button className="btn dark full" type="button" onClick={onPasskey} disabled={pending}>Use a passkey</button>
          <a className="btn light full" href="/api/auth/google">Continue with Google</a>
        </form>
      ) : (
        <form className="stack" onSubmit={onCode}>
          <p className="help">Enter the 6-digit code sent to your email. It expires in 10 minutes.</p>
          {demoCode ? <p className="ok-note">Demo inbox code: {demoCode}</p> : null}
          <label className="field">
            <span>Code</span>
            <input inputMode="numeric" autoComplete="one-time-code" value={code} onChange={(event) => setCode(event.target.value)} required />
          </label>
          <button className="btn full" type="submit" disabled={pending}>Enter the desk</button>
          <button className="linkish" type="button" onClick={() => { setStep("id"); setError(""); }}>Use a different account</button>
        </form>
      )}

      {demo && step === "id" ? (
        <div className="panel" style={{ marginTop: 18 }}>
          <p className="kicker">Demo roll</p>
          <p className="help">Staff · staff@efiinstitute.com · efi-staff-demo</p>
          <p className="help">Student · ali.raza@example.com · efi-student-demo</p>
          <p className="help">QR onboard · /onboard/onboard-hassan-efi1025</p>
        </div>
      ) : null}
    </div>
  );
}
