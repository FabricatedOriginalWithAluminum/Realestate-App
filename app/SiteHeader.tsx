"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowUpRight, Menu, X } from "lucide-react";
import { AccountMenu } from "./AccountMenu";

const navigation = [
  { id: "acasa", label: "Acasa", href: "/#acasa" },
  { id: "proiecte", label: "Proiecte", href: "/#proiecte" },
  { id: "avantaje", label: "Avantaje", href: "/#avantaje" },
  { id: "contact", label: "Contact", href: "/#contact" }
] as const;

type SectionId = (typeof navigation)[number]["id"];

export function SiteHeader() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<SectionId>("acasa");
  const headerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setMobileOpen(false);
    }
    function closeOutside(event: MouseEvent) {
      if (headerRef.current && !headerRef.current.contains(event.target as Node)) setMobileOpen(false);
    }
    function updateActive(event: Event) {
      setActiveSection((event as CustomEvent<SectionId>).detail);
    }
    document.addEventListener("keydown", closeOnEscape);
    document.addEventListener("mousedown", closeOutside);
    window.addEventListener("newgen:section-active", updateActive);
    return () => {
      document.removeEventListener("keydown", closeOnEscape);
      document.removeEventListener("mousedown", closeOutside);
      window.removeEventListener("newgen:section-active", updateActive);
    };
  }, []);

  function handleNavigation(event: React.MouseEvent<HTMLAnchorElement>, id: SectionId) {
    if (window.location.pathname !== "/") return;
    event.preventDefault();
    setMobileOpen(false);
    setActiveSection(id);
    window.dispatchEvent(new CustomEvent("newgen:navigate-section", { detail: id }));
  }

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-[#111c2d]/95 text-white shadow-[0_8px_28px_rgba(9,17,29,0.18)] backdrop-blur-xl" ref={headerRef}>
      <div className="mx-auto flex h-[72px] w-full max-w-7xl items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
        <a className="flex min-w-0 items-center gap-3 text-white" href="/#acasa" onClick={(event) => handleNavigation(event, "acasa")}>
          <span className="font-luxury grid h-9 w-9 shrink-0 place-items-center border border-newgen-green/75 text-xl text-newgen-green">N</span>
          <span className="hidden sm:block">
            <span className="block text-sm font-semibold leading-none">NewGen</span>
            <span className="mt-1 block text-[10px] text-white/45">Residence</span>
          </span>
        </a>

        <nav aria-label="Navigatie principala" className="hidden h-full items-center gap-8 lg:flex">
          {navigation.map((item) => {
            const active = activeSection === item.id;
            return (
              <a className={"relative flex h-full items-center text-xs font-semibold transition " + (active ? "text-white" : "text-white/55 hover:text-white")} href={item.href} key={item.href} onClick={(event) => handleNavigation(event, item.id)}>
                {item.label}
                <span className={"absolute inset-x-0 bottom-0 h-0.5 bg-newgen-green transition-transform duration-500 " + (active ? "scale-x-100" : "scale-x-0")} />
              </a>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <a className="hidden h-10 items-center gap-2 border-l border-white/20 px-4 text-xs font-semibold text-white/70 transition hover:text-newgen-green xl:inline-flex" href="/#contact" onClick={(event) => handleNavigation(event, "contact")}>Programeaza o vizionare <ArrowUpRight size={15} /></a>
          <AccountMenu />
          <button aria-expanded={mobileOpen} aria-label={mobileOpen ? "Inchide meniul" : "Deschide meniul"} className="grid h-10 w-10 place-items-center border border-white/25 text-white transition hover:border-newgen-green hover:text-newgen-green lg:hidden" onClick={() => setMobileOpen((value) => !value)} type="button">
            {mobileOpen ? <X size={19} /> : <Menu size={19} />}
          </button>
        </div>
      </div>

      {mobileOpen ? (
        <nav aria-label="Navigatie mobila" className="border-t border-white/10 bg-[#111c2d] px-4 py-2 shadow-xl lg:hidden">
          <div className="mx-auto grid max-w-7xl">
            {navigation.map((item, index) => (
              <a className={"flex items-center justify-between border-b border-white/10 px-2 py-3.5 text-sm font-semibold transition last:border-0 " + (activeSection === item.id ? "text-newgen-green" : "text-white/80")} href={item.href} key={item.href} onClick={(event) => handleNavigation(event, item.id)}>
                {item.label}<span className="text-[10px] text-white/35">0{index + 1}</span>
              </a>
            ))}
          </div>
        </nav>
      ) : null}
    </header>
  );
}
