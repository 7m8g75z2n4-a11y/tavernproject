import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

async function resetPassword(token: string, formData: FormData) {
  "use server";
  const password = formData.get("password")?.toString() ?? "";
  const confirm = formData.get("confirm")?.toString() ?? "";
  if (!password || password !== confirm) return { error: "Passwords do not match." };

  const record = await prisma.passwordResetToken.findUnique({ where: { token } });
  if (!record || record.expiresAt < new Date()) {
    return { error: "Reset link expired." };
  }

  const hash = await bcrypt.hash(password, 10);
  await prisma.user.update({
    where: { id: record.userId },
    data: { passwordHash: hash },
  });
  await prisma.passwordResetToken.delete({ where: { token } });
  redirect("/login");
}

export default async function ResetPasswordPage({
  params,
}: {
  params: { token: string };
}) {
  const token = params.token;
  const record = await prisma.passwordResetToken.findUnique({ where: { token } });
  if (!record || record.expiresAt < new Date()) {
    redirect("/forgot-password");
  }

  async function action(formData: FormData) {
    "use server";
    return resetPassword(token, formData);
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center px-4">
      <div className="w-full max-w-md space-y-4 rounded-2xl border border-slate-800 bg-slate-900/70 p-6">
        <h1 className="text-xl font-semibold">Set a new password</h1>
        <form className="space-y-3" action={action}>
          <label className="flex flex-col gap-1 text-sm">
            <span>New password</span>
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
            Update Password
          </button>
        </form>
      </div>
    </div>
  );
}
