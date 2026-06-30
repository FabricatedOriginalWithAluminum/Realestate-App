import { NextResponse } from "next/server";
import { getAccountRole } from "@/lib/developer-admin";
import { isSupabaseConfigured, signInClient } from "@/lib/supabase-admin";

type LoginPayload = { email?: string; password?: string };

export async function POST(request: Request) {
  const payload = (await request.json()) as LoginPayload;
  const email = payload.email?.trim().toLowerCase() ?? "";
  const password = payload.password ?? "";

  if (!email || !password) {
    return NextResponse.json({ message: "Completeaza emailul si parola." }, { status: 400 });
  }
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ message: "Supabase nu este configurat inca." }, { status: 503 });
  }

  try {
    const session = await signInClient(email, password);
    const account = await getAccountRole(session.access_token!);
    const isDeveloper = account.role === "developer";
    const response = NextResponse.json({
      message: "Autentificare reusita.",
      role: account.role,
      redirectTo: isDeveloper ? "/dezvoltator/panou" : "/cont-client/acasa"
    });
    response.cookies.set({
      name: isDeveloper ? "newgen_developer_token" : "newgen_access_token",
      value: session.access_token!,
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: session.expires_in ?? 3600
    });
    if (session.refresh_token) {
      response.cookies.set({
        name: isDeveloper ? "newgen_developer_refresh_token" : "newgen_client_refresh_token",
        value: session.refresh_token,
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        path: "/",
        maxAge: 60 * 60 * 24 * 30
      });
    }    return response;
  } catch {
    return NextResponse.json({ message: "Emailul sau parola nu sunt corecte." }, { status: 401 });
  }
}