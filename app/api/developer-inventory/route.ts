import { NextResponse } from "next/server";
import { listDeveloperInventory } from "@/lib/developer-admin";

function readCookie(request: Request, name: string) {
  return request.headers.get("cookie")
    ?.split(";")
    .map((item) => item.trim())
    .find((item) => item.startsWith(name + "="))
    ?.slice(name.length + 1);
}

export async function GET(request: Request) {
  const token = readCookie(request, "newgen_developer_token");
  if (!token) {
    return NextResponse.json(
      { message: "Autentificarea dezvoltatorului este necesara." },
      { status: 401 }
    );
  }

  try {
    return NextResponse.json(await listDeveloperInventory(decodeURIComponent(token)));
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Inventarul nu a putut fi incarcat." },
      { status: 401 }
    );
  }
}
