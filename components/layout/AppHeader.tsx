"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Session } from "next-auth";
import { TavernButton } from "../ui/TavernButton";

type AppHeaderProps = {
  session: Session | null;
};

const NAV_ITEMS = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Campaigns", href: "/campaigns" },
  { label: "Characters", href: "/characters" },
  { label: "My Table", href: "/play" },
];

export default function AppHeader({ session }: AppHeaderProps) {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 border-b border-slate-800 bg-slate-950/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 md:px-6">
        <Link href="/" className="flex items-center gap-3">
          <Image
            src="/tavern-logo.png"
            alt="Tavern logo"
            width={36}
            height={36}
            className="rounded-full object-cover"
          />
          <span className="text-sm font-medium tracking-[0.3em] text-amber-200">
            TAVERN
          </span>
        </Link>
        <nav className="hidden items-center gap-3 text-xs uppercase tracking-[0.2em] text-slate-400 md:flex">
          {NAV_ITEMS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`transition ${
                pathname?.startsWith(link.href)
                  ? "text-amber-200"
                  : "hover:text-slate-100"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-3 text-xs uppercase tracking-[0.2em]">
          {session?.user ? (
            <>
              <span className="hidden text-slate-300 md:block">
                {session.user.name ?? session.user.email}
              </span>
              <Link href="/me" className="text-slate-300 hover:text-amber-200">
                My Tavern
              </Link>
              <form action="/api/auth/signout" method="post">
                <TavernButton variant="ghost" type="submit">
                  Logout
                </TavernButton>
              </form>
            </>
          ) : (
            <>
              <Link href="/login">
                <TavernButton variant="ghost">Login</TavernButton>
              </Link>
              <Link href="/register">
                <TavernButton variant="primary">Register</TavernButton>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
