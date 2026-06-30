import { NextResponse } from "next/server";

const cookieNames = [
  "newgen_access_token",
  "newgen_client_refresh_token",
  "newgen_developer_token",
  "newgen_developer_refresh_token"
];

export async function POST() {
  const response = NextResponse.json({ message: "Deconectare reusita." });
  for (const name of cookieNames) {
    response.cookies.set({
      name,
      value: "",
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 0
    });
  }
  return response;
}