import type { ReactNode } from "react";
import Link from "next/link";
import "../styles/globals.css";

export const metadata = {
  title: "Tavern",
  description: "Where your characters gather.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="tavern-body">
        <div className="tavern-frame">
          <header className="tavern-header">
            <Link href="/" className="tavern-logo-link">
              <img
                src="/tavern-logo.png"
                alt="Tavern Logo"
                className="tavern-logo-img"
                width={180}
                height={60}
              />
            </Link>
          </header>
          <main className="tavern-main">{children}</main>
        </div>
      </body>
    </html>
  );
}
