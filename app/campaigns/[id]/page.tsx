import { campaignsById } from "@/lib/data";

type CampaignPageProps = {
  params: { id: string };
};

export default function CampaignPage({ params }: CampaignPageProps) {
  const campaign = campaignsById[params.id] ?? campaignsById["1"];

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
              Send this link to your players to invite them to the party and keep everyone in sync between sessions.
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
              Use this space to remember hooks, villains, locations, and open threads. In a future version this will sync
              with your session logs.
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
