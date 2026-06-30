"use client";

import { useEffect, useState } from "react";
import { ArrowLeft, Mail, Phone, Save, UserRound } from "lucide-react";

type Profile = {
  name: string;
  email: string;
  phone: string | null;
  role: "client" | "developer";
  target: string;
};

export function ProfileForm() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/session-summary")
      .then(() => fetch("/api/profile"))
      .then(async (response) => {
        const data = (await response.json()) as { profile?: Profile; message?: string };
        if (!response.ok || !data.profile) throw new Error(data.message ?? "Profilul nu a putut fi incarcat.");
        setProfile(data.profile);
      })
      .catch((reason: Error) => setError(reason.message));
  }, []);

  async function saveProfile(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setMessage("");
    setError("");
    const payload = Object.fromEntries(new FormData(event.currentTarget).entries());

    const response = await fetch("/api/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    const data = (await response.json()) as { profile?: Profile; message?: string };

    if (!response.ok || !data.profile) {
      setError(data.message ?? "Profilul nu a putut fi actualizat.");
      setSaving(false);
      return;
    }
    setProfile(data.profile);
    setMessage(data.message ?? "Profilul a fost actualizat.");
    setSaving(false);
  }

  if (error && !profile) {
    return <div className="mx-auto max-w-xl py-20 text-center"><h1 className="text-2xl font-semibold text-newgen-blue">Profil indisponibil</h1><p className="mt-3 text-newgen-black/60">{error}</p><a className="mt-6 inline-flex rounded-md bg-newgen-blue px-5 py-3 font-bold text-white" href="/cont-client">Autentificare</a></div>;
  }
  if (!profile) return <p className="py-20 text-center font-semibold text-newgen-blue">Se incarca profilul...</p>;

  return (
    <div className="mx-auto w-full max-w-4xl">
      <a className="inline-flex items-center gap-2 text-sm font-semibold text-white/70 hover:text-white" href={profile.target}><ArrowLeft size={17} /> Inapoi</a>
      <div className="mt-8 grid gap-10 bg-white p-7 shadow-premium md:grid-cols-[260px_1fr] md:p-10">
        <aside className="border-b border-newgen-grey/35 pb-8 md:border-b-0 md:border-r md:pb-0 md:pr-8">
          <span className="grid h-16 w-16 place-items-center rounded-full bg-newgen-blue text-white"><UserRound size={28} /></span>
          <h1 className="mt-5 text-2xl font-semibold text-newgen-blue">{profile.name}</h1>
          <p className="mt-2 text-sm text-newgen-black/55">{profile.role === "developer" ? "Dezvoltator" : "Client"}</p>
        </aside>

        <form onSubmit={saveProfile}>
          <p className="text-sm font-bold uppercase tracking-[0.16em] text-newgen-green">Date cont</p>
          <h2 className="mt-2 text-3xl font-semibold text-newgen-blue">Profilul meu</h2>
          <div className="mt-7 grid gap-5">
            <label className="grid gap-2 text-sm font-semibold text-newgen-blue">Nume complet<span className="relative"><UserRound className="pointer-events-none absolute left-3 top-3.5 text-newgen-grey" size={18} /><input className="h-12 w-full rounded-md border border-newgen-grey/55 pl-10 pr-4 outline-none focus:border-newgen-blue" defaultValue={profile.name} name="name" required /></span></label>
            <label className="grid gap-2 text-sm font-semibold text-newgen-blue">Email<span className="relative"><Mail className="pointer-events-none absolute left-3 top-3.5 text-newgen-grey" size={18} /><input className="h-12 w-full rounded-md border border-newgen-grey/40 bg-newgen-blue/5 pl-10 pr-4 text-newgen-black/55" disabled value={profile.email} /></span></label>
            {profile.role === "client" ? <label className="grid gap-2 text-sm font-semibold text-newgen-blue">Telefon<span className="relative"><Phone className="pointer-events-none absolute left-3 top-3.5 text-newgen-grey" size={18} /><input className="h-12 w-full rounded-md border border-newgen-grey/55 pl-10 pr-4 outline-none focus:border-newgen-blue" defaultValue={profile.phone ?? ""} name="phone" /></span></label> : null}
          </div>
          <button className="mt-7 inline-flex h-12 items-center justify-center gap-2 rounded-md bg-newgen-blue px-6 font-bold text-white disabled:opacity-60" disabled={saving} type="submit"><Save size={18} />{saving ? "Se salveaza..." : "Salveaza modificarile"}</button>
          {message ? <p className="mt-4 rounded-md bg-newgen-green/15 px-4 py-3 text-sm font-semibold text-newgen-blue">{message}</p> : null}
          {error ? <p className="mt-4 rounded-md bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{error}</p> : null}
        </form>
      </div>
    </div>
  );
}