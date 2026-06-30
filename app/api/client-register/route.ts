import { NextResponse } from "next/server";
import {
  createClientAuthUser,
  createClientProfile,
  createUserRole,
  deleteClientAuthUser,
  isSupabaseConfigured,
  signInClient
} from "@/lib/supabase-admin";

type RegisterPayload = {
  name?: string;
  email?: string;
  phone?: string;
  password?: string;
  developerCode?: string;
};

function clean(value?: string) {
  return value?.trim() ?? "";
}

export async function POST(request: Request) {
  const payload = (await request.json()) as RegisterPayload;
  const name = clean(payload.name);
  const email = clean(payload.email).toLowerCase();
  const phone = clean(payload.phone);
  const password = payload.password ?? "";
  const developerCode = clean(payload.developerCode);
  const expectedCode = process.env.DEVELOPER_SIGNUP_CODE ?? "TEST_DEV";

  if (!name || !email || !password || !developerCode) {
    return NextResponse.json({ message: "Completeaza numele, emailul, parola si codul primit." }, { status: 400 });
  }
  if (password.length < 8) {
    return NextResponse.json({ message: "Parola trebuie sa aiba minimum 8 caractere." }, { status: 400 });
  }
  if (developerCode !== expectedCode) {
    return NextResponse.json({ message: "Codul introdus nu este valid." }, { status: 403 });
  }
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ message: "Supabase nu este configurat inca." }, { status: 503 });
  }

  let userId = "";
  try {
    const user = await createClientAuthUser({ email, password, name, phone });
    userId = user.id!;
    try {
      await createUserRole(userId, "client");
      await createClientProfile({ userId, name, email, phone });
    } catch (error) {
      await deleteClientAuthUser(userId);
      throw error;
    }
    const session = await signInClient(email, password);
    const response = NextResponse.json({ message: "Contul a fost creat.", userId }, { status: 201 });
    response.cookies.set({
      name: "newgen_access_token",
      value: session.access_token!,
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: session.expires_in ?? 3600
    });
    if (session.refresh_token) {
      response.cookies.set({
        name: "newgen_client_refresh_token",
        value: session.refresh_token,
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        path: "/",
        maxAge: 60 * 60 * 24 * 30
      });
    }    return response;
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Nu am putut crea contul." },
      { status: 500 }
    );
  }
}
