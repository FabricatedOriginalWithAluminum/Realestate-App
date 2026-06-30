import { NextResponse } from "next/server";
import { getEditableProfile, updateAccountProfile } from "@/lib/developer-admin";

function readCookie(request: Request, name: string) {
  return request.headers.get("cookie")
    ?.split(";")
    .map((item) => item.trim())
    .find((item) => item.startsWith(name + "="))
    ?.slice(name.length + 1);
}

function getAccessToken(request: Request) {
  return readCookie(request, "newgen_developer_token") ?? readCookie(request, "newgen_access_token");
}

export async function GET(request: Request) {
  const token = getAccessToken(request);
  if (!token) return NextResponse.json({ message: "Autentificarea este necesara." }, { status: 401 });

  try {
    return NextResponse.json({ profile: await getEditableProfile(decodeURIComponent(token)) });
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Profilul nu a putut fi incarcat." },
      { status: 401 }
    );
  }
}

export async function PATCH(request: Request) {
  const token = getAccessToken(request);
  if (!token) return NextResponse.json({ message: "Autentificarea este necesara." }, { status: 401 });

  const payload = (await request.json()) as { name?: string; phone?: string };
  const name = payload.name?.trim() ?? "";
  const phone = payload.phone?.trim() ?? "";

  if (name.length < 2) {
    return NextResponse.json({ message: "Numele trebuie sa aiba minimum 2 caractere." }, { status: 400 });
  }

  try {
    const profile = await updateAccountProfile(decodeURIComponent(token), { name, phone });
    return NextResponse.json({ message: "Profilul a fost actualizat.", profile });
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Profilul nu a putut fi actualizat." },
      { status: 500 }
    );
  }
}