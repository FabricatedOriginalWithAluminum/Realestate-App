"use client";

import { useEffect, useState } from "react";
import { Building2, Clock3, Mail, Phone, UserRound } from "lucide-react";

type Account = { name: string; email: string; phone: string | null; apartmentId: string | null };

export function ClientHome() {
  const [account, setAccount] = useState<Account | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/client-account")
      .then(async (response) => {
        const data = (await response.json()) as { account?: Account; message?: string };
        if (!response.ok || !data.account) throw new Error(data.message ?? "Profilul nu a putut fi incarcat.");
        setAccount(data.account);
      })
      .catch((reason: Error) => setError(reason.message));
  }, []);

  if (error) {
    return (
      <div className="mx-auto max-w-xl rounded-md bg-white p-8 text-center shadow-premium">
        <h1 className="text-2xl font-semibold text-newgen-blue">Sesiunea nu este activa</h1>
        <p className="mt-3 text-newgen-black/65">{error}</p>
        <a className="mt-6 inline-flex h-11 items-center rounded-md bg-newgen-blue px-5 font-bold text-white" href="/cont-client">Inapoi la inregistrare</a>
      </div>
    );
  }
  if (!account) return <p className="text-center font-semibold text-white">Se incarca profilul...</p>;

  return (
    <div className="mx-auto w-full max-w-6xl">

      <div className="grid gap-10 py-12 lg:grid-cols-[1fr_340px] lg:py-16">
        <section>
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-newgen-green">Contul meu</p>
          <h1 className="mt-3 text-4xl font-semibold text-white md:text-5xl">Bine ai venit, {account.name.split(" ")[0]}.</h1>
          <p className="mt-4 max-w-2xl text-lg leading-8 text-white/65">Aici vei gasi informatiile despre locuinta ta si actualizarile transmise de dezvoltator.</p>
          <div className="mt-10 border-l-4 border-newgen-green bg-white p-7 shadow-premium">
            <div className="flex items-start gap-4">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-md bg-newgen-green/15 text-newgen-blue">
                {account.apartmentId ? <Building2 size={22} /> : <Clock3 size={22} />}
              </span>
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.12em] text-newgen-green">Status apartament</p>
                <h2 className="mt-2 text-2xl font-semibold text-newgen-blue">{account.apartmentId ? "Apartament asignat" : "In asteptarea atribuirii"}</h2>
                <p className="mt-2 leading-7 text-newgen-black/65">{account.apartmentId ? "Dezvoltatorul ti-a asociat locuinta achizitionata." : "Contul tau este activ. Dezvoltatorul va atribui in curand apartamentul achizitionat."}</p>
              </div>
            </div>
          </div>
        </section>
        <aside className="border-t border-white/15 pt-8 lg:border-l lg:border-t-0 lg:pl-8 lg:pt-0">
          <h2 className="text-lg font-semibold text-white">Date personale</h2>
          <dl className="mt-6 grid gap-5 text-sm">
            <div className="flex gap-3"><UserRound className="text-newgen-green" size={18} /><div><dt className="text-white/45">Nume</dt><dd className="mt-1 font-semibold text-white">{account.name}</dd></div></div>
            <div className="flex gap-3"><Mail className="text-newgen-green" size={18} /><div><dt className="text-white/45">Email</dt><dd className="mt-1 font-semibold text-white">{account.email}</dd></div></div>
            <div className="flex gap-3"><Phone className="text-newgen-green" size={18} /><div><dt className="text-white/45">Telefon</dt><dd className="mt-1 font-semibold text-white">{account.phone || "Necompletat"}</dd></div></div>
          </dl>
        </aside>
      </div>
    </div>
  );
}
