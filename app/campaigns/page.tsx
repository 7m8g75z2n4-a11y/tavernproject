import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import Link from "next/link";

async function createCampaign(formData: FormData) {
  "use server";

  const name = formData.get("name")?.toString().trim();
  const description = formData.get("description")?.toString().trim() || "";

  if (!name) redirect("/campaigns");

  // demo GM user
  let user = await prisma.user.findFirst();
  if (!user) {
    user = await prisma.user.create({
      data: {
        authUserId: "demo-user",
        displayName: "Demo GM",
      },
    });
  }

  const campaign = await prisma.campaign.create({
    data: {
      name,
      description,
      gmId: user.id,
    },
  });

  revalidatePath("/campaigns");
  redirect(`/campaigns/${campaign.id}`);
}

export default async function CampaignsPage() {
  const campaigns = await prisma.campaign.findMany({
    orderBy: { createdAt: "desc" },
    include: { gm: true },
  });

  return (
    <main className="min-h-screen p-6 bg-black text-amber-100">
      <h1 className="text-2xl font-semibold mb-4">Your Campaigns</h1>

      {campaigns.length === 0 ? (
        <p className="text-sm opacity-70 mb-6">
          No campaigns yet. The tables in this tavern are still clean.
        </p>
      ) : (
        <div className="space-y-3 mb-6">
          {campaigns.map((c) => (
            <Link
              key={c.id}
              href={`/campaigns/${c.id}`}
              className="block p-3 border border-amber-700/50 rounded-lg hover:bg-amber-900/20 transition"
            >
              <div className="text-sm font-medium">{c.name}</div>
              {c.description && (
                <div className="text-xs opacity-70 line-clamp-2">
                  {c.description}
                </div>
              )}
              <div className="text-[10px] opacity-60 mt-1">
                GM: {c.gm?.displayName ?? "Demo GM"}
              </div>
            </Link>
          ))}
        </div>
      )}

      <section className="max-w-md border border-amber-700/40 rounded-lg p-4 bg-amber-900/10">
        <h2 className="text-sm font-semibold mb-2">Create a new campaign</h2>
        <form action={createCampaign} className="space-y-3">
          <div className="flex flex-col gap-1">
            <label htmlFor="name" className="text-xs opacity-80">
              Name
            </label>
            <input
              id="name"
              name="name"
              required
              className="px-2 py-1 text-sm rounded-md bg-black border border-amber-700/60 outline-none focus:border-amber-400"
              placeholder="The Shattered Coast"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="description" className="text-xs opacity-80">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              rows={3}
              className="px-2 py-1 text-sm rounded-md bg-black border border-amber-700/60 outline-none focus:border-amber-400"
              placeholder="Storms, secrets, and strange tides."
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 text-sm bg-amber-600 hover:bg-amber-500 font-semibold rounded-md"
          >
            Create Campaign
          </button>
        </form>
      </section>
    </main>
  );
}
