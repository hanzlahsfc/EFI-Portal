"use client";

import { startRegistration } from "@simplewebauthn/browser";
import { useState } from "react";

export function PasskeyPanel({ devices }: { devices: string[] }) {
  const [list, setList] = useState(devices);
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function addPasskey() {
    setPending(true);
    setError("");
    try {
      const optionsResponse = await fetch("/api/auth/passkey/register/options", { method: "POST" });
      const options = await optionsResponse.json();
      if (!optionsResponse.ok) throw new Error(options.error || "Passkey setup failed.");
      const credential = await startRegistration({ optionsJSON: options });
      const verify = await fetch("/api/auth/passkey/register/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...credential, deviceName: "This device" }),
      });
      const data = await verify.json();
      if (!verify.ok) throw new Error(data.error || "Passkey setup failed.");
      setList((current) => [...current, "This device"]);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Passkey setup was cancelled.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="panel stack">
      <h2>Passkey</h2>
      <p className="help">A passkey signs this browser or phone in without a password. Email codes still protect password and Google sign-in.</p>
      {list.length ? <ul className="points">{list.map((device, index) => <li key={`${device}-${index}`}><strong>{device}</strong></li>)}</ul> : <p className="help">No passkey on this account yet.</p>}
      {error ? <p className="error">{error}</p> : null}
      <button className="btn dark" type="button" onClick={addPasskey} disabled={pending}>Add a passkey</button>
    </div>
  );
}
