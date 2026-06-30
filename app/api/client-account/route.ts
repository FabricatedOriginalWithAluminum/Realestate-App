import { NextResponse } from "next/server";
import { getClientAccount } from "@/lib/supabase-admin";

export async function GET(request: Request) {
  const token = request.headers.get("cookie")
    ?.split(";")
    .map((item) => item.trim())
    .find((item) => item.startsWith("newgen_access_token="))
    ?.slice("newgen_access_token=".length);

  if (!token) return NextResponse.json({ message: "Autentificarea este necesara." }, { status: 401 });

  try {
    return NextResponse.json({ account: await getClientAccount(decodeURIComponent(token)) });
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Nu am putut incarca profilul." },
      { status: 401 }
    );
  }
}
