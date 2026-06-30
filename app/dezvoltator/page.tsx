import { ArrowLeft, Building2 } from "lucide-react";
import { DeveloperLoginForm } from "./DeveloperLoginForm";

export default function DeveloperPage() {
  return (
    <main className="min-h-screen bg-newgen-darkblue text-white">
      <section className="mx-auto grid min-h-screen w-full max-w-7xl items-center gap-12 px-6 py-10 lg:grid-cols-[1fr_0.85fr] lg:px-8">
        <div>
          <a className="mb-12 inline-flex items-center gap-2 text-sm font-semibold text-white/70" href="/"><ArrowLeft size={17} /> Inapoi la prezentare</a>
          <Building2 className="text-newgen-green" size={34} />
          <h1 className="mt-6 max-w-2xl text-5xl font-semibold leading-[1.05] tracking-normal md:text-6xl">Panoul dezvoltatorului.</h1>
          <p className="mt-6 max-w-xl text-lg leading-8 text-white/65">Gestioneaza clientii si locuintele atribuite dintr-un singur loc.</p>
        </div>
        <DeveloperLoginForm />
      </section>
    </main>
  );
}