import { useState, useEffect, useRef, useCallback } from "react";

const SAMPLE_MEETINGS = {
  standup: { label: "Daily Standup", icon: "🔄", text: `Daily Standup — March 14, 2026
Attendees: Sarah Chen (PM), David Kim (Frontend), Lisa Park (Backend), Tom Rivera (Design), Maya Johnson (QA)

Sarah: Good morning everyone. Let's go around. David, you first.

David: Yesterday I finished the authentication flow redesign. Today I'm picking up the dashboard charts — the bar chart component needs to support stacked mode. Should be done by end of day. No blockers.

Sarah: Great. Lisa?

Lisa: I deployed the new API rate limiter to staging yesterday. Found a bug though — it's not correctly counting requests from users with multiple API keys. I'll fix that today, should take about 3-4 hours. I also need someone from frontend to help test the new webhook retry logic. David, can you pair with me on that tomorrow?

David: Sure, let's do it after lunch tomorrow.

Sarah: Perfect. Tom?

Tom: I finished the mobile onboarding mockups. I'll share them in Figma today — everyone please review and leave comments by end of day Friday. I'm starting the settings page redesign next.

Sarah: Maya?

Maya: I found 3 critical bugs in the checkout flow during regression testing. I've filed them as P1s — tickets SHOP-442, SHOP-443, and SHOP-444. These need to be fixed before the March 20th release. Lisa, two of them are backend issues.

Lisa: I'll look at them right after standup.

Sarah: Good catch Maya. So action items: David finishes dashboard charts today, Lisa fixes the rate limiter bug and looks at Maya's P1 tickets, Tom shares mockups for review by Friday, David and Lisa pair on webhook testing tomorrow afternoon. The March 20th release is our hard deadline — let's make sure those P1s are resolved by Monday. I'll set up a quick sync on Monday to check progress. Meeting adjourned.` },

  strategy: { label: "Strategy Meeting", icon: "📊", text: `Q2 Strategy Planning — March 12, 2026
Attendees: James Wright (CEO), Anna Schmidt (VP Product), Roberto Vasquez (VP Engineering), Karen Li (VP Sales), Michael Okonkwo (CFO)

James: Let's align on Q2 priorities. Anna, walk us through the product roadmap.

Anna: We have three major initiatives. First, the enterprise tier launch — we need SSO, audit logs, and advanced permissions. Target: April 30th. Second, the AI assistant feature — this is our biggest differentiator. We've validated with 15 enterprise prospects and 12 said this would be a deciding factor. Target: May 31st. Third, mobile app v2 with offline mode. Target: end of June.

Roberto: I need to push back on the April 30th date for enterprise. My team needs at least 6 weeks for SSO alone if we want it production-ready. I'd recommend May 15th. We can ship audit logs and permissions by April 30th though.

James: Karen, does that timeline work for sales?

Karen: We have 3 enterprise deals worth $480K total ARR waiting on SSO. Two of them have June 1st decision deadlines. May 15th is tight but workable if there's no slip.

Michael: Budget-wise, we need to decide on the AI infrastructure spend. Running the models in-house costs about $45K/month. Using a managed API would be $12K/month but we lose some customization. I need a decision this week so I can finalize Q2 budget.

James: Let's go with the managed API to start — we can always migrate later. Roberto, does your team agree?

Roberto: Yes, it de-risks the timeline significantly. I'll have my team switch to the Groq API integration by end of this week.

Anna: One more thing — we should hire 2 more engineers for the AI team. Current team of 3 can't handle both the assistant feature and enterprise work.

James: Agreed. Michael, add those headcount to the budget. Karen, I want weekly pipeline updates on those enterprise deals. Anna, send me the revised roadmap by Friday. Roberto, get the API migration started this week and give me a confidence check on May 15th for SSO by next Wednesday. Let's reconvene in two weeks.` },

  retro: { label: "Sprint Retro", icon: "🔁", text: `Sprint 24 Retrospective — March 13, 2026
Facilitator: Priya Sharma (Scrum Master)
Attendees: Full engineering team (8 people)

Priya: Let's start with what went well.

Alex: The new CI/CD pipeline saved us about 4 hours of manual deployment work this sprint. Great investment.

Nina: Pair programming on the payment integration really helped. We caught bugs early and both learned a lot.

Chris: Customer feedback on the new dashboard was overwhelmingly positive — 4.6/5 satisfaction score.

Priya: Great. Now what didn't go well?

Jordan: We underestimated the database migration by about 3 days. It cascaded and pushed back two other features. We need better estimation for infrastructure tasks.

Sam: Code review turnaround was slow this sprint — some PRs sat for 2+ days. It blocked my work twice.

Alex: Agreed on the PR reviews. We should set a 24-hour SLA for first review.

Emily: The requirements for the reporting feature changed mid-sprint. We lost about 2 days of work. We need product to lock scope before sprint start.

Priya: Valid points. Let's talk action items.

Jordan: I'll create an estimation template specifically for infrastructure tasks that includes a "complexity buffer" — I'll share it by Monday.

Alex: I'll propose a PR review rotation schedule so every PR has an assigned reviewer within 4 hours. I'll send it out tomorrow.

Priya: I'll schedule a meeting with Anna from product about the scope change issue. We need a clearer definition of done before sprint planning. Emily, can you document the impact of the mid-sprint changes so I have data for that conversation?

Emily: Sure, I'll write that up by end of day Thursday.

Nina: Can we also make pair programming a regular thing? Maybe twice a sprint for complex features?

Priya: Love it. I'll add it to our sprint planning template. Let's also celebrate the CI/CD win — Chris, can you do a quick 15-minute demo for the wider team next week?

Chris: Absolutely. I'll schedule it for Wednesday lunch.

Priya: Perfect. To summarize decisions: 24-hour PR review SLA, pair programming twice per sprint, and scope lock before sprint start. Action items assigned. Great retro everyone.` },

  client: { label: "Client Call", icon: "🤝", text: `Client Kickoff — Meridian Healthcare
Date: March 11, 2026
Attendees: 
  Our side: Rachel Torres (Account Lead), Ben Cooper (Solutions Architect), Diana Moss (Project Manager)
  Client: Dr. Ahmed Hassan (CTO), Jennifer Walsh (VP Operations), Steven Park (IT Director)

Rachel: Thanks for joining everyone. Let's align on the project scope and timeline.

Dr. Hassan: Our main pain point is patient data is spread across 4 different systems. Nurses spend 20 minutes per patient just gathering information. We need a unified dashboard.

Ben: Based on our discovery session, I'm proposing a 3-phase approach. Phase 1: Data integration layer connecting your EHR, scheduling system, lab results, and billing. Timeline: 6 weeks. Phase 2: Unified dashboard with role-based views for nurses, doctors, and admin. Timeline: 4 weeks. Phase 3: AI-powered alerts for anomalies in patient data. Timeline: 4 weeks.

Jennifer: Phase 1 is critical. Can we start immediately?

Diana: We can start next Monday, March 17th. I'll need access to your systems documentation and API specs by this Friday.

Steven: I'll send those over by Thursday. One concern — our EHR vendor requires a signed data processing agreement before any API access. That usually takes a week.

Rachel: We can work on the architecture and other integrations in parallel while that's being processed. Ben, can you draft the DPA requirements?

Ben: I'll have a draft ready by Wednesday. Steven, I'll need your legal team's contact to expedite.

Steven: I'll introduce you via email today.

Dr. Hassan: Budget question — the original estimate was $280K. Phase 3 with AI wasn't in the original scope. What's the additional cost?

Rachel: Phase 3 would be an additional $65K. But I'd recommend we revisit after Phase 2 — by then we'll have the data flowing and can make a more informed decision about the AI component.

Dr. Hassan: That's reasonable. Let's commit to Phases 1 and 2 now, with Phase 3 as an option.

Diana: I'll send the updated SOW and project plan by Friday. Weekly status calls every Tuesday at 2 PM — does that work for everyone?

Jennifer: Works for us.

Rachel: Perfect. To confirm next steps: Steven sends API docs by Thursday, Ben drafts DPA by Wednesday, Steven connects Ben with legal today, Diana sends SOW by Friday, and we kick off development on March 17th. Any questions? Great, talk to you all Tuesday.` },
};

const PRIORITY_COLORS = { high: "#FF4D4D", medium: "#FBBF24", low: "#34D399" };

const ActionItem = ({ item, index }) => (
  <div style={{
    padding: "14px 16px", borderRadius: "10px", background: "rgba(255,255,255,0.015)",
    border: "1px solid rgba(255,255,255,0.04)", display: "flex", gap: "12px",
    alignItems: "flex-start", animation: "fadeIn 0.3s ease",
    animationDelay: `${index * 0.08}s`, animationFillMode: "both",
  }}>
    <div style={{
      width: "22px", height: "22px", borderRadius: "6px", flexShrink: 0,
      border: "2px solid rgba(255,255,255,0.12)", display: "flex",
      alignItems: "center", justifyContent: "center", marginTop: "1px",
    }}>
      <span style={{ fontSize: "10px", color: "rgba(255,255,255,0.25)", fontFamily: "mono", fontWeight: 700 }}>
        {String(index + 1).padStart(2, "0")}
      </span>
    </div>
    <div style={{ flex: 1, minWidth: 0 }}>
      <div style={{ fontSize: "13px", fontWeight: 600, color: "rgba(255,255,255,0.8)", lineHeight: 1.5, marginBottom: "8px" }}>{item.task}</div>
      <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
        {item.owner && (
          <span style={{ fontSize: "10px", padding: "3px 8px", borderRadius: "5px", background: "rgba(167,139,250,0.08)", color: "#A78BFA", fontWeight: 600, fontFamily: "mono" }}>
            👤 {item.owner}
          </span>
        )}
        {item.deadline && (
          <span style={{ fontSize: "10px", padding: "3px 8px", borderRadius: "5px", background: "rgba(96,165,250,0.08)", color: "#60A5FA", fontWeight: 600, fontFamily: "mono" }}>
            📅 {item.deadline}
          </span>
        )}
        {item.priority && (
          <span style={{ fontSize: "10px", padding: "3px 8px", borderRadius: "5px", background: (PRIORITY_COLORS[item.priority] || "#999") + "12", color: PRIORITY_COLORS[item.priority] || "#999", fontWeight: 700, fontFamily: "mono", textTransform: "uppercase" }}>
            {item.priority}
          </span>
        )}
        {item.category && (
          <span style={{ fontSize: "10px", padding: "3px 8px", borderRadius: "5px", background: "rgba(255,255,255,0.03)", color: "rgba(255,255,255,0.3)", fontFamily: "mono" }}>
            {item.category}
          </span>
        )}
      </div>
    </div>
  </div>
);

const DecisionCard = ({ decision, index }) => (
  <div style={{
    padding: "12px 14px", borderRadius: "9px", background: "rgba(52,211,153,0.03)",
    border: "1px solid rgba(52,211,153,0.08)", animation: "fadeIn 0.3s ease",
    animationDelay: `${index * 0.1}s`, animationFillMode: "both",
  }}>
    <div style={{ display: "flex", gap: "8px", alignItems: "flex-start" }}>
      <span style={{ color: "#34D399", fontSize: "12px", marginTop: "2px", flexShrink: 0 }}>✓</span>
      <div>
        <div style={{ fontSize: "12.5px", color: "rgba(255,255,255,0.7)", lineHeight: 1.5 }}>{decision.decision}</div>
        {decision.rationale && (
          <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.3)", marginTop: "4px", lineHeight: 1.5 }}>
            Rationale: {decision.rationale}
          </div>
        )}
      </div>
    </div>
  </div>
);

export default function MeetingPipeline() {
  const [apiKey, setApiKey] = useState("");
  const [keySaved, setKeySaved] = useState(false);
  const [keyVisible, setKeyVisible] = useState(false);
  const [input, setInput] = useState("");
  const [processing, setProcessing] = useState(false);
  const [stage, setStage] = useState(null);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);
  const [logs, setLogs] = useState([]);
  const [history, setHistory] = useState([]);
  const [activeView, setActiveView] = useState("process");
  const [activeTab, setActiveTab] = useState("actions");
  const [elapsed, setElapsed] = useState(0);
  const timerRef = useRef(null);

  const addLog = useCallback((level, msg) => {
    const t = new Date();
    const time = t.toLocaleTimeString("en-US", { hour12: false }) + "." + String(t.getMilliseconds()).padStart(3, "0").slice(0, 2);
    setLogs(prev => [...prev.slice(-60), { time, level, msg }]);
  }, []);

  const callGroq = async (system, user) => {
    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({ model: "llama-3.3-70b-versatile", max_tokens: 2000, temperature: 0.15, messages: [{ role: "system", content: system }, { role: "user", content: user }] }),
    });
    const data = await res.json();
    if (data.error) throw new Error(data.error.message || JSON.stringify(data.error));
    return data.choices?.[0]?.message?.content || "";
  };

  const processMeeting = useCallback(async (text) => {
    if (!apiKey.trim()) { setError("Connect your Groq API key first"); return; }
    setProcessing(true); setError(null); setResults(null); setLogs([]);
    setElapsed(0); setActiveTab("actions");
    const start = Date.now();
    timerRef.current = setInterval(() => setElapsed(Date.now() - start), 50);

    try {
      // Stage 1: Extract action items
      setStage("actions");
      addLog("info", "Stage 1/3 → Extracting action items with owners and deadlines...");
      const actionsRaw = await callGroq(
        `You extract action items from meeting transcripts. Return ONLY valid JSON array. Each object:
{"task":"specific actionable task","owner":"person name or null","deadline":"deadline text or null","priority":"high|medium|low","category":"development|design|operations|communication|hiring|budget|other"}
Be specific about the task. Include ALL action items mentioned, even implicit ones. Return 5-15 items. Start with [ end with ].`,
        text
      );
      let actions;
      try { actions = JSON.parse(actionsRaw.replace(/```json|```/g, "").trim()); }
      catch { throw new Error("Failed to parse action items"); }
      addLog("success", `Extracted ${actions.length} action items`);

      // Stage 2: Extract decisions and summary
      setStage("summary");
      addLog("info", "Stage 2/3 → Generating executive summary and extracting decisions...");
      const summaryRaw = await callGroq(
        `You summarize meetings for executives. Return ONLY valid JSON:
{
  "title": "meeting title",
  "date": "date if mentioned",
  "type": "standup|planning|retro|kickoff|review|strategy|other",
  "attendees": ["name (role)"],
  "executive_summary": "2-3 sentence summary of the meeting focused on outcomes and decisions",
  "key_decisions": [{"decision":"what was decided","rationale":"why, or null"}],
  "risks_flagged": ["risk or concern mentioned"],
  "follow_up_meeting": "next meeting info or null",
  "sentiment": "productive|tense|positive|neutral|mixed"
}`,
        text
      );
      let summary;
      try { summary = JSON.parse(summaryRaw.replace(/```json|```/g, "").trim()); }
      catch { throw new Error("Failed to parse summary"); }
      addLog("success", `Summary generated — ${summary.key_decisions?.length || 0} decisions, ${summary.risks_flagged?.length || 0} risks`);

      // Stage 3: Generate PM-ready export
      setStage("export");
      addLog("info", "Stage 3/3 → Generating PM-ready structured output...");
      const exportRaw = await callGroq(
        `You convert meeting data into project management ready output. Given the action items and summary, return ONLY valid JSON:
{
  "project_tasks": [
    {"title":"task title","description":"1 sentence detail","assignee":"name","due":"date or timeframe","priority":"P1|P2|P3","labels":["label1"],"status":"todo"}
  ],
  "blockers": [{"description":"blocker","owner":"who needs to resolve","severity":"high|medium|low"}],
  "dependencies": [{"task":"task that depends","depends_on":"what it depends on","owner":"who"}],
  "metrics_mentioned": [{"metric":"metric name","value":"value","context":"context"}]
}`,
        `Action items:\n${JSON.stringify(actions)}\n\nMeeting summary:\n${JSON.stringify(summary)}\n\nOriginal transcript:\n${text}`
      );
      let exportData;
      try { exportData = JSON.parse(exportRaw.replace(/```json|```/g, "").trim()); }
      catch { exportData = { project_tasks: [], blockers: [], dependencies: [], metrics_mentioned: [] }; addLog("warn", "Export parse incomplete"); }
      addLog("success", `PM export ready — ${exportData.project_tasks?.length || 0} tasks, ${exportData.blockers?.length || 0} blockers`);

      clearInterval(timerRef.current);
      setElapsed(Date.now() - start);
      setStage("done");

      const result = { actions, summary, exportData, processedAt: Date.now(), elapsed: Date.now() - start };
      setResults(result);

      setHistory(prev => [{
        id: Date.now(),
        title: summary.title || "Meeting",
        type: summary.type,
        actionCount: actions.length,
        decisionCount: summary.key_decisions?.length || 0,
        time: ((Date.now() - start) / 1000).toFixed(1) + "s",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        result,
      }, ...prev].slice(0, 15));

      addLog("success", `✓ Meeting processed in ${((Date.now() - start) / 1000).toFixed(2)}s`);
    } catch (err) {
      clearInterval(timerRef.current);
      setStage(null); setError(err.message);
      addLog("error", `Failed: ${err.message}`);
    } finally { setProcessing(false); }
  }, [apiKey, addLog]);

  const handleExportJSON = () => {
    if (!results) return;
    const blob = new Blob([JSON.stringify(results, null, 2)], { type: "application/json" });
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = `meeting-${results.summary?.title?.replace(/\s+/g, "-") || Date.now()}.json`; a.click();
  };

  const handleExportMarkdown = () => {
    if (!results) return;
    const s = results.summary;
    const lines = [`# ${s?.title || "Meeting Notes"}`, `**Date:** ${s?.date || "N/A"}  `, `**Type:** ${s?.type || "N/A"}  `, `**Attendees:** ${(s?.attendees || []).join(", ")}`, "", `## Summary`, s?.executive_summary || "", "", `## Decisions`];
    (s?.key_decisions || []).forEach(d => lines.push(`- ✓ ${d.decision}${d.rationale ? ` _(${d.rationale})_` : ""}`));
    lines.push("", "## Action Items", "| # | Task | Owner | Deadline | Priority |", "|---|------|-------|----------|----------|");
    (results.actions || []).forEach((a, i) => lines.push(`| ${i + 1} | ${a.task} | ${a.owner || "—"} | ${a.deadline || "—"} | ${a.priority || "—"} |`));
    if (s?.risks_flagged?.length) { lines.push("", "## Risks"); s.risks_flagged.forEach(r => lines.push(`- ⚠ ${r}`)); }
    const blob = new Blob([lines.join("\n")], { type: "text/markdown" });
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = `meeting-notes-${Date.now()}.md`; a.click();
  };

  const s = results?.summary;
  const typeColors = { standup: "#60A5FA", planning: "#A78BFA", retro: "#FBBF24", kickoff: "#34D399", strategy: "#FF6B6B", review: "#F59E0B", other: "#9CA3AF" };

  return (
    <div style={{ minHeight: "100vh", background: "#0B0C10", color: "#fff", fontFamily: "'DM Sans', 'Segoe UI', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&family=IBM+Plex+Mono:wght@400;500;600;700&display=swap');
        @keyframes fadeIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}
        @keyframes slideIn{from{opacity:0;transform:translateX(10px)}to{opacity:1;transform:translateX(0)}}
        *{box-sizing:border-box;scrollbar-width:thin;scrollbar-color:rgba(255,255,255,.08) transparent}
        *::-webkit-scrollbar{width:4px}*::-webkit-scrollbar-thumb{background:rgba(255,255,255,.08);border-radius:2px}
        textarea:focus,input:focus{outline:none}
        ::selection{background:rgba(251,191,36,.2)}
      `}</style>

      <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "28px 20px 60px" }}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "14px", marginBottom: "24px" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
              <div style={{ width: "30px", height: "30px", borderRadius: "8px", background: "linear-gradient(135deg, #FBBF24, #F59E0B)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px" }}>📋</div>
              <h1 style={{ fontSize: "20px", fontWeight: 800, margin: 0, letterSpacing: "-0.3px" }}>Meeting → Actions AI</h1>
              <span style={{ fontSize: "9px", padding: "3px 8px", borderRadius: "4px", background: "rgba(251,191,36,0.08)", color: "#FBBF24", fontWeight: 700, fontFamily: "mono", letterSpacing: "0.8px" }}>v1.0</span>
            </div>
            <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.3)", margin: 0 }}>Paste a meeting transcript → get structured action items, decisions, and PM-ready exports</p>
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
                <button onClick={() => apiKey.trim() && setKeySaved(true)} style={{ padding: "6px 12px", borderRadius: "7px", border: "none", background: apiKey.trim() ? "#FBBF24" : "rgba(255,255,255,.04)", color: apiKey.trim() ? "#000" : "rgba(255,255,255,.15)", fontWeight: 700, fontSize: "11px", cursor: "pointer", fontFamily: "mono" }}>CONNECT</button>
              </div>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: "3px", marginBottom: "20px", background: "rgba(255,255,255,0.02)", borderRadius: "9px", padding: "3px", border: "1px solid rgba(255,255,255,0.03)" }}>
          {[{ id: "process", label: "Process", icon: "▶" }, { id: "history", label: `History (${history.length})`, icon: "📋" }].map(tab => (
            <button key={tab.id} onClick={() => setActiveView(tab.id)} style={{
              flex: 1, padding: "8px", borderRadius: "6px", border: "none",
              background: activeView === tab.id ? "rgba(251,191,36,0.06)" : "transparent",
              color: activeView === tab.id ? "#FBBF24" : "rgba(255,255,255,0.25)",
              fontSize: "11px", fontWeight: 600, cursor: "pointer", transition: "all 0.2s",
            }}>{tab.icon} {tab.label}</button>
          ))}
        </div>

        {activeView === "process" && (
          <div style={{ display: "grid", gridTemplateColumns: results ? "1fr 1fr" : "1fr", gap: "18px" }}>
            {/* Left: Input */}
            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <div style={{ background: "rgba(255,255,255,0.015)", border: "1px solid rgba(255,255,255,0.04)", borderRadius: "12px", padding: "16px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px", flexWrap: "wrap", gap: "6px" }}>
                  <span style={{ fontSize: "10px", fontWeight: 700, letterSpacing: "1.2px", color: "rgba(255,255,255,0.2)", fontFamily: "mono" }}>MEETING TRANSCRIPT</span>
                  <div style={{ display: "flex", gap: "4px", flexWrap: "wrap" }}>
                    {Object.entries(SAMPLE_MEETINGS).map(([key, s]) => (
                      <button key={key} onClick={() => setInput(s.text)} style={{
                        padding: "3px 8px", borderRadius: "5px", border: "1px solid rgba(255,255,255,.05)",
                        background: input === s.text ? "rgba(251,191,36,0.06)" : "rgba(255,255,255,.015)",
                        color: input === s.text ? "#FBBF24" : "rgba(255,255,255,.3)",
                        fontSize: "9.5px", fontWeight: 600, cursor: "pointer", transition: "all 0.15s",
                      }}>{s.icon} {s.label}</button>
                    ))}
                  </div>
                </div>
                <textarea value={input} onChange={e => setInput(e.target.value)} placeholder="Paste your meeting notes or transcript here..." style={{
                  width: "100%", minHeight: "280px", padding: "14px", borderRadius: "9px",
                  background: "rgba(0,0,0,.2)", border: "1px solid rgba(255,255,255,.03)",
                  color: "rgba(255,255,255,.75)", fontSize: "12px", lineHeight: 1.7, resize: "vertical",
                  fontFamily: "'IBM Plex Mono', monospace",
                }} />
                <button onClick={() => input.trim() && processMeeting(input.trim())} disabled={processing || !input.trim() || !keySaved} style={{
                  marginTop: "10px", width: "100%", padding: "12px", borderRadius: "9px", border: "none",
                  fontWeight: 700, fontSize: "12px", fontFamily: "mono",
                  cursor: (processing || !input.trim() || !keySaved) ? "not-allowed" : "pointer",
                  background: processing ? "rgba(251,191,36,0.08)" : (!input.trim() || !keySaved) ? "rgba(255,255,255,.03)" : "linear-gradient(135deg, #FBBF24, #F59E0B)",
                  color: (!input.trim() || !keySaved) ? "rgba(255,255,255,.12)" : processing ? "#FBBF24" : "#000",
                  transition: "all 0.3s",
                }}>
                  {!keySaved ? "🔑 CONNECT KEY" : processing ? `⟳ ${stage === "actions" ? "EXTRACTING ACTIONS" : stage === "summary" ? "GENERATING SUMMARY" : stage === "export" ? "BUILDING EXPORT" : "PROCESSING"}... ${(elapsed / 1000).toFixed(1)}s` : "▶ PROCESS MEETING"}
                </button>
              </div>

              {/* Pipeline status */}
              {(processing || results) && (
                <div style={{ display: "flex", gap: "4px" }}>
                  {["actions", "summary", "export"].map((s, i) => {
                    const isDone = results || (stage === "summary" && i === 0) || (stage === "export" && i <= 1) || (stage === "done");
                    const isActive = processing && stage === s;
                    return (
                      <div key={s} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: "6px" }}>
                        <div style={{
                          width: "100%", height: "3px", borderRadius: "2px",
                          background: isDone ? "#FBBF24" : isActive ? "#FBBF2466" : "rgba(255,255,255,0.04)",
                          transition: "background 0.3s",
                        }} />
                        <span style={{ fontSize: "9px", fontFamily: "mono", color: isDone ? "#FBBF24" : "rgba(255,255,255,0.2)", fontWeight: 600 }}>
                          {["ACTIONS", "SUMMARY", "EXPORT"][i]}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Console */}
              {logs.length > 0 && (
                <div style={{ background: "#090A0D", border: "1px solid rgba(255,255,255,0.03)", borderRadius: "10px", overflow: "hidden" }}>
                  <div style={{ padding: "7px 12px", display: "flex", alignItems: "center", gap: "6px", borderBottom: "1px solid rgba(255,255,255,0.03)" }}>
                    <div style={{ display: "flex", gap: "4px" }}><div style={{ width: 6, height: 6, borderRadius: "50%", background: "#FF5F57" }} /><div style={{ width: 6, height: 6, borderRadius: "50%", background: "#FFBD2E" }} /><div style={{ width: 6, height: 6, borderRadius: "50%", background: "#28CA41" }} /></div>
                    <span style={{ fontSize: "9px", fontFamily: "mono", color: "rgba(255,255,255,0.2)" }}>meeting-pipeline</span>
                  </div>
                  <div style={{ maxHeight: "100px", overflowY: "auto", padding: "8px 12px", fontSize: "10px", fontFamily: "mono", lineHeight: 1.8 }}>
                    {logs.map((l, i) => (
                      <div key={i}>
                        <span style={{ color: "rgba(255,255,255,0.1)" }}>{l.time} </span>
                        <span style={{ color: l.level === "error" ? "#F87171" : l.level === "success" ? "#34D399" : l.level === "warn" ? "#FBBF24" : "#60A5FA", fontWeight: 600 }}>{l.level.slice(0, 4).toUpperCase()} </span>
                        <span style={{ color: "rgba(255,255,255,0.4)" }}>{l.msg}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {error && <div style={{ padding: "10px 14px", borderRadius: "9px", background: "rgba(248,113,113,.06)", border: "1px solid rgba(248,113,113,.12)", fontSize: "11px", color: "#F87171", fontFamily: "mono" }}>⚠ {error}</div>}
            </div>

            {/* Right: Results */}
            {results && (
              <div style={{ display: "flex", flexDirection: "column", gap: "12px", animation: "slideIn 0.4s ease" }}>
                {/* Meeting header */}
                <div style={{ background: "rgba(255,255,255,0.015)", border: "1px solid rgba(255,255,255,0.04)", borderRadius: "12px", padding: "16px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "10px" }}>
                    <div>
                      <div style={{ display: "flex", gap: "6px", alignItems: "center", marginBottom: "6px" }}>
                        <span style={{ fontSize: "9px", padding: "3px 8px", borderRadius: "4px", background: (typeColors[s?.type] || "#999") + "12", color: typeColors[s?.type] || "#999", fontWeight: 700, fontFamily: "mono", textTransform: "uppercase" }}>{s?.type || "meeting"}</span>
                        <span style={{ fontSize: "9px", padding: "3px 8px", borderRadius: "4px", background: "rgba(255,255,255,0.03)", color: "rgba(255,255,255,0.3)", fontFamily: "mono" }}>{s?.sentiment || "neutral"}</span>
                      </div>
                      <h3 style={{ fontSize: "16px", fontWeight: 700, margin: 0, color: "rgba(255,255,255,0.85)" }}>{s?.title || "Meeting"}</h3>
                    </div>
                    <div style={{ display: "flex", gap: "4px" }}>
                      <button onClick={handleExportMarkdown} style={{ padding: "5px 8px", borderRadius: "5px", border: "1px solid rgba(251,191,36,0.15)", background: "rgba(251,191,36,0.04)", color: "#FBBF24", fontSize: "9px", fontWeight: 700, cursor: "pointer", fontFamily: "mono" }}>📝 MD</button>
                      <button onClick={handleExportJSON} style={{ padding: "5px 8px", borderRadius: "5px", border: "1px solid rgba(96,165,250,0.15)", background: "rgba(96,165,250,0.04)", color: "#60A5FA", fontSize: "9px", fontWeight: 700, cursor: "pointer", fontFamily: "mono" }}>{ } JSON</button>
                    </div>
                  </div>
                  <p style={{ fontSize: "12.5px", color: "rgba(255,255,255,0.5)", lineHeight: 1.6, margin: "0 0 10px" }}>{s?.executive_summary}</p>
                  {s?.attendees?.length > 0 && (
                    <div style={{ display: "flex", gap: "4px", flexWrap: "wrap" }}>
                      {s.attendees.map((a, i) => (
                        <span key={i} style={{ fontSize: "10px", padding: "2px 7px", borderRadius: "4px", background: "rgba(255,255,255,0.03)", color: "rgba(255,255,255,0.35)", fontFamily: "mono" }}>{a}</span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Stats */}
                <div style={{ display: "flex", gap: "8px" }}>
                  {[
                    { value: results.actions?.length || 0, label: "ACTIONS", color: "#FBBF24" },
                    { value: s?.key_decisions?.length || 0, label: "DECISIONS", color: "#34D399" },
                    { value: results.exportData?.blockers?.length || 0, label: "BLOCKERS", color: "#F87171" },
                    { value: ((results.elapsed) / 1000).toFixed(1) + "s", label: "TIME", color: "#60A5FA" },
                  ].map(stat => (
                    <div key={stat.label} style={{ flex: 1, padding: "10px", borderRadius: "9px", background: "rgba(0,0,0,0.15)", textAlign: "center" }}>
                      <div style={{ fontSize: "18px", fontWeight: 800, color: stat.color, fontFamily: "mono" }}>{stat.value}</div>
                      <div style={{ fontSize: "8px", color: "rgba(255,255,255,0.2)", letterSpacing: "0.8px", marginTop: "2px", fontFamily: "mono" }}>{stat.label}</div>
                    </div>
                  ))}
                </div>

                {/* Result tabs */}
                <div style={{ display: "flex", gap: "2px", background: "rgba(255,255,255,0.02)", borderRadius: "8px", padding: "2px" }}>
                  {[{ id: "actions", label: `Actions (${results.actions?.length || 0})` }, { id: "decisions", label: "Decisions" }, { id: "risks", label: "Risks & Blockers" }, { id: "tasks", label: "PM Export" }].map(tab => (
                    <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
                      flex: 1, padding: "7px 4px", borderRadius: "6px", border: "none",
                      background: activeTab === tab.id ? "rgba(251,191,36,0.06)" : "transparent",
                      color: activeTab === tab.id ? "#FBBF24" : "rgba(255,255,255,0.2)",
                      fontSize: "10px", fontWeight: 600, cursor: "pointer",
                    }}>{tab.label}</button>
                  ))}
                </div>

                {/* Tab content */}
                <div style={{ maxHeight: "420px", overflowY: "auto" }}>
                  {activeTab === "actions" && (
                    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                      {(results.actions || []).map((item, i) => <ActionItem key={i} item={item} index={i} />)}
                    </div>
                  )}
                  {activeTab === "decisions" && (
                    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                      {(s?.key_decisions || []).length === 0 ? (
                        <div style={{ textAlign: "center", padding: "30px", color: "rgba(255,255,255,0.15)", fontSize: "12px" }}>No explicit decisions recorded</div>
                      ) : (s?.key_decisions || []).map((d, i) => <DecisionCard key={i} decision={d} index={i} />)}
                    </div>
                  )}
                  {activeTab === "risks" && (
                    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                      {(s?.risks_flagged || []).map((r, i) => (
                        <div key={i} style={{ padding: "10px 14px", borderRadius: "9px", background: "rgba(248,113,113,0.03)", border: "1px solid rgba(248,113,113,0.08)", fontSize: "12px", color: "rgba(255,255,255,0.6)", display: "flex", gap: "8px", animation: "fadeIn 0.3s ease", animationDelay: `${i * 0.1}s`, animationFillMode: "both" }}>
                          <span style={{ color: "#F87171" }}>⚠</span> {r}
                        </div>
                      ))}
                      {(results.exportData?.blockers || []).map((b, i) => (
                        <div key={`b${i}`} style={{ padding: "10px 14px", borderRadius: "9px", background: "rgba(255,77,77,0.03)", border: "1px solid rgba(255,77,77,0.08)", animation: "fadeIn 0.3s ease" }}>
                          <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.6)", marginBottom: "4px" }}>🚧 {b.description}</div>
                          <div style={{ display: "flex", gap: "6px" }}>
                            {b.owner && <span style={{ fontSize: "9px", padding: "2px 6px", borderRadius: "3px", background: "rgba(167,139,250,0.08)", color: "#A78BFA", fontFamily: "mono" }}>👤 {b.owner}</span>}
                            <span style={{ fontSize: "9px", padding: "2px 6px", borderRadius: "3px", background: (PRIORITY_COLORS[b.severity] || "#999") + "10", color: PRIORITY_COLORS[b.severity] || "#999", fontFamily: "mono", fontWeight: 700 }}>{b.severity}</span>
                          </div>
                        </div>
                      ))}
                      {(s?.risks_flagged || []).length === 0 && (results.exportData?.blockers || []).length === 0 && (
                        <div style={{ textAlign: "center", padding: "30px", color: "rgba(255,255,255,0.15)", fontSize: "12px" }}>No risks or blockers identified</div>
                      )}
                    </div>
                  )}
                  {activeTab === "tasks" && (
                    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                      {(results.exportData?.project_tasks || []).map((t, i) => (
                        <div key={i} style={{ padding: "12px 14px", borderRadius: "9px", background: "rgba(255,255,255,0.015)", border: "1px solid rgba(255,255,255,0.04)", animation: "fadeIn 0.3s ease", animationDelay: `${i * 0.06}s`, animationFillMode: "both" }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "8px" }}>
                            <div style={{ flex: 1 }}>
                              <div style={{ fontSize: "12.5px", fontWeight: 600, color: "rgba(255,255,255,0.75)" }}>{t.title}</div>
                              {t.description && <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.3)", marginTop: "3px", lineHeight: 1.4 }}>{t.description}</div>}
                            </div>
                            <span style={{ fontSize: "9px", padding: "2px 6px", borderRadius: "3px", background: t.priority === "P1" ? "rgba(255,77,77,0.08)" : t.priority === "P2" ? "rgba(251,191,36,0.08)" : "rgba(52,211,153,0.08)", color: t.priority === "P1" ? "#FF4D4D" : t.priority === "P2" ? "#FBBF24" : "#34D399", fontWeight: 700, fontFamily: "mono" }}>{t.priority}</span>
                          </div>
                          <div style={{ display: "flex", gap: "5px", marginTop: "8px", flexWrap: "wrap" }}>
                            {t.assignee && <span style={{ fontSize: "9px", padding: "2px 6px", borderRadius: "3px", background: "rgba(167,139,250,0.08)", color: "#A78BFA", fontFamily: "mono" }}>👤 {t.assignee}</span>}
                            {t.due && <span style={{ fontSize: "9px", padding: "2px 6px", borderRadius: "3px", background: "rgba(96,165,250,0.08)", color: "#60A5FA", fontFamily: "mono" }}>📅 {t.due}</span>}
                            {(t.labels || []).map((l, j) => <span key={j} style={{ fontSize: "9px", padding: "2px 6px", borderRadius: "3px", background: "rgba(255,255,255,0.03)", color: "rgba(255,255,255,0.25)", fontFamily: "mono" }}>{l}</span>)}
                          </div>
                        </div>
                      ))}
                      {(results.exportData?.dependencies || []).length > 0 && (
                        <>
                          <div style={{ fontSize: "9px", fontWeight: 700, letterSpacing: "1px", color: "rgba(255,255,255,0.15)", fontFamily: "mono", marginTop: "8px" }}>DEPENDENCIES</div>
                          {results.exportData.dependencies.map((d, i) => (
                            <div key={i} style={{ padding: "8px 12px", borderRadius: "8px", background: "rgba(255,255,255,0.01)", border: "1px dashed rgba(255,255,255,0.06)", fontSize: "11px", color: "rgba(255,255,255,0.4)" }}>
                              <strong style={{ color: "rgba(255,255,255,0.6)" }}>{d.task}</strong> → depends on: {d.depends_on}
                            </div>
                          ))}
                        </>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* History */}
        {activeView === "history" && (
          <div>
            {history.length === 0 ? (
              <div style={{ textAlign: "center", padding: "60px", color: "rgba(255,255,255,0.12)" }}>
                <div style={{ fontSize: "28px", marginBottom: "10px" }}>📋</div>
                <div style={{ fontSize: "13px", fontWeight: 600 }}>No meetings processed yet</div>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {history.map(h => (
                  <div key={h.id} onClick={() => { setResults(h.result); setStage("done"); setActiveView("process"); }} style={{
                    padding: "12px 16px", borderRadius: "10px", cursor: "pointer",
                    background: "rgba(255,255,255,0.015)", border: "1px solid rgba(255,255,255,0.04)",
                    display: "flex", justifyContent: "space-between", alignItems: "center",
                  }}>
                    <div>
                      <div style={{ fontSize: "12.5px", fontWeight: 600, color: "rgba(255,255,255,0.75)" }}>{h.title}</div>
                      <div style={{ display: "flex", gap: "6px", marginTop: "5px" }}>
                        <span style={{ fontSize: "9px", padding: "2px 6px", borderRadius: "3px", background: (typeColors[h.type] || "#999") + "10", color: typeColors[h.type] || "#999", fontFamily: "mono" }}>{h.type}</span>
                        <span style={{ fontSize: "9px", padding: "2px 6px", borderRadius: "3px", background: "rgba(251,191,36,0.08)", color: "#FBBF24", fontFamily: "mono" }}>{h.actionCount} actions</span>
                        <span style={{ fontSize: "9px", padding: "2px 6px", borderRadius: "3px", background: "rgba(52,211,153,0.08)", color: "#34D399", fontFamily: "mono" }}>{h.decisionCount} decisions</span>
                        <span style={{ fontSize: "9px", padding: "2px 6px", borderRadius: "3px", background: "rgba(255,255,255,0.03)", color: "rgba(255,255,255,0.2)", fontFamily: "mono" }}>{h.time}</span>
                      </div>
                    </div>
                    <span style={{ fontSize: "10px", fontFamily: "mono", color: "rgba(255,255,255,0.15)" }}>{h.timestamp}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <div style={{ marginTop: "40px", textAlign: "center", fontSize: "10px", color: "rgba(255,255,255,0.08)", fontFamily: "'IBM Plex Mono', monospace" }}>
          Meeting → Actions AI · Groq LPU + Llama 3.3 · Structured action extraction pipeline
        </div>
      </div>
    </div>
  );
}
