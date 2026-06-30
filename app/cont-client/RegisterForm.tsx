"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { KeyRound, LockKeyhole, Mail, Phone, UserRound } from "lucide-react";

type Mode = "login" | "register";
type Status = { type: "idle" | "success" | "error"; message: string };

const inputClass = "h-12 w-full rounded-md border border-newgen-grey/50 pl-10 pr-4 outline-none transition focus:border-newgen-blue";

export function RegisterForm() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("login");
  const [status, setStatus] = useState<Status>({ type: "idle", message: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  function changeMode(nextMode: Mode) {
    setMode(nextMode);
    setStatus({ type: "idle", message: "" });
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setStatus({ type: "idle", message: "" });

    const payload = Object.fromEntries(new FormData(event.currentTarget).entries());
    const endpoint = mode === "login" ? "/api/client-login" : "/api/client-register";

    const requestOptions: RequestInit = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    };

    try {
      let response: Response;
      try {
        response = await fetch(endpoint, requestOptions);
      } catch {
        await new Promise((resolve) => window.setTimeout(resolve, 900));
        response = await fetch(endpoint, requestOptions);
      }

      const contentType = response.headers.get("content-type") ?? "";
      if (!contentType.includes("application/json")) {
        throw new Error("Serverul este momentan indisponibil. Reincarca pagina si incearca din nou.");
      }

      const data = (await response.json()) as { message?: string; redirectTo?: string };
      if (!response.ok) throw new Error(data.message ?? "A aparut o eroare.");

      setStatus({ type: "success", message: mode === "login" ? "Autentificare reusita." : "Contul a fost creat." });
      router.push(data.redirectTo ?? "/cont-client/acasa");
    } catch (error) {
      const message = error instanceof TypeError
        ? "Nu ne-am putut conecta la server. Verifica daca aplicatia este pornita si incearca din nou."
        : error instanceof Error ? error.message : "A aparut o eroare.";
      setStatus({ type: "error", message });
      setIsSubmitting(false);
    }
  }

  return (
    <div className="rounded-md border border-newgen-grey/30 bg-white p-6 shadow-premium md:p-8">
      <div className="grid grid-cols-2 rounded-md bg-newgen-blue/5 p-1" role="tablist" aria-label="Acces portal client">
        <button className={"h-11 rounded-md text-sm font-bold transition " + (mode === "login" ? "bg-newgen-blue text-white shadow-sm" : "text-newgen-blue hover:bg-white")} onClick={() => changeMode("login")} type="button" role="tab" aria-selected={mode === "login"}>Autentificare</button>
        <button className={"h-11 rounded-md text-sm font-bold transition " + (mode === "register" ? "bg-newgen-blue text-white shadow-sm" : "text-newgen-blue hover:bg-white")} onClick={() => changeMode("register")} type="button" role="tab" aria-selected={mode === "register"}>Cont nou</button>
      </div>

      <form className="mt-7" onSubmit={handleSubmit}>
        <div className="mb-7">
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-newgen-green">Portal client</p>
          <h2 className="mt-2 text-3xl font-semibold text-newgen-blue">{mode === "login" ? "Bine ai revenit" : "Date cont"}</h2>
        </div>

        <div className="grid gap-4">
          {mode === "register" ? <label className="grid gap-2 text-sm font-semibold text-newgen-blue">Nume complet<span className="relative"><UserRound className="pointer-events-none absolute left-3 top-3.5 text-newgen-grey" size={18} /><input className={inputClass} name="name" placeholder="Popescu Andrei" required /></span></label> : null}
          <label className="grid gap-2 text-sm font-semibold text-newgen-blue">Email<span className="relative"><Mail className="pointer-events-none absolute left-3 top-3.5 text-newgen-grey" size={18} /><input className={inputClass} name="email" placeholder="andrei@email.ro" required type="email" /></span></label>
          {mode === "register" ? <label className="grid gap-2 text-sm font-semibold text-newgen-blue">Telefon<span className="relative"><Phone className="pointer-events-none absolute left-3 top-3.5 text-newgen-grey" size={18} /><input className={inputClass} name="phone" placeholder="07xx xxx xxx" /></span></label> : null}
          <label className="grid gap-2 text-sm font-semibold text-newgen-blue">Parola<span className="relative"><LockKeyhole className="pointer-events-none absolute left-3 top-3.5 text-newgen-grey" size={18} /><input className={inputClass} minLength={8} name="password" placeholder="Minimum 8 caractere" required type="password" /></span></label>
          {mode === "register" ? <label className="grid gap-2 text-sm font-semibold text-newgen-blue">Cod dezvoltator<span className="relative"><KeyRound className="pointer-events-none absolute left-3 top-3.5 text-newgen-grey" size={18} /><input className={inputClass} name="developerCode" placeholder="TEST_DEV" required /></span></label> : null}
        </div>

        <button className="mt-7 inline-flex h-12 w-full items-center justify-center rounded-md bg-newgen-blue px-6 text-sm font-bold text-white shadow-lg shadow-newgen-blue/20 transition hover:bg-newgen-darkblue disabled:cursor-not-allowed disabled:opacity-60" disabled={isSubmitting} type="submit">
          {isSubmitting ? "Se proceseaza..." : mode === "login" ? "Intra in cont" : "Creeaza cont"}
        </button>

        {status.message ? <p className={"mt-5 rounded-md px-4 py-3 text-sm font-semibold " + (status.type === "success" ? "bg-newgen-green/15 text-newgen-blue" : "bg-red-50 text-red-700")}>{status.message}</p> : null}
      </form>
    </div>
  );
}
