import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import CampaignsList from "./CampaignsList";

async function createCampaign(formData: FormData) {
  "use server";

  const user = await getCurrentUser();
  const email = user?.email;

  if (!email) redirect("/auth");

  const name = formData.get("name")?.toString().trim();
  const description = formData.get("description")?.toString().trim() || "";

  if (!name) redirect("/campaigns");

  const campaign = await prisma.campaign.create({
    data: {
      name,
      description,
      ownerEmail: email,
      createdById: user?.id,
    },
  });

  revalidatePath("/campaigns");
  redirect(`/campaigns/${campaign.id}`);
}

export default async function CampaignsPage() {
  const user = await getCurrentUser();
  const email = user?.email;

  if (!email || !user?.id) redirect("/login");

  const [activeCampaigns, archivedCampaigns] = await Promise.all([
    prisma.campaign.findMany({
      where: {
        OR: [{ ownerEmail: email }, { createdById: user.id }],
        isArchived: false,
      },
      orderBy: { createdAt: "desc" },
      include: { _count: { select: { sessions: true } } },
    }),
    prisma.campaign.findMany({
      where: {
        OR: [{ ownerEmail: email }, { createdById: user.id }],
        isArchived: true,
      },
      orderBy: [{ archivedAt: "desc" }, { createdAt: "desc" }],
    }),
  ]);

  return (
    <main className="min-h-screen p-6 bg-black text-amber-100">
      <h1 className="text-2xl font-semibold mb-4">Your Campaigns</h1>

      <CampaignsList
        activeCampaigns={activeCampaigns}
        archivedCampaigns={archivedCampaigns}
      />

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
