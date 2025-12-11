"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const callbackUrl = searchParams.get("callbackUrl") || "/";
    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
      callbackUrl,
    });
    if (res?.error) {
      setError("Invalid email or password.");
    } else {
      router.push(callbackUrl);
    }
    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center px-4">
      <div className="w-full max-w-md space-y-6 rounded-2xl border border-slate-800 bg-slate-900/70 p-6">
        <header className="space-y-2 text-center">
          <h1 className="text-2xl font-semibold">Welcome back</h1>
          <p className="text-sm text-slate-400">Sign in to your Tavern account.</p>
        </header>

        <form className="space-y-3" onSubmit={handleSubmit}>
          <label className="flex flex-col gap-1 text-sm">
            <span>Email</span>
            <input
              type="email"
              className="rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm outline-none focus:border-amber-500"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            <span>Password</span>
            <input
              type="password"
              className="rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm outline-none focus:border-amber-500"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </label>
          {error && <p className="text-sm text-red-400">{error}</p>}
          <button
            type="submit"
            className="w-full rounded-md bg-amber-600 py-2 text-sm font-semibold text-slate-950 hover:bg-amber-500 disabled:opacity-60"
            disabled={loading}
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <div className="flex justify-between text-sm text-slate-400">
          <Link href="/register" className="text-amber-300 hover:text-amber-200">
            Create account
          </Link>
          <Link href="/forgot-password" className="hover:text-amber-200">
            Forgot password?
          </Link>
        </div>
      </div>
    </div>
  );
}
