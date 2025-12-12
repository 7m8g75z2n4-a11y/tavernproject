import type { ReactNode } from "react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import AppHeader from "@/components/layout/AppHeader";
import "./globals.css";

export const metadata = {
  title: "Tavern",
  description: "A home between adventures.",
  icons: {
    icon: "/icon.png",
    shortcut: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
};

export default async function RootLayout({ children }: { children: ReactNode }) {
  const session = await getServerSession(authOptions);
  return (
    <html lang="en">
      <body className="bg-slate-950">
        <AppHeader session={session} />
        <main>{children}</main>
      </body>
    </html>
  );
}
