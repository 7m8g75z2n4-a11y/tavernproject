import Link from "next/link";
import { Sparkles } from "lucide-react";
import { PageShell, SectionGroup } from "@/components/ui/Page";
import { SectionHeader } from "@/components/ui/Section";
import { TavernCard } from "@/components/ui/TavernCard";
import { TavernButton } from "@/components/ui/TavernButton";
import { TavernBadge } from "@/components/ui/TavernBadge";
import { EmptyState } from "@/components/ui/EmptyState";
import { StatPill } from "@/components/ui/StatPill";

export default function LandingPage() {
  return (
    <PageShell>
      <SectionHeader
        title="TAVERN"
        subtitle="Where your characters gather, rest, and continue their stories."
        actions={
          <>
            <Link href="/register">
              <TavernButton variant="primary">Create account</TavernButton>
            </Link>
            <Link href="/dashboard">
              <TavernButton variant="secondary">Explore demo</TavernButton>
            </Link>
          </>
        }
      />

      <SectionGroup>
        <TavernCard title="A home between adventures" subtitle="Dark slate, warm amber glow">
          <div className="grid gap-6 lg:grid-cols-[1.3fr,0.8fr]">
            <div className="space-y-4">
              <p className="text-base text-slate-300">
                Taverns are built with slow-burn storytelling in mind. Track every campaign, character, and session
                with components that feel like one cohesive, enchanted place.
              </p>
              <div className="flex flex-wrap gap-2">
                <TavernBadge>Shared campaign feed</TavernBadge>
                <TavernBadge variant="slate">Custom GM tools</TavernBadge>
                <TavernBadge variant="muted">Session ledger</TavernBadge>
              </div>
            </div>
            <div className="rounded-2xl border border-slate-800/70 bg-gradient-to-br from-slate-900/60 to-slate-800/60 p-5">
              <div className="h-full space-y-4">
                <div className="h-32 rounded-2xl bg-slate-900/80"></div>
                <p className="text-sm text-slate-400">
                  Visualize your party with a cinematic room, personalized stats, and shimmering micro-interactions.
                </p>
              </div>
            </div>
          </div>
        </TavernCard>

        <TavernCard title="Stay ready" subtitle="Live stats, Sacred UI">
          <div className="flex flex-wrap gap-3">
            <StatPill label="HP" value="120" />
            <StatPill label="XP" value="5,300" />
            <StatPill label="Conditions" value="None" />
            <StatPill label="Gold" value="2,800" />
          </div>
          <p className="text-sm text-slate-400">
            Every action, stat, and note hums with amber detailing to make the story feel alive even when the dice
            are resting.
          </p>
        </TavernCard>

        <EmptyState
          icon={Sparkles}
          title="Ready when you are"
          body="Launch with the shared design system, then layer in 3D renders, session notes, and character stories."
          cta={
            <Link href="/campaigns">
              <TavernButton variant="ghost">Browse campaigns</TavernButton>
            </Link>
          }
        />
      </SectionGroup>
    </PageShell>
  );
}
