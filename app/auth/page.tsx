"use client";

import { FormEvent, useEffect, useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function AuthPage() {
  const [email, setEmail] = useState("");
  const router = useRouter();

  useEffect(() => {
    router.prefetch("/dashboard");
  }, [router]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    await signIn("credentials", {
      email,
      redirect: true,
      callbackUrl: "/dashboard",
    });
  }

  return (
    <div className="auth">
      <div className="auth-panel">
        <section className="auth-section auth-create">
          <h1 className="auth-title">TAVERN</h1>
          <h2 className="auth-heading">Create Account</h2>
          <form className="auth-form" onSubmit={handleSubmit}>
            <label className="auth-label">
              <span>Email</span>
              <input
                type="email"
                className="auth-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="you@example.com"
              />
            </label>
            <button type="submit" className="btn-primary auth-submit">
              Enter Tavern
            </button>
          </form>
        </section>

        <div className="auth-divider">
          <span>Sign In</span>
        </div>

        <section className="auth-section auth-signin">
          <form className="auth-form" onSubmit={handleSubmit}>
            <label className="auth-label">
              <span>Email Address</span>
              <input
                type="email"
                className="auth-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="you@example.com"
              />
            </label>
            <button type="submit" className="btn-secondary auth-submit auth-google">
              <span className="auth-google-icon" />
              Continue with Email
            </button>
          </form>
          <p className="auth-footnote">
            The Tavern keeps your characters safe and your stories yours.
          </p>
          <Link href="/dashboard">
            <button type="button" className="btn-secondary auth-submit">
              Explore Tavern (Demo)
            </button>
          </Link>
        </section>
      </div>
      <div className="auth-lantern" />
    </div>
  );
}
