"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LockKeyhole, Mail } from "lucide-react";

export function DeveloperLoginForm() {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setMessage("");
    const payload = Object.fromEntries(new FormData(event.currentTarget).entries());

    const response = await fetch("/api/developer-login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    const data = (await response.json()) as { message?: string };

    if (!response.ok) {
      setMessage(data.message ?? "Autentificarea nu a reusit.");
      setSubmitting(false);
      return;
    }
    router.push("/dezvoltator/panou");
  }

  return (
    <form className="rounded-md border border-white/10 bg-white p-7 shadow-premium md:p-9" onSubmit={handleSubmit}>
      <p className="text-sm font-bold uppercase tracking-[0.18em] text-newgen-green">Administrare</p>
      <h2 className="mt-2 text-3xl font-semibold text-newgen-blue">Cont dezvoltator</h2>
      <div className="mt-7 grid gap-4">
        <label className="grid gap-2 text-sm font-semibold text-newgen-blue">Email<span className="relative"><Mail className="pointer-events-none absolute left-3 top-3.5 text-newgen-grey" size={18} /><input className="h-12 w-full rounded-md border border-newgen-grey/50 pl-10 pr-4 outline-none focus:border-newgen-blue" name="email" required type="email" /></span></label>
        <label className="grid gap-2 text-sm font-semibold text-newgen-blue">Parola<span className="relative"><LockKeyhole className="pointer-events-none absolute left-3 top-3.5 text-newgen-grey" size={18} /><input className="h-12 w-full rounded-md border border-newgen-grey/50 pl-10 pr-4 outline-none focus:border-newgen-blue" name="password" required type="password" /></span></label>
      </div>
      <button className="mt-7 h-12 w-full rounded-md bg-newgen-blue font-bold text-white disabled:opacity-60" disabled={submitting} type="submit">{submitting ? "Se verifica..." : "Intra in panou"}</button>
      {message ? <p className="mt-4 rounded-md bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{message}</p> : null}
    </form>
  );
}