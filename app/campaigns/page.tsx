import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import CampaignsList from "./CampaignsList";
import { PageShell, SectionGroup } from "@/components/ui/Page";
import { SectionHeader } from "@/components/ui/Section";
import { TavernCard } from "@/components/ui/TavernCard";
import { TavernButton } from "@/components/ui/TavernButton";
import { EmptyState } from "@/components/ui/EmptyState";
import Link from "next/link";

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
    <PageShell className="pt-6 pb-12">
      <SectionHeader
        title="Your Campaigns"
        subtitle="Track every table, invite players, and archive finished stories."
        actions={
          <Link href="/campaigns/new">
            <TavernButton variant="primary">Host a campaign</TavernButton>
          </Link>
        }
      />

      <SectionGroup>
        <div className="grid gap-6 lg:grid-cols-[1.4fr,1fr]">
          <TavernCard title="Active & archived tables">
            {activeCampaigns.length === 0 && archivedCampaigns.length === 0 ? (
              <EmptyState
                title="No campaigns yet"
                body="The tavern is quiet. Create a campaign to fill the roster."
                cta={
                  <TavernButton variant="primary" type="submit" form="create-campaign-form">
                    Create a campaign
                  </TavernButton>
                }
              />
            ) : (
              <CampaignsList
                activeCampaigns={activeCampaigns}
                archivedCampaigns={archivedCampaigns}
              />
            )}
          </TavernCard>

          <TavernCard title="Create a new campaign" subtitle="Drop a fresh story into the roster">
            <form
              action={createCampaign}
              id="create-campaign-form"
              className="space-y-4 text-sm"
            >
              <div className="space-y-1">
                <label htmlFor="name" className="text-slate-300">
                  Name
                </label>
                <input
                  id="name"
                  name="name"
                  required
                  className="w-full rounded-xl border border-slate-700 bg-slate-950/80 px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-1 focus:ring-amber-500"
                  placeholder="The Shattered Coast"
                />
              </div>
              <div className="space-y-1">
                <label htmlFor="description" className="text-slate-300">
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  rows={3}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950/80 px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-1 focus:ring-amber-500"
                  placeholder="Storms, secrets, and strange tides."
                />
              </div>
              <TavernButton variant="primary" type="submit">
                Create campaign
              </TavernButton>
            </form>
          </TavernCard>
        </div>
      </SectionGroup>
    </PageShell>
  );
}
