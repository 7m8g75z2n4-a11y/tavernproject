import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { sendPasswordResetEmail } from "@/lib/email";

async function requestReset(formData: FormData) {
  "use server";
  const email = formData.get("email")?.toString().toLowerCase().trim();
  if (!email) return;

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return;

  const token = crypto.randomUUID();
  const expires = new Date(Date.now() + 1000 * 60 * 60);
  await prisma.passwordResetToken.create({
    data: {
      userId: user.id,
      token,
      expiresAt: expires,
    },
  });
  await sendPasswordResetEmail(email, token);
  redirect("/login");
}

export default function ForgotPasswordPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center px-4">
      <div className="w-full max-w-md space-y-4 rounded-2xl border border-slate-800 bg-slate-900/70 p-6">
        <h1 className="text-xl font-semibold">Reset your password</h1>
        <p className="text-sm text-slate-400">
          Enter the email tied to your Tavern account and we&apos;ll send a reset link.
        </p>
        <form className="space-y-3" action={requestReset}>
          <label className="flex flex-col gap-1 text-sm">
            <span>Email</span>
            <input
              name="email"
              type="email"
              required
              className="rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm outline-none focus:border-amber-500"
            />
          </label>
          <button
            type="submit"
            className="w-full rounded-md bg-amber-600 py-2 text-sm font-semibold text-slate-950 hover:bg-amber-500"
          >
            Send reset link
          </button>
        </form>
      </div>
    </div>
  );
}
