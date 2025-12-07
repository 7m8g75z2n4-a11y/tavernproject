import type { ReactNode } from "react";
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
            <div className="tavern-logo">TAVERN</div>
          </header>
          <main className="tavern-main">{children}</main>
        </div>
      </body>
    </html>
  );
}
