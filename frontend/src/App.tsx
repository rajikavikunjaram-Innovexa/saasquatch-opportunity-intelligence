import { useEffect, useMemo, useState } from "react";

type Signal = {
  type: string;
  weight: number;
  description: string;
};

type Lead = {
  leadId: number;
  company: string;
  contact: string;
  title: string;
  opportunityScore: number;
  whyNow: string;
  nextBestAction: string;
  dataConfidence: number;
  scoreBreakdown: {
    revenuePotential: number;
    growth: number;
    technologyFit: number;
    decisionMaker: number;
    industryFit: number;
    corporateRelationship: number;
    dataConfidence: number;
  };
  signals: Signal[];
  corporateRelationships: string[];
};

const API = import.meta.env.VITE_API_URL || "http://localhost:8080/api";

const SAMPLE_LEADS: Lead[] = [
  {
    leadId: 1,
    company: "Acme Software",
    contact: "Jordan Lee",
    title: "VP Engineering",
    opportunityScore: 99,
    whyNow: "Recent funding/growth signal detected in the supplied lead data; Engineering hiring growth is elevated; Technology stack matches target profile",
    nextBestAction: "Contact VP Engineering today",
    dataConfidence: 94,
    scoreBreakdown: {
      revenuePotential: 20,
      growth: 18,
      technologyFit: 17,
      decisionMaker: 15,
      industryFit: 14,
      corporateRelationship: 6,
      dataConfidence: 9
    },
    signals: [
      { type: "FUNDING", weight: 5, description: "Recent funding/growth signal detected in the supplied lead data" },
      { type: "HIRING_GROWTH", weight: 5, description: "Engineering hiring growth is elevated" },
      { type: "TECHNOLOGY_FIT", weight: 5, description: "Technology stack matches target profile" },
      { type: "DECISION_MAKER", weight: 5, description: "Senior decision maker identified" },
      { type: "CORPORATE_RELATIONSHIP", weight: 6, description: "Corporate relationship context is available" }
    ],
    corporateRelationships: ["RELATED → Northstar Analytics: Related-company context supplied for demonstration"]
  },
  {
    leadId: 2,
    company: "Northstar Analytics",
    contact: "Maya Patel",
    title: "Head of Product",
    opportunityScore: 83,
    whyNow: "Product and engineering hiring signal present; Cloud technology fit is strong; Head-level decision maker identified",
    nextBestAction: "Contact Head of Product today",
    dataConfidence: 88,
    scoreBreakdown: {
      revenuePotential: 15,
      growth: 14,
      technologyFit: 17,
      decisionMaker: 15,
      industryFit: 14,
      corporateRelationship: 0,
      dataConfidence: 8
    },
    signals: [
      { type: "HIRING_GROWTH", weight: 4, description: "Product and engineering hiring signal present" },
      { type: "TECHNOLOGY_FIT", weight: 5, description: "Cloud technology fit is strong" },
      { type: "DECISION_MAKER", weight: 5, description: "Head-level decision maker identified" }
    ],
    corporateRelationships: []
  },
  {
    leadId: 3,
    company: "Orbit Commerce",
    contact: "Chris Morgan",
    title: "Engineering Manager",
    opportunityScore: 68,
    whyNow: "Technology overlap is moderate",
    nextBestAction: "Verify the decision maker, then start a targeted outreach sequence",
    dataConfidence: 76,
    scoreBreakdown: {
      revenuePotential: 20,
      growth: 8,
      technologyFit: 17,
      decisionMaker: 8,
      industryFit: 8,
      corporateRelationship: 0,
      dataConfidence: 7
    },
    signals: [
      { type: "TECHNOLOGY_FIT", weight: 3, description: "Technology overlap is moderate" }
    ],
    corporateRelationships: []
  }
];

export default function App() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [search, setSearch] = useState("");
  const [minScore, setMinScore] = useState(0);
  const [selected, setSelected] = useState<Lead | null>(null);
  const [usingSampleData, setUsingSampleData] = useState(false);

  useEffect(() => {
    fetch(API + "/leads")
      .then((response) => {
        if (!response.ok) throw new Error("API unavailable");
        return response.json();
      })
      .then((data: Lead[]) => {
        setLeads(data);
        setUsingSampleData(false);
      })
      .catch(() => {
        setLeads(SAMPLE_LEADS);
        setUsingSampleData(true);
      });
  }, []);

  const filtered = useMemo(
    () =>
      leads
        .filter(
          (lead) =>
            !search ||
            lead.company.toLowerCase().includes(search.toLowerCase()) ||
            lead.contact.toLowerCase().includes(search.toLowerCase())
        )
        .filter((lead) => lead.opportunityScore >= minScore),
    [leads, search, minScore]
  );

  return (
    <div className="app">
      <header>
        <div>
          <span className="eyebrow">SAASQUATCH / INTELLIGENCE</span>
          <h1>Opportunity Command Center</h1>
          <p>Prioritize the leads most likely to become valuable conversations.</p>
        </div>
        <div className={usingSampleData ? "pill sample" : "pill"}>
          ● {usingSampleData ? "SAMPLE DATA" : "LIVE DATA"}
        </div>
      </header>

      {usingSampleData && (
        <div className="notice">
          The API is not running, so the dashboard is showing the included sample dataset. Start the backend to switch to live API data.
        </div>
      )}

      <section className="toolbar">
        <input
          placeholder="Search company or contact…"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
        <select value={minScore} onChange={(event) => setMinScore(Number(event.target.value))}>
          <option value={0}>All scores</option>
          <option value={70}>70+ High intent</option>
          <option value={85}>85+ Priority</option>
        </select>
        <span>{filtered.length} leads</span>
      </section>

      <main>
        <section className="tableCard">
          <div className="tableHead">
            <b>Priority leads</b>
            <span>Sorted by opportunity score</span>
          </div>

          {filtered.length === 0 ? (
            <div className="empty">No leads match the current filters.</div>
          ) : (
            filtered.map((lead) => (
              <button className="row" key={lead.leadId} onClick={() => setSelected(lead)}>
                <div className="score">{lead.opportunityScore}</div>
                <div className="identity">
                  <strong>{lead.company}</strong>
                  <span>{lead.contact} · {lead.title}</span>
                </div>
                <div className="signals">
                  {lead.signals.slice(0, 3).map((signal) => (
                    <em key={signal.type}>{signal.type.replaceAll("_", " ")}</em>
                  ))}
                </div>
                <div className="confidence">Confidence {lead.dataConfidence}%</div>
                <div className="arrow">→</div>
              </button>
            ))
          )}
        </section>

        {selected && (
          <aside>
            <button className="close" onClick={() => setSelected(null)} aria-label="Close details">×</button>
            <span className="eyebrow">LEAD INTELLIGENCE</span>
            <h2>{selected.company}</h2>
            <p className="person">{selected.contact} · {selected.title}</p>

            <div className="heroScore">
              <b>{selected.opportunityScore}</b>
              <span>Opportunity score</span>
            </div>

            <h3>Why now?</h3>
            <p>{selected.whyNow}</p>

            <h3>Next best action</h3>
            <div className="action">{selected.nextBestAction}</div>

            <h3>Score breakdown</h3>
            <div className="breakdown">
              {Object.entries(selected.scoreBreakdown).map(([key, value]) => (
                <div key={key}>
                  <span>{key.replace(/([A-Z])/g, " $1")}</span>
                  <b>{value}</b>
                </div>
              ))}
            </div>

            <h3>Corporate relationships</h3>
            {selected.corporateRelationships.length ? (
              selected.corporateRelationships.map((relationship) => (
                <p className="relationship" key={relationship}>↳ {relationship}</p>
              ))
            ) : (
              <p>No relationship signal available.</p>
            )}

            <h3>Signals</h3>
            {selected.signals.map((signal) => (
              <div className="signal" key={signal.type}>
                <b>{signal.type.replaceAll("_", " ")}</b>
                <span>+{signal.weight}</span>
                <small>{signal.description}</small>
              </div>
            ))}
          </aside>
        )}
      </main>
    </div>
  );
}
