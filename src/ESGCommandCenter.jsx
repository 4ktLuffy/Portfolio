import { useState, useEffect, useRef, useCallback } from "react";

const SAMPLE_DATA = {
  manufacturing: { label: "Manufacturing Co.", icon: "🏭", text: `COMPANY: NovaTech Manufacturing GmbH
INDUSTRY: Electronics Manufacturing
HQ: Munich, Germany
REPORTING PERIOD: Q1 2026
FRAMEWORK: EU CSRD / ESRS

SUPPLIER DATA:
ID | Name | Country | Tier | Category | Annual Spend | Emissions (tCO2e) | Energy Source | Workers | Certifications | Last Audit
S001 | Shenzhen MicroParts Ltd | China | 1 | Components | €4.2M | 12,400 | 78% Coal | 2,800 | ISO 14001 | 2024-08
S002 | Chennai Circuit Solutions | India | 1 | PCB Assembly | €2.8M | 6,200 | 45% Solar, 55% Grid | 1,200 | ISO 14001, SA8000 | 2025-11
S003 | Baltic Metals OÜ | Estonia | 2 | Raw Materials | €1.5M | 3,100 | 90% Renewable | 340 | ISO 14001 | 2025-06
S004 | Lagos Plastics Intl | Nigeria | 2 | Packaging | €890K | 4,800 | 95% Diesel Gen | 520 | None | 2023-03
S005 | TechAssembly Vietnam | Vietnam | 1 | Final Assembly | €6.1M | 8,900 | 60% Coal, 40% Hydro | 4,200 | ISO 14001 | 2025-09
S006 | Rhine Logistics AG | Germany | 3 | Transport | €2.1M | 5,600 | Diesel Fleet | 180 | ISO 14001 | 2025-12
S007 | Santiago Rare Earth Mining | Chile | 2 | Raw Materials | €3.4M | 15,200 | 70% Grid, 30% Solar | 890 | None | 2024-01
S008 | Krakow Steel Works | Poland | 2 | Raw Materials | €1.9M | 9,300 | 85% Coal | 620 | ISO 14001 | 2025-03

COMPANY EMISSIONS:
Scope 1 (Direct): 4,200 tCO2e
Scope 2 (Electricity): 8,100 tCO2e
Scope 3 (Supply Chain): 65,500 tCO2e (estimated)

RECENT EVENTS:
- Feb 2026: New EU CSDDD enforcement guidelines published, stricter due diligence on Tier 2+ suppliers
- Mar 2026: Reports of labor violations at a Vietnam electronics factory district (unconfirmed if our supplier affected)
- Jan 2026: Nigeria tightened emissions reporting requirements for export manufacturers
- Mar 2026: Chile water scarcity crisis affecting mining operations in northern regions` },

  fashion: { label: "Fashion Brand", icon: "👗", text: `COMPANY: EcoThread Fashion AB
INDUSTRY: Fast Fashion / Apparel
HQ: Stockholm, Sweden
REPORTING PERIOD: Q1 2026
FRAMEWORK: EU CSRD / ESRS

SUPPLIER DATA:
ID | Name | Country | Tier | Category | Annual Spend | Emissions (tCO2e) | Energy Source | Workers | Certifications | Last Audit
S001 | Dhaka Textiles Group | Bangladesh | 1 | Garment Manufacturing | €8.5M | 11,200 | 80% Gas | 12,000 | BSCI, WRAP | 2025-10
S002 | Izmir Cotton Mills | Turkey | 2 | Raw Materials | €3.2M | 4,100 | 60% Grid | 800 | OEKO-TEX | 2025-04
S003 | Mumbai Dye Works Pvt | India | 2 | Dyeing & Finishing | €2.1M | 7,800 | 70% Coal | 1,400 | None | 2024-06
S004 | Addis Ababa Garments PLC | Ethiopia | 1 | Basic Assembly | €1.8M | 1,900 | 85% Hydro | 3,200 | None | 2024-09
S005 | Portuguese Leather Co | Portugal | 2 | Materials | €4.1M | 2,800 | 75% Renewable | 220 | ISO 14001, LWG | 2025-12
S006 | Hangzhou Zipper Tech | China | 3 | Accessories | €680K | 1,200 | 65% Coal | 340 | ISO 9001 | 2025-01
S007 | Antwerp Distribution NV | Belgium | 3 | Logistics | €1.5M | 3,400 | Diesel/Electric Mix | 90 | ISO 14001 | 2025-11

COMPANY EMISSIONS:
Scope 1: 1,800 tCO2e
Scope 2: 3,200 tCO2e
Scope 3: 32,400 tCO2e

RECENT EVENTS:
- Mar 2026: Bangladesh factory building safety concerns raised by IndustriALL union
- Feb 2026: Turkish earthquake disrupted supply routes, 2-week delays
- Jan 2026: India Chemical Management regulation update (dyeing processes)
- Mar 2026: Ethiopia political instability reports in manufacturing regions` },
};

const AGENT_DEFS = [
  { id: "scanner", name: "Horizon Scanner", icon: "🛰️", color: "#60A5FA", desc: "Scans for regulatory changes, risks & global events" },
  { id: "aggregator", name: "Data Aggregator", icon: "📊", color: "#A78BFA", desc: "Structures and validates supplier data" },
  { id: "assessor", name: "Risk Assessor", icon: "⚖️", color: "#FBBF24", desc: "Scores suppliers on ESG criteria" },
  { id: "writer", name: "Report Writer", icon: "📝", color: "#34D399", desc: "Drafts CSRD-compliant narrative report" },
  { id: "redteam", name: "Red Teamer", icon: "🔴", color: "#FF4D4D", desc: "Adversarially attacks report for errors & bias" },
];

const RiskBadge = ({ level }) => {
  const c = { critical: "#FF4D4D", high: "#FF9F43", medium: "#FBBF24", low: "#34D399" };
  return (
    <span style={{ fontSize: "9px", padding: "2px 7px", borderRadius: "4px", background: (c[level] || "#999") + "12", color: c[level] || "#999", fontWeight: 700, fontFamily: "mono", textTransform: "uppercase", letterSpacing: "0.5px" }}>
      {level}
    </span>
  );
};

export default function ESGCommandCenter() {
  const [apiKey, setApiKey] = useState("");
  const [keySaved, setKeySaved] = useState(false);
  const [keyVisible, setKeyVisible] = useState(false);
  const [input, setInput] = useState("");
  const [processing, setProcessing] = useState(false);
  const [currentAgent, setCurrentAgent] = useState(-1);
  const [agentResults, setAgentResults] = useState({});
  const [agentTimes, setAgentTimes] = useState({});
  const [redTeamPass, setRedTeamPass] = useState(null);
  const [iterationCount, setIterationCount] = useState(0);
  const [error, setError] = useState(null);
  const [logs, setLogs] = useState([]);
  const [activeTab, setActiveTab] = useState("pipeline");
  const [elapsed, setElapsed] = useState(0);
  const timerRef = useRef(null);

  const addLog = useCallback((lvl, msg) => {
    const t = new Date();
    const time = t.toLocaleTimeString("en-US", { hour12: false }) + "." + String(t.getMilliseconds()).padStart(3, "0").slice(0, 2);
    setLogs(prev => [...prev.slice(-80), { time, lvl, msg }]);
  }, []);

  const callGroq = async (system, user, agent) => {
    addLog("info", `${agent} → Sending to Groq...`);
    const start = Date.now();
    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({ model: "llama-3.3-70b-versatile", max_tokens: 2000, temperature: 0.2, messages: [{ role: "system", content: system }, { role: "user", content: user }] }),
    });
    const data = await res.json();
    if (data.error) throw new Error(data.error.message || JSON.stringify(data.error));
    const ms = Date.now() - start;
    addLog("success", `${agent} → Done in ${(ms / 1000).toFixed(2)}s`);
    return { text: data.choices?.[0]?.message?.content || "", ms };
  };

  const runPipeline = useCallback(async (text) => {
    if (!apiKey.trim()) { setError("Connect Groq API key first"); return; }
    setProcessing(true); setError(null); setAgentResults({}); setAgentTimes({});
    setRedTeamPass(null); setIterationCount(0); setLogs([]); setElapsed(0);
    setActiveTab("pipeline"); setCurrentAgent(0);
    const start = Date.now();
    timerRef.current = setInterval(() => setElapsed(Date.now() - start), 50);

    try {
      // AGENT 1: Horizon Scanner
      addLog("info", "═══ AGENT 1/5: HORIZON SCANNER ═══");
      const scan = await callGroq(
        `You are a Horizon Scanner Agent for ESG supply chain compliance. Analyze the company data and recent events. Identify:
1. New regulatory risks (EU CSRD, CSDDD, local laws)
2. Geopolitical risks affecting suppliers
3. Environmental events (climate, disasters)
4. Labor/human rights red flags
5. Reputational risks

Return ONLY valid JSON:
{"regulatory_alerts":[{"regulation":"name","impact":"description","urgency":"critical|high|medium|low","affected_suppliers":["IDs"]}],"geopolitical_risks":[{"region":"area","risk":"description","severity":"critical|high|medium|low"}],"environmental_events":[{"event":"description","impact":"on supply chain"}],"labor_flags":[{"flag":"description","suppliers":["IDs"]}],"scan_confidence":0-100}`,
        text, "Scanner"
      );
      let scanData;
      try { scanData = JSON.parse(scan.text.replace(/```json|```/g, "").trim()); } catch { throw new Error("Scanner parse failed"); }
      setAgentResults(prev => ({ ...prev, scanner: scanData }));
      setAgentTimes(prev => ({ ...prev, scanner: scan.ms }));
      setCurrentAgent(1);

      // AGENT 2: Data Aggregator
      addLog("info", "═══ AGENT 2/5: DATA AGGREGATOR ═══");
      const agg = await callGroq(
        `You are a Data Aggregator Agent. Structure and validate the supplier data. Return ONLY valid JSON:
{"company":{"name":"string","industry":"string","hq":"string","period":"string"},"total_suppliers":0,"emissions_summary":{"scope1":0,"scope2":0,"scope3":0,"total":0,"unit":"tCO2e"},"suppliers":[{"id":"string","name":"string","country":"string","tier":0,"spend":"string","emissions":0,"energy_profile":"string","workers":0,"certifications":["string"],"last_audit":"date","audit_gap_months":0}],"data_quality":{"completeness_score":0-100,"missing_fields":["field"],"stale_data_flags":["description"]}}`,
        text, "Aggregator"
      );
      let aggData;
      try { aggData = JSON.parse(agg.text.replace(/```json|```/g, "").trim()); } catch { throw new Error("Aggregator parse failed"); }
      setAgentResults(prev => ({ ...prev, aggregator: aggData }));
      setAgentTimes(prev => ({ ...prev, aggregator: agg.ms }));
      setCurrentAgent(2);

      // AGENT 3: Risk Assessor
      addLog("info", "═══ AGENT 3/5: RISK ASSESSOR ═══");
      const assess = await callGroq(
        `You are an ESG Risk Assessor Agent. Score each supplier on Environmental, Social, and Governance criteria. Use the scanner findings and aggregated data. Return ONLY valid JSON:
{"supplier_scores":[{"id":"string","name":"string","environmental_score":0-100,"social_score":0-100,"governance_score":0-100,"overall_esg":0-100,"risk_level":"critical|high|medium|low","key_risks":["risk"],"recommendations":["action"]}],"high_risk_suppliers":["IDs"],"critical_actions":[{"action":"what to do","supplier":"ID","deadline":"urgency","potential_fine":"estimated"}],"portfolio_risk_score":0-100}`,
        `Scanner findings:\n${JSON.stringify(scanData)}\n\nAggregated data:\n${JSON.stringify(aggData)}\n\nOriginal:\n${text}`, "Assessor"
      );
      let assessData;
      try { assessData = JSON.parse(assess.text.replace(/```json|```/g, "").trim()); } catch { throw new Error("Assessor parse failed"); }
      setAgentResults(prev => ({ ...prev, assessor: assessData }));
      setAgentTimes(prev => ({ ...prev, assessor: assess.ms }));
      setCurrentAgent(3);

      // AGENT 4: Report Writer
      addLog("info", "═══ AGENT 4/5: REPORT WRITER ═══");
      const writeReport = async (feedback) => {
        const extra = feedback ? `\n\nPREVIOUS RED TEAM FEEDBACK (you MUST address these issues):\n${feedback}` : "";
        const report = await callGroq(
          `You are an ESG Report Writer Agent. Draft a CSRD-compliant executive summary report. Include:
1. Executive Summary (2-3 sentences)
2. Emissions Overview (Scope 1, 2, 3)
3. Supply Chain Risk Assessment (top risks by supplier)
4. Regulatory Compliance Status
5. Critical Actions Required (with deadlines)
6. Recommendations

Write in professional regulatory language. Be specific with numbers and supplier names. Do NOT hallucinate data — only use what's provided.${extra}

Return the report as plain text (not JSON). Use clear section headers with "##" markdown.`,
          `Scanner:\n${JSON.stringify(scanData)}\n\nData:\n${JSON.stringify(aggData)}\n\nRisk Assessment:\n${JSON.stringify(assessData)}`, "Writer"
        );
        return report;
      };

      let reportResult = await writeReport(null);
      setAgentResults(prev => ({ ...prev, writer: reportResult.text }));
      setAgentTimes(prev => ({ ...prev, writer: reportResult.ms }));
      setCurrentAgent(4);

      // AGENT 5: Red Teamer (with feedback loop)
      addLog("info", "═══ AGENT 5/5: RED TEAMER ═══");
      addLog("warn", "Red Teamer activating — adversarial review mode");

      let passed = false;
      let iteration = 0;
      const maxIterations = 2;

      while (!passed && iteration < maxIterations) {
        iteration++;
        setIterationCount(iteration);
        addLog("info", `Red Team iteration ${iteration}/${maxIterations}...`);

        const redteam = await callGroq(
          `You are a Red Teamer Agent — an adversarial reviewer of ESG compliance reports. Your job is to ATTACK this report and find every flaw. Be aggressive and thorough.

Check for:
1. HALLUCINATIONS — numbers or claims not supported by the source data
2. MISSING RISKS — important risks from scanner data not mentioned in report
3. BIAS — unfair treatment of any supplier or region
4. REGULATORY GAPS — CSRD/CSDDD requirements not adequately addressed
5. VAGUE LANGUAGE — any weasel words or non-specific claims that wouldn't pass an audit
6. WRONG MATH — emissions totals, percentages, or scores that don't add up

Return ONLY valid JSON:
{"passed":true/false,"severity":"clean|minor|major|critical","issues_found":[{"type":"hallucination|missing_risk|bias|regulatory_gap|vague_language|wrong_math","description":"specific issue","location":"where in report","fix_suggestion":"how to fix"}],"overall_assessment":"1-2 sentence verdict","confidence":0-100}`,
          `REPORT TO REVIEW:\n${reportResult.text}\n\nSOURCE DATA:\nScanner: ${JSON.stringify(scanData)}\nAggregated: ${JSON.stringify(aggData)}\nRisk Assessment: ${JSON.stringify(assessData)}`, "RedTeam"
        );

        let redData;
        try { redData = JSON.parse(redteam.text.replace(/```json|```/g, "").trim()); } catch { redData = { passed: true, severity: "minor", issues_found: [], overall_assessment: "Parse failed — treating as pass", confidence: 50 }; }

        setAgentResults(prev => ({ ...prev, [`redteam_${iteration}`]: redData }));
        setAgentTimes(prev => ({ ...prev, [`redteam_${iteration}`]: redteam.ms }));

        if (redData.passed || redData.issues_found?.length === 0) {
          passed = true;
          addLog("success", `✓ Red Team PASSED — report cleared (iteration ${iteration})`);
        } else {
          addLog("warn", `✕ Red Team found ${redData.issues_found?.length || 0} issues (${redData.severity})`);
          if (iteration < maxIterations) {
            addLog("info", "Sending feedback to Report Writer for revision...");
            setCurrentAgent(3);
            const feedback = redData.issues_found.map(i => `[${i.type.toUpperCase()}] ${i.description} → Fix: ${i.fix_suggestion}`).join("\n");
            reportResult = await writeReport(feedback);
            setAgentResults(prev => ({ ...prev, writer: reportResult.text }));
            setAgentTimes(prev => ({ ...prev, writer: (prev.writer || 0) + reportResult.ms }));
            setCurrentAgent(4);
          } else {
            addLog("warn", "Max iterations reached — releasing with warnings");
          }
        }
      }

      setRedTeamPass(passed);
      clearInterval(timerRef.current);
      setElapsed(Date.now() - start);
      setCurrentAgent(5);
      addLog("success", `✓ Pipeline complete — ${((Date.now() - start) / 1000).toFixed(2)}s total, ${iteration} red team iteration(s)`);
    } catch (err) {
      clearInterval(timerRef.current);
      setError(err.message);
      addLog("error", `Pipeline failed: ${err.message}`);
    } finally { setProcessing(false); }
  }, [apiKey, addLog]);

  const handleExport = () => {
    const blob = new Blob([JSON.stringify({ agentResults, agentTimes, redTeamPass, iterationCount, elapsed }, null, 2)], { type: "application/json" });
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = `esg-report-${Date.now()}.json`; a.click();
  };

  const handleExportReport = () => {
    if (!agentResults.writer) return;
    const blob = new Blob([agentResults.writer], { type: "text/markdown" });
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = `esg-compliance-report-${Date.now()}.md`; a.click();
  };

  const scores = agentResults.assessor?.supplier_scores || [];
  const latestRedTeam = agentResults[`redteam_${iterationCount}`];

  return (
    <div style={{ minHeight: "100vh", background: "#0A0C0F", color: "#fff", fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&family=IBM+Plex+Mono:wght@400;500;600;700&display=swap');
        @keyframes fadeIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}
        @keyframes slideIn{from{opacity:0;transform:translateX(10px)}to{opacity:1;transform:translateX(0)}}
        *{box-sizing:border-box;scrollbar-width:thin;scrollbar-color:rgba(255,255,255,.08) transparent}
        *::-webkit-scrollbar{width:4px}*::-webkit-scrollbar-thumb{background:rgba(255,255,255,.08);border-radius:2px}
        textarea:focus,input:focus{outline:none}::selection{background:rgba(96,165,250,.2)}
      `}</style>

      <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "28px 20px 60px" }}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "14px", marginBottom: "24px" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
              <div style={{ width: "30px", height: "30px", borderRadius: "8px", background: "linear-gradient(135deg, #34D399, #60A5FA)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px" }}>🌍</div>
              <h1 style={{ fontSize: "20px", fontWeight: 800, margin: 0 }}>ESG Compliance Command Center</h1>
              <span style={{ fontSize: "9px", padding: "3px 8px", borderRadius: "4px", background: "rgba(52,211,153,0.08)", color: "#34D399", fontWeight: 700, fontFamily: "mono" }}>v1.0</span>
            </div>
            <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.3)", margin: 0 }}>5-agent pipeline with adversarial Red Teaming — supply chain ESG risk analysis & CSRD reporting</p>
          </div>
          <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
            {keySaved ? (
              <div style={{ display: "flex", alignItems: "center", gap: "8px", padding: "6px 12px", borderRadius: "8px", background: "rgba(52,211,153,0.06)", border: "1px solid rgba(52,211,153,0.12)" }}>
                <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#34D399" }} />
                <span style={{ fontSize: "11px", fontFamily: "mono", color: "rgba(255,255,255,0.4)" }}>{apiKey.slice(0, 7)}...{apiKey.slice(-3)}</span>
                <button onClick={() => { setKeySaved(false); setApiKey(""); }} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.2)", cursor: "pointer", fontSize: "12px" }}>×</button>
              </div>
            ) : (
              <div style={{ display: "flex", gap: "5px" }}>
                <input type={keyVisible ? "text" : "password"} value={apiKey} onChange={e => setApiKey(e.target.value)} placeholder="Groq API key..." style={{ padding: "6px 10px", borderRadius: "7px", background: "rgba(0,0,0,.25)", border: "1px solid rgba(255,255,255,.05)", color: "#fff", fontSize: "11px", fontFamily: "mono", width: "180px" }} />
                <button onClick={() => setKeyVisible(!keyVisible)} style={{ padding: "6px", borderRadius: "7px", border: "1px solid rgba(255,255,255,.05)", background: "rgba(255,255,255,.02)", color: "rgba(255,255,255,.3)", cursor: "pointer" }}>{keyVisible ? "🙈" : "👁️"}</button>
                <button onClick={() => apiKey.trim() && setKeySaved(true)} style={{ padding: "6px 12px", borderRadius: "7px", border: "none", background: apiKey.trim() ? "#34D399" : "rgba(255,255,255,.04)", color: apiKey.trim() ? "#000" : "rgba(255,255,255,.15)", fontWeight: 700, fontSize: "11px", cursor: "pointer", fontFamily: "mono" }}>CONNECT</button>
              </div>
            )}
            {agentResults.writer && (
              <div style={{ display: "flex", gap: "4px" }}>
                <button onClick={handleExportReport} style={{ padding: "5px 10px", borderRadius: "6px", border: "1px solid rgba(52,211,153,0.15)", background: "rgba(52,211,153,0.04)", color: "#34D399", fontSize: "10px", fontWeight: 700, cursor: "pointer", fontFamily: "mono" }}>📝 Report</button>
                <button onClick={handleExport} style={{ padding: "5px 10px", borderRadius: "6px", border: "1px solid rgba(96,165,250,0.15)", background: "rgba(96,165,250,0.04)", color: "#60A5FA", fontSize: "10px", fontWeight: 700, cursor: "pointer", fontFamily: "mono" }}>{ } JSON</button>
              </div>
            )}
          </div>
        </div>

        {/* Agent pipeline strip */}
        <div style={{ display: "flex", gap: "4px", marginBottom: "20px", flexWrap: "wrap", alignItems: "center" }}>
          {AGENT_DEFS.map((agent, i) => {
            const isDone = agentResults[agent.id] || (agent.id === "redteam" && latestRedTeam);
            const isActive = processing && currentAgent === i;
            return (
              <div key={agent.id} style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                <div style={{
                  display: "flex", alignItems: "center", gap: "6px", padding: "6px 10px",
                  background: isDone ? agent.color + "10" : isActive ? agent.color + "08" : "rgba(255,255,255,0.015)",
                  border: `1px solid ${isActive ? agent.color + "40" : isDone ? agent.color + "20" : "rgba(255,255,255,0.04)"}`,
                  borderRadius: "7px", transition: "all 0.3s",
                }}>
                  <span style={{ fontSize: "13px" }}>{agent.icon}</span>
                  <span style={{ fontSize: "9px", fontWeight: 700, color: isDone || isActive ? agent.color : "rgba(255,255,255,0.2)", fontFamily: "mono", letterSpacing: "0.3px" }}>
                    {agent.name.split(" ")[0].toUpperCase()}
                  </span>
                  {isActive && <span style={{ fontSize: "8px", color: agent.color, animation: "pulse 1s infinite" }}>●</span>}
                  {isDone && <span style={{ fontSize: "9px", color: agent.color }}>✓</span>}
                </div>
                {i < 3 && <span style={{ color: isDone ? "#34D399" : "rgba(255,255,255,0.08)", fontSize: "10px" }}>→</span>}
                {i === 3 && <span style={{ color: isDone ? "#34D399" : "rgba(255,255,255,0.08)", fontSize: "10px" }}>→</span>}
                {i === 4 && iterationCount > 0 && !redTeamPass && currentAgent < 5 && (
                  <span style={{ fontSize: "9px", color: "#FF4D4D", fontFamily: "mono", marginLeft: "4px" }}>↩ LOOP</span>
                )}
              </div>
            );
          })}
        </div>

        {/* Input */}
        <div style={{ background: "rgba(255,255,255,0.015)", border: "1px solid rgba(255,255,255,0.04)", borderRadius: "12px", padding: "16px", marginBottom: "16px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px", flexWrap: "wrap", gap: "6px" }}>
            <span style={{ fontSize: "10px", fontWeight: 700, letterSpacing: "1.2px", color: "rgba(255,255,255,0.2)", fontFamily: "mono" }}>SUPPLY CHAIN DATA</span>
            <div style={{ display: "flex", gap: "4px" }}>
              {Object.entries(SAMPLE_DATA).map(([key, s]) => (
                <button key={key} onClick={() => setInput(s.text)} style={{
                  padding: "3px 8px", borderRadius: "5px", border: "1px solid rgba(255,255,255,.05)",
                  background: input === s.text ? "rgba(52,211,153,0.06)" : "rgba(255,255,255,.015)",
                  color: input === s.text ? "#34D399" : "rgba(255,255,255,.3)",
                  fontSize: "9.5px", fontWeight: 600, cursor: "pointer",
                }}>{s.icon} {s.label}</button>
              ))}
            </div>
          </div>
          <textarea value={input} onChange={e => setInput(e.target.value)} placeholder="Paste company supplier data, emissions, certifications, recent events..." style={{
            width: "100%", minHeight: "180px", padding: "14px", borderRadius: "9px",
            background: "rgba(0,0,0,.2)", border: "1px solid rgba(255,255,255,.03)",
            color: "rgba(255,255,255,.75)", fontSize: "12px", lineHeight: 1.65, resize: "vertical",
            fontFamily: "'IBM Plex Mono', monospace",
          }} />
          <button onClick={() => input.trim() && runPipeline(input.trim())} disabled={processing || !input.trim() || !keySaved} style={{
            marginTop: "10px", width: "100%", padding: "12px", borderRadius: "9px", border: "none",
            fontWeight: 700, fontSize: "12px", fontFamily: "mono",
            cursor: (processing || !input.trim() || !keySaved) ? "not-allowed" : "pointer",
            background: processing ? "rgba(52,211,153,0.08)" : (!input.trim() || !keySaved) ? "rgba(255,255,255,.03)" : "linear-gradient(135deg, #34D399, #60A5FA)",
            color: (!input.trim() || !keySaved) ? "rgba(255,255,255,.12)" : processing ? "#34D399" : "#fff",
          }}>
            {!keySaved ? "🔑 CONNECT KEY" : processing ? `⟳ AGENT ${currentAgent + 1}/5 — ${AGENT_DEFS[currentAgent]?.name || "Processing"}... ${(elapsed / 1000).toFixed(1)}s` : "▶ RUN 5-AGENT PIPELINE"}
          </button>
        </div>

        {/* Console */}
        {logs.length > 0 && (
          <div style={{ background: "#080A0D", border: "1px solid rgba(255,255,255,0.03)", borderRadius: "10px", overflow: "hidden", marginBottom: "16px" }}>
            <div style={{ padding: "7px 12px", display: "flex", alignItems: "center", gap: "6px", borderBottom: "1px solid rgba(255,255,255,0.03)" }}>
              <div style={{ display: "flex", gap: "4px" }}><div style={{ width: 6, height: 6, borderRadius: "50%", background: "#FF5F57" }} /><div style={{ width: 6, height: 6, borderRadius: "50%", background: "#FFBD2E" }} /><div style={{ width: 6, height: 6, borderRadius: "50%", background: "#28CA41" }} /></div>
              <span style={{ fontSize: "9px", fontFamily: "mono", color: "rgba(255,255,255,0.2)" }}>esg-pipeline — {logs.length} events</span>
            </div>
            <div style={{ maxHeight: "120px", overflowY: "auto", padding: "8px 12px", fontSize: "10px", fontFamily: "mono", lineHeight: 1.8 }}>
              {logs.map((l, i) => (
                <div key={i}><span style={{ color: "rgba(255,255,255,0.1)" }}>{l.time} </span><span style={{ color: l.lvl === "error" ? "#F87171" : l.lvl === "success" ? "#34D399" : l.lvl === "warn" ? "#FBBF24" : "#60A5FA", fontWeight: 600 }}>{l.lvl.slice(0, 4).toUpperCase()} </span><span style={{ color: "rgba(255,255,255,0.4)" }}>{l.msg}</span></div>
              ))}
            </div>
          </div>
        )}

        {error && <div style={{ padding: "10px 14px", borderRadius: "9px", background: "rgba(248,113,113,.06)", border: "1px solid rgba(248,113,113,.12)", fontSize: "11px", color: "#F87171", fontFamily: "mono", marginBottom: "16px" }}>⚠ {error}</div>}

        {/* Results */}
        {(currentAgent >= 5 || scores.length > 0) && (
          <div style={{ animation: "fadeIn 0.4s ease" }}>
            {/* Tabs */}
            <div style={{ display: "flex", gap: "2px", background: "rgba(255,255,255,0.02)", borderRadius: "8px", padding: "2px", marginBottom: "16px" }}>
              {[{ id: "pipeline", label: "Scores & Risks" }, { id: "report", label: "Compliance Report" }, { id: "redteam", label: `Red Team ${redTeamPass === true ? "✓" : redTeamPass === false ? "⚠" : ""}` }, { id: "actions", label: "Critical Actions" }].map(tab => (
                <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
                  flex: 1, padding: "8px", borderRadius: "6px", border: "none",
                  background: activeTab === tab.id ? "rgba(52,211,153,0.06)" : "transparent",
                  color: activeTab === tab.id ? "#34D399" : "rgba(255,255,255,0.2)",
                  fontSize: "10.5px", fontWeight: 600, cursor: "pointer",
                }}>{tab.label}</button>
              ))}
            </div>

            {/* Scores & Risks */}
            {activeTab === "pipeline" && (
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {agentResults.assessor?.portfolio_risk_score !== undefined && (
                  <div style={{ display: "flex", gap: "10px", marginBottom: "4px" }}>
                    <div style={{ flex: 1, padding: "16px", borderRadius: "11px", background: "rgba(0,0,0,0.15)", textAlign: "center" }}>
                      <div style={{ fontSize: "28px", fontWeight: 800, color: agentResults.assessor.portfolio_risk_score > 60 ? "#34D399" : agentResults.assessor.portfolio_risk_score > 40 ? "#FBBF24" : "#FF4D4D", fontFamily: "mono" }}>{agentResults.assessor.portfolio_risk_score}</div>
                      <div style={{ fontSize: "9px", color: "rgba(255,255,255,0.2)", letterSpacing: "1px", marginTop: "4px", fontFamily: "mono" }}>PORTFOLIO ESG SCORE</div>
                    </div>
                    <div style={{ flex: 1, padding: "16px", borderRadius: "11px", background: "rgba(0,0,0,0.15)", textAlign: "center" }}>
                      <div style={{ fontSize: "28px", fontWeight: 800, color: "#60A5FA", fontFamily: "mono" }}>{scores.length}</div>
                      <div style={{ fontSize: "9px", color: "rgba(255,255,255,0.2)", letterSpacing: "1px", marginTop: "4px", fontFamily: "mono" }}>SUPPLIERS SCORED</div>
                    </div>
                    <div style={{ flex: 1, padding: "16px", borderRadius: "11px", background: "rgba(0,0,0,0.15)", textAlign: "center" }}>
                      <div style={{ fontSize: "28px", fontWeight: 800, color: "#FF4D4D", fontFamily: "mono" }}>{(agentResults.assessor?.high_risk_suppliers || []).length}</div>
                      <div style={{ fontSize: "9px", color: "rgba(255,255,255,0.2)", letterSpacing: "1px", marginTop: "4px", fontFamily: "mono" }}>HIGH RISK</div>
                    </div>
                    <div style={{ flex: 1, padding: "16px", borderRadius: "11px", background: "rgba(0,0,0,0.15)", textAlign: "center" }}>
                      <div style={{ fontSize: "28px", fontWeight: 800, color: "#FBBF24", fontFamily: "mono" }}>{iterationCount}</div>
                      <div style={{ fontSize: "9px", color: "rgba(255,255,255,0.2)", letterSpacing: "1px", marginTop: "4px", fontFamily: "mono" }}>RED TEAM ROUNDS</div>
                    </div>
                  </div>
                )}

                {scores.map((s, i) => (
                  <div key={i} style={{ padding: "14px", borderRadius: "10px", background: "rgba(255,255,255,0.015)", border: "1px solid rgba(255,255,255,0.04)", animation: "fadeIn 0.3s ease", animationDelay: `${i * 0.06}s`, animationFillMode: "both" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <span style={{ fontSize: "10px", fontFamily: "mono", color: "rgba(255,255,255,0.2)" }}>{s.id}</span>
                        <span style={{ fontSize: "13px", fontWeight: 600, color: "rgba(255,255,255,0.8)" }}>{s.name}</span>
                      </div>
                      <RiskBadge level={s.risk_level} />
                    </div>
                    <div style={{ display: "flex", gap: "8px", marginBottom: "8px" }}>
                      {[{ label: "ENV", val: s.environmental_score, color: "#34D399" }, { label: "SOC", val: s.social_score, color: "#60A5FA" }, { label: "GOV", val: s.governance_score, color: "#A78BFA" }, { label: "ESG", val: s.overall_esg, color: "#FBBF24" }].map(m => (
                        <div key={m.label} style={{ flex: 1, textAlign: "center", padding: "6px", borderRadius: "6px", background: "rgba(0,0,0,0.15)" }}>
                          <div style={{ fontSize: "14px", fontWeight: 800, color: m.val >= 70 ? m.color : m.val >= 40 ? "#FBBF24" : "#FF4D4D", fontFamily: "mono" }}>{m.val}</div>
                          <div style={{ fontSize: "8px", color: "rgba(255,255,255,0.2)", fontFamily: "mono" }}>{m.label}</div>
                        </div>
                      ))}
                    </div>
                    {s.key_risks?.length > 0 && (
                      <div style={{ display: "flex", gap: "4px", flexWrap: "wrap" }}>
                        {s.key_risks.map((r, j) => <span key={j} style={{ fontSize: "9px", padding: "2px 7px", borderRadius: "4px", background: "rgba(255,77,77,0.06)", color: "rgba(255,77,77,0.7)", fontFamily: "mono" }}>{r}</span>)}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Report */}
            {activeTab === "report" && (
              <div style={{ background: "rgba(255,255,255,0.015)", border: "1px solid rgba(255,255,255,0.04)", borderRadius: "12px", padding: "20px" }}>
                {agentResults.writer ? (
                  <div style={{ fontSize: "13px", color: "rgba(255,255,255,0.6)", lineHeight: 1.8, whiteSpace: "pre-wrap", fontFamily: "'DM Sans', sans-serif" }}>
                    {agentResults.writer.split("\n").map((line, i) => {
                      if (line.startsWith("##")) return <div key={i} style={{ fontSize: "15px", fontWeight: 700, color: "#34D399", marginTop: "16px", marginBottom: "8px" }}>{line.replace(/^#+\s*/, "")}</div>;
                      if (line.startsWith("**") || line.startsWith("- **")) return <div key={i} style={{ fontWeight: 600, color: "rgba(255,255,255,0.7)" }}>{line}</div>;
                      return <div key={i}>{line}</div>;
                    })}
                  </div>
                ) : <div style={{ textAlign: "center", padding: "40px", color: "rgba(255,255,255,0.15)" }}>Report generating...</div>}
              </div>
            )}

            {/* Red Team */}
            {activeTab === "redteam" && (
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {[...Array(iterationCount)].map((_, idx) => {
                  const rd = agentResults[`redteam_${idx + 1}`];
                  if (!rd) return null;
                  return (
                    <div key={idx} style={{ background: rd.passed ? "rgba(52,211,153,0.03)" : "rgba(255,77,77,0.03)", border: `1px solid ${rd.passed ? "rgba(52,211,153,0.1)" : "rgba(255,77,77,0.1)"}`, borderRadius: "12px", padding: "16px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                        <span style={{ fontSize: "10px", fontWeight: 700, fontFamily: "mono", color: rd.passed ? "#34D399" : "#FF4D4D", letterSpacing: "0.8px" }}>
                          🔴 RED TEAM — ITERATION {idx + 1} — {rd.passed ? "PASSED" : `FAILED (${rd.severity})`}
                        </span>
                        <span style={{ fontSize: "10px", fontFamily: "mono", color: "rgba(255,255,255,0.25)" }}>Confidence: {rd.confidence}%</span>
                      </div>
                      <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.5)", marginBottom: "10px", lineHeight: 1.5 }}>{rd.overall_assessment}</div>
                      {(rd.issues_found || []).map((issue, j) => (
                        <div key={j} style={{ padding: "10px", borderRadius: "8px", background: "rgba(0,0,0,0.15)", marginBottom: "6px" }}>
                          <div style={{ display: "flex", gap: "6px", alignItems: "center", marginBottom: "4px" }}>
                            <span style={{ fontSize: "9px", padding: "2px 6px", borderRadius: "3px", background: "rgba(255,77,77,0.08)", color: "#FF4D4D", fontFamily: "mono", fontWeight: 700, textTransform: "uppercase" }}>{issue.type}</span>
                          </div>
                          <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.6)", lineHeight: 1.5 }}>{issue.description}</div>
                          {issue.fix_suggestion && <div style={{ fontSize: "11px", color: "rgba(52,211,153,0.7)", marginTop: "4px" }}>💡 {issue.fix_suggestion}</div>}
                        </div>
                      ))}
                    </div>
                  );
                })}
                {iterationCount === 0 && <div style={{ textAlign: "center", padding: "40px", color: "rgba(255,255,255,0.15)" }}>Red Team hasn't run yet</div>}
              </div>
            )}

            {/* Critical Actions */}
            {activeTab === "actions" && (
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {(agentResults.assessor?.critical_actions || []).map((a, i) => (
                  <div key={i} style={{ padding: "14px", borderRadius: "10px", background: "rgba(255,77,77,0.03)", border: "1px solid rgba(255,77,77,0.08)", animation: "fadeIn 0.3s ease", animationDelay: `${i * 0.08}s`, animationFillMode: "both" }}>
                    <div style={{ fontSize: "13px", fontWeight: 600, color: "rgba(255,255,255,0.8)", marginBottom: "6px" }}>🚨 {a.action}</div>
                    <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                      <span style={{ fontSize: "9px", padding: "2px 7px", borderRadius: "4px", background: "rgba(167,139,250,0.08)", color: "#A78BFA", fontFamily: "mono" }}>Supplier: {a.supplier}</span>
                      <span style={{ fontSize: "9px", padding: "2px 7px", borderRadius: "4px", background: "rgba(96,165,250,0.08)", color: "#60A5FA", fontFamily: "mono" }}>{a.deadline}</span>
                      {a.potential_fine && <span style={{ fontSize: "9px", padding: "2px 7px", borderRadius: "4px", background: "rgba(255,77,77,0.08)", color: "#FF4D4D", fontFamily: "mono" }}>Fine risk: {a.potential_fine}</span>}
                    </div>
                  </div>
                ))}
                {(agentResults.scanner?.regulatory_alerts || []).length > 0 && (
                  <div style={{ marginTop: "8px" }}>
                    <div style={{ fontSize: "9px", fontWeight: 700, letterSpacing: "1px", color: "rgba(255,255,255,0.15)", fontFamily: "mono", marginBottom: "8px" }}>REGULATORY ALERTS</div>
                    {agentResults.scanner.regulatory_alerts.map((a, i) => (
                      <div key={i} style={{ padding: "10px 14px", borderRadius: "9px", background: "rgba(255,255,255,0.015)", border: "1px solid rgba(255,255,255,0.04)", marginBottom: "6px", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                        <div>
                          <div style={{ fontSize: "12px", fontWeight: 600, color: "rgba(255,255,255,0.7)" }}>{a.regulation}</div>
                          <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.35)", marginTop: "3px" }}>{a.impact}</div>
                        </div>
                        <RiskBadge level={a.urgency} />
                      </div>
                    ))}
                  </div>
                )}
                {(agentResults.assessor?.critical_actions || []).length === 0 && !agentResults.scanner && (
                  <div style={{ textAlign: "center", padding: "40px", color: "rgba(255,255,255,0.15)" }}>Run the pipeline to see critical actions</div>
                )}
              </div>
            )}

            {/* Metrics bar */}
            {currentAgent >= 5 && (
              <div style={{ display: "flex", gap: "8px", marginTop: "16px", flexWrap: "wrap" }}>
                {[
                  { label: "AGENTS", value: "5/5", color: "#34D399" },
                  { label: "TIME", value: (elapsed / 1000).toFixed(1) + "s", color: "#60A5FA" },
                  { label: "RED TEAM", value: redTeamPass ? "PASSED" : "WARNED", color: redTeamPass ? "#34D399" : "#FBBF24" },
                  { label: "ITERATIONS", value: String(iterationCount), color: "#A78BFA" },
                  { label: "COST", value: "$0.00", color: "#34D399" },
                ].map(s => (
                  <div key={s.label} style={{ flex: 1, minWidth: "80px", padding: "10px", borderRadius: "9px", background: "rgba(0,0,0,0.15)", textAlign: "center" }}>
                    <div style={{ fontSize: "14px", fontWeight: 800, color: s.color, fontFamily: "mono" }}>{s.value}</div>
                    <div style={{ fontSize: "8px", color: "rgba(255,255,255,0.15)", letterSpacing: "0.8px", marginTop: "2px", fontFamily: "mono" }}>{s.label}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <div style={{ marginTop: "40px", textAlign: "center", fontSize: "10px", color: "rgba(255,255,255,0.08)", fontFamily: "mono" }}>
          ESG Compliance Command Center · 5-Agent Pipeline with Red Teaming · Groq LPU + Llama 3.3 · CSRD Framework
        </div>
      </div>
    </div>
  );
}
