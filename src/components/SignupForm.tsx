"use client";

import { useId, useRef, useState } from "react";

type Status = "idle" | "sending" | "done" | "preview" | "error";

/**
 * Mailing list signup posted to Formspree. Works without JavaScript too: the
 * form then submits straight to Formspree.
 */
export function SignupForm({
  formId,
  privacyLine,
  button,
  success,
  successNote,
}: {
  formId: string | null;
  privacyLine: string;
  button: string;
  success: string;
  successNote: string;
}) {
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");
  const statusRef = useRef<HTMLDivElement>(null);
  const uid = useId();
  const emailId = `${uid}-email`;
  const noteId = `${uid}-note`;
  const errorId = `${uid}-error`;
  const endpoint = formId ? `https://formspree.io/f/${formId}` : undefined;

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    const email = String(data.get("email") ?? "").trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setStatus("error");
      setError("Please enter a full email address, like name@example.com.");
      return;
    }
    if (String(data.get("_gotcha") ?? "")) return; // bot
    setStatus("sending");
    setError("");

    if (!endpoint) {
      // Not connected yet: show the success state so the flow can be reviewed.
      await new Promise((r) => setTimeout(r, 650));
      setStatus("preview");
      requestAnimationFrame(() => statusRef.current?.focus());
      return;
    }

    try {
      const res = await fetch(endpoint, { method: "POST", body: data, headers: { Accept: "application/json" } });
      if (res.ok) {
        setStatus("done");
        form.reset();
        requestAnimationFrame(() => statusRef.current?.focus());
      } else {
        const body = (await res.json().catch(() => null)) as { errors?: { message: string }[] } | null;
        setStatus("error");
        setError(body?.errors?.[0]?.message ?? "That didn’t go through. Please try again in a moment.");
      }
    } catch {
      setStatus("error");
      setError("We couldn’t reach the signup service. Check your connection and try again.");
    }
  }

  const finished = status === "done" || status === "preview";

  return (
    <div className="signup">
      {finished ? (
        <div ref={statusRef} tabIndex={-1} className="signup-done label-card" role="status" aria-live="polite">
          <div className="t-label flex items-center justify-between text-[color:var(--night-3)]">
            <span>Mailing list</span>
            <span>Confirmed</span>
          </div>
          <p className="t-d3 mt-2 flex items-center gap-3">
            <span className="signup-check" aria-hidden="true" />
            {success}
          </p>
          <p className="t-small mt-2 text-[color:var(--night-2)]">{successNote}</p>
          {status === "preview" ? (
            <p className="t-small mt-3 border-t border-[color:var(--night-line)] pt-3 text-[color:var(--night-2)]">
              Preview only: this address was not saved. Add your Formspree form ID in <code>src/content/series.ts</code> to connect the form.
            </p>
          ) : null}
        </div>
      ) : (
        <form
          action={endpoint}
          method="POST"
          noValidate
          onSubmit={onSubmit}
          className="signup-form"
          aria-describedby={noteId}
        >
          <label htmlFor={emailId} className="t-label block text-[color:var(--paper-2)]">
            Email address
          </label>
          <div className="signup-row mt-3">
            <input
              id={emailId}
              name="email"
              type="email"
              autoComplete="email"
              inputMode="email"
              required
              placeholder="name@example.com"
              className="signup-input"
              aria-invalid={status === "error" ? true : undefined}
              aria-describedby={status === "error" ? errorId : undefined}
            />
            <input type="text" name="_gotcha" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />
            <input type="hidden" name="_subject" value="New mailing list signup" />
            <button type="submit" className="btn btn-amber signup-button" disabled={status === "sending"}>
              <span>{status === "sending" ? "Signing up…" : button}</span>
              <span className="arrow-right" aria-hidden="true">
                →
              </span>
            </button>
          </div>
          <p id={errorId} className="t-small signup-error mt-3" role="alert">
            {status === "error" ? error : ""}
          </p>
          <p id={noteId} className="t-small mt-1 max-w-[52ch] text-[color:var(--paper-3)]">
            {privacyLine}
          </p>
        </form>
      )}
    </div>
  );
}
