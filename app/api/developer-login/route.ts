import { NextResponse } from "next/server";
import { authenticateDeveloper } from "@/lib/developer-admin";

type LoginPayload = { email?: string; password?: string };

export async function POST(request: Request) {
  const payload = (await request.json()) as LoginPayload;
  const email = payload.email?.trim().toLowerCase() ?? "";
  const password = payload.password ?? "";

  if (!email || !password) {
    return NextResponse.json({ message: "Completeaza emailul si parola." }, { status: 400 });
  }

  try {
    const session = await authenticateDeveloper(email, password);
    const response = NextResponse.json({ message: "Autentificare reusita." });
    response.cookies.set({
      name: "newgen_developer_token",
      value: session.access_token!,
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: session.expires_in ?? 3600
    });
    if (session.refresh_token) {
      response.cookies.set({
        name: "newgen_developer_refresh_token",
        value: session.refresh_token,
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        path: "/",
        maxAge: 60 * 60 * 24 * 30
      });
    }    return response;
  } catch {
    return NextResponse.json({ message: "Datele nu sunt corecte sau contul nu are rol de dezvoltator." }, { status: 401 });
  }
}