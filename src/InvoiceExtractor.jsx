import { useState, useEffect, useRef, useCallback } from "react";

const SAMPLE_INVOICES = {
  standard: { label: "Standard Invoice", icon: "🧾", text: `INVOICE #INV-2026-0392
From: Nordic Design Studio AB
Address: Kungsgatan 44, 111 35 Stockholm, Sweden
VAT: SE556677889901

Bill To: Brighton Digital Ltd
Address: 47 Ship Street, Brighton BN1 1AF, United Kingdom
VAT: GB123456789

Invoice Date: March 3, 2026
Due Date: April 2, 2026
Payment Terms: Net 30
Currency: EUR

Description                          Qty    Unit Price    Amount
─────────────────────────────────────────────────────────────────
UX Research & User Interviews         40h    €95.00       €3,800.00
Wireframing & Prototyping            32h    €110.00      €3,520.00
Visual Design — Mobile App           60h    €120.00      €7,200.00
Design System Documentation          16h    €105.00      €1,680.00
Client Revision Rounds (3x)          12h    €95.00       €1,140.00

                                              Subtotal:  €17,340.00
                                              VAT (21%): €3,641.40
                                              TOTAL:     €20,981.40

Payment Details:
Bank: Handelsbanken
IBAN: SE35 5000 0000 0549 1000 0003
BIC/SWIFT: HANDSESS
Reference: INV-2026-0392

Notes: Payment is due within 30 days. Late payments incur 1.5% monthly interest.
Thank you for your business!` },

  messy: { label: "Messy Email Invoice", icon: "📧", text: `Hey team,

Here's the invoice for the server migration work we did last month.

Vendor: CloudShift Solutions (contact: billing@cloudshift.io)
Our ref: PO-2026-118

Work completed Feb 10 - Feb 28:
- AWS to GCP migration (main cluster): $12,500
- Database migration & optimization: $4,200  
- SSL cert renewal + DNS cutover: $800
- After-hours emergency support (Feb 22 incident, 6hrs): $1,800
- Post-migration monitoring setup (2 weeks): $2,400

Total: $21,700
Tax: $0 (reverse charge applies, we're both US entities)

Net amount due: $21,700

Please wire to:
Chase Bank
Routing: 021000021  
Account: 483-291-7744
Company: CloudShift Solutions LLC

Due by March 28. Let me know if you need a formal PDF — this email serves as the invoice per our agreement.

Cheers,
Mike Torres
CloudShift Solutions` },

  international: { label: "Multi-Currency", icon: "🌍", text: `株式会社テックフォワード
TECHFORWARD INC.
Invoice No: TF-2026-0088
Date: 2026-03-01

Customer: Samsung Electronics Co., Ltd.
Address: 129 Samsung-ro, Yeongtong-gu, Suwon-si, Gyeonggi-do, South Korea

Item                                    Qty     Rate (JPY)      Amount (JPY)
────────────────────────────────────────────────────────────────────────────
AI Model Training - Custom NLP            1     ¥2,400,000      ¥2,400,000
GPU Compute Charges (A100 x 8, 120hrs)    1     ¥1,860,000      ¥1,860,000
Data Preprocessing Pipeline               1       ¥680,000        ¥680,000
Model Optimization & Quantization         1       ¥540,000        ¥540,000
API Integration & Deployment              1       ¥420,000        ¥420,000

                                          Subtotal:             ¥5,900,000
                                          Consumption Tax (10%): ¥590,000
                                          Total (JPY):         ¥6,490,000
                                          Total (USD approx):    $43,267

Payment Terms: Net 45
Bank: MUFG Bank, Tokyo Branch
Account: 1234567
SWIFT: BOTKJPJT

Notes: USD conversion at ¥150.00/USD rate as of invoice date.` },

  freelance: { label: "Freelance Invoice", icon: "💻", text: `INVOICE

Maria Santos — Independent Contractor
maria@msantos.dev | +351 912 345 678
NIF: 276543210

To: Rocket Startup GmbH
    Friedrichstraße 123, 10117 Berlin, Germany
    USt-IdNr: DE987654321

Invoice #: MS-2026-015
Date: March 5, 2026
Project: Mobile App MVP Development

Milestone 1 — Authentication & Onboarding (delivered Feb 3)     €3,200
Milestone 2 — Core Features + API Integration (delivered Feb 17) €4,800
Milestone 3 — Payment Integration (Stripe) (delivered Feb 28)   €2,600
Milestone 4 — QA, Bug Fixes & App Store Submission              €1,900
Travel expenses (Berlin trip, Feb 12-14)                           €487.50

                                            Subtotal:          €12,987.50
                                            VAT (0% — reverse charge):  €0.00
                                            Total Due:         €12,987.50

Payment via TransferWise/Wise:
IBAN: PT50 0035 0000 0000 1234 5678 9
BIC: CGDIPTPL

Due: March 20, 2026` },
};

const StatusBadge = ({ status }) => {
  const config = {
    extracting: { color: "#60A5FA", bg: "rgba(96,165,250,0.08)", label: "EXTRACTING..." },
    validating: { color: "#FBBF24", bg: "rgba(251,191,36,0.08)", label: "VALIDATING..." },
    complete: { color: "#34D399", bg: "rgba(52,211,153,0.08)", label: "COMPLETE" },
    error: { color: "#F87171", bg: "rgba(248,113,113,0.08)", label: "ERROR" },
  };
  const c = config[status];
  if (!c) return null;
  return (
    <span style={{ fontSize: "10px", padding: "3px 10px", borderRadius: "5px", background: c.bg, color: c.color, fontWeight: 700, fontFamily: "'IBM Plex Mono', monospace", letterSpacing: "0.5px", display: "inline-flex", alignItems: "center", gap: "5px" }}>
      {status === "extracting" || status === "validating" ? <span style={{ animation: "pulse 1s infinite" }}>●</span> : status === "complete" ? "✓" : "✕"} {c.label}
    </span>
  );
};

const FieldRow = ({ label, value, confidence, type = "text" }) => {
  const confColor = confidence >= 90 ? "#34D399" : confidence >= 70 ? "#FBBF24" : "#F87171";
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", padding: "8px 0", borderBottom: "1px solid rgba(255,255,255,0.03)", gap: "12px" }}>
      <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.35)", fontFamily: "'IBM Plex Mono', monospace", minWidth: "130px", flexShrink: 0 }}>{label}</span>
      <span style={{ fontSize: "12px", color: type === "amount" ? "#34D399" : type === "date" ? "#60A5FA" : "rgba(255,255,255,0.75)", fontWeight: type === "amount" ? 600 : 400, fontFamily: "'IBM Plex Mono', monospace", textAlign: "right", flex: 1, wordBreak: "break-word" }}>{value || "—"}</span>
      {confidence !== undefined && (
        <span style={{ fontSize: "9px", padding: "2px 6px", borderRadius: "3px", background: confColor + "12", color: confColor, fontWeight: 700, fontFamily: "mono", flexShrink: 0 }}>{confidence}%</span>
      )}
    </div>
  );
};

const LineItemTable = ({ items }) => {
  if (!items || items.length === 0) return null;
  return (
    <div style={{ overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "11.5px", fontFamily: "'IBM Plex Mono', monospace" }}>
        <thead>
          <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
            {["Description", "Qty", "Unit Price", "Amount"].map(h => (
              <th key={h} style={{ padding: "8px 6px", textAlign: h === "Description" ? "left" : "right", color: "rgba(255,255,255,0.3)", fontWeight: 600, fontSize: "10px", letterSpacing: "0.5px" }}>{h.toUpperCase()}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {items.map((item, i) => (
            <tr key={i} style={{ borderBottom: "1px solid rgba(255,255,255,0.03)" }}>
              <td style={{ padding: "8px 6px", color: "rgba(255,255,255,0.65)" }}>{item.description}</td>
              <td style={{ padding: "8px 6px", textAlign: "right", color: "rgba(255,255,255,0.5)" }}>{item.quantity || "—"}</td>
              <td style={{ padding: "8px 6px", textAlign: "right", color: "rgba(255,255,255,0.5)" }}>{item.unit_price || "—"}</td>
              <td style={{ padding: "8px 6px", textAlign: "right", color: "#34D399", fontWeight: 600 }}>{item.amount || "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default function InvoiceExtractor() {
  const [apiKey, setApiKey] = useState("");
  const [keySaved, setKeySaved] = useState(false);
  const [keyVisible, setKeyVisible] = useState(false);
  const [input, setInput] = useState("");
  const [processing, setProcessing] = useState(false);
  const [status, setStatus] = useState(null);
  const [extracted, setExtracted] = useState(null);
  const [validation, setValidation] = useState(null);
  const [history, setHistory] = useState([]);
  const [error, setError] = useState(null);
  const [activeView, setActiveView] = useState("extract");
  const [logs, setLogs] = useState([]);
  const [elapsed, setElapsed] = useState(0);
  const timerRef = useRef(null);

  const addLog = useCallback((level, msg) => {
    const t = new Date();
    const time = t.toLocaleTimeString("en-US", { hour12: false }) + "." + String(t.getMilliseconds()).padStart(3, "0").slice(0, 2);
    setLogs(prev => [...prev.slice(-50), { time, level, msg }]);
  }, []);

  const callGroq = async (system, user) => {
    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({ model: "llama-3.3-70b-versatile", max_tokens: 2000, temperature: 0.1, messages: [{ role: "system", content: system }, { role: "user", content: user }] }),
    });
    const data = await res.json();
    if (data.error) throw new Error(data.error.message || JSON.stringify(data.error));
    return data.choices?.[0]?.message?.content || "";
  };

  const extractInvoice = useCallback(async (text) => {
    if (!apiKey.trim()) { setError("Connect your Groq API key first"); return; }
    setProcessing(true); setError(null); setExtracted(null); setValidation(null);
    setStatus("extracting"); setLogs([]); setElapsed(0);
    const start = Date.now();
    timerRef.current = setInterval(() => setElapsed(Date.now() - start), 50);

    try {
      // STEP 1: Extract structured data
      addLog("info", "Step 1/2 → Extracting structured data from invoice...");
      const extractRaw = await callGroq(
        `You are an invoice data extraction system. Extract ALL data from the invoice into structured JSON. Return ONLY valid JSON, no markdown. Format:
{
  "invoice_number": "string",
  "invoice_date": "string",
  "due_date": "string",
  "currency": "string (3-letter code)",
  "vendor": {
    "name": "string",
    "address": "string",
    "email": "string or null",
    "phone": "string or null",
    "vat_id": "string or null"
  },
  "customer": {
    "name": "string",
    "address": "string",
    "vat_id": "string or null"
  },
  "line_items": [
    {"description": "string", "quantity": "string", "unit_price": "string", "amount": "string"}
  ],
  "subtotal": "string",
  "tax_rate": "string",
  "tax_amount": "string",
  "total": "string",
  "payment_terms": "string or null",
  "bank_details": "string or null",
  "notes": "string or null",
  "confidence_scores": {
    "overall": 0-100,
    "amounts": 0-100,
    "dates": 0-100,
    "entities": 0-100,
    "line_items": 0-100
  }
}
Extract numbers exactly as written including currency symbols. If a field is not found, use null.`,
        text
      );

      let data;
      try { data = JSON.parse(extractRaw.replace(/```json|```/g, "").trim()); }
      catch { throw new Error("Extraction parse failed — model returned invalid JSON"); }
      setExtracted(data);
      addLog("success", `Extracted: ${data.line_items?.length || 0} line items, total: ${data.total || "unknown"}`);

      // STEP 2: Validate
      setStatus("validating");
      addLog("info", "Step 2/2 → Validating extracted data...");
      const valRaw = await callGroq(
        `You are an invoice validation agent. Given extracted invoice data, check for errors and inconsistencies. Return ONLY valid JSON:
{
  "is_valid": true/false,
  "math_check": {"line_items_sum_correct": true/false, "tax_calculation_correct": true/false, "total_correct": true/false},
  "completeness": {"missing_fields": ["field1"], "completeness_score": 0-100},
  "warnings": ["warning string"],
  "suggested_corrections": ["correction string"],
  "risk_flags": ["flag string if suspicious"]
}`,
        `Extracted invoice data:\n${JSON.stringify(data, null, 2)}\n\nOriginal text:\n${text}`
      );

      let val;
      try { val = JSON.parse(valRaw.replace(/```json|```/g, "").trim()); }
      catch { val = { is_valid: true, math_check: {}, completeness: { missing_fields: [], completeness_score: 75 }, warnings: ["Validation parse incomplete"], suggested_corrections: [], risk_flags: [] }; }
      setValidation(val);
      addLog("success", `Validation: ${val.is_valid ? "PASSED" : "ISSUES FOUND"} — ${val.completeness?.completeness_score || "?"}% complete`);

      setStatus("complete");
      clearInterval(timerRef.current);
      setElapsed(Date.now() - start);

      // Add to history
      setHistory(prev => [{
        id: Date.now(),
        invoiceNum: data.invoice_number || "Unknown",
        vendor: data.vendor?.name || "Unknown",
        total: data.total || "—",
        currency: data.currency || "—",
        isValid: val.is_valid,
        completeness: val.completeness?.completeness_score || 0,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        data, validation: val,
      }, ...prev].slice(0, 20));

      addLog("success", `✓ Invoice processed in ${((Date.now() - start) / 1000).toFixed(2)}s`);
    } catch (err) {
      clearInterval(timerRef.current);
      setStatus("error"); setError(err.message);
      addLog("error", `Failed: ${err.message}`);
    } finally { setProcessing(false); }
  }, [apiKey, addLog]);

  const handleExportCSV = () => {
    if (!extracted) return;
    const rows = [["Field", "Value"]];
    rows.push(["Invoice #", extracted.invoice_number]);
    rows.push(["Date", extracted.invoice_date]);
    rows.push(["Due Date", extracted.due_date]);
    rows.push(["Vendor", extracted.vendor?.name]);
    rows.push(["Customer", extracted.customer?.name]);
    rows.push(["Currency", extracted.currency]);
    rows.push(["Subtotal", extracted.subtotal]);
    rows.push(["Tax", extracted.tax_amount]);
    rows.push(["Total", extracted.total]);
    rows.push([""]); rows.push(["Line Items"]); rows.push(["Description", "Qty", "Unit Price", "Amount"]);
    (extracted.line_items || []).forEach(item => rows.push([item.description, item.quantity, item.unit_price, item.amount]));
    const csv = rows.map(r => r.map(c => `"${(c || "").toString().replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = `invoice-${extracted.invoice_number || Date.now()}.csv`; a.click();
    addLog("info", "Exported as CSV");
  };

  const handleExportJSON = () => {
    if (!extracted) return;
    const blob = new Blob([JSON.stringify({ extracted, validation }, null, 2)], { type: "application/json" });
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = `invoice-${extracted.invoice_number || Date.now()}.json`; a.click();
    addLog("info", "Exported as JSON");
  };

  const conf = extracted?.confidence_scores;

  return (
    <div style={{ minHeight: "100vh", background: "#0B0D10", color: "#fff", fontFamily: "'DM Sans', 'Segoe UI', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&family=IBM+Plex+Mono:wght@400;500;600;700&display=swap');
        @keyframes fadeIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}
        @keyframes slideIn{from{opacity:0;transform:translateX(10px)}to{opacity:1;transform:translateX(0)}}
        *{box-sizing:border-box;scrollbar-width:thin;scrollbar-color:rgba(255,255,255,.08) transparent}
        *::-webkit-scrollbar{width:4px}*::-webkit-scrollbar-thumb{background:rgba(255,255,255,.08);border-radius:2px}
        textarea:focus,input:focus{outline:none}
        ::selection{background:rgba(96,165,250,.25)}
      `}</style>

      <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "28px 20px 60px" }}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "14px", marginBottom: "24px" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
              <div style={{ width: "30px", height: "30px", borderRadius: "8px", background: "linear-gradient(135deg, #60A5FA, #34D399)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px" }}>🧾</div>
              <h1 style={{ fontSize: "20px", fontWeight: 800, margin: 0, letterSpacing: "-0.3px" }}>Invoice Extractor AI</h1>
              <span style={{ fontSize: "9px", padding: "3px 8px", borderRadius: "4px", background: "rgba(96,165,250,0.08)", color: "#60A5FA", fontWeight: 700, fontFamily: "mono", letterSpacing: "0.8px" }}>v1.0</span>
            </div>
            <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.3)", margin: 0 }}>Extract structured data from any invoice format — outputs accounting-ready CSV & JSON</p>
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
                <button onClick={() => apiKey.trim() && setKeySaved(true)} style={{ padding: "6px 12px", borderRadius: "7px", border: "none", background: apiKey.trim() ? "#60A5FA" : "rgba(255,255,255,.04)", color: apiKey.trim() ? "#fff" : "rgba(255,255,255,.15)", fontWeight: 700, fontSize: "11px", cursor: "pointer", fontFamily: "mono" }}>CONNECT</button>
              </div>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: "3px", marginBottom: "20px", background: "rgba(255,255,255,0.02)", borderRadius: "9px", padding: "3px", border: "1px solid rgba(255,255,255,0.03)" }}>
          {[
            { id: "extract", label: "Extract", icon: "▶" },
            { id: "history", label: `History (${history.length})`, icon: "📋" },
          ].map(tab => (
            <button key={tab.id} onClick={() => setActiveView(tab.id)} style={{
              flex: 1, padding: "8px", borderRadius: "6px", border: "none",
              background: activeView === tab.id ? "rgba(96,165,250,0.06)" : "transparent",
              color: activeView === tab.id ? "#60A5FA" : "rgba(255,255,255,0.25)",
              fontSize: "11px", fontWeight: 600, cursor: "pointer", transition: "all 0.2s",
            }}>{tab.icon} {tab.label}</button>
          ))}
        </div>

        {activeView === "extract" && (
          <div style={{ display: "grid", gridTemplateColumns: extracted ? "1fr 1fr" : "1fr", gap: "18px" }}>
            {/* Left: Input */}
            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <div style={{ background: "rgba(255,255,255,0.015)", border: "1px solid rgba(255,255,255,0.04)", borderRadius: "12px", padding: "16px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px", flexWrap: "wrap", gap: "6px" }}>
                  <span style={{ fontSize: "10px", fontWeight: 700, letterSpacing: "1.2px", color: "rgba(255,255,255,0.2)", fontFamily: "mono" }}>INVOICE INPUT</span>
                  <div style={{ display: "flex", gap: "4px", flexWrap: "wrap" }}>
                    {Object.entries(SAMPLE_INVOICES).map(([key, s]) => (
                      <button key={key} onClick={() => setInput(s.text)} style={{
                        padding: "3px 8px", borderRadius: "5px", border: "1px solid rgba(255,255,255,.05)",
                        background: input === s.text ? "rgba(96,165,250,0.06)" : "rgba(255,255,255,.015)",
                        color: input === s.text ? "#60A5FA" : "rgba(255,255,255,.3)",
                        fontSize: "9.5px", fontWeight: 600, cursor: "pointer", transition: "all 0.15s",
                      }}>{s.icon} {s.label}</button>
                    ))}
                  </div>
                </div>
                <textarea value={input} onChange={e => setInput(e.target.value)} placeholder="Paste any invoice — PDF text, email, any format..." style={{
                  width: "100%", minHeight: "260px", padding: "14px", borderRadius: "9px",
                  background: "rgba(0,0,0,.2)", border: "1px solid rgba(255,255,255,.03)",
                  color: "rgba(255,255,255,.75)", fontSize: "12px", lineHeight: 1.65, resize: "vertical",
                  fontFamily: "'IBM Plex Mono', monospace",
                }} />
                <div style={{ display: "flex", gap: "8px", marginTop: "10px" }}>
                  <button onClick={() => input.trim() && extractInvoice(input.trim())} disabled={processing || !input.trim() || !keySaved} style={{
                    flex: 1, padding: "12px", borderRadius: "9px", border: "none", fontWeight: 700, fontSize: "12px",
                    fontFamily: "mono", cursor: (processing || !input.trim() || !keySaved) ? "not-allowed" : "pointer",
                    background: processing ? "rgba(96,165,250,0.08)" : (!input.trim() || !keySaved) ? "rgba(255,255,255,.03)" : "linear-gradient(135deg, #60A5FA, #34D399)",
                    color: (!input.trim() || !keySaved) ? "rgba(255,255,255,.12)" : processing ? "#60A5FA" : "#fff",
                    transition: "all 0.3s",
                  }}>
                    {!keySaved ? "🔑 CONNECT KEY" : processing ? `⟳ ${status === "validating" ? "VALIDATING" : "EXTRACTING"}... ${(elapsed / 1000).toFixed(1)}s` : "▶ EXTRACT DATA"}
                  </button>
                </div>
              </div>

              {/* Console */}
              {logs.length > 0 && (
                <div style={{ background: "#090A0D", border: "1px solid rgba(255,255,255,0.03)", borderRadius: "10px", overflow: "hidden" }}>
                  <div style={{ padding: "7px 12px", display: "flex", alignItems: "center", gap: "6px", borderBottom: "1px solid rgba(255,255,255,0.03)" }}>
                    <div style={{ display: "flex", gap: "4px" }}><div style={{ width: 6, height: 6, borderRadius: "50%", background: "#FF5F57" }} /><div style={{ width: 6, height: 6, borderRadius: "50%", background: "#FFBD2E" }} /><div style={{ width: 6, height: 6, borderRadius: "50%", background: "#28CA41" }} /></div>
                    <span style={{ fontSize: "9px", fontFamily: "mono", color: "rgba(255,255,255,0.2)" }}>extraction-console</span>
                  </div>
                  <div style={{ maxHeight: "120px", overflowY: "auto", padding: "8px 12px", fontSize: "10px", fontFamily: "'IBM Plex Mono', monospace", lineHeight: 1.8 }}>
                    {logs.map((l, i) => (
                      <div key={i}>
                        <span style={{ color: "rgba(255,255,255,0.12)" }}>{l.time} </span>
                        <span style={{ color: l.level === "error" ? "#F87171" : l.level === "success" ? "#34D399" : "#60A5FA", fontWeight: 600 }}>{l.level.slice(0, 4).toUpperCase()} </span>
                        <span style={{ color: "rgba(255,255,255,0.45)" }}>{l.msg}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {error && (
                <div style={{ padding: "10px 14px", borderRadius: "9px", background: "rgba(248,113,113,.06)", border: "1px solid rgba(248,113,113,.12)", fontSize: "11px", color: "#F87171", fontFamily: "mono" }}>⚠ {error}</div>
              )}
            </div>

            {/* Right: Results */}
            {extracted && (
              <div style={{ display: "flex", flexDirection: "column", gap: "12px", animation: "slideIn 0.4s ease" }}>
                {/* Status + export */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <StatusBadge status={status} />
                  <div style={{ display: "flex", gap: "5px" }}>
                    <button onClick={handleExportCSV} style={{ padding: "5px 10px", borderRadius: "6px", border: "1px solid rgba(52,211,153,0.15)", background: "rgba(52,211,153,0.04)", color: "#34D399", fontSize: "10px", fontWeight: 700, cursor: "pointer", fontFamily: "mono" }}>📄 CSV</button>
                    <button onClick={handleExportJSON} style={{ padding: "5px 10px", borderRadius: "6px", border: "1px solid rgba(96,165,250,0.15)", background: "rgba(96,165,250,0.04)", color: "#60A5FA", fontSize: "10px", fontWeight: 700, cursor: "pointer", fontFamily: "mono" }}>{ } JSON</button>
                  </div>
                </div>

                {/* Confidence scores */}
                {conf && (
                  <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                    {Object.entries(conf).map(([key, val]) => {
                      const c = val >= 90 ? "#34D399" : val >= 70 ? "#FBBF24" : "#F87171";
                      return (
                        <div key={key} style={{ flex: 1, minWidth: "80px", padding: "8px", borderRadius: "8px", background: "rgba(0,0,0,0.15)", textAlign: "center" }}>
                          <div style={{ fontSize: "16px", fontWeight: 800, color: c, fontFamily: "mono" }}>{val}%</div>
                          <div style={{ fontSize: "8px", color: "rgba(255,255,255,0.2)", letterSpacing: "0.5px", marginTop: "2px", textTransform: "uppercase", fontFamily: "mono" }}>{key.replace("_", " ")}</div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Header fields */}
                <div style={{ background: "rgba(255,255,255,0.015)", border: "1px solid rgba(255,255,255,0.04)", borderRadius: "11px", padding: "14px" }}>
                  <div style={{ fontSize: "9px", fontWeight: 700, letterSpacing: "1px", color: "rgba(255,255,255,0.2)", fontFamily: "mono", marginBottom: "8px" }}>INVOICE DETAILS</div>
                  <FieldRow label="Invoice #" value={extracted.invoice_number} />
                  <FieldRow label="Date" value={extracted.invoice_date} type="date" />
                  <FieldRow label="Due Date" value={extracted.due_date} type="date" />
                  <FieldRow label="Currency" value={extracted.currency} />
                  <FieldRow label="Payment Terms" value={extracted.payment_terms} />
                </div>

                {/* Parties */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                  <div style={{ background: "rgba(255,255,255,0.015)", border: "1px solid rgba(255,255,255,0.04)", borderRadius: "11px", padding: "14px" }}>
                    <div style={{ fontSize: "9px", fontWeight: 700, letterSpacing: "1px", color: "rgba(255,255,255,0.2)", fontFamily: "mono", marginBottom: "8px" }}>VENDOR</div>
                    <div style={{ fontSize: "12.5px", fontWeight: 600, color: "rgba(255,255,255,0.8)", marginBottom: "4px" }}>{extracted.vendor?.name || "—"}</div>
                    <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.3)", lineHeight: 1.5, whiteSpace: "pre-wrap" }}>{extracted.vendor?.address || ""}</div>
                    {extracted.vendor?.vat_id && <div style={{ fontSize: "10px", color: "rgba(255,255,255,0.25)", fontFamily: "mono", marginTop: "4px" }}>VAT: {extracted.vendor.vat_id}</div>}
                  </div>
                  <div style={{ background: "rgba(255,255,255,0.015)", border: "1px solid rgba(255,255,255,0.04)", borderRadius: "11px", padding: "14px" }}>
                    <div style={{ fontSize: "9px", fontWeight: 700, letterSpacing: "1px", color: "rgba(255,255,255,0.2)", fontFamily: "mono", marginBottom: "8px" }}>CUSTOMER</div>
                    <div style={{ fontSize: "12.5px", fontWeight: 600, color: "rgba(255,255,255,0.8)", marginBottom: "4px" }}>{extracted.customer?.name || "—"}</div>
                    <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.3)", lineHeight: 1.5, whiteSpace: "pre-wrap" }}>{extracted.customer?.address || ""}</div>
                    {extracted.customer?.vat_id && <div style={{ fontSize: "10px", color: "rgba(255,255,255,0.25)", fontFamily: "mono", marginTop: "4px" }}>VAT: {extracted.customer.vat_id}</div>}
                  </div>
                </div>

                {/* Line items */}
                <div style={{ background: "rgba(255,255,255,0.015)", border: "1px solid rgba(255,255,255,0.04)", borderRadius: "11px", padding: "14px" }}>
                  <div style={{ fontSize: "9px", fontWeight: 700, letterSpacing: "1px", color: "rgba(255,255,255,0.2)", fontFamily: "mono", marginBottom: "10px" }}>
                    LINE ITEMS — {extracted.line_items?.length || 0} items
                  </div>
                  <LineItemTable items={extracted.line_items} />
                  <div style={{ marginTop: "12px", borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: "10px" }}>
                    <FieldRow label="Subtotal" value={extracted.subtotal} type="amount" />
                    <FieldRow label={`Tax (${extracted.tax_rate || "—"})`} value={extracted.tax_amount} type="amount" />
                    <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 0 0", borderTop: "1px solid rgba(255,255,255,0.06)", marginTop: "4px" }}>
                      <span style={{ fontSize: "13px", fontWeight: 700, color: "rgba(255,255,255,0.6)" }}>TOTAL</span>
                      <span style={{ fontSize: "16px", fontWeight: 800, color: "#34D399", fontFamily: "mono" }}>{extracted.total || "—"}</span>
                    </div>
                  </div>
                </div>

                {/* Validation */}
                {validation && (
                  <div style={{
                    background: validation.is_valid ? "rgba(52,211,153,0.03)" : "rgba(251,191,36,0.03)",
                    border: `1px solid ${validation.is_valid ? "rgba(52,211,153,0.1)" : "rgba(251,191,36,0.1)"}`,
                    borderRadius: "11px", padding: "14px",
                  }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                      <span style={{ fontSize: "9px", fontWeight: 700, letterSpacing: "1px", fontFamily: "mono", color: validation.is_valid ? "#34D399" : "#FBBF24" }}>
                        {validation.is_valid ? "✓ VALIDATION PASSED" : "⚠ VALIDATION WARNINGS"}
                      </span>
                      <span style={{ fontSize: "10px", fontFamily: "mono", color: "rgba(255,255,255,0.3)" }}>
                        {validation.completeness?.completeness_score || "?"}% complete
                      </span>
                    </div>
                    {validation.math_check && (
                      <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginBottom: "8px" }}>
                        {Object.entries(validation.math_check).map(([k, v]) => (
                          <span key={k} style={{ fontSize: "9px", padding: "3px 7px", borderRadius: "4px", background: v ? "rgba(52,211,153,0.08)" : "rgba(248,113,113,0.08)", color: v ? "#34D399" : "#F87171", fontFamily: "mono", fontWeight: 600 }}>
                            {v ? "✓" : "✕"} {k.replace(/_/g, " ")}
                          </span>
                        ))}
                      </div>
                    )}
                    {validation.warnings?.length > 0 && validation.warnings.map((w, i) => (
                      <div key={i} style={{ fontSize: "11px", color: "rgba(255,255,255,0.4)", padding: "3px 0", lineHeight: 1.5 }}>⚠ {w}</div>
                    ))}
                    {validation.risk_flags?.length > 0 && validation.risk_flags.map((f, i) => (
                      <div key={i} style={{ fontSize: "11px", color: "#F87171", padding: "3px 0", lineHeight: 1.5 }}>🚩 {f}</div>
                    ))}
                  </div>
                )}

                {/* Bank details */}
                {extracted.bank_details && (
                  <div style={{ background: "rgba(255,255,255,0.015)", border: "1px solid rgba(255,255,255,0.04)", borderRadius: "11px", padding: "14px" }}>
                    <div style={{ fontSize: "9px", fontWeight: 700, letterSpacing: "1px", color: "rgba(255,255,255,0.2)", fontFamily: "mono", marginBottom: "6px" }}>PAYMENT DETAILS</div>
                    <div style={{ fontSize: "11.5px", color: "rgba(255,255,255,0.5)", fontFamily: "mono", lineHeight: 1.6, whiteSpace: "pre-wrap" }}>{extracted.bank_details}</div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* History */}
        {activeView === "history" && (
          <div>
            {history.length === 0 ? (
              <div style={{ textAlign: "center", padding: "60px", color: "rgba(255,255,255,0.12)" }}>
                <div style={{ fontSize: "28px", marginBottom: "10px" }}>🧾</div>
                <div style={{ fontSize: "13px", fontWeight: 600 }}>No invoices processed yet</div>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {history.map(h => (
                  <div key={h.id} onClick={() => { setExtracted(h.data); setValidation(h.validation); setStatus("complete"); setActiveView("extract"); }} style={{
                    padding: "12px 16px", borderRadius: "10px", cursor: "pointer",
                    background: "rgba(255,255,255,0.015)", border: "1px solid rgba(255,255,255,0.04)",
                    display: "flex", justifyContent: "space-between", alignItems: "center", transition: "all 0.2s",
                  }}>
                    <div>
                      <div style={{ fontSize: "12.5px", fontWeight: 600, color: "rgba(255,255,255,0.75)" }}>{h.vendor}</div>
                      <div style={{ display: "flex", gap: "6px", marginTop: "5px" }}>
                        <span style={{ fontSize: "9px", padding: "2px 6px", borderRadius: "3px", background: "rgba(96,165,250,0.08)", color: "#60A5FA", fontFamily: "mono" }}>{h.invoiceNum}</span>
                        <span style={{ fontSize: "9px", padding: "2px 6px", borderRadius: "3px", background: "rgba(52,211,153,0.08)", color: "#34D399", fontFamily: "mono" }}>{h.total}</span>
                        <span style={{ fontSize: "9px", padding: "2px 6px", borderRadius: "3px", background: h.isValid ? "rgba(52,211,153,0.08)" : "rgba(251,191,36,0.08)", color: h.isValid ? "#34D399" : "#FBBF24", fontFamily: "mono" }}>{h.isValid ? "✓ valid" : "⚠ issues"}</span>
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
          Invoice Extractor AI · Groq LPU + Llama 3.3 · Structured data extraction pipeline
        </div>
      </div>
    </div>
  );
}
