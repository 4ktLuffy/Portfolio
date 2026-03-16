import React, { useState, useEffect } from 'react'
import ReactDOM from 'react-dom/client'
import Portfolio from './Portfolio.jsx'
import SupportTriage from './SupportTriage.jsx'
import InvoiceExtractor from './InvoiceExtractor.jsx'
import MeetingPipeline from './MeetingPipeline.jsx'
import ESGCommandCenter from './ESGCommandCenter.jsx'

function App() {
  const [route, setRoute] = useState(window.location.hash || '#/')

  useEffect(() => {
    const onHash = () => setRoute(window.location.hash || '#/')
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])

  // Global navigate so Portfolio project cards can link to demos
  window.__navigate = (hash) => {
    window.location.hash = hash
    window.scrollTo(0, 0)
  }

  if (route === '#/demo/support-triage') {
    return (
      <DemoWrapper title="AI Support Ticket Triage">
        <SupportTriage />
      </DemoWrapper>
    )
  }

  if (route === '#/demo/invoice-extractor') {
    return (
      <DemoWrapper title="Invoice Extractor AI">
        <InvoiceExtractor />
      </DemoWrapper>
    )
  }

  if (route === '#/demo/meeting-pipeline') {
    return (
      <DemoWrapper title="Meeting → Actions AI">
        <MeetingPipeline />
      </DemoWrapper>
    )
  }

  if (route === '#/demo/esg-command-center') {
    return (
      <DemoWrapper title="ESG Compliance Command Center">
        <ESGCommandCenter />
      </DemoWrapper>
    )
  }

  return <Portfolio />
}

function DemoWrapper({ title, children }) {
  return (
    <div>
      <div style={{
        position: "sticky", top: 0, zIndex: 999, padding: "10px 24px",
        background: "rgba(10,10,12,0.92)", backdropFilter: "blur(12px)",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
        display: "flex", justifyContent: "space-between", alignItems: "center",
      }}>
        <a href="#/" style={{
          display: "flex", alignItems: "center", gap: "8px",
          color: "#00FF9D", textDecoration: "none", fontSize: "12px",
          fontFamily: "'IBM Plex Mono', monospace", fontWeight: 600,
          padding: "4px 12px", borderRadius: "6px",
          background: "rgba(0,255,157,0.06)", border: "1px solid rgba(0,255,157,0.15)",
          transition: "all 0.2s",
        }}>
          ← Portfolio
        </a>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{
            fontSize: "9px", padding: "3px 8px", borderRadius: "4px",
            background: "rgba(0,255,157,0.08)", color: "#00FF9D",
            fontWeight: 700, fontFamily: "'IBM Plex Mono', monospace",
            letterSpacing: "0.8px",
          }}>
            ● LIVE DEMO
          </span>
          <span style={{
            fontSize: "11px", color: "rgba(255,255,255,0.35)",
            fontFamily: "'IBM Plex Mono', monospace",
          }}>
            {title}
          </span>
        </div>
      </div>
      {children}
    </div>
  )
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
