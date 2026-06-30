import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { SiteHeader } from "./SiteHeader";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap"
});

export const metadata: Metadata = {
  title: "NewGen Residence",
  description: "Apartamente premium si portal dedicat clientilor."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ro">
      <body className={inter.className}>
        <SiteHeader />
        {children}
      </body>
    </html>
  );
}