"use client";

import { useEffect, useMemo, useState } from "react";
import {
  BadgeCheck,
  Building2,
  CircleCheck,
  Clock3,
  Search,
  UserRound,
  UsersRound
} from "lucide-react";

type Client = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  createdAt: string;
  assignment: null | { typeName: string; rooms: number; areaSqm: number };
};

type Project = {
  id: string;
  name: string;
  slug: string;
  location: string | null;
  status: "planning" | "active" | "completed";
};

type InventoryUnit = {
  id: string;
  unitLabel: string;
  floor: number;
  areaSqm: number;
  priceEur: number | null;
  status: "available" | "reserved" | "sold";
  updatedAt: string;
  project: { id: string; name: string };
  apartmentType: { id: string; name: string; rooms: number };
};

type PanelTab = "clients" | "inventory";

const statusDetails = {
  available: {
    label: "Disponibil",
    className: "bg-emerald-50 text-emerald-700",
    Icon: CircleCheck
  },
  reserved: {
    label: "Rezervat",
    className: "bg-amber-50 text-amber-700",
    Icon: Clock3
  },
  sold: {
    label: "Vandut",
    className: "bg-newgen-blue/10 text-newgen-blue",
    Icon: BadgeCheck
  }
} as const;

const priceFormatter = new Intl.NumberFormat("ro-RO", {
  style: "currency",
  currency: "EUR",
  maximumFractionDigits: 0
});

export function DeveloperPanel() {
  const [activeTab, setActiveTab] = useState<PanelTab>("clients");
  const [clients, setClients] = useState<Client[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [units, setUnits] = useState<InventoryUnit[]>([]);
  const [clientQuery, setClientQuery] = useState("");
  const [clientFilter, setClientFilter] = useState("all");
  const [unitQuery, setUnitQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [projectFilter, setProjectFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([fetch("/api/developer-clients"), fetch("/api/developer-inventory")])
      .then(async ([clientsResponse, inventoryResponse]) => {
        const clientsData = (await clientsResponse.json()) as { clients?: Client[]; message?: string };
        const inventoryData = (await inventoryResponse.json()) as {
          projects?: Project[];
          units?: InventoryUnit[];
          message?: string;
        };

        if (!clientsResponse.ok || !clientsData.clients) {
          throw new Error(clientsData.message ?? "Lista clientilor nu a putut fi incarcata.");
        }
        if (!inventoryResponse.ok || !inventoryData.projects || !inventoryData.units) {
          throw new Error(inventoryData.message ?? "Inventarul nu a putut fi incarcat.");
        }

        setClients(clientsData.clients);
        setProjects(inventoryData.projects);
        setUnits(inventoryData.units);
      })
      .catch((reason: Error) => setError(reason.message))
      .finally(() => setLoading(false));
  }, []);

  const visibleClients = useMemo(() => clients.filter((client) => {
    const matchesQuery = (client.name + " " + client.email).toLowerCase().includes(clientQuery.toLowerCase());
    const matchesFilter = clientFilter === "all" || (clientFilter === "assigned" ? Boolean(client.assignment) : !client.assignment);
    return matchesQuery && matchesFilter;
  }), [clients, clientQuery, clientFilter]);

  const visibleUnits = useMemo(() => units.filter((unit) => {
    const matchesQuery = (unit.unitLabel + " " + unit.project.name + " " + unit.apartmentType.name)
      .toLowerCase()
      .includes(unitQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || unit.status === statusFilter;
    const matchesProject = projectFilter === "all" || unit.project.id === projectFilter;
    return matchesQuery && matchesStatus && matchesProject;
  }), [units, unitQuery, statusFilter, projectFilter]);

  const inventoryCounts = useMemo(() => ({
    available: units.filter((unit) => unit.status === "available").length,
    reserved: units.filter((unit) => unit.status === "reserved").length,
    sold: units.filter((unit) => unit.status === "sold").length
  }), [units]);

  if (loading) {
    return <main className="grid min-h-[calc(100svh-72px)] place-items-center bg-[#f5f7f9]"><p className="text-sm font-semibold text-newgen-blue">Se incarca panoul...</p></main>;
  }

  if (error) {
    return (
      <main className="grid min-h-[calc(100svh-72px)] place-items-center bg-[#f5f7f9] px-6 text-center">
        <div>
          <h1 className="text-2xl font-semibold text-newgen-blue">Acces indisponibil</h1>
          <p className="mt-3 text-newgen-black/60">{error}</p>
          <a className="mt-5 inline-flex bg-newgen-blue px-5 py-3 font-bold text-white" href="/dezvoltator">Autentificare</a>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-[calc(100svh-72px)] bg-[#f5f7f9] text-newgen-black">
      <section className="mx-auto max-w-7xl px-5 py-8 sm:px-6 lg:px-8 lg:py-10">
        <div className="flex flex-col justify-between gap-5 border-b border-newgen-grey/40 pb-6 md:flex-row md:items-end">
          <div>
            <p className="text-xs font-bold uppercase text-newgen-green">Administrare portofoliu</p>
            <h1 className="mt-2 font-luxury text-4xl font-normal text-newgen-blue md:text-5xl">Panou dezvoltator</h1>
          </div>
          <p className="max-w-md text-sm leading-6 text-newgen-black/55">Urmareste clientii si disponibilitatea apartamentelor din toate proiectele NewGen.</p>
        </div>

        <div className="mt-6 inline-flex border border-newgen-blue/15 bg-white p-1" role="tablist" aria-label="Sectiuni panou dezvoltator">
          <button aria-selected={activeTab === "clients"} className={"inline-flex h-10 items-center gap-2 px-4 text-sm font-bold transition " + (activeTab === "clients" ? "bg-newgen-blue text-white" : "text-newgen-blue hover:bg-newgen-blue/5")} onClick={() => setActiveTab("clients")} role="tab" type="button"><UsersRound size={17} /> Clienti</button>
          <button aria-selected={activeTab === "inventory"} className={"inline-flex h-10 items-center gap-2 px-4 text-sm font-bold transition " + (activeTab === "inventory" ? "bg-newgen-blue text-white" : "text-newgen-blue hover:bg-newgen-blue/5")} onClick={() => setActiveTab("inventory")} role="tab" type="button"><Building2 size={17} /> Inventar</button>
        </div>

        {activeTab === "clients" ? (
          <section className="mt-7" role="tabpanel">
            <div className="flex flex-wrap items-end justify-between gap-5">
              <div><p className="text-xs font-bold uppercase text-newgen-black/45">Portofoliu clienti</p><h2 className="mt-1 text-2xl font-semibold text-newgen-blue">Clienti inregistrati</h2></div>
              <div className="flex gap-3 text-sm"><span className="bg-white px-4 py-3 font-semibold shadow-sm"><UsersRound className="mr-2 inline text-newgen-blue" size={17} />{clients.length} total</span><span className="bg-newgen-green/15 px-4 py-3 font-semibold text-newgen-blue"><Building2 className="mr-2 inline" size={17} />{clients.filter((client) => client.assignment).length} atribuiti</span></div>
            </div>

            <div className="mt-5 flex flex-wrap gap-3 border-y border-newgen-grey/35 py-4">
              <label className="relative min-w-[260px] flex-1"><Search className="absolute left-3 top-3 text-newgen-grey" size={18} /><input className="h-11 w-full border border-newgen-grey/45 bg-white pl-10 pr-4 outline-none focus:border-newgen-blue" onChange={(event) => setClientQuery(event.target.value)} placeholder="Cauta dupa nume sau email" value={clientQuery} /></label>
              <select aria-label="Filtreaza clientii" className="h-11 border border-newgen-grey/45 bg-white px-4 font-semibold text-newgen-blue outline-none" onChange={(event) => setClientFilter(event.target.value)} value={clientFilter}><option value="all">Toti clientii</option><option value="unassigned">Neatribuiti</option><option value="assigned">Atribuiti</option></select>
            </div>

            <div className="mt-5 overflow-hidden border border-newgen-grey/35 bg-white">
              <div className="hidden grid-cols-[1.3fr_1.3fr_.8fr_.8fr] gap-4 border-b border-newgen-grey/35 bg-newgen-blue/5 px-5 py-3 text-xs font-bold uppercase text-newgen-blue md:grid"><span>Client</span><span>Contact</span><span>Status</span><span>Apartament</span></div>
              {visibleClients.map((client) => (
                <article className="grid gap-4 border-b border-newgen-grey/25 px-5 py-5 last:border-0 md:grid-cols-[1.3fr_1.3fr_.8fr_.8fr] md:items-center" key={client.id}>
                  <div className="flex items-center gap-3"><span className="grid h-10 w-10 place-items-center bg-newgen-blue/8 text-newgen-blue"><UserRound size={19} /></span><div><p className="font-bold text-newgen-blue">{client.name}</p><p className="mt-1 text-xs text-newgen-black/45">Din {new Date(client.createdAt).toLocaleDateString("ro-RO")}</p></div></div>
                  <div><p className="text-sm font-semibold">{client.email}</p><p className="mt-1 text-xs text-newgen-black/50">{client.phone || "Fara telefon"}</p></div>
                  <div><span className={"inline-flex px-3 py-1.5 text-xs font-bold " + (client.assignment ? "bg-newgen-green/15 text-newgen-blue" : "bg-amber-50 text-amber-700")}>{client.assignment ? "Atribuit" : "Neatribuit"}</span></div>
                  <div className="text-sm font-semibold text-newgen-blue">{client.assignment ? client.assignment.typeName + " · " + client.assignment.areaSqm + " m²" : "—"}</div>
                </article>
              ))}
              {!visibleClients.length ? <p className="px-5 py-12 text-center text-newgen-black/50">Nu exista clienti pentru filtrul selectat.</p> : null}
            </div>
          </section>
        ) : (
          <section className="mt-7" role="tabpanel">
            <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
              <div><p className="text-xs font-bold uppercase text-newgen-black/45">Portofoliu locuinte</p><h2 className="mt-1 text-2xl font-semibold text-newgen-blue">Inventar apartamente</h2></div>
              <p className="text-sm text-newgen-black/50">{projects.length} proiecte active · {units.length} unitati</p>
            </div>

            <div className="mt-5 grid gap-px overflow-hidden border border-newgen-blue/10 bg-newgen-blue/10 sm:grid-cols-3">
              {([
                ["available", "Disponibile", inventoryCounts.available, CircleCheck],
                ["reserved", "Rezervate", inventoryCounts.reserved, Clock3],
                ["sold", "Vandute", inventoryCounts.sold, BadgeCheck]
              ] as const).map(([status, label, count, Icon]) => (
                <button className={"flex min-h-[86px] items-center justify-between bg-white px-5 text-left transition hover:bg-newgen-blue/[0.03] " + (statusFilter === status ? "shadow-[inset_0_-3px_0_#8dcb39]" : "")} key={status} onClick={() => setStatusFilter(statusFilter === status ? "all" : status)} type="button">
                  <div><p className="text-2xl font-bold text-newgen-blue">{count}</p><p className="mt-1 text-xs font-semibold text-newgen-black/50">{label}</p></div><Icon className="text-newgen-green" size={22} />
                </button>
              ))}
            </div>

            <div className="mt-5 grid gap-3 border-y border-newgen-grey/35 py-4 md:grid-cols-[1fr_auto_auto]">
              <label className="relative"><Search className="absolute left-3 top-3 text-newgen-grey" size={18} /><input className="h-11 w-full border border-newgen-grey/45 bg-white pl-10 pr-4 outline-none focus:border-newgen-blue" onChange={(event) => setUnitQuery(event.target.value)} placeholder="Cauta unitate, proiect sau tip" value={unitQuery} /></label>
              <select aria-label="Filtreaza dupa proiect" className="h-11 border border-newgen-grey/45 bg-white px-4 font-semibold text-newgen-blue outline-none" onChange={(event) => setProjectFilter(event.target.value)} value={projectFilter}><option value="all">Toate proiectele</option>{projects.map((project) => <option key={project.id} value={project.id}>{project.name}</option>)}</select>
              <select aria-label="Filtreaza dupa status" className="h-11 border border-newgen-grey/45 bg-white px-4 font-semibold text-newgen-blue outline-none" onChange={(event) => setStatusFilter(event.target.value)} value={statusFilter}><option value="all">Toate statusurile</option><option value="available">Disponibile</option><option value="reserved">Rezervate</option><option value="sold">Vandute</option></select>
            </div>

            <div className="mt-5 overflow-hidden border border-newgen-grey/35 bg-white">
              <div className="hidden grid-cols-[.8fr_1.2fr_1.25fr_.55fr_.8fr_.8fr] gap-4 border-b border-newgen-grey/35 bg-newgen-blue/5 px-5 py-3 text-xs font-bold uppercase text-newgen-blue lg:grid"><span>Unitate</span><span>Proiect</span><span>Tip</span><span>Etaj</span><span>Pret</span><span>Status</span></div>
              {visibleUnits.map((unit) => {
                const status = statusDetails[unit.status];
                return (
                  <article className="grid gap-3 border-b border-newgen-grey/25 px-5 py-5 last:border-0 sm:grid-cols-2 lg:grid-cols-[.8fr_1.2fr_1.25fr_.55fr_.8fr_.8fr] lg:items-center" key={unit.id}>
                    <div><p className="text-xs font-semibold uppercase text-newgen-black/40 lg:hidden">Unitate</p><p className="mt-1 font-bold text-newgen-blue">{unit.unitLabel}</p></div>
                    <div><p className="text-xs font-semibold uppercase text-newgen-black/40 lg:hidden">Proiect</p><p className="mt-1 text-sm font-semibold">{unit.project.name}</p></div>
                    <div><p className="text-xs font-semibold uppercase text-newgen-black/40 lg:hidden">Tip</p><p className="mt-1 text-sm font-semibold text-newgen-blue">{unit.apartmentType.name}</p><p className="mt-1 text-xs text-newgen-black/45">{unit.areaSqm} m²</p></div>
                    <div><p className="text-xs font-semibold uppercase text-newgen-black/40 lg:hidden">Etaj</p><p className="mt-1 text-sm font-semibold">{unit.floor}</p></div>
                    <div><p className="text-xs font-semibold uppercase text-newgen-black/40 lg:hidden">Pret</p><p className="mt-1 text-sm font-semibold">{unit.priceEur === null ? "Nespecificat" : priceFormatter.format(unit.priceEur)}</p></div>
                    <div><p className="text-xs font-semibold uppercase text-newgen-black/40 lg:hidden">Status</p><span className={"mt-1 inline-flex items-center gap-2 px-3 py-1.5 text-xs font-bold " + status.className}><status.Icon size={14} />{status.label}</span></div>
                  </article>
                );
              })}
              {!visibleUnits.length ? <p className="px-5 py-12 text-center text-newgen-black/50">Nu exista apartamente pentru filtrele selectate.</p> : null}
            </div>
          </section>
        )}
      </section>
    </main>
  );
}
