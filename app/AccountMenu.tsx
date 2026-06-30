"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown, LogOut, UserRound } from "lucide-react";

type Account = { name: string; role: "client" | "developer"; target: string };

export function AccountMenu() {
  const [account, setAccount] = useState<Account | null | undefined>(undefined);
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/session-summary")
      .then((response) => response.json())
      .then((data: { authenticated?: boolean; account?: Account }) => {
        setAccount(data.authenticated && data.account ? data.account : null);
      })
      .catch(() => setAccount(null));
  }, []);

  useEffect(() => {
    function closeMenu(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) setOpen(false);
    }
    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", closeMenu);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("mousedown", closeMenu);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, []);

  async function logout() {
    await fetch("/api/logout", { method: "POST" });
    window.location.href = "/";
  }

  if (account === undefined) {
    return <span className="h-10 w-[148px] border border-white/15 bg-white/5" aria-hidden="true" />;
  }

  if (!account) {
    return <a className="inline-flex h-10 items-center border border-white/30 bg-white px-4 text-xs font-bold text-newgen-blue transition hover:border-newgen-green hover:bg-newgen-green" href="/cont-client">Login / Register</a>;
  }

  return (
    <div className="relative" ref={menuRef}>
      <button
        aria-expanded={open}
        aria-haspopup="menu"
        className="inline-flex h-10 max-w-[180px] items-center gap-2 border border-white/25 bg-white/5 px-2.5 pr-3 text-xs font-semibold text-white transition hover:border-newgen-green hover:bg-white/10"
        onClick={() => setOpen((value) => !value)}
        type="button"
      >
        <span className="grid h-7 w-7 shrink-0 place-items-center bg-newgen-green text-newgen-blue"><UserRound size={15} /></span>
        <span className="min-w-0 flex-1 truncate">{account.name}</span>
        <ChevronDown className={"shrink-0 transition " + (open ? "rotate-180" : "")} size={15} />
      </button>

      {open ? (
        <div className="absolute right-0 z-50 mt-2 w-48 overflow-hidden border border-newgen-blue/10 bg-white py-1 shadow-2xl" role="menu">
          <a className="flex items-center gap-3 px-4 py-3 text-sm font-semibold text-newgen-blue transition hover:bg-newgen-blue/5" href="/profil" role="menuitem">
            <UserRound size={17} /> Vezi profil
          </a>
          <button className="flex w-full items-center gap-3 border-t border-newgen-grey/30 px-4 py-3 text-left text-sm font-semibold text-red-700 transition hover:bg-red-50" onClick={logout} role="menuitem" type="button">
            <LogOut size={17} /> Log out
          </button>
        </div>
      ) : null}
    </div>
  );
}
