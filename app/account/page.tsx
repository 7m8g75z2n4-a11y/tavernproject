import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

async function updateName(formData: FormData) {
  "use server";
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const name = formData.get("name")?.toString().trim() || null;
  await prisma.user.update({
    where: { id: user.id },
    data: { name },
  });
}

export default async function AccountPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: { email: true, name: true },
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center px-4">
      <div className="w-full max-w-lg space-y-4 rounded-2xl border border-slate-800 bg-slate-900/70 p-6">
        <h1 className="text-2xl font-semibold">Account</h1>
        <p className="text-sm text-slate-400">Manage your Tavern profile.</p>

        <dl className="space-y-2 text-sm">
          <div className="flex justify-between">
            <dt className="text-slate-400">Email</dt>
            <dd className="font-medium">{dbUser?.email}</dd>
          </div>
        </dl>

        <form className="space-y-2" action={updateName}>
          <label className="flex flex-col gap-1 text-sm">
            <span>Name</span>
            <input
              name="name"
              defaultValue={dbUser?.name ?? ""}
              className="rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm outline-none focus:border-amber-500"
            />
          </label>
          <button
            type="submit"
            className="rounded-md bg-amber-600 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-amber-500"
          >
            Save
          </button>
        </form>
      </div>
    </div>
  );
}
