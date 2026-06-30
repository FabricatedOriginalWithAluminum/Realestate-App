"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, animate, motion, useReducedMotion } from "framer-motion";
import {
  ArrowDown,
  ArrowRight,
  Check,
  KeyRound,
  Mail,
  MapPin,
  MoveUpRight,
  ShieldCheck
} from "lucide-react";

const projects = [
  {
    title: "Residence Nord",
    location: "Zona verde, aproape de centru",
    details: "42 apartamente disponibile",
    price: "de la 89.000 EUR",
    image: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1800&q=90",
    number: "01",
    description: "Arhitectura luminoasa, terase ample si un ritm de viata linistit, la cateva minute de centrul orasului."
  },
  {
    title: "Urban Garden",
    location: "Acces rapid la scoli si birouri",
    details: "28 apartamente disponibile",
    price: "de la 104.000 EUR",
    image: "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=1800&q=90",
    number: "02",
    description: "Un ansamblu contemporan creat in jurul gradinilor private si al spatiilor comune atent proportionate."
  },
  {
    title: "Skyline Homes",
    location: "Priveliste panoramica",
    details: "16 apartamente disponibile",
    price: "de la 128.000 EUR",
    image: "https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?auto=format&fit=crop&w=1800&q=90",
    number: "03",
    description: "Locuinte cu vedere deschisa, interioare generoase si finisaje selectate pentru o atmosfera calma."
  }
];

const benefits = [
  "Materiale premium si finisaje atent selectate",
  "Documentatie clara in portalul clientului",
  "Actualizari transparente despre progresul constructiei",
  "Acces securizat la datele locuintei cumparate"
];

const sections = [
  { id: "acasa", label: "Acasa" },
  { id: "proiecte", label: "Proiecte" },
  { id: "avantaje", label: "Avantaje" },
  { id: "contact", label: "Contact" }
] as const;

type SectionId = (typeof sections)[number]["id"];

const reveal = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0 }
};

export default function Home() {
  const scrollContainerRef = useRef<HTMLElement>(null);
  const scrollAnimationRef = useRef<ReturnType<typeof animate> | null>(null);
  const reduceMotion = useReducedMotion();
  const [activeSection, setActiveSection] = useState<SectionId>("acasa");
  const [activeProject, setActiveProject] = useState(0);

  function scrollToSection(id: SectionId) {
    const container = scrollContainerRef.current;
    const target = document.getElementById(id);
    if (!container || !target) return;

    scrollAnimationRef.current?.stop();
    if (reduceMotion) {
      container.scrollTop = target.offsetTop;
      return;
    }

    scrollAnimationRef.current = animate(container.scrollTop, target.offsetTop, {
      duration: 1.05,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (value) => {
        container.scrollTop = value;
      }
    });
  }

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const sectionElements = sections
      .map((section) => document.getElementById(section.id))
      .filter((element): element is HTMLElement => Boolean(element));

    const observer = new IntersectionObserver(
      (entries) => {
        const mostVisible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

        if (!mostVisible) return;
        const id = mostVisible.target.id as SectionId;
        setActiveSection(id);
        window.history.replaceState(null, "", "#" + id);
        window.dispatchEvent(new CustomEvent("newgen:section-active", { detail: id }));
      },
      { root: container, threshold: [0.35, 0.55, 0.75] }
    );

    sectionElements.forEach((element) => observer.observe(element));

    const initialSection = window.location.hash.slice(1) as SectionId;
    if (sections.some((section) => section.id === initialSection)) {
      window.requestAnimationFrame(() => {
        container.scrollTop = document.getElementById(initialSection)?.offsetTop ?? 0;
      });
    }

    function navigateFromHeader(event: Event) {
      const id = (event as CustomEvent<SectionId>).detail;
      if (sections.some((section) => section.id === id)) scrollToSection(id);
    }

    window.addEventListener("newgen:navigate-section", navigateFromHeader);
    return () => {
      observer.disconnect();
      scrollAnimationRef.current?.stop();
      window.removeEventListener("newgen:navigate-section", navigateFromHeader);
    };
  }, [reduceMotion]);

  const project = projects[activeProject];

  return (
    <>
      <main
        className="h-[calc(100svh-72px)] snap-none overflow-y-auto overscroll-y-contain bg-[#f3f0e9] [scrollbar-width:none] md:snap-y md:snap-mandatory [&::-webkit-scrollbar]:hidden"
        ref={scrollContainerRef}
      >
        <section className="relative flex min-h-full items-end overflow-hidden text-white md:h-full md:snap-start md:snap-always" data-home-section id="acasa">
          <img
            alt="Interior contemporan NewGen Residence"
            className="absolute inset-0 h-full w-full object-cover object-center"
            src="https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=2200&q=92"
          />
          <div className="absolute inset-0 bg-[#101a29]/60" />
          <div className="absolute inset-x-0 top-0 h-px bg-white/30" />

          <motion.div
            animate={activeSection === "acasa" ? "visible" : "hidden"}
            className="relative mx-auto flex w-full max-w-7xl flex-col justify-end px-6 pb-24 pt-24 md:pb-12 lg:px-8"
            initial={false}
            transition={{ duration: 0.72, ease: [0.22, 1, 0.36, 1] }}
            variants={reveal}
          >
            <div className="max-w-4xl">
              <p className="mb-5 flex items-center gap-3 text-xs font-semibold uppercase text-white/75">
                <span className="h-px w-10 bg-newgen-green" /> NewGen Residence · Bucuresti
              </p>
              <h1 className="font-luxury text-5xl font-normal leading-[0.98] text-white sm:text-6xl md:text-7xl xl:text-8xl">
                Spatiu pentru o viata<br className="hidden sm:block" /> traita frumos.
              </h1>
              <p className="mt-6 max-w-xl text-base leading-7 text-white/72 md:text-lg">
                Locuinte contemporane construite cu grija, transparenta si o atentie fireasca pentru fiecare detaliu.
              </p>
            </div>

            <div className="mt-9 flex flex-col gap-5 border-t border-white/25 pt-6 sm:flex-row sm:items-end sm:justify-between">
              <div className="flex flex-col gap-3 sm:flex-row">
                <button className="inline-flex h-12 items-center justify-center gap-3 bg-newgen-green px-6 text-sm font-bold text-[#132037] transition hover:bg-white" onClick={() => scrollToSection("proiecte")} type="button">
                  Descopera proiectele <ArrowRight size={17} />
                </button>
                <button className="inline-flex h-12 items-center justify-center border border-white/45 bg-white/5 px-6 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-white hover:text-newgen-blue" onClick={() => scrollToSection("contact")} type="button">
                  Programeaza o discutie
                </button>
              </div>
              <button aria-label="Continua la proiecte" className="hidden h-12 w-12 place-items-center border border-white/35 text-white transition hover:border-newgen-green hover:text-newgen-green md:grid" onClick={() => scrollToSection("proiecte")} type="button">
                <ArrowDown size={18} />
              </button>
            </div>

            <div className="mt-7 grid grid-cols-3 gap-4 text-white sm:max-w-lg">
              {[["86", "locuinte"], ["3", "proiecte"], ["24/7", "portal client"]].map(([value, label]) => (
                <div className="border-l border-white/30 pl-3" key={label}>
                  <p className="font-luxury text-2xl md:text-3xl">{value}</p>
                  <p className="mt-1 text-xs text-white/55">{label}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </section>

        <section className="relative flex min-h-full overflow-hidden bg-newgen-darkblue text-white md:h-full md:snap-start md:snap-always" data-home-section id="proiecte">
          <AnimatePresence mode="wait">
            <motion.img
              alt={project.title}
              animate={{ opacity: 1, scale: 1 }}
              className="absolute inset-0 h-full w-full object-cover"
              exit={{ opacity: 0 }}
              initial={{ opacity: 0, scale: 1.025 }}
              key={project.image}
              src={project.image}
              transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
            />
          </AnimatePresence>
          <div className="absolute inset-0 bg-[#101a29]/70" />

          <div className="relative mx-auto flex w-full max-w-7xl flex-col justify-between px-6 pb-24 pt-16 md:pb-10 md:pt-12 lg:px-8">
            <motion.div animate={activeSection === "proiecte" ? "visible" : "hidden"} initial={false} transition={{ duration: 0.65 }} variants={reveal}>
              <p className="flex items-center gap-3 text-xs font-semibold uppercase text-newgen-green"><span className="h-px w-10 bg-newgen-green" /> Portofoliu selectat</p>
              <div className="mt-4 flex max-w-4xl items-start gap-5">
                <span className="mt-2 font-luxury text-xl text-white/45">{project.number}</span>
                <div>
                  <AnimatePresence mode="wait">
                    <motion.h2 animate={{ opacity: 1, y: 0 }} className="font-luxury text-5xl font-normal leading-none sm:text-6xl md:text-7xl" exit={{ opacity: 0, y: -14 }} initial={{ opacity: 0, y: 14 }} key={project.title} transition={{ duration: 0.45 }}>
                      {project.title}
                    </motion.h2>
                  </AnimatePresence>
                  <p className="mt-4 flex items-center gap-2 text-sm text-white/65"><MapPin size={15} /> {project.location}</p>
                </div>
              </div>
            </motion.div>

            <div className="grid gap-8 lg:grid-cols-[1fr_1.05fr] lg:items-end">
              <motion.div animate={activeSection === "proiecte" ? "visible" : "hidden"} className="max-w-xl" initial={false} transition={{ delay: 0.12, duration: 0.65 }} variants={reveal}>
                <p className="text-base leading-7 text-white/72 md:text-lg">{project.description}</p>
                <div className="mt-6 flex flex-wrap items-center gap-x-8 gap-y-3 border-t border-white/25 pt-5">
                  <div><p className="text-xs text-white/45">Disponibilitate</p><p className="mt-1 text-sm font-semibold">{project.details}</p></div>
                  <div><p className="text-xs text-white/45">Pret</p><p className="mt-1 text-sm font-semibold text-newgen-green">{project.price}</p></div>
                  <button aria-label={"Vezi " + project.title} className="grid h-11 w-11 place-items-center border border-white/35 text-white transition hover:border-newgen-green hover:bg-newgen-green hover:text-newgen-blue" type="button"><MoveUpRight size={18} /></button>
                </div>
              </motion.div>

              <div className="grid border-t border-white/30 sm:grid-cols-3">
                {projects.map((item, index) => {
                  const active = index === activeProject;
                  return (
                    <button
                      aria-pressed={active}
                      className={"relative min-h-[76px] border-b border-white/20 px-4 py-4 text-left transition sm:border-b-0 sm:border-r " + (active ? "bg-white/12 text-white" : "text-white/55 hover:bg-white/5 hover:text-white")}
                      key={item.title}
                      onClick={() => setActiveProject(index)}
                      type="button"
                    >
                      {active ? <motion.span className="absolute inset-x-0 top-0 h-0.5 bg-newgen-green" layoutId="project-indicator" /> : null}
                      <span className="text-xs">0{index + 1}</span>
                      <span className="mt-1 block text-sm font-semibold">{item.title}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        <section className="relative flex min-h-full overflow-hidden bg-[#f3f0e9] md:h-full md:snap-start md:snap-always" data-home-section id="avantaje">
          <div className="absolute inset-y-0 right-0 hidden w-[46%] md:block">
            <img alt="Detaliu interior premium" className="h-full w-full object-cover" src="https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1400&q=90" />
            <div className="absolute inset-0 bg-newgen-blue/10" />
          </div>

          <motion.div animate={activeSection === "avantaje" ? "visible" : "hidden"} className="relative mx-auto flex w-full max-w-7xl items-center px-6 py-20 md:py-12 lg:px-8" initial={false} transition={{ duration: 0.72, ease: [0.22, 1, 0.36, 1] }} variants={reveal}>
            <div className="w-full md:max-w-[49%]">
              <p className="flex items-center gap-3 text-xs font-semibold uppercase text-newgen-blue/65"><span className="h-px w-10 bg-newgen-green" /> Standard NewGen</p>
              <h2 className="mt-5 font-luxury text-5xl font-normal leading-[1.02] text-newgen-blue sm:text-6xl">Frumos la vedere.<br />Simplu de trait.</h2>
              <p className="mt-5 max-w-lg text-base leading-7 text-newgen-black/60">
                Calitatea unei locuinte se simte in detaliile zilnice. Noi le gandim de la inceput si iti facem fiecare etapa usor de urmarit.
              </p>

              <div className="mt-8 border-t border-newgen-blue/20">
                {benefits.map((benefit, index) => (
                  <div className="flex min-h-[58px] items-center gap-4 border-b border-newgen-blue/15 py-3" key={benefit}>
                    <span className="font-luxury text-sm text-newgen-green">0{index + 1}</span>
                    <p className="flex-1 text-sm font-semibold leading-5 text-newgen-blue">{benefit}</p>
                    <Check className="text-newgen-blue/50" size={17} />
                  </div>
                ))}
              </div>

              <div className="mt-7 flex items-center gap-3 text-sm font-semibold text-newgen-blue"><KeyRound className="text-newgen-green" size={19} /> Portal dedicat fiecarui proprietar</div>
            </div>
          </motion.div>
        </section>

        <section className="relative flex min-h-full items-center overflow-hidden text-white md:h-full md:snap-start md:snap-always" data-home-section id="contact">
          <img alt="Exterior rezidential la apus" className="absolute inset-0 h-full w-full object-cover" src="https://images.unsplash.com/photo-1600607688969-a5bfcd646154?auto=format&fit=crop&w=2200&q=90" />
          <div className="absolute inset-0 bg-[#101a29]/[0.82]" />

          <motion.div animate={activeSection === "contact" ? "visible" : "hidden"} className="relative mx-auto w-full max-w-7xl px-6 py-20 md:py-12 lg:px-8" initial={false} transition={{ duration: 0.72, ease: [0.22, 1, 0.36, 1] }} variants={reveal}>
            <div className="grid gap-10 lg:grid-cols-[1fr_0.55fr] lg:items-end">
              <div>
                <p className="flex items-center gap-3 text-xs font-semibold uppercase text-newgen-green"><span className="h-px w-10 bg-newgen-green" /> O conversatie, fara presiune</p>
                <h2 className="mt-5 max-w-4xl font-luxury text-5xl font-normal leading-[1.02] sm:text-6xl md:text-7xl">Urmatoarea ta locuinta incepe cu o intrebare.</h2>
                <a className="mt-8 inline-flex h-12 items-center justify-center gap-3 bg-newgen-green px-6 text-sm font-bold text-newgen-blue transition hover:bg-white" href="mailto:contact@newgen-residence.ro">
                  Scrie-ne acum <Mail size={17} />
                </a>
              </div>

              <aside className="border-l border-white/30 pl-6 lg:pb-1">
                <p className="text-xs text-white/45">Contact direct</p>
                <a className="mt-2 block text-base font-semibold transition hover:text-newgen-green" href="mailto:contact@newgen-residence.ro">contact@newgen-residence.ro</a>
                <p className="mt-7 text-xs text-white/45">Consultanta</p>
                <p className="mt-2 text-sm leading-6 text-white/75">Disponibilitate, preturi si programarea unei vizionari, intr-o singura discutie.</p>
                <div className="mt-7 flex items-center gap-3 border-t border-white/20 pt-5 text-xs text-white/55"><ShieldCheck size={16} className="text-newgen-green" /> Datele tale raman confidentiale</div>
              </aside>
            </div>
          </motion.div>
        </section>
      </main>

      <nav aria-label="Navigare sectiuni pagina principala" className="fixed right-4 top-1/2 z-30 hidden min-w-[132px] -translate-y-1/2 flex-col border border-white/20 bg-[#111c2d]/95 px-3 py-3 shadow-[0_18px_48px_rgba(5,12,22,0.38)] backdrop-blur-xl md:flex xl:right-8">
        {sections.map((section, index) => {
          const active = activeSection === section.id;
          return (
            <button aria-current={active ? "page" : undefined} aria-label={"Mergi la " + section.label} className={"group flex h-11 items-center justify-end gap-3 border-b border-white/10 text-right transition last:border-0 " + (active ? "bg-white/[0.07]" : "hover:bg-white/[0.04]")} key={section.id} onClick={() => scrollToSection(section.id)} type="button">
              <span className={"text-[10px] font-semibold transition " + (active ? "text-white" : "text-white/65 group-hover:text-white")}>{section.label}</span>
              <span className={"text-[10px] transition " + (active ? "text-newgen-green" : "text-white/45")}>0{index + 1}</span>
              <span className={"h-px transition-all duration-500 " + (active ? "w-7 bg-newgen-green" : "w-3 bg-white/45 group-hover:w-5 group-hover:bg-white/70")} />
            </button>
          );
        })}
      </nav>

      <nav aria-label="Navigare mobila sectiuni pagina principala" className="fixed bottom-4 left-1/2 z-30 flex -translate-x-1/2 items-center border border-white/20 bg-newgen-darkblue/90 px-3 py-2 shadow-2xl backdrop-blur-md md:hidden">
        {sections.map((section, index) => {
          const active = activeSection === section.id;
          return (
            <button aria-current={active ? "page" : undefined} aria-label={"Mergi la " + section.label} className={"grid h-8 w-10 place-items-center text-[10px] font-semibold transition " + (active ? "bg-newgen-green text-newgen-blue" : "text-white/65")} key={section.id} onClick={() => scrollToSection(section.id)} type="button">0{index + 1}</button>
          );
        })}
      </nav>
    </>
  );
}
