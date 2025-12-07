const mockCharacters = [
  { id: 1, name: "Elira Dawnwhisper", subtitle: "Elf Ranger • Lv. 5", status: "In Campaign: Emberfall" },
  { id: 2, name: "Brother Hal", subtitle: "Human Cleric • Lv. 3", status: "Available" },
  { id: 3, name: "Korr Blackmaw", subtitle: "Half-Orc Barbarian • Lv. 4", status: "In Campaign: Emberfall" },
];

const mockCampaigns = [
  { id: 1, name: "Curse of Strahd", role: "Player", schedule: "Sundays • 7 PM" },
  { id: 2, name: "Emberfall Heist", role: "GM", schedule: "On Hiatus" },
];

import Link from "next/link";

export default function DashboardPage() {
  return (
    <div className="dashboard">
      <nav className="dashboard-tabs">
        <button className="dashboard-tab dashboard-tab--active" type="button">
          Characters
        </button>
        <button className="dashboard-tab" type="button">
          Campaigns
        </button>
        <button className="dashboard-tab" type="button">
          Settings
        </button>
      </nav>

      <div className="dashboard-content">
        <section className="dashboard-section">
          <header className="dashboard-section-header">
            <div>
              <h2>Your Characters</h2>
              <p>Bring your heroes back to the table anytime.</p>
            </div>
            <Link href="/characters/new">
              <button className="btn-primary dashboard-section-cta" type="button">
                + Add Character
              </button>
            </Link>
          </header>

          <div className="dashboard-grid">
            {mockCharacters.map((c) => (
              <article key={c.id} className="card parchment-card character-card">
                <div className="card-header">
                  <h3>{c.name}</h3>
                  <p className="card-subtitle">{c.subtitle}</p>
                </div>
                <p className="card-meta">{c.status}</p>
                <Link href="/characters/1">
                  <button className="btn-secondary card-button" type="button">
                    Open Sheet
                  </button>
                </Link>
              </article>
            ))}
          </div>
        </section>

        <section className="dashboard-section">
          <header className="dashboard-section-header">
            <div>
              <h2>Your Campaigns</h2>
              <p>Step back into the stories you’re telling.</p>
            </div>
            <button className="btn-secondary dashboard-section-cta" type="button">
              Host a Campaign
            </button>
          </header>

          <div className="dashboard-grid">
            {mockCampaigns.map((c) => (
              <article key={c.id} className="card parchment-card campaign-card">
                <div className="card-header">
                  <h3>{c.name}</h3>
                  <p className="card-subtitle">{c.role}</p>
                </div>
                <p className="card-meta">{c.schedule}</p>
                <Link href="/campaigns/1">
                  <button className="btn-secondary card-button" type="button">
                    Open Campaign
                  </button>
                </Link>
              </article>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
