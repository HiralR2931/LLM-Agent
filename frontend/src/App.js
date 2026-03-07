import { useState } from "react";
import axios from "axios";

const API = "http://localhost:5002";

const MODES = [
  { id: "analyze", label: "Full Analysis", icon: "⚡", desc: "Summary + Extract + Insights", color: "#7c3aed" },
  { id: "summarize", label: "Summarize", icon: "📋", desc: "Structured summary", color: "#0ea5e9" },
  { id: "extract", label: "Extract Data", icon: "🔍", desc: "Names, dates, orgs", color: "#10b981" },
  { id: "ask", label: "Ask Anything", icon: "💬", desc: "Doc Q&A + General AI", color: "#f59e0b" },
  { id: "improve", label: "Improve Content", icon: "✨", desc: "AI writing suggestions", color: "#e11d48" },
];

const IMPROVE_TYPES = [
  { id: "general", label: "General Writing" },
  { id: "resume", label: "Resume" },
  { id: "email", label: "Email" },
  { id: "report", label: "Report" },
  { id: "bio", label: "Bio / Profile" },
];

export default function App() {
  const [mode, setMode] = useState("analyze");
  const [file, setFile] = useState(null);
  const [question, setQuestion] = useState("");
  const [improveContent, setImproveContent] = useState("");
  const [improveType, setImproveType] = useState("general");
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const activeMode = MODES.find(m => m.id === mode);

  const handleFile = (f) => { setFile(f); setResult(null); setError(null); };
  const handleDrop = (e) => {
    e.preventDefault(); setDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  };

  const handleSubmit = async () => {
    setLoading(true); setError(null); setResult(null);
    try {
      // Content improver — no file needed
      if (mode === "improve") {
        if (!improveContent.trim()) { setError("Please enter some content to improve."); setLoading(false); return; }
        const res = await axios.post(`${API}/api/improve`, { content: improveContent, type: improveType });
        setResult(res.data); setLoading(false); return;
      }

      // Ask mode — file optional
      if (mode === "ask") {
        if (!question.trim()) { setError("Please enter a question."); setLoading(false); return; }
        const formData = new FormData();
        formData.append("question", question);
        if (file) formData.append("file", file);
        const res = await axios.post(`${API}/api/ask`, formData, { headers: { "Content-Type": "multipart/form-data" } });
        setResult(res.data); setLoading(false); return;
      }

      // All other modes — file required
      if (!file) { setError("Please upload a file first."); setLoading(false); return; }
      const formData = new FormData();
      formData.append("file", file);
      const res = await axios.post(`${API}/api/${mode}`, formData, { headers: { "Content-Type": "multipart/form-data" } });
      setResult(res.data);
    } catch (err) {
      setError(err.response?.data?.error || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc", fontFamily: "'Segoe UI', system-ui, sans-serif" }}>

      {/* Nav */}
      <nav style={{ background: "#fff", borderBottom: "1px solid #e2e8f0", padding: "0 48px", height: 72, display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 100 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <img 
          src="https://raw.githubusercontent.com/HiralR2931/LLM-Agent/main/frontend/public/logo.png" 
          alt="DocuMind" 
          style={{ height: 56, objectFit: "contain" }} 
        />
          <span style={{ background: "#7c3aed15", color: "#7c3aed", fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 20, letterSpacing: 1 }}>AI AGENT</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "#64748b" }}>
          <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#10b981", boxShadow: "0 0 6px #10b981" }} />
          Powered by Groq · LLaMA 3
        </div>
      </nav>

      <div style={{ maxWidth: 860, margin: "0 auto", padding: "48px 24px" }}>

        {/* Hero */}
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "#7c3aed10", border: "1px solid #7c3aed30", borderRadius: 20, padding: "4px 14px", fontSize: 11, color: "#7c3aed", fontWeight: 600, letterSpacing: 1, marginBottom: 20 }}>
            ✦ RAG-POWERED DOCUMENT INTELLIGENCE
          </div>
          <h1 style={{ fontSize: 44, fontWeight: 900, color: "#0f172a", margin: "0 0 12px", letterSpacing: -1.5, lineHeight: 1.1 }}>
            Understand any document<br />
            <span style={{ background: "linear-gradient(135deg, #7c3aed, #0ea5e9)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>in seconds</span>
          </h1>
          <p style={{ fontSize: 16, color: "#64748b", margin: 0 }}>Upload a PDF · Summarize · Extract · Ask Questions · Improve Writing</p>
        </div>

        {/* Main card */}
        <div style={{ background: "#fff", borderRadius: 24, border: "1px solid #e2e8f0", boxShadow: "0 4px 24px rgba(0,0,0,0.06)", overflow: "hidden" }}>

          {/* Mode tabs */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", borderBottom: "1px solid #e2e8f0" }}>
            {MODES.map(m => (
              <button key={m.id} onClick={() => { setMode(m.id); setResult(null); setError(null); }}
                style={{ background: mode === m.id ? `${m.color}08` : "transparent", border: "none", borderBottom: mode === m.id ? `2px solid ${m.color}` : "2px solid transparent", padding: "16px 8px", cursor: "pointer", transition: "all 0.15s" }}>
                <div style={{ fontSize: 18, marginBottom: 4 }}>{m.icon}</div>
                <div style={{ fontSize: 11, fontWeight: 700, color: mode === m.id ? m.color : "#475569" }}>{m.label}</div>
                <div style={{ fontSize: 9, color: "#94a3b8", marginTop: 2 }}>{m.desc}</div>
              </button>
            ))}
          </div>

          <div style={{ padding: 32 }}>

            {/* IMPROVE MODE — textarea input */}
            {mode === "improve" ? (
              <div>
                {/* Improve type selector */}
                <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
                  {IMPROVE_TYPES.map(t => (
                    <button key={t.id} onClick={() => setImproveType(t.id)}
                      style={{ padding: "6px 14px", borderRadius: 20, border: `1px solid ${improveType === t.id ? "#e11d48" : "#e2e8f0"}`, background: improveType === t.id ? "#e11d4810" : "#fff", color: improveType === t.id ? "#e11d48" : "#64748b", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
                      {t.label}
                    </button>
                  ))}
                </div>
                <textarea
                  value={improveContent}
                  onChange={(e) => setImproveContent(e.target.value)}
                  placeholder="Paste your content here — resume bullet, email, bio, report section..."
                  rows={8}
                  style={{ width: "100%", padding: 16, borderRadius: 12, border: `1.5px solid ${improveContent ? "#e11d48" : "#e2e8f0"}`, fontSize: 14, color: "#0f172a", background: "#fafafa", outline: "none", boxSizing: "border-box", fontFamily: "inherit", resize: "vertical", lineHeight: 1.6, transition: "border 0.2s", marginBottom: 16 }}
                />
              </div>
            ) : (
              <>
                {/* Upload zone — file optional for Ask mode */}
                <div
                  onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                  onDragLeave={() => setDragging(false)}
                  onDrop={handleDrop}
                  onClick={() => document.getElementById("fileInput").click()}
                  style={{ border: `2px dashed ${dragging ? activeMode.color : file ? activeMode.color + "66" : "#e2e8f0"}`, borderRadius: 16, padding: "28px 24px", textAlign: "center", background: file ? `${activeMode.color}05` : "#fafafa", cursor: "pointer", transition: "all 0.2s", marginBottom: 16 }}>
                  <input id="fileInput" type="file" accept=".pdf,.txt" style={{ display: "none" }} onChange={(e) => handleFile(e.target.files[0])} />
                  {file ? (
                    <div>
                      <div style={{ fontSize: 28, marginBottom: 6 }}>✅</div>
                      <div style={{ fontWeight: 700, color: "#0f172a", fontSize: 14 }}>{file.name}</div>
                      <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 4 }}>{(file.size / 1024).toFixed(1)} KB · Click to change</div>
                    </div>
                  ) : (
                    <div>
                      <div style={{ fontSize: 32, marginBottom: 8 }}>📂</div>
                      <div style={{ fontWeight: 600, color: "#334155", fontSize: 14, marginBottom: 4 }}>
                        {mode === "ask" ? "Drop a document (optional)" : "Drop your document here"}
                      </div>
                      <div style={{ fontSize: 12, color: "#94a3b8" }}>
                        {mode === "ask" ? "Ask with or without a document · PDF or TXT" : "PDF or TXT · Click to browse"}
                      </div>
                    </div>
                  )}
                </div>

                {/* Question input */}
                {mode === "ask" && (
                  <div style={{ marginBottom: 16, position: "relative" }}>
                    <input
                      value={question}
                      onChange={(e) => setQuestion(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                      placeholder="Ask anything — about your document or any topic..."
                      style={{ width: "100%", padding: "14px 48px 14px 16px", borderRadius: 12, border: `1.5px solid ${question ? "#f59e0b" : "#e2e8f0"}`, fontSize: 14, color: "#0f172a", background: "#fff", outline: "none", boxSizing: "border-box", fontFamily: "inherit", transition: "border 0.2s" }}
                    />
                    <span style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", fontSize: 16 }}>💬</span>
                  </div>
                )}
              </>
            )}

            {/* Submit button */}
            <button onClick={handleSubmit} disabled={loading}
              style={{ width: "100%", padding: "15px", borderRadius: 12, border: "none", background: loading ? "#e2e8f0" : `linear-gradient(135deg, ${activeMode.color}, ${activeMode.color}cc)`, color: loading ? "#94a3b8" : "#fff", fontSize: 14, fontWeight: 700, cursor: loading ? "not-allowed" : "pointer", letterSpacing: 0.5, transition: "all 0.2s", boxShadow: loading ? "none" : `0 4px 14px ${activeMode.color}44` }}>
              {loading ? "⏳  Processing..." : `${activeMode.icon}  Run ${activeMode.label}`}
            </button>

            {error && (
              <div style={{ marginTop: 16, padding: "12px 16px", background: "#fff1f2", border: "1px solid #fecdd3", borderRadius: 10, fontSize: 13, color: "#e11d48" }}>
                ❌ {error}
              </div>
            )}
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div style={{ textAlign: "center", padding: "48px 0" }}>
            <div style={{ fontSize: 36, marginBottom: 12 }}>🧠</div>
            <div style={{ fontWeight: 600, color: "#334155", marginBottom: 6 }}>AI is processing...</div>
            <div style={{ fontSize: 13, color: "#94a3b8" }}>Running LLaMA 3 via Groq · RAG Pipeline Active</div>
          </div>
        )}

        {/* Results */}
        {result && !loading && (
          <div style={{ marginTop: 24, display: "flex", flexDirection: "column", gap: 16 }}>

            {/* Stats */}
            {(result.word_count || result.chunks_searched !== undefined) && (
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                {result.word_count && <Chip label="Words" value={result.word_count.toLocaleString()} color={activeMode.color} />}
                {result.char_count && <Chip label="Characters" value={result.char_count.toLocaleString()} color={activeMode.color} />}
                {result.chunks_searched > 0 && <Chip label="Chunks Searched" value={result.chunks_searched} color={activeMode.color} />}
                {result.source && <Chip label="Source" value={result.source} color={activeMode.color} />}
              </div>
            )}

            {/* Summary */}
            {result.summary && <ResultCard title="📋 Summary" color="#0ea5e9" content={result.summary} />}

            {/* Answer */}
            {result.answer && (
              <ResultCard title="💬 Answer" color="#f59e0b" content={result.answer}>
                <div style={{ fontSize: 12, color: "#94a3b8", marginBottom: 12, padding: "8px 12px", background: "#fafafa", borderRadius: 8 }}>
                  Q: {result.question}
                </div>
              </ResultCard>
            )}

            {/* Extracted Data */}
            {result.extracted_data && (
              <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #e2e8f0", padding: 24, boxShadow: "0 2px 12px rgba(0,0,0,0.04)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20 }}>
                  <div style={{ width: 3, height: 18, background: "#10b981", borderRadius: 2 }} />
                  <span style={{ fontWeight: 700, fontSize: 14, color: "#0f172a" }}>🔍 Extracted Data</span>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 12 }}>
                  {Object.entries(result.extracted_data).map(([key, values]) =>
                    Array.isArray(values) && values.length > 0 && (
                      <div key={key} style={{ background: "#f8fafc", borderRadius: 10, padding: 14, border: "1px solid #e2e8f0" }}>
                        <div style={{ fontSize: 10, fontWeight: 700, color: "#94a3b8", letterSpacing: 1.5, marginBottom: 10, textTransform: "uppercase" }}>{key.replace(/_/g, " ")}</div>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                          {values.map((v, i) => (
                            <span key={i} style={{ background: "#10b98115", border: "1px solid #10b98133", color: "#059669", borderRadius: 6, padding: "3px 10px", fontSize: 12, fontWeight: 500 }}>{v}</span>
                          ))}
                        </div>
                      </div>
                    )
                  )}
                  {result.extracted_data.raw && (
                    <div style={{ gridColumn: "1/-1", background: "#f8fafc", borderRadius: 10, padding: 14 }}>
                      <pre style={{ fontSize: 12, color: "#475569", whiteSpace: "pre-wrap", margin: 0 }}>{result.extracted_data.raw}</pre>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Insights */}
            {result.insights && <ResultCard title="💡 Key Insights" color="#f59e0b" content={result.insights} />}

            {/* Improved content */}
            {result.improved && (
              <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #e2e8f0", padding: 24, boxShadow: "0 2px 12px rgba(0,0,0,0.04)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20 }}>
                  <div style={{ width: 3, height: 18, background: "#e11d48", borderRadius: 2 }} />
                  <span style={{ fontWeight: 700, fontSize: 14, color: "#0f172a" }}>✨ AI Improved Version</span>
                  <span style={{ marginLeft: "auto", background: "#e11d4810", color: "#e11d48", fontSize: 11, fontWeight: 600, padding: "2px 10px", borderRadius: 20 }}>{result.type}</span>
                </div>
                <div style={{ background: "#fafafa", borderRadius: 10, padding: 16, marginBottom: 12 }}>
                  <div style={{ fontSize: 11, color: "#94a3b8", marginBottom: 8, fontWeight: 600, letterSpacing: 1 }}>ORIGINAL</div>
                  <p style={{ fontSize: 13, color: "#94a3b8", margin: 0, lineHeight: 1.7 }}>{result.original}</p>
                </div>
                <p style={{ fontSize: 14, color: "#475569", lineHeight: 1.8, margin: 0, whiteSpace: "pre-wrap" }}>{result.improved}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function ResultCard({ title, color, content, children }) {
  return (
    <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #e2e8f0", padding: 24, boxShadow: "0 2px 12px rgba(0,0,0,0.04)" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
        <div style={{ width: 3, height: 18, background: color, borderRadius: 2 }} />
        <span style={{ fontWeight: 700, fontSize: 14, color: "#0f172a" }}>{title}</span>
      </div>
      {children}
      <p style={{ fontSize: 14, color: "#475569", lineHeight: 1.8, margin: 0, whiteSpace: "pre-wrap" }}>{content}</p>
    </div>
  );
}

function Chip({ label, value, color }) {
  return (
    <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 8, padding: "6px 14px", fontSize: 12, color: "#64748b", display: "flex", gap: 6, alignItems: "center" }}>
      {label}: <span style={{ color, fontWeight: 700 }}>{value}</span>
    </div>
  );
}