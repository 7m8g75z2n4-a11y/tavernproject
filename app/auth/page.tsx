"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";

export default function AuthPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (isSubmitting) return;

    setError(null);
    setIsSubmitting(true);

    try {
      const result = await signIn("credentials", {
        email,
        redirect: false,
        callbackUrl: "/dashboard",
      });

      if (result?.error) {
        setError("Sign-in failed. Please try a different email.");
        return;
      }

      router.push("/dashboard");
    } catch (err) {
      console.error("Sign-in error", err);
      setError("Unexpected error during sign-in.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="auth-layout">
      <div className="auth-panel">
        <section className="auth-section auth-create">
          <h1 className="auth-title">TAVERN</h1>
          <h2 className="auth-heading">Enter the Tavern</h2>
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
            {error && <p className="auth-footnote">{error}</p>}
            <button type="submit" className="btn-primary auth-submit" disabled={isSubmitting}>
              {isSubmitting ? "Entering..." : "Enter Tavern"}
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
            {error && <p className="auth-footnote">{error}</p>}
            <button type="submit" className="btn-secondary auth-submit auth-google" disabled={isSubmitting}>
              <span className="auth-google-icon" />
              {isSubmitting ? "Signing in..." : "Continue with Email"}
            </button>
          </form>
          <p className="auth-footnote">
            The Tavern keeps your characters safe and your stories yours.
          </p>
        </section>
      </div>
      <div className="auth-lantern" />
    </div>
  );
}
