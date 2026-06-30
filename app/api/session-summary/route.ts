import { NextResponse } from "next/server";
import { getAccountSummary } from "@/lib/developer-admin";
import { refreshAuthSession } from "@/lib/supabase-admin";

function readCookie(request: Request, name: string) {
  return request.headers.get("cookie")
    ?.split(";")
    .map((item) => item.trim())
    .find((item) => item.startsWith(name + "="))
    ?.slice(name.length + 1);
}

export async function GET(request: Request) {
  const candidates = [
    {
      accessName: "newgen_developer_token",
      refreshName: "newgen_developer_refresh_token"
    },
    {
      accessName: "newgen_access_token",
      refreshName: "newgen_client_refresh_token"
    }
  ];

  for (const candidate of candidates) {
    const accessToken = readCookie(request, candidate.accessName);
    if (accessToken) {
      try {
        const account = await getAccountSummary(decodeURIComponent(accessToken));
        return NextResponse.json({ authenticated: true, account });
      } catch {
        // Try the refresh token below.
      }
    }

    const refreshToken = readCookie(request, candidate.refreshName);
    if (!refreshToken) continue;

    try {
      const session = await refreshAuthSession(decodeURIComponent(refreshToken));
      const account = await getAccountSummary(session.access_token!);
      const isDeveloper = account.role === "developer";
      const response = NextResponse.json({ authenticated: true, account });
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
      }
      return response;
    } catch {
      // Continue with another remembered session.
    }
  }

  return NextResponse.json({ authenticated: false });
}