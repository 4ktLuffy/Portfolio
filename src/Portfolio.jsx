import { useState, useEffect, useRef, useCallback } from "react";

// ─── TYPING HOOK ───────────────────────────────────────────────
const useTyping = (text, speed = 40, delay = 0) => {
  const [displayed, setDisplayed] = useState("");
  const [done, setDone] = useState(false);
  useEffect(() => {
    setDisplayed(""); setDone(false);
    const t1 = setTimeout(() => {
      let i = 0;
      const iv = setInterval(() => {
        if (i < text.length) { setDisplayed(text.slice(0, i + 1)); i++; }
        else { setDone(true); clearInterval(iv); }
      }, speed);
      return () => clearInterval(iv);
    }, delay);
    return () => clearTimeout(t1);
  }, [text, speed, delay]);
  return { displayed, done };
};

// ─── CURSOR ────────────────────────────────────────────────────
const Cursor = ({ color = "#00FF9D" }) => (
  <span style={{ display: "inline-block", width: "8px", height: "16px", background: color, marginLeft: "2px", animation: "blink 1s step-end infinite", verticalAlign: "middle" }} />
);

// ─── TERMINAL LINE ─────────────────────────────────────────────
const TermLine = ({ prefix = "λ", children, color = "#00FF9D", delay = 0 }) => {
  const [show, setShow] = useState(false);
  useEffect(() => { const t = setTimeout(() => setShow(true), delay); return () => clearTimeout(t); }, [delay]);
  if (!show) return null;
  return (
    <div style={{ animation: "fadeIn 0.3s ease", fontFamily: "'IBM Plex Mono', monospace", fontSize: "13px", lineHeight: 1.8 }}>
      <span style={{ color: "#555", marginRight: "8px", userSelect: "none" }}>{prefix}</span>
      <span style={{ color }}>{children}</span>
    </div>
  );
};

// ─── GLITCH TEXT ───────────────────────────────────────────────
const GlitchText = ({ children, style: s = {} }) => {
  const [glitch, setGlitch] = useState(false);
  useEffect(() => {
    const run = () => {
      setGlitch(true);
      setTimeout(() => setGlitch(false), 150);
    };
    const iv = setInterval(run, 4000 + Math.random() * 3000);
    return () => clearInterval(iv);
  }, []);
  return (
    <span style={{ position: "relative", display: "inline-block", ...s }}>
      {children}
      {glitch && (
        <>
          <span style={{ position: "absolute", left: "2px", top: "-1px", color: "#FF004D", clipPath: "inset(20% 0 40% 0)", opacity: 0.7 }}>{children}</span>
          <span style={{ position: "absolute", left: "-2px", top: "1px", color: "#00D4FF", clipPath: "inset(50% 0 10% 0)", opacity: 0.7 }}>{children}</span>
        </>
      )}
    </span>
  );
};

// ─── MATRIX RAIN (lightweight) ─────────────────────────────────
const MatrixColumn = ({ left, speed, delay: d }) => {
  const chars = "アイウエオカキクケコサシスセソタチツテトナニヌネノ01";
  const [col] = useState(() => Array.from({ length: 12 + Math.floor(Math.random() * 10) }, () => chars[Math.floor(Math.random() * chars.length)]));
  return (
    <div style={{
      position: "absolute", left, top: "-200px", fontSize: "12px", fontFamily: "mono",
      color: "#00FF9D", opacity: 0.06, lineHeight: "16px", whiteSpace: "pre",
      animation: `matrixFall ${speed}s linear ${d}s infinite`, pointerEvents: "none", userSelect: "none",
    }}>
      {col.map((c, i) => <div key={i} style={{ opacity: i === col.length - 1 ? 1 : 0.3 + (i / col.length) * 0.7 }}>{c}</div>)}
    </div>
  );
};

const MatrixBG = () => {
  const cols = useMemo(() =>
    Array.from({ length: 20 }, (_, i) => ({
      left: `${(i / 20) * 100}%`,
      speed: 8 + Math.random() * 12,
      delay: Math.random() * 10,
    })), []);
  return (
    <div style={{ position: "fixed", inset: 0, overflow: "hidden", pointerEvents: "none", zIndex: 0 }}>
      {cols.map((c, i) => <MatrixColumn key={i} {...c} />)}
    </div>
  );
};

const useMemo = (fn, deps) => {
  const ref = useRef({ deps: null, value: null });
  const depsChanged = !ref.current.deps || deps.some((d, i) => d !== ref.current.deps[i]);
  if (depsChanged) { ref.current = { deps, value: fn() }; }
  return ref.current.value;
};

// ─── PROJECT CARD ──────────────────────────────────────────────
const ProjectCard = ({ project, index, onSelect }) => {
  const [hovered, setHovered] = useState(false);
  const [visible, setVisible] = useState(false);
  useEffect(() => { const t = setTimeout(() => setVisible(true), 300 + index * 200); return () => clearTimeout(t); }, [index]);

  return (
    <div
      onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
      onClick={() => project.status !== "locked" && onSelect?.(project)}
      style={{
        opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(20px)",
        transition: "all 0.6s cubic-bezier(0.16, 1, 0.3, 1)",
        background: hovered && project.status !== "locked" ? "rgba(0,255,157,0.03)" : "rgba(255,255,255,0.01)",
        border: `1px solid ${hovered && project.status !== "locked" ? "rgba(0,255,157,0.2)" : "rgba(255,255,255,0.05)"}`,
        borderRadius: "12px", padding: "24px", cursor: project.status === "locked" ? "default" : "pointer",
        position: "relative", overflow: "hidden",
      }}
    >
      {/* Scan line effect on hover */}
      {hovered && project.status !== "locked" && (
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, transparent 0%, rgba(0,255,157,0.02) 50%, transparent 100%)", animation: "scanDown 2s linear infinite", pointerEvents: "none" }} />
      )}

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "14px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <span style={{ fontSize: "9px", fontFamily: "mono", color: "#555", fontWeight: 700 }}>
            [{String(index + 1).padStart(2, "0")}]
          </span>
          <span style={{
            fontSize: "9px", padding: "3px 8px", borderRadius: "4px", fontWeight: 700, fontFamily: "mono",
            letterSpacing: "0.8px",
            background: project.status === "live" ? "rgba(0,255,157,0.08)" : project.status === "wip" ? "rgba(255,200,0,0.08)" : "rgba(255,255,255,0.03)",
            color: project.status === "live" ? "#00FF9D" : project.status === "wip" ? "#FFC800" : "#444",
          }}>
            {project.status === "live" ? "● LIVE" : project.status === "wip" ? "◐ IN PROGRESS" : "○ COMING SOON"}
          </span>
          {project.demoRoute && (
            <span style={{
              fontSize: "9px", padding: "3px 8px", borderRadius: "4px", fontWeight: 700, fontFamily: "mono",
              letterSpacing: "0.8px", background: `${project.accent}15`, color: project.accent,
            }}>
              ▶ INTERACTIVE DEMO
            </span>
          )}
        </div>
        <span style={{ fontSize: "11px", fontFamily: "mono", color: "#333" }}>{project.tech}</span>
      </div>

      <h3 style={{ fontSize: "18px", fontWeight: 700, margin: "0 0 8px", color: project.status === "locked" ? "#333" : "rgba(255,255,255,0.9)", letterSpacing: "-0.3px" }}>
        {project.title}
      </h3>
      <p style={{ fontSize: "13px", color: project.status === "locked" ? "#2a2a2a" : "rgba(255,255,255,0.35)", lineHeight: 1.6, margin: "0 0 16px" }}>
        {project.description}
      </p>

      {/* Tags */}
      <div style={{ display: "flex", gap: "5px", flexWrap: "wrap", marginBottom: "16px" }}>
        {project.tags.map((tag, i) => (
          <span key={i} style={{
            fontSize: "10px", padding: "3px 8px", borderRadius: "4px", fontFamily: "mono",
            background: "rgba(255,255,255,0.03)", color: project.status === "locked" ? "#2a2a2a" : "rgba(255,255,255,0.3)",
            border: "1px solid rgba(255,255,255,0.04)",
          }}>{tag}</span>
        ))}
      </div>

      {/* Metrics */}
      {project.metrics && (
        <div style={{ display: "flex", gap: "16px" }}>
          {project.metrics.map((m, i) => (
            <div key={i}>
              <div style={{ fontSize: "16px", fontWeight: 800, color: project.accent || "#00FF9D", fontFamily: "mono" }}>{m.value}</div>
              <div style={{ fontSize: "9px", color: "#444", fontFamily: "mono", letterSpacing: "0.5px", marginTop: "2px" }}>{m.label}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ─── SKILL BAR ─────────────────────────────────────────────────
const SkillBar = ({ name, level, color, delay: d }) => {
  const [visible, setVisible] = useState(false);
  const [filled, setFilled] = useState(false);
  useEffect(() => { const t = setTimeout(() => { setVisible(true); setTimeout(() => setFilled(true), 100); }, d); return () => clearTimeout(t); }, [d]);
  if (!visible) return null;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "12px", animation: "fadeIn 0.3s ease" }}>
      <span style={{ fontSize: "11px", fontFamily: "mono", color: "rgba(255,255,255,0.4)", minWidth: "120px" }}>{name}</span>
      <div style={{ flex: 1, height: "3px", borderRadius: "2px", background: "rgba(255,255,255,0.04)", overflow: "hidden" }}>
        <div style={{ width: filled ? `${level}%` : "0%", height: "100%", borderRadius: "2px", background: color, transition: "width 1.2s cubic-bezier(0.16, 1, 0.3, 1)" }} />
      </div>
      <span style={{ fontSize: "10px", fontFamily: "mono", color, minWidth: "32px", textAlign: "right" }}>{level}%</span>
    </div>
  );
};

// ─── PROJECTS DATA ─────────────────────────────────────────────
const PROJECTS = [
  {
    id: "sms-scam-prevention",
    title: "AI SMS Scam Prevention System",
    description: "Built and deployed an AI-powered SMS screening application that detects and prevents scam messages in real-time. The system analyzes incoming SMS content using AI to identify fraudulent patterns, phishing attempts, and social engineering tactics — protecting businesses and their customers from financial loss.",
    tags: ["AI Classification", "SMS Gateway", "Fraud Detection", "Real-Time Processing", "Production Deployment"],
    tech: "Python + AI + SMS API",
    status: "live",
    accent: "#FF6B6B",
    metrics: [
      { value: "100+", label: "BUSINESSES DEPLOYED" },
      { value: "Real-time", label: "DETECTION SPEED" },
      { value: "SMS", label: "CHANNEL" },
      { value: "Live", label: "IN PRODUCTION" },
    ],
    problem: "SMS scams cause significant financial damage to businesses and individuals, especially in regions with limited fraud prevention infrastructure",
    solution: "AI-powered screening system deployed across 100+ businesses that detects and blocks scam messages before they reach end users",
  },
  {
    id: "odoo-implementation",
    title: "Odoo ERP Implementation",
    description: "Led end-to-end Odoo ERP implementation for 30+ companies across multiple industries. Configured modules, mapped business workflows, handled data migrations, and trained teams. This work gave me deep insight into how businesses operate — the inefficiencies I saw here directly inspired every AI automation I build today.",
    tags: ["Odoo Certified", "ERP Configuration", "Business Process Mapping", "Data Migration", "Workflow Design", "Training"],
    tech: "Odoo + Python + PostgreSQL",
    status: "live",
    accent: "#A78BFA",
    metrics: [
      { value: "30+", label: "COMPANIES" },
      { value: "Certified", label: "ODOO STATUS" },
      { value: "E2E", label: "IMPLEMENTATION" },
      { value: "Multi", label: "INDUSTRIES" },
    ],
    problem: "Companies running on spreadsheets, manual processes, and disconnected tools — no unified system for operations",
    solution: "Full ERP implementation: configured modules, mapped workflows, migrated data, and trained teams to run on a unified system",
  },
  {
    id: "support-triage",
    title: "AI Support Ticket Triage",
    description: "Production-grade system that replaces manual ticket routing. 4-stage AI pipeline classifies priority, matches knowledge base articles, auto-drafts empathetic responses adapted to customer sentiment, and routes to the right team with SLA tracking.",
    tags: ["Multi-Agent AI", "Knowledge Base RAG", "SLA Monitoring", "Sentiment Analysis", "Auto-Response"],
    tech: "React + Groq + Llama 3.3",
    status: "live",
    accent: "#00E5A0",
    demoRoute: "#/demo/support-triage",
    metrics: [
      { value: "4", label: "AI AGENTS" },
      { value: "<10s", label: "TRIAGE TIME" },
      { value: "90%+", label: "ACCURACY" },
      { value: "$0", label: "API COST" },
    ],
    problem: "Support teams spend 5-10 min/ticket on manual classification and routing",
    solution: "AI pipeline reduces handling time to seconds with KB-powered auto-responses",
  },
  {
    id: "invoice-extraction",
    title: "Invoice Data Extraction Pipeline",
    description: "Automated pipeline that extracts structured data from invoices in any format. Pulls vendor info, line items, amounts, tax, due dates and outputs clean CSV/JSON ready for accounting software import.",
    tags: ["Document AI", "Data Extraction", "PDF Processing", "Structured Output", "Accounting"],
    tech: "React + Groq + Llama 3.3",
    status: "live",
    accent: "#60A5FA",
    demoRoute: "#/demo/invoice-extractor",
    metrics: [
      { value: "20+", label: "FIELDS EXTRACTED" },
      { value: "5sec", label: "PER INVOICE" },
      { value: "CSV", label: "EXPORT FORMAT" },
      { value: "$0", label: "API COST" },
    ],
    problem: "Accounting teams manually type invoice data — 20 min per invoice",
    solution: "AI extracts all fields in seconds, outputs accounting-ready structured data",
  },
  {
    id: "meeting-actions",
    title: "Meeting → Action Items Pipeline",
    description: "Transforms meeting transcripts into structured action items with owners, deadlines, and priorities. Generates executive summaries, decision logs, and task lists ready for project management tools.",
    tags: ["NLP", "Action Extraction", "Project Management", "Summarization", "Workflow"],
    tech: "React + Groq + Llama 3.3",
    status: "live",
    accent: "#FBBF24",
    demoRoute: "#/demo/meeting-pipeline",
    metrics: [
      { value: "3", label: "OUTPUT TYPES" },
      { value: "Auto", label: "OWNER DETECT" },
      { value: "JSON", label: "PM EXPORT" },
      { value: "$0", label: "API COST" },
    ],
    problem: "Teams spend 30+ min after each meeting writing up notes and creating tasks",
    solution: "AI generates structured action items with owners and deadlines instantly",
  },
  {
    id: "esg-compliance",
    title: "ESG Supply Chain Compliance Center",
    description: "5-agent AI pipeline that scans for regulatory risks, aggregates supplier data, scores ESG compliance, generates CSRD-format reports, and adversarially red-teams the output for hallucinations and errors before release. Includes a feedback loop where the Red Teamer sends issues back to the Report Writer for revision.",
    tags: ["Multi-Agent Orchestration", "Red Teaming", "ESG/CSRD Compliance", "Adversarial AI", "Supply Chain Risk", "Feedback Loop"],
    tech: "React + Groq + Llama 3.3",
    status: "live",
    accent: "#34D399",
    demoRoute: "#/demo/esg-command-center",
    metrics: [
      { value: "5", label: "AI AGENTS" },
      { value: "Red Team", label: "SELF-CHECKING" },
      { value: "CSRD", label: "EU FRAMEWORK" },
      { value: "$0", label: "API COST" },
    ],
    problem: "Companies face massive fines for ESG non-compliance — manual reporting takes teams weeks and misses risks",
    solution: "5-agent pipeline with adversarial red-teaming catches errors, scores suppliers, and generates audit-ready reports in minutes",
  },
];

// ─── MAIN ──────────────────────────────────────────────────────
export default function Portfolio() {
  const [loaded, setLoaded] = useState(false);
  const [section, setSection] = useState("home");
  const [selectedProject, setSelectedProject] = useState(null);
  const [commandInput, setCommandInput] = useState("");
  const [commandHistory, setCommandHistory] = useState([]);
  const [showTerminal, setShowTerminal] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => { setTimeout(() => setLoaded(true), 200); }, []);

  const heroType = useTyping("I saw the gaps in business systems. Now I build AI to fill them.", 35, 800);
  const subType = useTyping("Software Engineer → Odoo Consultant → AI Automation Engineer", 25, 2800);

  const handleCommand = (cmd) => {
    const c = cmd.trim().toLowerCase();
    let response = "";
    if (c === "help") response = "Available: help, projects, skills, journey, about, contact, clear, ls, whoami, pwd, history";
    else if (c === "projects") { setSection("projects"); response = "→ Navigating to projects..."; }
    else if (c === "skills") { setSection("skills"); response = "→ Navigating to skills..."; }
    else if (c === "journey" || c === "about") { setSection("journey"); response = "→ Loading origin story..."; }
    else if (c === "home") { setSection("home"); response = "→ Navigating home..."; }
    else if (c === "contact") response = "→ henosdereje@email.com · Open to AI automation roles";
    else if (c === "clear") { setCommandHistory([]); return; }
    else if (c === "sudo" || c.startsWith("sudo")) response = "Nice try. 😏";
    else if (c === "ls") response = "projects/  skills/  journey/  about.md  contact.md  odoo-gaps.log  README.md";
    else if (c === "whoami") response = "Henos Dereje — Software Engineer → Odoo Consultant → AI Automation Engineer";
    else if (c === "pwd") response = "/home/henos/portfolio";
    else if (c === "history") response = "Full-stack dev (Python/Go/Java) → Odoo ERP for 30+ companies → Built AI SMS scam prevention (100+ businesses) → AI Automation Engineer";
    else if (c === "cat readme.md") response = "I implemented Odoo for 30+ companies and saw the same gaps everywhere:\nmanual data entry, slow ticket routing, wasted hours on reports.\nI also built an AI SMS scam prevention system deployed to 100+ businesses.\nNow I build AI pipelines to automate the work nobody should be doing by hand.";
    else if (c === "cat odoo-gaps.log") response = "[GAP] Manual invoice entry — 20 min/invoice\n[GAP] Support tickets unrouted for hours\n[GAP] Meeting notes never became action items\n[GAP] SMS scams costing businesses real money\n[FIX] Built AI pipelines + scam detection for all of these.\n[DEPLOYED] 100+ businesses running the SMS system live.";
    else if (c === "stack") response = "Languages: Python, Go, Java, JavaScript\nAI: LLM Pipelines, Multi-Agent, RAG, Prompt Eng\nERP: Odoo (certified), business process mapping\nInfra: Groq, Llama 3.3, Vercel, Docker, PostgreSQL";
    else response = `command not found: ${cmd}. Type 'help' for available commands.`;
    setCommandHistory(prev => [...prev, { cmd, response }]);
  };

  const navItems = [
    { id: "home", label: "~/home" },
    { id: "journey", label: "~/journey" },
    { id: "projects", label: "~/projects" },
    { id: "skills", label: "~/skills" },
  ];

  return (
    <div style={{ minHeight: "100vh", background: "#0A0A0C", color: "#fff", fontFamily: "'IBM Plex Mono', 'Courier New', monospace", position: "relative" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600;700&family=Space+Grotesk:wght@400;500;600;700;800&display=swap');
        @keyframes blink{0%,100%{opacity:1}50%{opacity:0}}
        @keyframes fadeIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
        @keyframes scanDown{0%{transform:translateY(-100%)}100%{transform:translateY(100%)}}
        @keyframes matrixFall{0%{transform:translateY(-200px)}100%{transform:translateY(calc(100vh + 200px))}}
        @keyframes glowPulse{0%,100%{text-shadow:0 0 10px rgba(0,255,157,0.3)}50%{text-shadow:0 0 20px rgba(0,255,157,0.6),0 0 40px rgba(0,255,157,0.2)}}
        @keyframes lineReveal{from{width:0}to{width:100%}}
        @keyframes scanline{0%{top:-4px}100%{top:100%}}
        *{box-sizing:border-box;scrollbar-width:thin;scrollbar-color:rgba(0,255,157,.15) transparent}
        *::-webkit-scrollbar{width:4px}*::-webkit-scrollbar-thumb{background:rgba(0,255,157,.15);border-radius:2px}
        ::selection{background:rgba(0,255,157,.2)}
        input:focus,textarea:focus{outline:none}
      `}</style>

      <MatrixBG />

      {/* Scanline overlay */}
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 100, background: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.03) 2px, rgba(0,0,0,0.03) 4px)" }} />

      {/* Nav */}
      <nav style={{
        position: "sticky", top: 0, zIndex: 50, padding: "12px 24px",
        background: "rgba(10,10,12,0.85)", backdropFilter: "blur(12px)",
        borderBottom: "1px solid rgba(255,255,255,0.04)",
        display: "flex", justifyContent: "space-between", alignItems: "center",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <span style={{ color: "#00FF9D", fontWeight: 700, fontSize: "14px", letterSpacing: "-0.5px" }}>
            <GlitchText>HD</GlitchText>
          </span>
          <div style={{ width: "1px", height: "16px", background: "rgba(255,255,255,0.08)" }} />
          <div style={{ display: "flex", gap: "4px" }}>
            {navItems.map(item => (
              <button key={item.id} onClick={() => setSection(item.id)} style={{
                padding: "5px 12px", borderRadius: "6px", border: "none",
                background: section === item.id ? "rgba(0,255,157,0.08)" : "transparent",
                color: section === item.id ? "#00FF9D" : "#444",
                fontSize: "12px", fontWeight: 500, cursor: "pointer", transition: "all 0.2s",
                fontFamily: "'IBM Plex Mono', monospace",
              }}>{item.label}</button>
            ))}
          </div>
        </div>
        <button onClick={() => { setShowTerminal(!showTerminal); setTimeout(() => inputRef.current?.focus(), 100); }} style={{
          padding: "5px 12px", borderRadius: "6px",
          border: `1px solid ${showTerminal ? "rgba(0,255,157,0.2)" : "rgba(255,255,255,0.06)"}`,
          background: showTerminal ? "rgba(0,255,157,0.06)" : "transparent",
          color: showTerminal ? "#00FF9D" : "#444",
          fontSize: "11px", cursor: "pointer", fontFamily: "mono",
        }}>
          {showTerminal ? "× close" : ">_ terminal"}
        </button>
      </nav>

      {/* Terminal dropdown */}
      {showTerminal && (
        <div style={{
          position: "sticky", top: "49px", zIndex: 40, background: "rgba(8,8,10,0.95)",
          borderBottom: "1px solid rgba(0,255,157,0.1)", padding: "12px 24px",
          backdropFilter: "blur(12px)", animation: "fadeIn 0.2s ease",
        }}>
          <div style={{ maxHeight: "120px", overflowY: "auto", marginBottom: "8px" }}>
            {commandHistory.map((h, i) => (
              <div key={i} style={{ fontSize: "12px", lineHeight: 1.8 }}>
                <span style={{ color: "#00FF9D" }}>λ </span>
                <span style={{ color: "rgba(255,255,255,0.6)" }}>{h.cmd}</span>
                <div style={{ color: "#555", paddingLeft: "16px" }}>{h.response}</div>
              </div>
            ))}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ color: "#00FF9D", fontSize: "12px" }}>λ</span>
            <input
              ref={inputRef}
              value={commandInput}
              onChange={e => setCommandInput(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter" && commandInput.trim()) { handleCommand(commandInput); setCommandInput(""); } }}
              placeholder="type 'help' for commands..."
              style={{ flex: 1, background: "none", border: "none", color: "rgba(255,255,255,0.7)", fontSize: "12px", fontFamily: "'IBM Plex Mono', monospace" }}
              autoFocus
            />
          </div>
        </div>
      )}

      <div style={{ maxWidth: "900px", margin: "0 auto", padding: "0 24px 80px", position: "relative", zIndex: 1 }}>

        {/* ─── HOME ─── */}
        {section === "home" && (
          <div style={{ paddingTop: "80px" }}>
            {/* Boot sequence */}
            <div style={{ marginBottom: "48px", opacity: loaded ? 1 : 0, transition: "opacity 0.5s" }}>
              <TermLine delay={0} color="#333">system boot v4.2.1 — loading henos_dereje.portfolio...</TermLine>
              <TermLine delay={200} color="#333">modules: [erp_experience, ai_pipeline, agent_framework, business_logic] ✓</TermLine>
              <TermLine delay={400} color="#00FF9D">connection established. welcome.</TermLine>
            </div>

            {/* Hero */}
            <div style={{ marginBottom: "60px" }}>
              <div style={{ fontSize: "11px", color: "#333", marginBottom: "16px", letterSpacing: "2px" }}>
                // HENOS DEREJE
              </div>
              <h1 style={{
                fontSize: "clamp(32px, 6vw, 52px)", fontWeight: 800, margin: "0 0 6px",
                fontFamily: "'Space Grotesk', sans-serif", letterSpacing: "-1.5px", lineHeight: 1.05,
                color: "#fff",
              }}>
                <GlitchText>AI Automation</GlitchText>
                <br />
                <span style={{ color: "#00FF9D", animation: "glowPulse 3s ease-in-out infinite" }}>Engineer</span>
              </h1>

              <div style={{ fontSize: "16px", color: "rgba(255,255,255,0.5)", marginTop: "20px", minHeight: "24px", fontFamily: "'Space Grotesk', sans-serif", fontWeight: 400 }}>
                {heroType.displayed}{!heroType.done && <Cursor />}
              </div>
              <div style={{ fontSize: "13px", color: "#333", marginTop: "8px", minHeight: "20px" }}>
                {subType.displayed}{heroType.done && !subType.done && <Cursor color="#333" />}
              </div>

              <div style={{ marginTop: "32px", display: "flex", gap: "10px", flexWrap: "wrap" }}>
                <button onClick={() => setSection("projects")} style={{
                  padding: "10px 20px", borderRadius: "8px", border: "1px solid rgba(0,255,157,0.3)",
                  background: "rgba(0,255,157,0.06)", color: "#00FF9D", fontSize: "13px", fontWeight: 600,
                  cursor: "pointer", fontFamily: "mono", transition: "all 0.2s",
                }}>
                  view projects →
                </button>
                <button onClick={() => setSection("journey")} style={{
                  padding: "10px 20px", borderRadius: "8px", border: "1px solid rgba(167,139,250,0.3)",
                  background: "rgba(167,139,250,0.06)", color: "#A78BFA", fontSize: "13px", fontWeight: 600,
                  cursor: "pointer", fontFamily: "mono", transition: "all 0.2s",
                }}>
                  my journey →
                </button>
                <button onClick={() => setShowTerminal(true)} style={{
                  padding: "10px 20px", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.06)",
                  background: "transparent", color: "#444", fontSize: "13px", fontWeight: 500,
                  cursor: "pointer", fontFamily: "mono", transition: "all 0.2s",
                }}>
                  open terminal
                </button>
              </div>
            </div>

            {/* What I do */}
            <div style={{ marginBottom: "60px" }}>
              <div style={{ fontSize: "10px", color: "#333", letterSpacing: "2px", marginBottom: "20px" }}>// WHAT I BUILD</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "12px" }}>
                {[
                  { icon: "⚡", title: "Multi-Agent Pipelines", desc: "Specialized AI agents that collaborate in sequence — the same workflows I watched people do manually in Odoo, now automated" },
                  { icon: "📄", title: "Document Intelligence", desc: "Extract, classify, and process invoices, contracts, and tickets that used to be keyed in by hand" },
                  { icon: "🔄", title: "Business Process AI", desc: "I map real business workflows from ERP experience, then build AI systems to replace the repetitive parts" },
                ].map((item, i) => (
                  <div key={i} style={{
                    padding: "20px", borderRadius: "10px", background: "rgba(255,255,255,0.015)",
                    border: "1px solid rgba(255,255,255,0.04)", animation: "fadeIn 0.5s ease",
                    animationDelay: `${0.5 + i * 0.15}s`, animationFillMode: "both",
                  }}>
                    <div style={{ fontSize: "20px", marginBottom: "10px" }}>{item.icon}</div>
                    <div style={{ fontSize: "14px", fontWeight: 700, color: "rgba(255,255,255,0.8)", marginBottom: "6px", fontFamily: "'Space Grotesk', sans-serif" }}>{item.title}</div>
                    <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.3)", lineHeight: 1.6 }}>{item.desc}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Origin story block */}
            <div style={{ marginBottom: "60px", padding: "24px", borderRadius: "14px", background: "rgba(0,255,157,0.015)", border: "1px solid rgba(0,255,157,0.06)", position: "relative", overflow: "hidden" }}>
              <div style={{ position: "absolute", top: "12px", right: "16px", fontSize: "9px", fontFamily: "mono", color: "#222", letterSpacing: "1px" }}>// ORIGIN</div>
              <div style={{ fontSize: "10px", color: "#00FF9D", letterSpacing: "2px", marginBottom: "14px", fontWeight: 700, fontFamily: "mono" }}>WHY AI AUTOMATION?</div>
              <div style={{ fontSize: "14px", color: "rgba(255,255,255,0.55)", lineHeight: 1.8, fontFamily: "'Space Grotesk', sans-serif", maxWidth: "700px" }}>
                I spent years implementing <span style={{ color: "#A78BFA" }}>Odoo ERP</span> for companies — configuring modules, mapping workflows, migrating data. I learned how businesses actually operate: what grows them, what destroys them, and where time gets wasted at scale.
              </div>
              <div style={{ fontSize: "14px", color: "rgba(255,255,255,0.55)", lineHeight: 1.8, fontFamily: "'Space Grotesk', sans-serif", maxWidth: "700px", marginTop: "12px" }}>
                The same gaps kept appearing: <span style={{ color: "#FF4D4D" }}>invoice data typed manually when it already existed in PDFs</span>, <span style={{ color: "#FF4D4D" }}>support tickets sitting unrouted for hours</span>, <span style={{ color: "#FF4D4D" }}>important data trapped in documents no system could read</span>. These weren't rare failures — they were everyday processes that scaled poorly. So I started building AI to fix them.
              </div>
            </div>

            {/* Featured stats */}
            <div style={{ display: "flex", gap: "24px", flexWrap: "wrap", marginBottom: "60px", padding: "24px", borderRadius: "12px", background: "rgba(0,255,157,0.02)", border: "1px solid rgba(0,255,157,0.06)" }}>
              {[
                { value: "6", label: "SHIPPED PROJECTS", color: "#00FF9D" },
                { value: "100+", label: "BUSINESSES SERVED", color: "#60A5FA" },
                { value: "Odoo", label: "ERP CERTIFIED", color: "#A78BFA" },
                { value: "4+", label: "LANGUAGES", color: "#FBBF24" },
              ].map((s, i) => (
                <div key={i} style={{ flex: 1, minWidth: "120px", textAlign: "center" }}>
                  <div style={{ fontSize: "24px", fontWeight: 800, color: s.color, fontFamily: "'Space Grotesk', sans-serif" }}>{s.value}</div>
                  <div style={{ fontSize: "9px", color: "#444", letterSpacing: "1.2px", marginTop: "4px" }}>{s.label}</div>
                </div>
              ))}
            </div>

            {/* Approach */}
            <div style={{ marginBottom: "40px" }}>
              <div style={{ fontSize: "10px", color: "#333", letterSpacing: "2px", marginBottom: "20px" }}>// MY APPROACH</div>
              <div style={{ borderLeft: "2px solid rgba(0,255,157,0.15)", paddingLeft: "20px" }}>
                {[
                  { num: "01", text: "Map the real business workflow — my ERP background means I understand how operations actually run, not just how they look in a demo" },
                  { num: "02", text: "Identify the manual bottleneck that costs time and money — the repetitive task someone does 50x a day" },
                  { num: "03", text: "Design a multi-agent AI pipeline with error handling, retries, and observability built in from day one" },
                  { num: "04", text: "Ship at zero cost using open-source models on Groq's LPU — because the best automation is the one companies can actually afford to run" },
                ].map((step, i) => (
                  <div key={i} style={{ display: "flex", gap: "14px", marginBottom: "16px", alignItems: "flex-start" }}>
                    <span style={{ fontSize: "11px", color: "#00FF9D", fontWeight: 700, marginTop: "1px" }}>{step.num}</span>
                    <span style={{ fontSize: "13px", color: "rgba(255,255,255,0.5)", lineHeight: 1.6, fontFamily: "'Space Grotesk', sans-serif" }}>{step.text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ─── PROJECTS ─── */}
        {section === "projects" && (
          <div style={{ paddingTop: "48px" }}>
            <div style={{ marginBottom: "32px" }}>
              <div style={{ fontSize: "10px", color: "#333", letterSpacing: "2px", marginBottom: "12px" }}>// PROJECTS</div>
              <h2 style={{ fontSize: "28px", fontWeight: 800, margin: 0, fontFamily: "'Space Grotesk', sans-serif", letterSpacing: "-0.5px" }}>
                Real problems. <span style={{ color: "#00FF9D" }}>Real solutions.</span>
              </h2>
              <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.3)", marginTop: "8px", lineHeight: 1.6, fontFamily: "'Space Grotesk', sans-serif" }}>
                From ERP implementations to AI-powered scam prevention — each project solves a real business problem at scale.
              </p>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              {PROJECTS.map((p, i) => (
                <ProjectCard key={p.id} project={p} index={i} onSelect={setSelectedProject} />
              ))}
            </div>

            {/* Project detail modal */}
            {selectedProject && (
              <div style={{
                position: "fixed", inset: 0, zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center",
                background: "rgba(0,0,0,0.8)", backdropFilter: "blur(8px)", padding: "24px",
              }} onClick={() => setSelectedProject(null)}>
                <div onClick={e => e.stopPropagation()} style={{
                  maxWidth: "600px", width: "100%", background: "#111114", borderRadius: "16px",
                  border: `1px solid ${selectedProject.accent}25`, padding: "32px",
                  animation: "fadeIn 0.3s ease", maxHeight: "80vh", overflowY: "auto",
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "20px" }}>
                    <div>
                      <span style={{ fontSize: "9px", padding: "3px 8px", borderRadius: "4px", background: "rgba(0,255,157,0.08)", color: "#00FF9D", fontWeight: 700, fontFamily: "mono" }}>
                        {selectedProject.status === "live" ? "● LIVE" : "◐ IN PROGRESS"}
                      </span>
                    </div>
                    <button onClick={() => setSelectedProject(null)} style={{ background: "none", border: "none", color: "#444", cursor: "pointer", fontSize: "18px" }}>×</button>
                  </div>

                  <h3 style={{ fontSize: "22px", fontWeight: 800, margin: "0 0 8px", fontFamily: "'Space Grotesk', sans-serif", color: "#fff" }}>{selectedProject.title}</h3>
                  <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.4)", lineHeight: 1.6, margin: "0 0 20px" }}>{selectedProject.description}</p>

                  <div style={{ padding: "14px", borderRadius: "10px", background: "rgba(255,77,77,0.04)", border: "1px solid rgba(255,77,77,0.08)", marginBottom: "12px" }}>
                    <div style={{ fontSize: "9px", color: "#FF4D4D", fontWeight: 700, letterSpacing: "1px", fontFamily: "mono", marginBottom: "4px" }}>PROBLEM</div>
                    <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.5)", lineHeight: 1.5 }}>{selectedProject.problem}</div>
                  </div>
                  <div style={{ padding: "14px", borderRadius: "10px", background: "rgba(0,255,157,0.04)", border: "1px solid rgba(0,255,157,0.08)", marginBottom: "20px" }}>
                    <div style={{ fontSize: "9px", color: "#00FF9D", fontWeight: 700, letterSpacing: "1px", fontFamily: "mono", marginBottom: "4px" }}>SOLUTION</div>
                    <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.5)", lineHeight: 1.5 }}>{selectedProject.solution}</div>
                  </div>

                  <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
                    {selectedProject.metrics?.map((m, i) => (
                      <div key={i} style={{ textAlign: "center", flex: 1, minWidth: "70px", padding: "10px", borderRadius: "8px", background: "rgba(255,255,255,0.02)" }}>
                        <div style={{ fontSize: "18px", fontWeight: 800, color: selectedProject.accent, fontFamily: "mono" }}>{m.value}</div>
                        <div style={{ fontSize: "8px", color: "#444", letterSpacing: "0.8px", marginTop: "3px" }}>{m.label}</div>
                      </div>
                    ))}
                  </div>

                  <div style={{ display: "flex", gap: "5px", flexWrap: "wrap", marginTop: "16px" }}>
                    {selectedProject.tags.map((t, i) => (
                      <span key={i} style={{ fontSize: "10px", padding: "3px 8px", borderRadius: "4px", background: "rgba(255,255,255,0.03)", color: "rgba(255,255,255,0.3)", border: "1px solid rgba(255,255,255,0.04)" }}>{t}</span>
                    ))}
                  </div>

                  {/* Live Demo Button */}
                  {selectedProject.demoRoute && (
                    <button onClick={() => { setSelectedProject(null); window.__navigate?.(selectedProject.demoRoute); }} style={{
                      marginTop: "20px", width: "100%", padding: "14px", borderRadius: "10px",
                      border: "none", fontWeight: 700, fontSize: "14px", cursor: "pointer",
                      fontFamily: "'IBM Plex Mono', monospace", letterSpacing: "0.5px",
                      background: `linear-gradient(135deg, ${selectedProject.accent}, ${selectedProject.accent}88)`,
                      color: "#fff", transition: "all 0.2s",
                      display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
                    }}>
                      ▶ TRY LIVE DEMO
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ─── JOURNEY ─── */}
        {section === "journey" && (
          <div style={{ paddingTop: "48px" }}>
            <div style={{ marginBottom: "36px" }}>
              <div style={{ fontSize: "10px", color: "#333", letterSpacing: "2px", marginBottom: "12px" }}>// JOURNEY</div>
              <h2 style={{ fontSize: "28px", fontWeight: 800, margin: 0, fontFamily: "'Space Grotesk', sans-serif" }}>
                From ERP to <span style={{ color: "#00FF9D" }}>AI Engineering</span>
              </h2>
              <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.3)", marginTop: "8px", lineHeight: 1.6, fontFamily: "'Space Grotesk', sans-serif" }}>
                How implementing business systems showed me exactly where AI automation belongs.
              </p>
            </div>

            {/* Timeline */}
            <div style={{ position: "relative", paddingLeft: "28px" }}>
              {/* Vertical line */}
              <div style={{ position: "absolute", left: "8px", top: "8px", bottom: "8px", width: "2px", background: "linear-gradient(180deg, #60A5FA, #A78BFA, #00FF9D)", borderRadius: "1px" }} />

              {[
                {
                  phase: "PHASE 01",
                  title: "Software Engineer",
                  period: "Foundation",
                  color: "#60A5FA",
                  content: "Started as a full-stack developer working with Python, Go, and Java. Built web applications, learned system design, and developed strong fundamentals in APIs, structured data, and logical problem-solving. This gave me the engineering backbone that everything else is built on.",
                  tags: ["Python", "Go", "Java", "Full-Stack", "API Design"],
                },
                {
                  phase: "PHASE 02",
                  title: "Odoo ERP Consultant",
                  period: "Business Intelligence",
                  color: "#A78BFA",
                  content: "Got certified in Odoo and started implementing ERP systems for companies. This wasn't just technical work — it taught me how businesses actually operate. I mapped their workflows, configured modules, handled data migrations, and learned to make strategic decisions based on operational data. I saw firsthand what grows and destroys businesses.",
                  tags: ["Odoo Certified", "ERP Implementation", "Business Process Mapping", "Data Migration", "Strategic Analysis"],
                  highlight: true,
                },
                {
                  phase: "THE GAP",
                  title: "Seeing the Patterns",
                  period: "Turning Point",
                  color: "#FF4D4D",
                  content: [
                    "Across the companies I worked with, the same operational problems kept appearing. Accounting teams manually typed invoice data into systems even though the information already existed in PDFs and emails. Customer support tickets would sit for hours because no one had classified or routed them yet. Meetings produced pages of notes but no clear tasks, so decisions often never turned into action. These weren't rare mistakes — they were everyday processes that scaled poorly as companies grew.",
                    "Large organizations also struggle with unstructured information. Important data lives inside documents, contracts, emails, chat messages, and spreadsheets, but systems can't easily read or organize it. Employees end up spending hours searching for information, copying data between systems, or repeating work that someone else already did. AI can extract, structure, and organize this information automatically, turning messy data into something systems can actually use.",
                    "Another common problem is workflow bottlenecks. Many processes depend on someone manually reviewing, sorting, or forwarding tasks — whether it's routing support tickets, qualifying sales leads, reviewing contracts, or following up after meetings. When teams are busy, these tasks get delayed or forgotten. AI automation can classify requests, assign them to the right people, generate summaries, and trigger the next step in a workflow instantly, removing the friction that slows companies down."
                  ],
                  tags: ["Manual Data Entry", "Unstructured Data", "Workflow Bottlenecks", "Ticket Routing", "Lost Action Items", "Information Silos"],
                  isGap: true,
                },
                {
                  phase: "PHASE 03",
                  title: "AI Automation Engineer",
                  period: "Current",
                  color: "#00FF9D",
                  content: "Now I combine my software engineering skills with my deep understanding of business operations to build AI systems that actually solve the problems I witnessed. Multi-agent pipelines that classify, extract, route, and automate — designed by someone who's seen the pain these processes cause in real companies. My technical writing and prompt engineering skills let me evaluate and improve AI outputs with precision.",
                  tags: ["Multi-Agent AI", "LLM Pipelines", "Prompt Engineering", "Production Automation", "RAG Systems"],
                  isCurrent: true,
                },
              ].map((item, i) => (
                <div key={i} style={{
                  marginBottom: "28px", position: "relative",
                  animation: "fadeIn 0.5s ease", animationDelay: `${i * 0.15}s`, animationFillMode: "both",
                }}>
                  {/* Dot */}
                  <div style={{
                    position: "absolute", left: "-24px", top: "6px",
                    width: "12px", height: "12px", borderRadius: "50%",
                    background: item.isGap ? "#0A0A0C" : item.isCurrent ? item.color : "#0A0A0C",
                    border: `2px solid ${item.color}`,
                    boxShadow: item.isCurrent ? `0 0 12px ${item.color}50` : item.isGap ? `0 0 8px ${item.color}30` : "none",
                  }} />

                  <div style={{
                    padding: "20px", borderRadius: "12px",
                    background: item.isGap ? "rgba(255,77,77,0.03)" : item.isCurrent ? "rgba(0,255,157,0.03)" : "rgba(255,255,255,0.015)",
                    border: `1px solid ${item.isGap ? "rgba(255,77,77,0.1)" : item.isCurrent ? "rgba(0,255,157,0.1)" : "rgba(255,255,255,0.04)"}`,
                  }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px", flexWrap: "wrap", gap: "6px" }}>
                      <span style={{ fontSize: "9px", fontFamily: "mono", color: item.color, fontWeight: 700, letterSpacing: "1.2px" }}>{item.phase}</span>
                      <span style={{ fontSize: "10px", fontFamily: "mono", color: "#333" }}>{item.period}</span>
                    </div>
                    <h3 style={{ fontSize: "17px", fontWeight: 700, margin: "0 0 10px", color: "rgba(255,255,255,0.85)", fontFamily: "'Space Grotesk', sans-serif" }}>
                      {item.title}
                    </h3>
                    <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.4)", lineHeight: 1.7, margin: "0 0 14px", fontFamily: "'Space Grotesk', sans-serif" }}>
                      {Array.isArray(item.content) ? item.content.map((para, pi) => (
                        <span key={pi} style={{ display: "block", marginBottom: pi < item.content.length - 1 ? "12px" : 0 }}>{para}</span>
                      )) : item.content}
                    </p>
                    <div style={{ display: "flex", gap: "5px", flexWrap: "wrap" }}>
                      {item.tags.map((tag, j) => (
                        <span key={j} style={{
                          fontSize: "10px", padding: "3px 8px", borderRadius: "4px",
                          background: item.color + "10", color: item.color + "AA",
                          fontFamily: "mono", fontWeight: 500,
                        }}>{tag}</span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* What makes me different */}
            <div style={{ marginTop: "32px", padding: "24px", borderRadius: "14px", background: "rgba(0,255,157,0.02)", border: "1px solid rgba(0,255,157,0.06)" }}>
              <div style={{ fontSize: "10px", color: "#00FF9D", letterSpacing: "2px", marginBottom: "16px", fontWeight: 700, fontFamily: "mono" }}>// WHAT MAKES ME DIFFERENT</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px" }}>
                {[
                  { icon: "🏢", title: "I've been inside the businesses", desc: "Not just building tools from outside — I've mapped real workflows, migrated real data, and seen where real time gets wasted." },
                  { icon: "🔍", title: "I evaluate AI outputs critically", desc: "My technical writing background means I catch hallucinations, check for logical consistency, and engineer prompts with precision." },
                  { icon: "🔧", title: "I ship production systems", desc: "Python, Go, Java, React — I don't just prototype. I build systems with error handling, retries, observability, and real deployment." },
                  { icon: "📊", title: "I think in business impact", desc: "Every automation I build has a clear ROI: hours saved, errors prevented, revenue protected. I speak both engineering and business." },
                ].map((item, i) => (
                  <div key={i} style={{ padding: "16px", borderRadius: "10px", background: "rgba(0,0,0,0.15)" }}>
                    <div style={{ fontSize: "18px", marginBottom: "8px" }}>{item.icon}</div>
                    <div style={{ fontSize: "13px", fontWeight: 700, color: "rgba(255,255,255,0.75)", marginBottom: "4px", fontFamily: "'Space Grotesk', sans-serif" }}>{item.title}</div>
                    <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.3)", lineHeight: 1.6 }}>{item.desc}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ─── SKILLS ─── */}
        {section === "skills" && (
          <div style={{ paddingTop: "48px" }}>
            <div style={{ marginBottom: "32px" }}>
              <div style={{ fontSize: "10px", color: "#333", letterSpacing: "2px", marginBottom: "12px" }}>// SKILLS</div>
              <h2 style={{ fontSize: "28px", fontWeight: 800, margin: 0, fontFamily: "'Space Grotesk', sans-serif" }}>
                Tech <span style={{ color: "#00FF9D" }}>stack</span>
              </h2>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
              <div>
                <div style={{ fontSize: "10px", color: "#444", letterSpacing: "1.5px", marginBottom: "14px", fontWeight: 700 }}>AI & AUTOMATION</div>
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  <SkillBar name="LLM Pipelines" level={92} color="#00FF9D" delay={100} />
                  <SkillBar name="Prompt Engineering" level={90} color="#00FF9D" delay={200} />
                  <SkillBar name="Multi-Agent Systems" level={85} color="#00FF9D" delay={300} />
                  <SkillBar name="RAG / Knowledge Base" level={82} color="#00FF9D" delay={400} />
                  <SkillBar name="AI Output Evaluation" level={88} color="#00FF9D" delay={500} />
                </div>
              </div>
              <div>
                <div style={{ fontSize: "10px", color: "#444", letterSpacing: "1.5px", marginBottom: "14px", fontWeight: 700 }}>LANGUAGES</div>
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  <SkillBar name="Python" level={90} color="#60A5FA" delay={150} />
                  <SkillBar name="Go" level={80} color="#60A5FA" delay={250} />
                  <SkillBar name="Java" level={78} color="#60A5FA" delay={350} />
                  <SkillBar name="JavaScript / React" level={82} color="#60A5FA" delay={450} />
                  <SkillBar name="SQL" level={85} color="#60A5FA" delay={550} />
                </div>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px", marginTop: "24px" }}>
              <div>
                <div style={{ fontSize: "10px", color: "#444", letterSpacing: "1.5px", marginBottom: "14px", fontWeight: 700 }}>BUSINESS & ERP</div>
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  <SkillBar name="Odoo ERP" level={92} color="#A78BFA" delay={200} />
                  <SkillBar name="Process Mapping" level={88} color="#A78BFA" delay={300} />
                  <SkillBar name="Data Analysis" level={85} color="#A78BFA" delay={400} />
                  <SkillBar name="Technical Writing" level={86} color="#A78BFA" delay={500} />
                </div>
              </div>
              <div>
                <div style={{ fontSize: "10px", color: "#444", letterSpacing: "1.5px", marginBottom: "14px", fontWeight: 700 }}>ENGINEERING</div>
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  <SkillBar name="API Integration" level={90} color="#FBBF24" delay={250} />
                  <SkillBar name="System Design" level={80} color="#FBBF24" delay={350} />
                  <SkillBar name="Error Handling" level={87} color="#FBBF24" delay={450} />
                  <SkillBar name="Full-Stack Dev" level={84} color="#FBBF24" delay={550} />
                </div>
              </div>
            </div>

            <div style={{ marginTop: "32px" }}>
              <div style={{ fontSize: "10px", color: "#444", letterSpacing: "1.5px", marginBottom: "14px", fontWeight: 700 }}>TOOLS & PLATFORMS</div>
              <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                {["Groq", "Llama 3.3", "OpenAI", "LangChain", "Odoo", "Vercel", "Git", "Docker", "PostgreSQL", "Redis", "REST APIs", "n8n", "Linux", "VS Code"].map((tool, i) => (
                  <span key={i} style={{
                    padding: "6px 12px", borderRadius: "6px", fontSize: "11px", fontWeight: 500,
                    background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)",
                    color: "rgba(255,255,255,0.4)", animation: "fadeIn 0.3s ease",
                    animationDelay: `${0.1 + i * 0.05}s`, animationFillMode: "both",
                  }}>{tool}</span>
                ))}
              </div>
            </div>

            {/* Why hire terminal */}
            <div style={{ marginTop: "36px", padding: "20px", borderRadius: "12px", background: "rgba(0,0,0,0.2)", border: "1px solid rgba(255,255,255,0.04)" }}>
              <div style={{ display: "flex", gap: "5px", marginBottom: "14px" }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#FF5F57" }} />
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#FFBD2E" }} />
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#28CA41" }} />
              </div>
              <TermLine color="#555" prefix="#">cat why-hire-henos.md</TermLine>
              <TermLine color="#00FF9D" prefix="" delay={200}>→ I've implemented ERP for real companies — I know where the pain is</TermLine>
              <TermLine color="#00FF9D" prefix="" delay={400}>→ I build AI automation that saves companies thousands of hours and dollars</TermLine>
              <TermLine color="#00FF9D" prefix="" delay={600}>→ Python, Go, Java + production patterns: retries, SLA tracking, observability</TermLine>
              <TermLine color="#00FF9D" prefix="" delay={800}>→ Zero infrastructure cost — open-source models, free-tier inference</TermLine>
              <TermLine color="#00FF9D" prefix="" delay={1000}>→ I speak both engineering and business. I ship systems with measurable ROI.</TermLine>
              <TermLine color="#555" prefix="#" delay={1200}>_</TermLine>
            </div>
          </div>
        )}

        {/* Footer */}
        <div style={{ marginTop: "80px", paddingTop: "24px", borderTop: "1px solid rgba(255,255,255,0.04)", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
          <span style={{ fontSize: "11px", color: "#222" }}>© 2026 Henos Dereje</span>
          <div style={{ display: "flex", gap: "16px" }}>
            {["GitHub", "LinkedIn", "Email"].map(link => (
              <span key={link} style={{ fontSize: "11px", color: "#333", cursor: "pointer", transition: "color 0.2s" }}
                onMouseEnter={e => e.target.style.color = "#00FF9D"}
                onMouseLeave={e => e.target.style.color = "#333"}
              >{link}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
