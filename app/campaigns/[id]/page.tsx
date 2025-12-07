"use client";

type CampaignPageProps = {
  params: { id: string };
};

type PartyMember = {
  id: string;
  name: string;
  role: string;
  level: string;
};

type Campaign = {
  id: string;
  name: string;
  gm: string;
  partyLink: string;
  party: PartyMember[];
};

const mockCampaigns: Record<string, Campaign> = {
  "1": {
    id: "1",
    name: "Curse of Strahd",
    gm: "GM Thomas",
    partyLink: "https://tavern.app/join/curse-of-strahd-demo",
    party: [
      { id: "1", name: "Kael", role: "Race Sorcerer", level: "Level 5" },
      { id: "2", name: "Rhea", role: "Ranger", level: "Level 3" },
      { id: "3", name: "Thalia", role: "Elf Cleric", level: "Level 3" },
      { id: "4", name: "Brennar", role: "Paladin", level: "Level 4" },
    ],
  },
};

export default function CampaignPage({ params }: CampaignPageProps) {
  const campaign = mockCampaigns[params.id] ?? mockCampaigns["1"];

  return (
    <div className="campaign-layout">
      <section className="campaign-panel">
        <header className="campaign-header">
          <div>
            <h1>{campaign.name}</h1>
            <p className="campaign-subtitle">{campaign.gm}</p>
          </div>
        </header>

        <div className="campaign-body">
          <div className="campaign-share">
            <h2>Share Link</h2>
            <p>
              Send this link to your players to invite them to the party and keep everyone in sync between
              sessions.
            </p>
            <div className="campaign-link-row">
              <input className="campaign-link-input" type="text" value={campaign.partyLink} readOnly />
              <button
                type="button"
                className="btn-secondary campaign-link-btn"
                onClick={() => {
                  navigator.clipboard?.writeText(campaign.partyLink).catch(() => {});
                }}
              >
                Copy Link
              </button>
            </div>
          </div>

          <div className="campaign-notes">
            <h2>Campaign Notes</h2>
            <p>
              Use this space to remember hooks, villains, locations, and open threads. In a future version
              this will sync with your session logs.
            </p>
          </div>
        </div>
      </section>

      <aside className="campaign-party">
        <h2 className="campaign-party-title">Party</h2>
        <div className="campaign-party-list">
          {campaign.party.map((member) => (
            <article key={member.id} className="campaign-party-card">
              <div className="campaign-avatar" />
              <div className="campaign-party-info">
                <h3>{member.name}</h3>
                <p className="campaign-party-role">{member.role}</p>
                <p className="campaign-party-level">{member.level}</p>
              </div>
            </article>
          ))}
        </div>
      </aside>
    </div>
  );
}
