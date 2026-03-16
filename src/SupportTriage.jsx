import { useState, useEffect, useRef, useCallback, useMemo } from "react";

// ─── DEFAULTS ──────────────────────────────────────────────────
const DEFAULT_KB = [
  { id: 1, category: "billing", q: "How do I update my payment method?", a: "Navigate to Settings → Billing → Payment Methods. Click 'Update' next to your current card and enter new details. Changes apply to your next billing cycle." },
  { id: 2, category: "billing", q: "I was charged twice / duplicate charge", a: "We apologize for the inconvenience. Duplicate charges are typically resolved within 3-5 business days. If the charge persists, our billing team will issue a manual refund. Please provide your transaction ID." },
  { id: 3, category: "billing", q: "How do I cancel my subscription?", a: "Go to Settings → Billing → Subscription and click 'Cancel Plan'. You'll retain access until the end of your current billing period. No further charges will be made." },
  { id: 4, category: "technical", q: "API returning 500 errors", a: "A 500 error indicates a server-side issue. Please check our status page at status.example.com. If no incidents are reported, try: 1) Verify your API key is valid, 2) Check request payload format, 3) Retry with exponential backoff. If the issue persists, share your request ID and we'll investigate." },
  { id: 5, category: "technical", q: "Integration / webhook not firing", a: "Please verify: 1) The webhook URL is correct and publicly accessible, 2) Your endpoint returns a 200 status within 10 seconds, 3) SSL certificate is valid. Check the webhook logs in Settings → Integrations → Delivery Log for error details." },
  { id: 6, category: "technical", q: "Performance issues / slow loading", a: "We recommend: 1) Check your network connection, 2) Clear browser cache, 3) Try an incognito window, 4) Disable browser extensions. If the issue persists on multiple devices, it may be a regional issue — please share your approximate location." },
  { id: 7, category: "account", q: "Reset password / locked out", a: "Click 'Forgot Password' on the login page and enter your registered email. You'll receive a reset link valid for 24 hours. If you don't receive it, check spam folders or contact support for manual verification." },
  { id: 8, category: "account", q: "How to add team members?", a: "Go to Settings → Team → Invite Members. Enter their email addresses and select a role (Admin, Editor, Viewer). They'll receive an invitation email to join your workspace." },
  { id: 9, category: "feature", q: "Feature request / product suggestion", a: "Thank you for your feedback! We log all feature requests in our product roadmap. Your suggestion has been recorded and tagged for review by our product team. We'll notify you if it's added to an upcoming release." },
  { id: 10, category: "account", q: "Data export / GDPR request", a: "You can export your data from Settings → Account → Data Export. For GDPR-specific requests (deletion, portability), submit a formal request to privacy@example.com. We process these within 30 days per regulation." },
];

const SAMPLE_TICKETS = [
  { label: "Billing Issue", icon: "💳", text: `Subject: Charged $299 instead of $99 on my last invoice\n\nHi,\n\nI just noticed my credit card was charged $299 on March 1st but my plan is the Starter tier at $99/month. I did NOT upgrade my plan or add any seats.\n\nThis is the second billing issue I've had in 3 months and honestly I'm getting frustrated. Can someone look into this immediately and refund the difference?\n\nAccount: sarah.mitchell@designstudio.co\nInvoice #: INV-88421\n\nThanks,\nSarah Mitchell` },
  { label: "Production Down", icon: "🔥", text: `Subject: CRITICAL - All API endpoints returning 502\nPriority: P1 / EMERGENCY\n\nOur entire production environment is down. ALL API calls to api.yourservice.com are returning 502 Bad Gateway errors since approximately 2:15 AM PST.\n\nThis is affecting all 3,400 of our end users and our SaaS platform is completely non-functional. We're losing approximately $8,000/hour in revenue.\n\nWe need immediate escalation. Our on-call team has been paged and we need a bridge call with your engineering team ASAP.\n\nEnvironment: Production (us-west-2)\nAccount ID: ACC-7721\nContract: Enterprise SLA (99.99% uptime guarantee)\n\nMark Torres\nCTO, DataFlow Inc.\n+1 (415) 555-0177` },
  { label: "Feature Ask", icon: "💡", text: `Subject: Would love to see a Slack integration\n\nHey team!\n\nBig fan of the product. We've been using it for 6 months and the team loves it. One thing that would make it even better: a native Slack integration.\n\nRight now we manually copy alerts from your dashboard into Slack channels, which takes time and sometimes things get missed. If we could get real-time notifications piped directly into Slack with customizable filters (by severity, team, etc.) that would be a game-changer.\n\nWould this be on your roadmap? Happy to be a beta tester!\n\nCheers,\nAlex Kim\nOps Lead, Pixel & Code` },
  { label: "Account Help", icon: "👤", text: `Subject: Locked out after enabling 2FA - can't access anything\n\nI enabled two-factor authentication yesterday but my authenticator app crashed and I lost all my codes. Now I can't log in to my account AT ALL.\n\nI have a critical presentation tomorrow and ALL of my project files are in my account. I've tried the recovery flow but it says I need a backup code which I never saved.\n\nPlease help me regain access urgently. I can verify my identity however needed - government ID, last 4 of credit card, previous passwords, whatever.\n\nAccount email: j.rodriguez@marketwise.com\n\nThank you,\nJavier Rodriguez` },
];

const PRIORITY_CONFIG = {
  P1: { color: "#FF4D4D", bg: "#FF4D4D12", label: "CRITICAL", sla: 30, icon: "🔴" },
  P2: { color: "#FF9F43", bg: "#FF9F4312", label: "HIGH", sla: 120, icon: "🟠" },
  P3: { color: "#FECA57", bg: "#FECA5712", label: "MEDIUM", sla: 480, icon: "🟡" },
  P4: { color: "#54E0C7", bg: "#54E0C712", label: "LOW", sla: 1440, icon: "🟢" },
};

const CATEGORY_CONFIG = {
  billing: { color: "#A78BFA", icon: "💳", team: "Billing & Finance" },
  technical: { color: "#60A5FA", icon: "🔧", team: "Engineering" },
  account: { color: "#34D399", icon: "👤", team: "Account Management" },
  feature: { color: "#FBBF24", icon: "💡", team: "Product" },
  security: { color: "#F87171", icon: "🔒", team: "Security" },
  other: { color: "#9CA3AF", icon: "📋", team: "General Support" },
};

const SENTIMENT_CONFIG = {
  angry: { color: "#FF4D4D", icon: "😠", label: "Frustrated" },
  negative: { color: "#FF9F43", icon: "😟", label: "Unhappy" },
  neutral: { color: "#9CA3AF", icon: "😐", label: "Neutral" },
  positive: { color: "#34D399", icon: "😊", label: "Positive" },
};

// ─── SUB COMPONENTS ────────────────────────────────────────────
const SLATimer = ({ priorityKey, startTime }) => {
  const [now, setNow] = useState(Date.now());
  useEffect(() => { const id = setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(id); }, []);
  const cfg = PRIORITY_CONFIG[priorityKey];
  if (!cfg) return null;
  const elapsed = (now - startTime) / 60000;
  const remaining = Math.max(0, cfg.sla - elapsed);
  const pct = Math.min(100, (elapsed / cfg.sla) * 100);
  const isBreached = remaining <= 0;
  const isWarning = pct > 75 && !isBreached;
  const barColor = isBreached ? "#FF4D4D" : isWarning ? "#FF9F43" : cfg.color;

  const hrs = Math.floor(remaining / 60);
  const mins = Math.floor(remaining % 60);
  const secs = Math.floor((remaining * 60) % 60);

  return (
    <div style={{ padding: "10px 14px", borderRadius: "10px", background: "rgba(0,0,0,0.15)", border: `1px solid ${barColor}20` }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
        <span style={{ fontSize: "10px", fontFamily: "mono", fontWeight: 700, color: "rgba(255,255,255,0.35)", letterSpacing: "1px" }}>SLA TIMER</span>
        <span style={{ fontSize: "11px", fontFamily: "mono", fontWeight: 700, color: barColor }}>
          {isBreached ? "BREACHED" : `${hrs}h ${mins}m ${secs}s`}
        </span>
      </div>
      <div style={{ height: "4px", borderRadius: "2px", background: "rgba(255,255,255,0.06)", overflow: "hidden" }}>
        <div style={{ width: `${pct}%`, height: "100%", borderRadius: "2px", background: barColor, transition: "width 1s linear" }} />
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: "4px" }}>
        <span style={{ fontSize: "9px", color: "rgba(255,255,255,0.2)", fontFamily: "mono" }}>Target: {cfg.sla < 60 ? `${cfg.sla}m` : `${cfg.sla / 60}h`}</span>
        <span style={{ fontSize: "9px", color: "rgba(255,255,255,0.2)", fontFamily: "mono" }}>{pct.toFixed(0)}% elapsed</span>
      </div>
    </div>
  );
};

const KBEntry = ({ entry, onRemove, isMatched }) => (
  <div style={{
    padding: "12px 14px", borderRadius: "10px",
    background: isMatched ? "rgba(52,211,153,0.06)" : "rgba(255,255,255,0.015)",
    border: `1px solid ${isMatched ? "rgba(52,211,153,0.2)" : "rgba(255,255,255,0.04)"}`,
    transition: "all 0.3s",
  }}>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "8px" }}>
      <div style={{ flex: 1 }}>
        <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "4px" }}>
          <span style={{
            fontSize: "9px", padding: "2px 6px", borderRadius: "4px", fontWeight: 700, fontFamily: "mono",
            background: (CATEGORY_CONFIG[entry.category]?.color || "#9CA3AF") + "15",
            color: CATEGORY_CONFIG[entry.category]?.color || "#9CA3AF",
            textTransform: "uppercase", letterSpacing: "0.5px",
          }}>{entry.category}</span>
          {isMatched && <span style={{ fontSize: "9px", padding: "2px 6px", borderRadius: "4px", background: "rgba(52,211,153,0.12)", color: "#34D399", fontWeight: 700, fontFamily: "mono" }}>MATCHED</span>}
        </div>
        <div style={{ fontSize: "12px", fontWeight: 600, color: "rgba(255,255,255,0.75)", marginBottom: "4px" }}>{entry.q}</div>
        <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.35)", lineHeight: 1.5 }}>{entry.a.slice(0, 120)}...</div>
      </div>
      {onRemove && (
        <button onClick={() => onRemove(entry.id)} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.15)", cursor: "pointer", fontSize: "14px", padding: "2px 6px", flexShrink: 0 }}>×</button>
      )}
    </div>
  </div>
);

const MiniChart = ({ data, label, color }) => {
  const max = Math.max(...data.map(d => d.value), 1);
  return (
    <div style={{ padding: "14px", borderRadius: "10px", background: "rgba(0,0,0,0.15)" }}>
      <div style={{ fontSize: "9px", fontWeight: 700, letterSpacing: "1.2px", color: "rgba(255,255,255,0.25)", fontFamily: "mono", marginBottom: "12px" }}>{label}</div>
      <div style={{ display: "flex", alignItems: "flex-end", gap: "3px", height: "48px" }}>
        {data.map((d, i) => (
          <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: "4px" }}>
            <div style={{
              width: "100%", borderRadius: "3px 3px 0 0",
              height: `${Math.max(4, (d.value / max) * 48)}px`,
              background: d.color || color, opacity: 0.8,
              transition: "height 0.5s cubic-bezier(0.16, 1, 0.3, 1)",
            }} />
          </div>
        ))}
      </div>
      <div style={{ display: "flex", gap: "3px", marginTop: "4px" }}>
        {data.map((d, i) => (
          <div key={i} style={{ flex: 1, textAlign: "center", fontSize: "8px", color: "rgba(255,255,255,0.2)", fontFamily: "mono" }}>{d.label}</div>
        ))}
      </div>
    </div>
  );
};

// ─── MAIN ──────────────────────────────────────────────────────
export default function SupportTriageSystem() {
  const [apiKey, setApiKey] = useState("");
  const [keySaved, setKeySaved] = useState(false);
  const [keyVisible, setKeyVisible] = useState(false);
  const [kb, setKb] = useState(DEFAULT_KB);
  const [input, setInput] = useState("");
  const [tickets, setTickets] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [activeView, setActiveView] = useState("triage");
  const [logs, setLogs] = useState([]);
  const [error, setError] = useState(null);
  const [newKbQ, setNewKbQ] = useState("");
  const [newKbA, setNewKbA] = useState("");
  const [newKbCat, setNewKbCat] = useState("technical");
  const [kbFilter, setKbFilter] = useState("all");

  const addLog = useCallback((level, msg) => {
    const t = new Date();
    const time = t.toLocaleTimeString("en-US", { hour12: false }) + "." + String(t.getMilliseconds()).padStart(3, "0").slice(0, 2);
    setLogs(prev => [...prev.slice(-80), { time, level, msg }]);
  }, []);

  const callGroq = async (system, user) => {
    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({ model: "llama-3.3-70b-versatile", max_tokens: 1200, temperature: 0.2, messages: [{ role: "system", content: system }, { role: "user", content: user }] }),
    });
    const data = await res.json();
    if (data.error) throw new Error(data.error.message || JSON.stringify(data.error));
    return data.choices?.[0]?.message?.content || "";
  };

  const triageTicket = useCallback(async (text) => {
    if (!apiKey.trim()) { setError("Connect your Groq API key first"); return; }
    setProcessing(true); setError(null);
    const ticketId = `TKT-${Date.now().toString(36).toUpperCase()}`;
    addLog("info", `───── TRIAGING ${ticketId} ─────`);

    try {
      // STEP 1: Classify
      addLog("info", "Step 1/4 → Classifying ticket...");
      const classifyRaw = await callGroq(
        `You are a support ticket classifier. Analyze the ticket and return ONLY valid JSON, no markdown. Format:
{"priority":"P1|P2|P3|P4","category":"billing|technical|account|feature|security|other","sentiment":"angry|negative|neutral|positive","summary":"one sentence","customer_name":"name or Unknown","customer_email":"email or Unknown","urgency_signals":["signal1","signal2"],"confidence":0-100}`,
        text
      );
      let classification;
      try { classification = JSON.parse(classifyRaw.replace(/```json|```/g, "").trim()); }
      catch { throw new Error("Classification parse failed: " + classifyRaw.slice(0, 200)); }
      addLog("success", `Classified: ${classification.priority} / ${classification.category} / ${classification.sentiment} (${classification.confidence}% conf)`);

      // STEP 2: KB Match
      addLog("info", "Step 2/4 → Matching knowledge base...");
      const kbSummary = kb.map((e, i) => `[${i}] (${e.category}) ${e.q}`).join("\n");
      const matchRaw = await callGroq(
        `You match support tickets to knowledge base articles. Given the ticket and KB index below, return ONLY valid JSON: {"matched_indices":[0,2],"match_reasons":["reason for each match"],"coverage":"full|partial|none"}. Return up to 3 best matches. If nothing matches well, return empty array.`,
        `Ticket summary: ${classification.summary}\nCategory: ${classification.category}\n\nKnowledge Base:\n${kbSummary}`
      );
      let matches;
      try { matches = JSON.parse(matchRaw.replace(/```json|```/g, "").trim()); }
      catch { matches = { matched_indices: [], match_reasons: [], coverage: "none" }; }
      const matchedKB = (matches.matched_indices || []).map(i => kb[i]).filter(Boolean);
      addLog("success", `KB Match: ${matchedKB.length} articles (coverage: ${matches.coverage})`);

      // STEP 3: Draft response
      addLog("info", "Step 3/4 → Drafting response...");
      const kbContext = matchedKB.length > 0
        ? `\n\nRelevant KB articles:\n${matchedKB.map(e => `Q: ${e.q}\nA: ${e.a}`).join("\n\n")}`
        : "\n\nNo matching KB articles found. Draft a helpful response based on general best practices.";
      const draftRaw = await callGroq(
        `You are a senior support agent. Draft a professional, empathetic response to the customer ticket below. Use the knowledge base articles if provided. Match tone to sentiment — if frustrated, acknowledge their frustration first. Be specific and actionable. Keep under 150 words. Return ONLY the response text, no JSON, no markdown headers.${kbContext}`,
        `Customer ticket:\n${text}\n\nClassification: ${classification.priority}, ${classification.category}, sentiment: ${classification.sentiment}`
      );
      addLog("success", "Response drafted (" + draftRaw.split(/\s+/).length + " words)");

      // STEP 4: Route
      addLog("info", "Step 4/4 → Determining routing...");
      const routeRaw = await callGroq(
        `You are a ticket routing engine. Based on the classification and content, determine optimal routing. Return ONLY valid JSON:
{"primary_team":"team name","escalation_needed":true/false,"escalation_reason":"reason or null","secondary_team":"team or null","auto_resolve_candidate":true/false,"auto_resolve_reason":"reason or null","suggested_tags":["tag1","tag2"],"estimated_resolution":"time estimate"}`,
        `Priority: ${classification.priority}\nCategory: ${classification.category}\nSentiment: ${classification.sentiment}\nSummary: ${classification.summary}\nKB Coverage: ${matches.coverage}\nTicket:\n${text}`
      );
      let routing;
      try { routing = JSON.parse(routeRaw.replace(/```json|```/g, "").trim()); }
      catch { routing = { primary_team: CATEGORY_CONFIG[classification.category]?.team || "General Support", escalation_needed: false, auto_resolve_candidate: false, suggested_tags: [], estimated_resolution: "Unknown" }; }
      addLog("success", `Routed → ${routing.primary_team}${routing.escalation_needed ? " [ESCALATED]" : ""}${routing.auto_resolve_candidate ? " [AUTO-RESOLVE]" : ""}`);

      const ticket = {
        id: ticketId,
        text,
        createdAt: Date.now(),
        classification,
        matchedKB,
        kbCoverage: matches.coverage,
        matchReasons: matches.match_reasons || [],
        draft: draftRaw,
        routing,
      };

      setTickets(prev => [ticket, ...prev]);
      setSelectedTicket(ticket);
      setActiveView("triage");
      addLog("success", `✓ ${ticketId} triaged successfully`);
    } catch (err) {
      addLog("error", `Failed: ${err.message}`);
      setError(err.message);
    } finally {
      setProcessing(false);
    }
  }, [apiKey, kb, addLog]);

  const handleExportCSV = () => {
    if (tickets.length === 0) return;
    const headers = ["ID", "Priority", "Category", "Sentiment", "Summary", "Team", "Escalated", "Auto-Resolve", "SLA (min)", "Created"];
    const rows = tickets.map(t => [
      t.id, t.classification.priority, t.classification.category, t.classification.sentiment,
      `"${t.classification.summary}"`, t.routing.primary_team, t.routing.escalation_needed, t.routing.auto_resolve_candidate,
      PRIORITY_CONFIG[t.classification.priority]?.sla || "", new Date(t.createdAt).toISOString()
    ]);
    const csv = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = `tickets-export-${Date.now()}.csv`; a.click();
    addLog("info", `Exported ${tickets.length} tickets as CSV`);
  };

  // Analytics
  const analytics = useMemo(() => {
    const byPriority = { P1: 0, P2: 0, P3: 0, P4: 0 };
    const byCategory = {};
    const bySentiment = {};
    let escalated = 0, autoResolve = 0;
    tickets.forEach(t => {
      byPriority[t.classification.priority] = (byPriority[t.classification.priority] || 0) + 1;
      byCategory[t.classification.category] = (byCategory[t.classification.category] || 0) + 1;
      bySentiment[t.classification.sentiment] = (bySentiment[t.classification.sentiment] || 0) + 1;
      if (t.routing.escalation_needed) escalated++;
      if (t.routing.auto_resolve_candidate) autoResolve++;
    });
    return { byPriority, byCategory, bySentiment, escalated, autoResolve, total: tickets.length };
  }, [tickets]);

  const filteredKB = kbFilter === "all" ? kb : kb.filter(e => e.category === kbFilter);

  const sel = selectedTicket;
  const priCfg = sel ? PRIORITY_CONFIG[sel.classification.priority] : null;
  const catCfg = sel ? CATEGORY_CONFIG[sel.classification.category] : null;
  const sentCfg = sel ? SENTIMENT_CONFIG[sel.classification.sentiment] : null;

  return (
    <div style={{ minHeight: "100vh", background: "#0B0D11", color: "#fff", fontFamily: "'DM Sans', 'Segoe UI', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&family=IBM+Plex+Mono:wght@400;500;600;700&display=swap');
        @keyframes fadeUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}
        @keyframes slideIn{from{opacity:0;transform:translateX(12px)}to{opacity:1;transform:translateX(0)}}
        *{box-sizing:border-box;scrollbar-width:thin;scrollbar-color:rgba(255,255,255,.1) transparent}
        *::-webkit-scrollbar{width:5px}*::-webkit-scrollbar-thumb{background:rgba(255,255,255,.1);border-radius:3px}
        textarea:focus,input:focus,button:focus-visible{outline:none}
        ::selection{background:rgba(167,139,250,.3)}
      `}</style>

      <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "28px 20px 60px" }}>
        {/* HEADER */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px", marginBottom: "28px" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "10px" }}>
              <div style={{ width: "32px", height: "32px", borderRadius: "9px", background: "linear-gradient(135deg, #A78BFA, #60A5FA)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "16px" }}>🎫</div>
              <h1 style={{ fontSize: "22px", fontWeight: 800, margin: 0, letterSpacing: "-0.3px" }}>Support Triage AI</h1>
              <span style={{ fontSize: "9px", padding: "3px 8px", borderRadius: "4px", background: "rgba(167,139,250,0.1)", color: "#A78BFA", fontWeight: 700, fontFamily: "'IBM Plex Mono', monospace", letterSpacing: "0.8px" }}>v1.0</span>
            </div>
            <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.35)", margin: 0 }}>Classify, route, and auto-respond to support tickets using AI + your knowledge base</p>
          </div>
          <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
            {keySaved ? (
              <div style={{ display: "flex", alignItems: "center", gap: "8px", padding: "7px 14px", borderRadius: "8px", background: "rgba(52,211,153,0.06)", border: "1px solid rgba(52,211,153,0.15)" }}>
                <div style={{ width: "7px", height: "7px", borderRadius: "50%", background: "#34D399" }} />
                <span style={{ fontSize: "11px", fontFamily: "'IBM Plex Mono', monospace", color: "rgba(255,255,255,0.45)" }}>{apiKey.slice(0, 7)}...{apiKey.slice(-3)}</span>
                <button onClick={() => { setKeySaved(false); setApiKey(""); }} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.25)", cursor: "pointer", fontSize: "12px" }}>×</button>
              </div>
            ) : (
              <div style={{ display: "flex", gap: "6px" }}>
                <input type={keyVisible ? "text" : "password"} value={apiKey} onChange={e => setApiKey(e.target.value)} placeholder="Groq API key..." style={{ padding: "7px 12px", borderRadius: "8px", background: "rgba(0,0,0,.3)", border: "1px solid rgba(255,255,255,.06)", color: "#fff", fontSize: "12px", fontFamily: "mono", width: "200px" }} />
                <button onClick={() => setKeyVisible(!keyVisible)} style={{ padding: "7px", borderRadius: "8px", border: "1px solid rgba(255,255,255,.06)", background: "rgba(255,255,255,.02)", color: "rgba(255,255,255,.3)", cursor: "pointer" }}>{keyVisible ? "🙈" : "👁️"}</button>
                <button onClick={() => apiKey.trim() && setKeySaved(true)} style={{ padding: "7px 14px", borderRadius: "8px", border: "none", background: apiKey.trim() ? "#A78BFA" : "rgba(255,255,255,.04)", color: apiKey.trim() ? "#fff" : "rgba(255,255,255,.15)", fontWeight: 700, fontSize: "11px", cursor: "pointer", fontFamily: "mono" }}>CONNECT</button>
              </div>
            )}
            {tickets.length > 0 && (
              <button onClick={handleExportCSV} style={{ padding: "7px 12px", borderRadius: "8px", border: "1px solid rgba(255,255,255,.06)", background: "rgba(255,255,255,.02)", color: "rgba(255,255,255,.4)", fontSize: "11px", fontWeight: 600, cursor: "pointer", fontFamily: "mono" }}>📤 CSV</button>
            )}
          </div>
        </div>

        {/* TABS */}
        <div style={{ display: "flex", gap: "3px", marginBottom: "24px", background: "rgba(255,255,255,0.02)", borderRadius: "10px", padding: "3px", border: "1px solid rgba(255,255,255,0.04)" }}>
          {[
            { id: "triage", label: "Triage", icon: "▶", count: null },
            { id: "queue", label: "Queue", icon: "📋", count: tickets.length },
            { id: "kb", label: "Knowledge Base", icon: "📖", count: kb.length },
            { id: "analytics", label: "Analytics", icon: "📊", count: null },
          ].map(tab => (
            <button key={tab.id} onClick={() => setActiveView(tab.id)} style={{
              flex: 1, padding: "9px 6px", borderRadius: "7px", border: "none",
              background: activeView === tab.id ? "rgba(167,139,250,0.08)" : "transparent",
              color: activeView === tab.id ? "#A78BFA" : "rgba(255,255,255,0.3)",
              fontSize: "11.5px", fontWeight: 600, cursor: "pointer", transition: "all 0.2s",
              display: "flex", alignItems: "center", justifyContent: "center", gap: "6px",
            }}>
              <span>{tab.icon}</span> {tab.label}
              {tab.count !== null && tab.count > 0 && (
                <span style={{ fontSize: "9px", padding: "1px 5px", borderRadius: "4px", background: activeView === tab.id ? "rgba(167,139,250,0.15)" : "rgba(255,255,255,0.05)", fontFamily: "mono" }}>{tab.count}</span>
              )}
            </button>
          ))}
        </div>

        {/* ─── TRIAGE VIEW ─── */}
        {activeView === "triage" && (
          <div style={{ display: "grid", gridTemplateColumns: sel ? "1fr 1fr" : "1fr", gap: "20px" }}>
            {/* Left: Input */}
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: "14px", padding: "18px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px", flexWrap: "wrap", gap: "6px" }}>
                  <span style={{ fontSize: "10px", fontWeight: 700, letterSpacing: "1.2px", color: "rgba(255,255,255,0.25)", fontFamily: "'IBM Plex Mono', monospace" }}>INCOMING TICKET</span>
                  <div style={{ display: "flex", gap: "4px", flexWrap: "wrap" }}>
                    {SAMPLE_TICKETS.map((s, i) => (
                      <button key={i} onClick={() => setInput(s.text)} style={{
                        padding: "3px 8px", borderRadius: "5px", border: "1px solid rgba(255,255,255,.06)",
                        background: input === s.text ? "rgba(167,139,250,0.08)" : "rgba(255,255,255,.02)",
                        color: input === s.text ? "#A78BFA" : "rgba(255,255,255,.35)",
                        fontSize: "10px", fontWeight: 600, cursor: "pointer", transition: "all 0.15s",
                      }}>{s.icon} {s.label}</button>
                    ))}
                  </div>
                </div>
                <textarea value={input} onChange={e => setInput(e.target.value)} placeholder="Paste a customer support ticket here..." style={{
                  width: "100%", minHeight: "200px", padding: "14px", borderRadius: "10px",
                  background: "rgba(0,0,0,.2)", border: "1px solid rgba(255,255,255,.04)",
                  color: "rgba(255,255,255,.8)", fontSize: "12.5px", lineHeight: 1.7, resize: "vertical",
                  fontFamily: "'IBM Plex Mono', monospace",
                }} />
                <button onClick={() => input.trim() && triageTicket(input.trim())} disabled={processing || !input.trim() || !keySaved} style={{
                  marginTop: "12px", width: "100%", padding: "13px", borderRadius: "10px", border: "none",
                  fontWeight: 700, fontSize: "13px", fontFamily: "'IBM Plex Mono', monospace", letterSpacing: "0.3px",
                  cursor: (processing || !input.trim() || !keySaved) ? "not-allowed" : "pointer",
                  background: processing ? "rgba(167,139,250,0.1)" : (!input.trim() || !keySaved) ? "rgba(255,255,255,.03)" : "linear-gradient(135deg, #A78BFA, #60A5FA)",
                  color: (!input.trim() || !keySaved) ? "rgba(255,255,255,.15)" : processing ? "#A78BFA" : "#fff",
                  transition: "all 0.3s",
                }}>
                  {!keySaved ? "🔑 CONNECT KEY FIRST" : processing ? "⟳ TRIAGING..." : "▶ TRIAGE TICKET"}
                </button>
              </div>

              {/* Console */}
              {logs.length > 0 && (
                <div style={{ background: "#0A0A0E", border: "1px solid rgba(255,255,255,0.04)", borderRadius: "12px", overflow: "hidden" }}>
                  <div style={{ padding: "8px 14px", display: "flex", alignItems: "center", gap: "8px", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                    <div style={{ display: "flex", gap: "4px" }}><div style={{ width: 7, height: 7, borderRadius: "50%", background: "#FF5F57" }} /><div style={{ width: 7, height: 7, borderRadius: "50%", background: "#FFBD2E" }} /><div style={{ width: 7, height: 7, borderRadius: "50%", background: "#28CA41" }} /></div>
                    <span style={{ fontSize: "10px", fontFamily: "mono", color: "rgba(255,255,255,0.25)" }}>triage-console</span>
                  </div>
                  <div style={{ maxHeight: "150px", overflowY: "auto", padding: "10px 14px", fontSize: "10.5px", fontFamily: "'IBM Plex Mono', monospace", lineHeight: 1.9 }}>
                    {logs.slice(-20).map((l, i) => (
                      <div key={i}>
                        <span style={{ color: "rgba(255,255,255,0.15)" }}>{l.time} </span>
                        <span style={{ color: l.level === "error" ? "#FF6B6B" : l.level === "success" ? "#34D399" : l.level === "warn" ? "#FBBF24" : "#60A5FA", fontWeight: 600 }}>{l.level.slice(0, 4).toUpperCase()} </span>
                        <span style={{ color: "rgba(255,255,255,0.55)" }}>{l.msg}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {error && (
                <div style={{ padding: "12px 16px", borderRadius: "10px", background: "rgba(255,68,68,.06)", border: "1px solid rgba(255,68,68,.15)", fontSize: "12px", color: "#FF6B6B", fontFamily: "mono" }}>⚠ {error}</div>
              )}
            </div>

            {/* Right: Result */}
            {sel && (
              <div style={{ display: "flex", flexDirection: "column", gap: "12px", animation: "slideIn 0.4s ease" }}>
                {/* Classification header */}
                <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: "14px", padding: "18px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "14px" }}>
                    <div>
                      <div style={{ fontSize: "10px", fontFamily: "mono", color: "rgba(255,255,255,0.25)", fontWeight: 600, letterSpacing: "1px", marginBottom: "6px" }}>{sel.id}</div>
                      <div style={{ fontSize: "14px", fontWeight: 700, color: "rgba(255,255,255,0.85)", lineHeight: 1.4 }}>{sel.classification.summary}</div>
                    </div>
                    <span style={{ fontSize: "11px", fontFamily: "mono", color: "rgba(255,255,255,0.2)" }}>{new Date(sel.createdAt).toLocaleTimeString()}</span>
                  </div>

                  {/* Tags row */}
                  <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginBottom: "14px" }}>
                    <span style={{ fontSize: "10px", padding: "4px 10px", borderRadius: "6px", fontWeight: 700, fontFamily: "mono", background: priCfg?.bg, color: priCfg?.color, letterSpacing: "0.5px" }}>
                      {priCfg?.icon} {sel.classification.priority} — {priCfg?.label}
                    </span>
                    <span style={{ fontSize: "10px", padding: "4px 10px", borderRadius: "6px", fontWeight: 700, fontFamily: "mono", background: (catCfg?.color || "#999") + "12", color: catCfg?.color }}>
                      {catCfg?.icon} {sel.classification.category.toUpperCase()}
                    </span>
                    <span style={{ fontSize: "10px", padding: "4px 10px", borderRadius: "6px", fontWeight: 700, fontFamily: "mono", background: (sentCfg?.color || "#999") + "12", color: sentCfg?.color }}>
                      {sentCfg?.icon} {sentCfg?.label}
                    </span>
                    <span style={{ fontSize: "10px", padding: "4px 10px", borderRadius: "6px", fontWeight: 700, fontFamily: "mono", background: "rgba(255,255,255,0.04)", color: "rgba(255,255,255,0.4)" }}>
                      🎯 {sel.classification.confidence}% conf
                    </span>
                  </div>

                  {/* Urgency signals */}
                  {sel.classification.urgency_signals?.length > 0 && (
                    <div style={{ marginBottom: "12px" }}>
                      <div style={{ fontSize: "9px", fontWeight: 700, letterSpacing: "1px", color: "rgba(255,255,255,0.2)", fontFamily: "mono", marginBottom: "6px" }}>URGENCY SIGNALS</div>
                      <div style={{ display: "flex", gap: "4px", flexWrap: "wrap" }}>
                        {sel.classification.urgency_signals.map((s, i) => (
                          <span key={i} style={{ fontSize: "10px", padding: "3px 8px", borderRadius: "5px", background: "rgba(255,77,77,0.06)", color: "rgba(255,77,77,0.7)", fontFamily: "mono" }}>{s}</span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Customer info */}
                  <div style={{ display: "flex", gap: "12px", fontSize: "11px", color: "rgba(255,255,255,0.35)", fontFamily: "mono" }}>
                    {sel.classification.customer_name && sel.classification.customer_name !== "Unknown" && <span>👤 {sel.classification.customer_name}</span>}
                    {sel.classification.customer_email && sel.classification.customer_email !== "Unknown" && <span>📧 {sel.classification.customer_email}</span>}
                  </div>
                </div>

                {/* SLA */}
                <SLATimer priorityKey={sel.classification.priority} startTime={sel.createdAt} />

                {/* Routing */}
                <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: "12px", padding: "14px" }}>
                  <div style={{ fontSize: "9px", fontWeight: 700, letterSpacing: "1px", color: "rgba(255,255,255,0.2)", fontFamily: "mono", marginBottom: "10px" }}>ROUTING</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px" }}>
                      <span style={{ color: "rgba(255,255,255,0.4)" }}>Team</span>
                      <span style={{ fontWeight: 600, color: catCfg?.color }}>{sel.routing.primary_team}</span>
                    </div>
                    {sel.routing.escalation_needed && (
                      <div style={{ padding: "8px 10px", borderRadius: "8px", background: "rgba(255,77,77,0.06)", border: "1px solid rgba(255,77,77,0.12)", fontSize: "11px", color: "#FF6B6B" }}>
                        🚨 ESCALATION: {sel.routing.escalation_reason}
                      </div>
                    )}
                    {sel.routing.auto_resolve_candidate && (
                      <div style={{ padding: "8px 10px", borderRadius: "8px", background: "rgba(52,211,153,0.06)", border: "1px solid rgba(52,211,153,0.12)", fontSize: "11px", color: "#34D399" }}>
                        ✨ Auto-resolve candidate: {sel.routing.auto_resolve_reason}
                      </div>
                    )}
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px" }}>
                      <span style={{ color: "rgba(255,255,255,0.3)" }}>Est. resolution</span>
                      <span style={{ color: "rgba(255,255,255,0.5)", fontFamily: "mono" }}>{sel.routing.estimated_resolution}</span>
                    </div>
                    {sel.routing.suggested_tags?.length > 0 && (
                      <div style={{ display: "flex", gap: "4px", flexWrap: "wrap", marginTop: "4px" }}>
                        {sel.routing.suggested_tags.map((t, i) => (
                          <span key={i} style={{ fontSize: "9px", padding: "2px 7px", borderRadius: "4px", background: "rgba(255,255,255,0.04)", color: "rgba(255,255,255,0.3)", fontFamily: "mono" }}>#{t}</span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* KB Matches */}
                <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: "12px", padding: "14px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                    <span style={{ fontSize: "9px", fontWeight: 700, letterSpacing: "1px", color: "rgba(255,255,255,0.2)", fontFamily: "mono" }}>KB MATCHES</span>
                    <span style={{ fontSize: "10px", padding: "2px 7px", borderRadius: "4px", fontFamily: "mono", fontWeight: 600, background: sel.kbCoverage === "full" ? "rgba(52,211,153,0.1)" : sel.kbCoverage === "partial" ? "rgba(251,191,36,0.1)" : "rgba(255,255,255,0.04)", color: sel.kbCoverage === "full" ? "#34D399" : sel.kbCoverage === "partial" ? "#FBBF24" : "rgba(255,255,255,0.3)" }}>
                      {sel.kbCoverage} coverage
                    </span>
                  </div>
                  {sel.matchedKB.length > 0 ? sel.matchedKB.map((e, i) => (
                    <div key={i} style={{ marginBottom: i < sel.matchedKB.length - 1 ? "8px" : 0 }}>
                      <KBEntry entry={e} isMatched={true} />
                    </div>
                  )) : (
                    <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.25)", textAlign: "center", padding: "12px" }}>No matching articles — consider adding to KB</div>
                  )}
                </div>

                {/* Drafted Response */}
                <div style={{ background: "rgba(167,139,250,0.04)", border: "1px solid rgba(167,139,250,0.12)", borderRadius: "12px", padding: "14px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                    <span style={{ fontSize: "9px", fontWeight: 700, letterSpacing: "1px", color: "#A78BFA", fontFamily: "mono" }}>AI-DRAFTED RESPONSE</span>
                    <button onClick={() => navigator.clipboard?.writeText(sel.draft)} style={{ fontSize: "10px", padding: "3px 8px", borderRadius: "5px", border: "1px solid rgba(167,139,250,0.2)", background: "rgba(167,139,250,0.06)", color: "#A78BFA", cursor: "pointer", fontWeight: 600, fontFamily: "mono" }}>COPY</button>
                  </div>
                  <div style={{ fontSize: "12.5px", lineHeight: 1.7, color: "rgba(255,255,255,0.7)", whiteSpace: "pre-wrap" }}>{sel.draft}</div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ─── QUEUE VIEW ─── */}
        {activeView === "queue" && (
          <div>
            {tickets.length === 0 ? (
              <div style={{ textAlign: "center", padding: "60px", color: "rgba(255,255,255,0.15)" }}>
                <div style={{ fontSize: "28px", marginBottom: "10px" }}>📋</div>
                <div style={{ fontSize: "13px", fontWeight: 600 }}>No tickets triaged yet</div>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {tickets.map(t => {
                  const pc = PRIORITY_CONFIG[t.classification.priority];
                  const cc = CATEGORY_CONFIG[t.classification.category];
                  return (
                    <div key={t.id} onClick={() => { setSelectedTicket(t); setActiveView("triage"); }} style={{
                      padding: "14px 16px", borderRadius: "12px", cursor: "pointer",
                      background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)",
                      transition: "all 0.2s", display: "flex", gap: "14px", alignItems: "center",
                    }}>
                      <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: pc?.color, flexShrink: 0 }} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: "12.5px", fontWeight: 600, color: "rgba(255,255,255,0.8)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{t.classification.summary}</div>
                        <div style={{ display: "flex", gap: "6px", marginTop: "6px" }}>
                          <span style={{ fontSize: "9px", padding: "2px 6px", borderRadius: "4px", background: pc?.bg, color: pc?.color, fontWeight: 700, fontFamily: "mono" }}>{t.classification.priority}</span>
                          <span style={{ fontSize: "9px", padding: "2px 6px", borderRadius: "4px", background: (cc?.color || "#999") + "10", color: cc?.color, fontWeight: 600, fontFamily: "mono" }}>{t.classification.category}</span>
                          {t.routing.escalation_needed && <span style={{ fontSize: "9px", padding: "2px 6px", borderRadius: "4px", background: "rgba(255,77,77,0.08)", color: "#FF6B6B", fontWeight: 600, fontFamily: "mono" }}>ESCALATED</span>}
                          {t.routing.auto_resolve_candidate && <span style={{ fontSize: "9px", padding: "2px 6px", borderRadius: "4px", background: "rgba(52,211,153,0.08)", color: "#34D399", fontWeight: 600, fontFamily: "mono" }}>AUTO-RESOLVE</span>}
                        </div>
                      </div>
                      <div style={{ textAlign: "right", flexShrink: 0 }}>
                        <div style={{ fontSize: "10px", fontFamily: "mono", color: "rgba(255,255,255,0.2)" }}>{t.id}</div>
                        <div style={{ fontSize: "10px", fontFamily: "mono", color: "rgba(255,255,255,0.15)", marginTop: "2px" }}>→ {t.routing.primary_team}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ─── KB VIEW ─── */}
        {activeView === "kb" && (
          <div>
            <div style={{ display: "flex", gap: "4px", marginBottom: "16px", flexWrap: "wrap" }}>
              {["all", ...Object.keys(CATEGORY_CONFIG)].map(cat => (
                <button key={cat} onClick={() => setKbFilter(cat)} style={{
                  padding: "5px 10px", borderRadius: "6px", border: "1px solid rgba(255,255,255,.05)",
                  background: kbFilter === cat ? "rgba(167,139,250,0.08)" : "rgba(255,255,255,.02)",
                  color: kbFilter === cat ? "#A78BFA" : "rgba(255,255,255,.3)",
                  fontSize: "10px", fontWeight: 600, cursor: "pointer", textTransform: "capitalize",
                }}>{cat === "all" ? `All (${kb.length})` : `${CATEGORY_CONFIG[cat]?.icon || ""} ${cat}`}</button>
              ))}
            </div>

            {/* Add new entry */}
            <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: "12px", padding: "16px", marginBottom: "16px" }}>
              <div style={{ fontSize: "9px", fontWeight: 700, letterSpacing: "1px", color: "rgba(255,255,255,0.2)", fontFamily: "mono", marginBottom: "10px" }}>ADD ARTICLE</div>
              <div style={{ display: "flex", gap: "8px", marginBottom: "8px", flexWrap: "wrap" }}>
                <select value={newKbCat} onChange={e => setNewKbCat(e.target.value)} style={{ padding: "8px", borderRadius: "8px", background: "rgba(0,0,0,.2)", border: "1px solid rgba(255,255,255,.05)", color: "#fff", fontSize: "12px" }}>
                  {Object.keys(CATEGORY_CONFIG).map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <input value={newKbQ} onChange={e => setNewKbQ(e.target.value)} placeholder="Question..." style={{ flex: 1, padding: "8px 12px", borderRadius: "8px", background: "rgba(0,0,0,.2)", border: "1px solid rgba(255,255,255,.05)", color: "#fff", fontSize: "12px", minWidth: "200px" }} />
              </div>
              <div style={{ display: "flex", gap: "8px" }}>
                <textarea value={newKbA} onChange={e => setNewKbA(e.target.value)} placeholder="Answer template..." style={{ flex: 1, padding: "8px 12px", borderRadius: "8px", background: "rgba(0,0,0,.2)", border: "1px solid rgba(255,255,255,.05)", color: "#fff", fontSize: "12px", minHeight: "60px", resize: "vertical", fontFamily: "inherit" }} />
                <button onClick={() => {
                  if (newKbQ.trim() && newKbA.trim()) {
                    setKb(prev => [...prev, { id: Date.now(), category: newKbCat, q: newKbQ.trim(), a: newKbA.trim() }]);
                    setNewKbQ(""); setNewKbA("");
                    addLog("info", "KB article added: " + newKbQ.trim().slice(0, 40));
                  }
                }} style={{ padding: "0 16px", borderRadius: "8px", border: "none", background: (newKbQ.trim() && newKbA.trim()) ? "#A78BFA" : "rgba(255,255,255,.04)", color: (newKbQ.trim() && newKbA.trim()) ? "#fff" : "rgba(255,255,255,.15)", fontWeight: 700, fontSize: "12px", cursor: "pointer", alignSelf: "flex-end", height: "36px" }}>+ ADD</button>
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {filteredKB.map(entry => (
                <KBEntry key={entry.id} entry={entry} onRemove={(id) => setKb(prev => prev.filter(e => e.id !== id))} isMatched={false} />
              ))}
            </div>
          </div>
        )}

        {/* ─── ANALYTICS VIEW ─── */}
        {activeView === "analytics" && (
          <div>
            {analytics.total === 0 ? (
              <div style={{ textAlign: "center", padding: "60px", color: "rgba(255,255,255,0.15)" }}>
                <div style={{ fontSize: "28px", marginBottom: "10px" }}>📊</div>
                <div style={{ fontSize: "13px", fontWeight: 600 }}>Triage some tickets to see analytics</div>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                {/* Top stats */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: "10px" }}>
                  {[
                    { label: "TOTAL", value: analytics.total, color: "#A78BFA" },
                    { label: "ESCALATED", value: analytics.escalated, color: "#FF4D4D" },
                    { label: "AUTO-RESOLVE", value: analytics.autoResolve, color: "#34D399" },
                    { label: "AVG CONF", value: (tickets.reduce((a, t) => a + (t.classification.confidence || 0), 0) / tickets.length).toFixed(0) + "%", color: "#60A5FA" },
                  ].map(s => (
                    <div key={s.label} style={{ padding: "16px", borderRadius: "12px", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.04)", textAlign: "center" }}>
                      <div style={{ fontSize: "24px", fontWeight: 800, color: s.color, fontFamily: "'IBM Plex Mono', monospace" }}>{s.value}</div>
                      <div style={{ fontSize: "9px", fontWeight: 700, letterSpacing: "1.2px", color: "rgba(255,255,255,0.2)", marginTop: "4px", fontFamily: "mono" }}>{s.label}</div>
                    </div>
                  ))}
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                  <MiniChart label="BY PRIORITY" color="#A78BFA" data={Object.entries(analytics.byPriority).map(([k, v]) => ({ label: k, value: v, color: PRIORITY_CONFIG[k]?.color }))} />
                  <MiniChart label="BY CATEGORY" color="#60A5FA" data={Object.entries(analytics.byCategory).map(([k, v]) => ({ label: k.slice(0, 4), value: v, color: CATEGORY_CONFIG[k]?.color }))} />
                  <MiniChart label="BY SENTIMENT" color="#34D399" data={Object.entries(analytics.bySentiment).map(([k, v]) => ({ label: k.slice(0, 4), value: v, color: SENTIMENT_CONFIG[k]?.color }))} />
                  <div style={{ padding: "14px", borderRadius: "10px", background: "rgba(0,0,0,0.15)" }}>
                    <div style={{ fontSize: "9px", fontWeight: 700, letterSpacing: "1.2px", color: "rgba(255,255,255,0.25)", fontFamily: "mono", marginBottom: "12px" }}>ROUTING BREAKDOWN</div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                      {Object.entries(analytics.byCategory).sort((a, b) => b[1] - a[1]).map(([cat, count]) => {
                        const cfg = CATEGORY_CONFIG[cat];
                        return (
                          <div key={cat} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                            <span style={{ fontSize: "12px" }}>{cfg?.icon}</span>
                            <div style={{ flex: 1, height: "4px", borderRadius: "2px", background: "rgba(255,255,255,0.04)", overflow: "hidden" }}>
                              <div style={{ width: `${(count / analytics.total) * 100}%`, height: "100%", borderRadius: "2px", background: cfg?.color }} />
                            </div>
                            <span style={{ fontSize: "10px", fontFamily: "mono", color: cfg?.color, minWidth: "24px", textAlign: "right" }}>{count}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        <div style={{ marginTop: "40px", textAlign: "center", fontSize: "10px", color: "rgba(255,255,255,0.1)", fontFamily: "'IBM Plex Mono', monospace", lineHeight: 1.6 }}>
          Support Triage AI · Powered by Groq LPU + Llama 3.3 · Knowledge-base-driven response generation
        </div>
      </div>
    </div>
  );
}
