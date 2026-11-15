"use client";
import { useState } from "react";
import { Arrow } from "./arrow";
import { CONTACT_EMAIL } from "@/lib/projects";

export function ContactForm() {
  const [state, setState] = useState<"idle" | "sending" | "sent" | "error">(
    "idle",
  );
  return (
    <form
      className="contact-form"
      action="/api/contact"
      method="post"
      onSubmit={async (event) => {
        event.preventDefault();
        const form = event.currentTarget;
        const body = new FormData(form);
        setState("sending");
        try {
          const response = await fetch("/api/contact", {
            method: "POST",
            body,
            headers: { Accept: "application/json" },
          });
          if (!response.ok) throw new Error("Unable to send");
          setState("sent");
          form.reset();
        } catch {
          setState("error");
        }
      }}
    >
      <fieldset disabled={state === "sending"}>
        <legend className="sr-only">Tell us about your project</legend>
        <div className="contact-fields">
          <label>
            Your name
            <input
              name="name"
              autoComplete="name"
              required
              maxLength={100}
              placeholder="Name"
            />
          </label>
          <label>
            Email address
            <input
              name="email"
              type="email"
              autoComplete="email"
              required
              maxLength={254}
              placeholder="you@company.com"
            />
          </label>
          <label className="field-wide">
            Company <span>(optional)</span>
            <input
              name="company"
              autoComplete="organization"
              maxLength={120}
              placeholder="Company or organization"
            />
          </label>
          <label className="field-wide">
            What do you have in mind?
            <textarea
              name="message"
              required
              minLength={10}
              maxLength={5000}
              rows={4}
              placeholder="A little about your project…"
            />
          </label>
        </div>
        <div className="contact-trap" aria-hidden="true">
          <label>
            Leave this empty
            <input name="website" tabIndex={-1} autoComplete="off" />
          </label>
        </div>
        <button className="contact-submit" type="submit">
          {state === "sending" ? "Sending…" : "Send enquiry"}
          <Arrow />
        </button>
      </fieldset>
      <div className="contact-status" aria-live="polite" aria-atomic="true">
        {state === "sent" && (
          <p>Thanks — your message has been sent. We’ll be in touch.</p>
        )}
        {state === "error" && (
          <p role="alert">
            Your message couldn’t be sent. Please try again or{" "}
            <a href={`mailto:${CONTACT_EMAIL}`}>email Jeremy directly</a>.
          </p>
        )}
      </div>
      <noscript>
        <p>
          You can also{" "}
          <a href={`mailto:${CONTACT_EMAIL}`}>email Jeremy directly</a>.
        </p>
      </noscript>
    </form>
  );
}
