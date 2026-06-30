import { ArrowLeft } from "lucide-react";
import { RegisterForm } from "./RegisterForm";

export default function ClientAccountPage() {
  return (
    <main className="min-h-screen bg-[#f7f9fb] text-newgen-black">
      <section className="mx-auto grid min-h-screen w-full max-w-7xl items-center gap-12 px-6 py-10 lg:grid-cols-[0.9fr_1.1fr] lg:px-8">
        <div>
          <a className="mb-10 inline-flex items-center gap-2 text-sm font-semibold text-newgen-blue" href="/">
            <ArrowLeft size={17} /> Inapoi la prezentare
          </a>
          <p className="mb-5 inline-flex rounded-md bg-newgen-green/15 px-3 py-2 text-sm font-semibold text-newgen-blue">Portal securizat NewGen</p>
          <h1 className="max-w-2xl text-5xl font-semibold leading-[1.05] tracking-normal text-newgen-blue md:text-6xl">Acceseaza contul tau de client.</h1>
          <p className="mt-6 max-w-xl text-lg leading-8 text-newgen-black/70">Autentifica-te pentru a vedea starea apartamentului sau creeaza un cont folosind codul primit de la dezvoltator.</p>
        </div>
        <RegisterForm />
      </section>
    </main>
  );
}
