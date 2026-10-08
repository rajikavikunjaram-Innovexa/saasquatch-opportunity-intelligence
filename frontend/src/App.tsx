import { useEffect, useMemo, useState } from "react";
import { ReactFlow, Background, Controls, type NodeMouseHandler } from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import "./styles.css";

type Lead={
  leadId:number; company:string; contact:string; title:string; opportunityScore:number;
  whyNow:string; nextBestAction:string; dataConfidence:number; scoreBreakdown:any;
  signals:any[]; corporateRelationships:string[];
};

const API=import.meta.env.VITE_API_URL||"http://localhost:8080/api";

const demo:Lead[]=Array.from({length:200},(_,i)=>{
  const s=i<32?94:i<106?78:i<157?62:45;
  const breakdown=s>=85
    ? {revenuePotential:19,growth:17,technologyFit:16,decisionMaker:14,industryFit:13,corporateRelationship:i<3?6:0,dataConfidence:i<3?9:15}
    : s>=70
    ? {revenuePotential:17,growth:15,technologyFit:14,decisionMaker:12,industryFit:12,corporateRelationship:0,dataConfidence:8}
    : s>=55
    ? {revenuePotential:14,growth:12,technologyFit:10,decisionMaker:10,industryFit:9,corporateRelationship:0,dataConfidence:7}
    : {revenuePotential:10,growth:8,technologyFit:8,decisionMaker:7,industryFit:6,corporateRelationship:0,dataConfidence:6};
  return {
    leadId:i+1,
    company:["Apex Commerce","Apex Payments","Northstar Labs","CloudWorks","Vertex Systems"][i%5],
    contact:"Decision Maker "+(i+1),
    title:i%2?"VP Engineering":"CTO",
    opportunityScore:s,
    whyNow:s>=85?"Strong growth and technology fit indicate a timely opportunity.":s>=70?"Relevant fit signals make this account worth targeted outreach.":"Monitor for a stronger trigger.",
    nextBestAction:s>=85?"Contact decision maker today.":s>=70?"Send personalized outreach within 48 hours.":"Add to nurture.",
    dataConfidence:92,
    scoreBreakdown:breakdown,
    signals:[
      {type:"COMPANY_GROWTH",weight:18,description:"Growth and hiring activity create a timing trigger."},
      {type:"TECHNOLOGY_FIT",weight:17,description:"Technology environment aligns with the target profile."},
      {type:"DECISION_MAKER",weight:15,description:"Senior decision maker identified for direct outreach."},
      {type:"FUNDING",weight:12,description:"Recent capital activity suggests capacity for new initiatives."},
      {type:"HIRING_GROWTH",weight:10,description:"Hiring momentum indicates an active investment cycle."}
    ],
    corporateRelationships:i<3?["SUBSIDIARY → Apex Holdings"]:[]
  };
});

const band=(s:number)=>s>=85?"HOT":s>=70?"GOOD":s>=55?"NURTURE":"LOW";

export default function App(){
  const[leads,setLeads]=useState<Lead[]>([]);
  const[selected,setSelected]=useState<Lead|null>(null);
  const[view,setView]=useState("dashboard");
  const[search,setSearch]=useState("");
  const[priority,setPriority]=useState("ALL");
  const[demoMode,setDemoMode]=useState(false);

  useEffect(()=>{
    fetch(API+"/leads")
      .then(r=>r.ok?r.json():Promise.reject())
      .then(setLeads)
      .catch(()=>{setLeads(demo);setDemoMode(true);});
  },[]);

  const shown=useMemo(
    ()=>leads
      .filter(l=>(priority==="ALL"||band(l.opportunityScore)===priority)&&l.company.toLowerCase().includes(search.toLowerCase()))
      .sort((a,b)=>b.opportunityScore-a.opportunityScore),
    [leads,search,priority]
  );

  const open=(l:Lead)=>{
    setSelected(l);
    setView("intelligence");
    fetch(API+"/leads/"+l.leadId+"/intelligence")
      .then(r=>r.ok?r.json():null)
      .then(x=>x&&setSelected(x))
      .catch(()=>{});
  };

  const counts={
    HOT:leads.filter(x=>x.opportunityScore>=85).length,
    GOOD:leads.filter(x=>x.opportunityScore>=70&&x.opportunityScore<85).length,
    NURTURE:leads.filter(x=>x.opportunityScore>=55&&x.opportunityScore<70).length,
    LOW:leads.filter(x=>x.opportunityScore<55).length
  };

  const selectPriority=(value:string)=>{
    setPriority(value);
    setSearch("");
    setView("dashboard");
  };

  return <div className="app">
    <header>
      <div className="brand"><div className="logo">OI</div><div><b>Opportunity & Account Intelligence</b><small>Turn 200 leads into opportunities worth pursuing</small></div></div>
      <span className="status">{demoMode?"DEMO DATA":"LIVE DATA"}</span>
    </header>
    <nav>
      <button className={view==="dashboard"?"active":""} onClick={()=>setView("dashboard")}>Dashboard</button>
      <button className={view==="accounts"?"active":""} onClick={()=>setView("accounts")}>Corporate Intelligence</button>
      {selected&&<button className={view==="intelligence"?"active":""} onClick={()=>setView("intelligence")}>Lead Intelligence</button>}
    </nav>
    {view==="dashboard"
      ? <Dashboard leads={shown} all={leads} counts={counts} search={search} setSearch={setSearch} priority={priority} setPriority={selectPriority} open={open}/>
      : view==="intelligence"&&selected
      ? <Intelligence lead={selected}/>
      : <Accounts leads={leads} open={open}/>}
  </div>;
}

function Dashboard(p:any){
  const cards=[["ANALYZED",p.all.length,"ALL"],["HOT",p.counts.HOT,"HOT"],["GOOD",p.counts.GOOD,"GOOD"],["NURTURE",p.counts.NURTURE,"NURTURE"],["LOW",p.counts.LOW,"LOW"]];
  return <main>
    <section className="hero">
      <div><label>OPPORTUNITY COMMAND CENTER</label><h1>Know which lead to contact first — and why now.</h1><p>Explainable prioritization across revenue, growth, technology, decision makers, relationships and confidence.</p></div>
      <button className="cta" onClick={()=>location.reload()}>Analyze Opportunities</button>
    </section>
    <div className="metrics">
      {cards.map(([k,v,filter])=><button className={p.priority===filter?"metric selectedMetric":"metric"} key={String(k)} onClick={()=>p.setPriority(String(filter))}><label>{k}</label><strong>{Number(v)}</strong><small>View {String(k).toLowerCase()} opportunities →</small></button>)}
    </div>
    <section className="panel">
      <div className="toolbar"><h2>{p.priority==="ALL"?"Top opportunities":p.priority+" opportunities"}</h2><div><input placeholder="Search company" value={p.search} onChange={(e)=>p.setSearch(e.target.value)}/><select value={p.priority} onChange={(e)=>p.setPriority(e.target.value)}><option>ALL</option><option>HOT</option><option>GOOD</option><option>NURTURE</option><option>LOW</option></select></div></div>
      <table><thead><tr><th>COMPANY</th><th>SCORE</th><th>PRIORITY</th><th>WHY NOW</th><th>NEXT BEST ACTION</th></tr></thead>
      <tbody>{p.leads.map((l:Lead)=><tr key={l.leadId} onClick={()=>p.open(l)}><td><b>{l.company}</b><small>{l.contact} · {l.title}</small></td><td className="score">{l.opportunityScore}</td><td><em className={band(l.opportunityScore)}>{band(l.opportunityScore)}</em></td><td>{l.whyNow}</td><td>{l.nextBestAction}</td></tr>)}</tbody></table>
    </section>
  </main>;
}

function Intelligence({lead}:{lead:Lead}){
  const b=lead.scoreBreakdown||{};
  const rows=[
    ["Revenue Potential",b.revenuePotential||0,20],
    ["Growth",b.growth||0,18],
    ["Technology Fit",b.technologyFit||0,17],
    ["Decision Maker",b.decisionMaker||0,15],
    ["Industry Fit",b.industryFit||0,14],
    ["Corporate Relationship",b.corporateRelationship||0,6],
    ["Data Confidence",b.dataConfidence||0,10]
  ];
  const breakdownTotal=rows.reduce((sum,r)=>sum+Number(r[1]),0);
  return <main>
    <section className="hero"><div><label>LEAD INTELLIGENCE</label><h1>{lead.company}</h1><p>{lead.contact} · {lead.title}</p></div><div className="big">{lead.opportunityScore}<small>/100</small></div></section>
    <div className="columns">
      <section className="panel">
        <label>WHY NOW</label><h2>{lead.whyNow}</h2>
        <div className="action"><label>NEXT BEST ACTION</label><b>{lead.nextBestAction}</b></div>
        <label>BUYING SIGNALS</label>
        {lead.signals.map((s:any)=><div className="signal" key={s.type}><b>{s.type.replaceAll("_"," ")}</b><span>+{s.weight}</span><small>{s.description}</small></div>)}
      </section>
      <section className="panel">
        <div className="breakdownHeader"><label>SCORE BREAKDOWN</label><strong>{breakdownTotal} / 100</strong></div>
        {rows.map(r=><div className="scoreRow" key={String(r[0])}><span>{r[0]} <b>{r[1]}/{r[2]}</b></span><div><i style={{width:(Number(r[1])/Number(r[2])*100)+"%"}}/></div></div>)}
        <div className="confidence">DATA CONFIDENCE {lead.dataConfidence}%</div>
        <div className="scoreCheck">{breakdownTotal===lead.opportunityScore?"✓ Breakdown matches opportunity score":"! Score breakdown needs review"}</div>
      </section>
    </div>
  </main>;
}

function Accounts({leads,open}:{leads:Lead[];open:(lead:Lead)=>void}){
  const [related,setRelated]=useState<Lead[]>([]);
  useEffect(()=>{
    fetch(API+"/accounts/201/relationships")
      .then(r=>r.ok?r.json():Promise.reject())
      .then(data=>{
        const mapped=(data.relatedCompanies||[]).map((c:any)=>leads.find(l=>l.company===c.companyName)).filter(Boolean) as Lead[];
        if(mapped.length) setRelated(mapped);
      })
      .catch(()=>{});
  },[leads]);
  const visible=related.length?related:leads.filter(l=>l.corporateRelationships.length).slice(0,3);
  const nodes=[
    {id:"p",position:{x:340,y:25},data:{label:"APEX HOLDINGS\nACCOUNT GROUP"},style:{padding:"16px 24px",borderRadius:14,fontWeight:800,minWidth:210,textAlign:"center" as const,background:"#d9ff6a",color:"#07111f",border:"2px solid #efffb0",boxShadow:"0 10px 30px rgba(0,0,0,.25)"}},
    ...visible.map((l,i)=>({id:String(l.leadId),position:{x:55+i*220,y:205},data:{label:l.company+"\n"+l.opportunityScore+" / 100"},style:{padding:"15px 18px",borderRadius:14,minWidth:175,textAlign:"center" as const,cursor:"pointer",background:"#10243a",color:"#edf2fa",border:"1px solid #3b5572",boxShadow:"0 8px 24px rgba(0,0,0,.22)"}}))
  ];
  const edges=visible.map(l=>({id:"e"+l.leadId,source:"p",target:String(l.leadId),label:"SUBSIDIARY",animated:true,style:{stroke:"#7f93ad"},labelStyle:{fill:"#8ea0b7",fontSize:10,fontWeight:700}}));
  const onNodeClick:NodeMouseHandler=(_,node)=>{
    if(node.id!=="p"){
      const lead=visible.find(l=>String(l.leadId)===node.id);
      if(lead) open(lead);
    }
  };
  const top=visible[0];
  return <main>
    <section className="hero"><div><label>CORPORATE INTELLIGENCE</label><h1>See the account, not just the lead.</h1><p>Map corporate relationships, compare subsidiary opportunities, and move from account strategy to lead-level action.</p></div><div className="accountBadge">{visible.length} RELATED OPPORTUNITIES</div></section>
    <div className="accountLayout">
      <section className="panel graphPanel">
        <div className="graphTitle"><div><label>RELATIONSHIP MAP</label><h2>Account group structure</h2></div><span>Click a subsidiary</span></div>
        <div className="graph"><ReactFlow nodes={nodes} edges={edges} fitView fitViewOptions={{padding:0.22}} onNodeClick={onNodeClick}><Background gap={22} size={1}/><Controls/></ReactFlow></div>
      </section>
      <section className="panel accountPanel">
        <label>ACCOUNT INSIGHT</label><h2>Group-level opportunity</h2>
        <div className="accountScore">{top?.opportunityScore||0}<small>/100 lead score</small></div>
        <div className="insightBlock"><span>ACCOUNT / GROUP STRATEGY</span><b>Land-and-expand</b><p>Start with the highest-scoring subsidiary, then use the corporate relationship to introduce an account-level conversation across the group.</p></div>
        <div className="insightBlock"><span>OUTREACH PLAYBOOK</span><b>Lead with the strongest buying trigger</b><p>Reference growth, technology fit and the identified decision maker. Keep the first touch specific to the subsidiary before expanding to the parent account.</p></div>
        <div className="relatedList"><span className="listLabel">RELATED OPPORTUNITIES</span>{visible.map(l=><div className="related" key={l.leadId} onClick={()=>open(l)}><div><b>{l.company}</b><small>{l.title} · {band(l.opportunityScore)}</small></div><strong>{l.opportunityScore}</strong></div>)}</div>
      </section>
    </div>
  </main>;
}
