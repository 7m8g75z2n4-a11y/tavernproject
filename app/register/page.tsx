import { redirect } from "next/navigation";
import Link from "next/link";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { sendWelcomeEmail } from "@/lib/email";

async function registerAction(formData: FormData) {
  "use server";
  const name = formData.get("name")?.toString().trim() || null;
  const email = formData.get("email")?.toString().toLowerCase().trim();
  const password = formData.get("password")?.toString() || "";
  const confirm = formData.get("confirm")?.toString() || "";

  if (!email || !password || password !== confirm) {
    return { error: "Invalid input or passwords do not match." };
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return { error: "User already exists." };
  }

  const passwordHash = await bcrypt.hash(password, 10);
  await prisma.user.create({
    data: {
      email,
      name,
      passwordHash,
    },
  });
  await sendWelcomeEmail(email, name ?? undefined);
  redirect("/login");
}

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center px-4">
      <div className="w-full max-w-md space-y-6 rounded-2xl border border-slate-800 bg-slate-900/70 p-6">
        <header className="space-y-2 text-center">
          <h1 className="text-2xl font-semibold">Create your Tavern account</h1>
          <p className="text-sm text-slate-400">Start a new story.</p>
        </header>

        <form className="space-y-3" action={registerAction}>
          <label className="flex flex-col gap-1 text-sm">
            <span>Name</span>
            <input
              name="name"
              className="rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm outline-none focus:border-amber-500"
              placeholder="Aela the Bold"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            <span>Email</span>
            <input
              name="email"
              type="email"
              required
              className="rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm outline-none focus:border-amber-500"
              placeholder="you@example.com"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            <span>Password</span>
            <input
              name="password"
              type="password"
              required
              className="rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm outline-none focus:border-amber-500"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            <span>Confirm password</span>
            <input
              name="confirm"
              type="password"
              required
              className="rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm outline-none focus:border-amber-500"
            />
          </label>
          <button
            type="submit"
            className="w-full rounded-md bg-amber-600 py-2 text-sm font-semibold text-slate-950 hover:bg-amber-500"
          >
            Create Account
          </button>
        </form>

        <div className="text-sm text-slate-400 text-center">
          Already have an account?{" "}
          <Link href="/login" className="text-amber-300 hover:text-amber-200">
            Log in
          </Link>
        </div>
      </div>
    </div>
  );
}
