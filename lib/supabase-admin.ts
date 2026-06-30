type SupabaseAdminUserResponse = {
  id?: string;
  email?: string;
  error?: string;
  msg?: string;
};

type SupabaseSessionResponse = {
  access_token?: string;
  refresh_token?: string;
  expires_in?: number;
  error?: string;
  error_description?: string;
  msg?: string;
};

export type ClientAccount = {
  userId: string;
  name: string;
  email: string;
  phone: string | null;
  apartmentId: string | null;
};

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const adminKey = process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY;

export function isSupabaseConfigured() {
  return Boolean(supabaseUrl && adminKey);
}

export async function createClientAuthUser(input: {
  email: string;
  password: string;
  name: string;
  phone?: string;
}) {
  if (!supabaseUrl || !adminKey) throw new Error("Supabase is not configured.");

  const response = await fetch(supabaseUrl + "/auth/v1/admin/users", {
    method: "POST",
    headers: {
      apikey: adminKey,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      email: input.email,
      password: input.password,
      email_confirm: true,
      user_metadata: { name: input.name, phone: input.phone ?? null, role: "client" }
    })
  });
  const data = (await response.json()) as SupabaseAdminUserResponse;
  if (!response.ok || !data.id) throw new Error(data.msg || data.error || "Client account could not be created.");
  return data;
}

export async function createClientProfile(input: {
  userId: string;
  name: string;
  email: string;
  phone?: string;
}) {
  if (!supabaseUrl || !adminKey) throw new Error("Supabase is not configured.");

  const response = await fetch(supabaseUrl + "/rest/v1/client_profiles", {
    method: "POST",
    headers: {
      apikey: adminKey,
      "Content-Type": "application/json",
      Prefer: "return=representation"
    },
    body: JSON.stringify({
      user_id: input.userId,
      name: input.name,
      email: input.email,
      phone: input.phone || null
    })
  });
  if (!response.ok) throw new Error((await response.text()) || "Client profile could not be created.");
  return response.json();
}

export async function createUserRole(userId: string, role: "client" | "developer") {
  if (!supabaseUrl || !adminKey) throw new Error("Supabase is not configured.");

  const response = await fetch(supabaseUrl + "/rest/v1/user_roles", {
    method: "POST",
    headers: {
      apikey: adminKey,
      "Content-Type": "application/json",
      Prefer: "return=minimal"
    },
    body: JSON.stringify({ user_id: userId, role })
  });

  if (!response.ok) {
    throw new Error((await response.text()) || "User role could not be created.");
  }
}
export async function deleteClientAuthUser(userId: string) {
  if (!supabaseUrl || !adminKey) return;
  await fetch(supabaseUrl + "/auth/v1/admin/users/" + userId, {
    method: "DELETE",
    headers: { apikey: adminKey }
  });
}

export async function signInClient(email: string, password: string) {
  if (!supabaseUrl || !adminKey) throw new Error("Supabase is not configured.");

  const response = await fetch(supabaseUrl + "/auth/v1/token?grant_type=password", {
    method: "POST",
    headers: { apikey: adminKey, "Content-Type": "application/json" },
    body: JSON.stringify({ email, password })
  });
  const data = (await response.json()) as SupabaseSessionResponse;
  if (!response.ok || !data.access_token) {
    throw new Error(data.error_description || data.msg || data.error || "Autentificarea nu a reusit.");
  }
  return data;
}

export async function getClientAccount(accessToken: string): Promise<ClientAccount> {
  if (!supabaseUrl || !adminKey) throw new Error("Supabase is not configured.");

  const userResponse = await fetch(supabaseUrl + "/auth/v1/user", {
    headers: { apikey: adminKey, Authorization: "Bearer " + accessToken }
  });
  const user = (await userResponse.json()) as { id?: string };
  if (!userResponse.ok || !user.id) throw new Error("Sesiunea a expirat. Autentifica-te din nou.");

  const profileResponse = await fetch(
    supabaseUrl + "/rest/v1/client_profiles?select=name,email,phone,apartment_id&user_id=eq." + encodeURIComponent(user.id),
    { headers: { apikey: adminKey } }
  );
  const profiles = (await profileResponse.json()) as Array<{
    name: string;
    email: string;
    phone: string | null;
    apartment_id: string | null;
  }>;
  if (!profileResponse.ok || !profiles[0]) throw new Error("Profilul clientului nu a fost gasit.");

  return {
    userId: user.id,
    name: profiles[0].name,
    email: profiles[0].email,
    phone: profiles[0].phone,
    apartmentId: profiles[0].apartment_id
  };
}

export async function refreshAuthSession(refreshToken: string) {
  if (!supabaseUrl || !adminKey) throw new Error("Supabase is not configured.");

  const response = await fetch(supabaseUrl + "/auth/v1/token?grant_type=refresh_token", {
    method: "POST",
    headers: { apikey: adminKey, "Content-Type": "application/json" },
    body: JSON.stringify({ refresh_token: refreshToken })
  });
  const data = (await response.json()) as SupabaseSessionResponse;
  if (!response.ok || !data.access_token) throw new Error("Sesiunea nu a putut fi reinnoita.");
  return data;
}
