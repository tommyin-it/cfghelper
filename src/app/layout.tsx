import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin", "latin-ext"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin", "latin-ext"] });

export const metadata: Metadata = {
  metadataBase: new URL("https://cfghelper.vercel.app"),
  title: "CFG Helper – generator autoexec.cfg do CS2",
  description:
    "Prosty generator configu (autoexec.cfg) do Counter-Strike 2: wizualna klawiatura do bindów, baza wszystkich komend (także ukrytych), polecane ustawienia, edytor tekstowy z zapisem.",
  keywords: ["CS2", "autoexec", "cfg", "config", "bind", "generator", "Counter-Strike 2", "komendy"],
  openGraph: {
    title: "CFG Helper – generator autoexec.cfg do CS2",
    description: "Bindy na wizualnej klawiaturze, wszystkie komendy CS2, polecane ustawienia, edytor cfg.",
    type: "website",
    locale: "pl_PL",
    url: "https://cfghelper.vercel.app",
  },
};

export const viewport: Viewport = {
  themeColor: "#0a0d13",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pl" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
