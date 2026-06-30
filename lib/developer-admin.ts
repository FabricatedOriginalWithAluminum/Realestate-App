import { signInClient } from "@/lib/supabase-admin";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const adminKey = process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY;

function requireConfiguration() {
  if (!supabaseUrl || !adminKey) throw new Error("Supabase is not configured.");
}

async function getAuthenticatedUser(accessToken: string) {
  requireConfiguration();
  const response = await fetch(supabaseUrl + "/auth/v1/user", {
    headers: { apikey: adminKey!, Authorization: "Bearer " + accessToken }
  });
  const user = (await response.json()) as { id?: string; email?: string };
  if (!response.ok || !user.id) throw new Error("Sesiunea a expirat.");
  return user;
}

export async function getAccountRole(accessToken: string) {
  const user = await getAuthenticatedUser(accessToken);
  const response = await fetch(
    supabaseUrl + "/rest/v1/user_roles?select=role&user_id=eq." + encodeURIComponent(user.id!),
    { headers: { apikey: adminKey! } }
  );
  const roles = (await response.json()) as Array<{ role: "client" | "developer" }>;
  if (!response.ok || !roles[0]) throw new Error("Rolul contului nu a fost gasit.");
  return { user, role: roles[0].role };
}
export async function requireDeveloper(accessToken: string) {
  const user = await getAuthenticatedUser(accessToken);
  const response = await fetch(
    supabaseUrl + "/rest/v1/user_roles?select=role&user_id=eq." + encodeURIComponent(user.id!),
    { headers: { apikey: adminKey! } }
  );
  const roles = (await response.json()) as Array<{ role: string }>;
  if (!response.ok || roles[0]?.role !== "developer") throw new Error("Accesul este permis doar dezvoltatorului.");
  return user;
}

export async function authenticateDeveloper(email: string, password: string) {
  const session = await signInClient(email, password);
  await requireDeveloper(session.access_token!);
  return session;
}

export async function listDeveloperClients(accessToken: string) {
  await requireDeveloper(accessToken);
  requireConfiguration();

  const headers = { apikey: adminKey! };
  const [clientsResponse, assignmentsResponse, typesResponse] = await Promise.all([
    fetch(supabaseUrl + "/rest/v1/client_profiles?select=id,name,email,phone,created_at&order=created_at.desc", { headers }),
    fetch(supabaseUrl + "/rest/v1/client_apartment_assignments?select=id,client_id,apartment_type_id,project_name,unit_label,floor,assigned_at", { headers }),
    fetch(supabaseUrl + "/rest/v1/apartment_types?select=id,name,rooms,area_sqm", { headers })
  ]);

  if (!clientsResponse.ok || !assignmentsResponse.ok || !typesResponse.ok) {
    throw new Error("Lista clientilor nu a putut fi incarcata.");
  }

  const clients = (await clientsResponse.json()) as Array<{
    id: string; name: string; email: string; phone: string | null; created_at: string;
  }>;
  const assignments = (await assignmentsResponse.json()) as Array<{
    id: string; client_id: string; apartment_type_id: string; project_name: string | null;
    unit_label: string | null; floor: number | null; assigned_at: string;
  }>;
  const types = (await typesResponse.json()) as Array<{
    id: string; name: string; rooms: number; area_sqm: number;
  }>;

  return clients.map((client) => {
    const assignment = assignments.find((item) => item.client_id === client.id);
    const apartmentType = assignment ? types.find((item) => item.id === assignment.apartment_type_id) : undefined;
    return {
      id: client.id,
      name: client.name,
      email: client.email,
      phone: client.phone,
      createdAt: client.created_at,
      assignment: assignment && apartmentType ? {
        id: assignment.id,
        typeName: apartmentType.name,
        rooms: apartmentType.rooms,
        areaSqm: apartmentType.area_sqm,
        projectName: assignment.project_name,
        unitLabel: assignment.unit_label,
        floor: assignment.floor,
        assignedAt: assignment.assigned_at
      } : null
    };
  });
}

export async function listDeveloperInventory(accessToken: string) {
  await requireDeveloper(accessToken);
  requireConfiguration();

  const headers = { apikey: adminKey! };
  const [unitsResponse, projectsResponse, typesResponse] = await Promise.all([
    fetch(supabaseUrl + "/rest/v1/apartment_units?select=id,project_id,apartment_type_id,unit_label,floor,area_sqm,price_eur,status,updated_at&order=unit_label.asc", { headers }),
    fetch(supabaseUrl + "/rest/v1/projects?select=id,name,slug,location,status&order=name.asc", { headers }),
    fetch(supabaseUrl + "/rest/v1/apartment_types?select=id,name,rooms,area_sqm&order=rooms.asc", { headers })
  ]);

  if (!unitsResponse.ok || !projectsResponse.ok || !typesResponse.ok) {
    throw new Error("Inventarul nu a putut fi incarcat.");
  }

  const units = (await unitsResponse.json()) as Array<{
    id: string;
    project_id: string;
    apartment_type_id: string;
    unit_label: string;
    floor: number;
    area_sqm: number;
    price_eur: number | null;
    status: "available" | "reserved" | "sold";
    updated_at: string;
  }>;
  const projects = (await projectsResponse.json()) as Array<{
    id: string;
    name: string;
    slug: string;
    location: string | null;
    status: "planning" | "active" | "completed";
  }>;
  const apartmentTypes = (await typesResponse.json()) as Array<{
    id: string;
    name: string;
    rooms: number;
    area_sqm: number;
  }>;

  return {
    projects,
    units: units.map((unit) => {
      const project = projects.find((item) => item.id === unit.project_id);
      const apartmentType = apartmentTypes.find((item) => item.id === unit.apartment_type_id);
      if (!project || !apartmentType) throw new Error("Inventarul contine o referinta invalida.");

      return {
        id: unit.id,
        unitLabel: unit.unit_label,
        floor: unit.floor,
        areaSqm: Number(unit.area_sqm),
        priceEur: unit.price_eur === null ? null : Number(unit.price_eur),
        status: unit.status,
        updatedAt: unit.updated_at,
        project: { id: project.id, name: project.name },
        apartmentType: {
          id: apartmentType.id,
          name: apartmentType.name,
          rooms: apartmentType.rooms
        }
      };
    })
  };
}
export async function getAccountSummary(accessToken: string) {
  const account = await getAccountRole(accessToken);
  const table = account.role === "developer" ? "developer_profiles" : "client_profiles";
  const response = await fetch(
    supabaseUrl + "/rest/v1/" + table + "?select=name&user_id=eq." + encodeURIComponent(account.user.id!),
    { headers: { apikey: adminKey! } }
  );
  const profiles = (await response.json()) as Array<{ name: string }>;
  if (!response.ok || !profiles[0]) throw new Error("Profilul contului nu a fost gasit.");

  return {
    name: profiles[0].name,
    email: account.user.email ?? "",
    role: account.role,
    target: account.role === "developer" ? "/dezvoltator/panou" : "/cont-client/acasa"
  };
}
export async function getEditableProfile(accessToken: string) {
  const account = await getAccountRole(accessToken);
  const isDeveloper = account.role === "developer";
  const table = isDeveloper ? "developer_profiles" : "client_profiles";
  const fields = isDeveloper ? "name" : "name,phone";
  const response = await fetch(
    supabaseUrl + "/rest/v1/" + table + "?select=" + fields + "&user_id=eq." + encodeURIComponent(account.user.id!),
    { headers: { apikey: adminKey! } }
  );
  const profiles = (await response.json()) as Array<{ name: string; phone?: string | null }>;
  if (!response.ok || !profiles[0]) throw new Error("Profilul contului nu a fost gasit.");

  return {
    name: profiles[0].name,
    email: account.user.email ?? "",
    phone: profiles[0].phone ?? null,
    role: account.role,
    target: account.role === "developer" ? "/dezvoltator/panou" : "/cont-client/acasa"
  };
}

export async function updateAccountProfile(accessToken: string, input: { name: string; phone?: string }) {
  const account = await getAccountRole(accessToken);
  const isDeveloper = account.role === "developer";
  const table = isDeveloper ? "developer_profiles" : "client_profiles";
  const profileData = isDeveloper
    ? { name: input.name, updated_at: new Date().toISOString() }
    : { name: input.name, phone: input.phone || null, updated_at: new Date().toISOString() };

  const response = await fetch(
    supabaseUrl + "/rest/v1/" + table + "?user_id=eq." + encodeURIComponent(account.user.id!),
    {
      method: "PATCH",
      headers: {
        apikey: adminKey!,
        "Content-Type": "application/json",
        Prefer: "return=representation"
      },
      body: JSON.stringify(profileData)
    }
  );
  if (!response.ok) throw new Error("Profilul nu a putut fi actualizat.");

  await fetch(supabaseUrl + "/auth/v1/admin/users/" + encodeURIComponent(account.user.id!), {
    method: "PUT",
    headers: {
      apikey: adminKey!,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      user_metadata: {
        name: input.name,
        phone: isDeveloper ? null : input.phone || null,
        role: account.role
      }
    })
  });

  return getEditableProfile(accessToken);
}
