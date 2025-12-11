import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import "../styles/globals.css";

export const metadata = {
  title: "Tavern",
  description: "Where your characters gather.",
  icons: {
    icon: "/favicon.png",
  },
};

export default async function RootLayout({ children }: { children: ReactNode }) {
  const session = await getServerSession(authOptions);
  return (
    <html lang="en">
      <body className="tavern-body">
        <div className="tavern-frame">
          <header className="tavern-header">
            <Link href="/" className="tavern-logo-link">
              <Image
                src="/tavern-logo.png"
                alt="Tavern Logo"
                className="tavern-logo-img"
                width={200}
                height={70}
                priority
              />
            </Link>
            <nav className="flex items-center gap-3 text-sm">
              {session?.user ? (
                <>
                  <span className="text-slate-200">
                    {session.user.name ?? session.user.email}
                  </span>
                  <Link href="/me" className="text-amber-300 hover:text-amber-200">
                    My Tavern
                  </Link>
                  <Link href="/play" className="text-amber-300 hover:text-amber-200">
                    My Table
                  </Link>
                  <Link href="/account" className="text-amber-300 hover:text-amber-200">
                    Account
                  </Link>
                  <form action="/api/auth/signout" method="post">
                    <button
                      type="submit"
                      className="rounded-md border border-slate-700 px-3 py-1 text-xs hover:border-amber-400"
                    >
                      Logout
                    </button>
                  </form>
                </>
              ) : (
                <>
                  <Link href="/login" className="text-amber-300 hover:text-amber-200">
                    Login
                  </Link>
                  <Link href="/register" className="text-amber-300 hover:text-amber-200">
                    Register
                  </Link>
                </>
              )}
            </nav>
          </header>
          <main className="tavern-main">{children}</main>
        </div>
      </body>
    </html>
  );
}
