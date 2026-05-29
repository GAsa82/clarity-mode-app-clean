import { useState, useRef, useEffect, type ChangeEvent, type DragEvent } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { WhatsAppChat } from "@/components/WhatsAppChat";
import {
  healthCheck,
  uploadDiary,
  uploadFile,
  chatWithAI,
  getDashboard,
  getPatterns,
  type HealthStatus,
  type DashboardStats,
  type UploadResult,
} from "@/lib/clarity-ai-api";

// ─── Tab Navigation ──────────────────────────────────────────────────────────

type Tab = "upload" | "dashboard" | "chat";

const tabs: { id: Tab; label: string; icon: string }[] = [
  { id: "upload", label: "Upload", icon: "📤" },
  { id: "dashboard", label: "Dashboard", icon: "📊" },
  { id: "chat", label: "Chat", icon: "💬" },
];

// ─── AI Page ─────────────────────────────────────────────────────────────────

export default function AIPage() {
  const [activeTab, setActiveTab] = useState<Tab>("upload");
  const [backendStatus, setBackendStatus] = useState<HealthStatus | null>(null);
  const [statusError, setStatusError] = useState(false);

  useEffect(() => {
    healthCheck()
      .then((h) => {
        setBackendStatus(h);
        setStatusError(false);
      })
      .catch(() => {
        setStatusError(true);
        setBackendStatus(null);
      });
  }, []);

  return (
    <main className="relative z-0 min-h-screen bg-transparent overflow-x-hidden">
      <Navbar />

      <div className="pt-28 pb-12 px-4">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-sm font-medium mb-4">
              <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
              Clarity AI
            </div>
            <h1 className="text-3xl md:text-4xl font-bold mb-3">
              Your AI-Powered{" "}
              <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                Diary Analyzer
              </span>
            </h1>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Upload diary entries, discover emotional patterns, and chat with an AI
              that understands your journey.
            </p>
          </div>

          {/* Backend Status */}
          <div className="flex items-center justify-center gap-2 mb-6 text-sm">
            <span className="text-muted-foreground">API:</span>
            {statusError ? (
              <span className="text-red-400 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-red-400" />
                Offline — Start the backend server on port 8000
              </span>
            ) : backendStatus ? (
              <span className="text-green-400 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-green-400" />
                Online ({backendStatus.version})
              </span>
            ) : (
              <span className="text-yellow-400 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-yellow-400" />
                Checking...
              </span>
            )}
          </div>

          {/* Tabs */}
          <div className="flex items-center justify-center gap-2 mb-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                  activeTab === tab.id
                    ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/25"
                    : "bg-white/5 text-muted-foreground hover:text-foreground hover:bg-white/10 border border-white/10"
                }`}
              >
                <span className="mr-1.5">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="glass rounded-2xl border border-white/10 p-6 md:p-8">
            {activeTab === "upload" && <UploadSection />}
            {activeTab === "dashboard" && <DashboardSection />}
            {activeTab === "chat" && <ChatSection />}
          </div>
        </div>
      </div>

      <Footer />
      <WhatsAppChat />
    </main>
  );
}

// ─── Upload Section ──────────────────────────────────────────────────────────

function UploadSection() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<UploadResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = (f: File) => {
    const allowed = [".jpg", ".jpeg", ".png", ".gif", ".webp", ".pdf", ".txt"];
    const ext = "." + f.name.split(".").pop()?.toLowerCase();
    if (!allowed.includes(ext)) {
      setError(`Unsupported file type: ${ext}. Allowed: ${allowed.join(", ")}`);
      setFile(null);
      return;
    }
    setFile(f);
    setError(null);
    setResult(null);
  };

  const onChange = (e: ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) handleFile(f);
  };

  const onDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files?.[0];
    if (f) handleFile(f);
  };

  const onDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(true);
  };

  const onSubmitQuick = async () => {
    if (!file) return;
    setUploading(true);
    setError(null);
    setResult(null);
    try {
      const r = await uploadDiary(file);
      setResult(r);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const onSubmitFull = async () => {
    if (!file) return;
    setUploading(true);
    setError(null);
    setResult(null);
    try {
      const r = await uploadFile(file);
      setResult({
        success: r.status === "completed",
        filename: r.filename,
        saved_as: r.file_id,
        size_bytes: 0,
        message:
          r.status === "completed"
            ? `Processed: ${r.chunks_count ?? 0} chunks`
            : r.error || r.status,
      });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-xl font-bold mb-2">Upload Diary Entry</h2>
      <p className="text-muted-foreground text-sm mb-6">
        Upload handwritten diary pages (images or PDFs) for AI-powered analysis.
      </p>

      {/* Drop zone */}
      <div
        className={`border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all duration-200 ${
          dragOver
            ? "border-indigo-400 bg-indigo-500/10"
            : "border-white/20 hover:border-white/40"
        }`}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onDragLeave={() => setDragOver(false)}
        onClick={() => inputRef.current?.click()}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".jpg,.jpeg,.png,.gif,.webp,.pdf,.txt"
          onChange={onChange}
          className="hidden"
        />
        <div className="text-4xl mb-3">📄</div>
        <p className="text-foreground font-medium">
          {file ? file.name : "Drop your diary entry here, or click to browse"}
        </p>
        <p className="text-muted-foreground text-sm mt-1">
          JPG, PNG, PDF, TXT supported
        </p>
      </div>

      {/* File info */}
      {file && (
        <div className="mt-4 p-3 rounded-lg bg-white/5 border border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm text-foreground">{file.name}</span>
            <span className="text-xs text-muted-foreground">
              ({(file.size / 1024).toFixed(1)} KB)
            </span>
          </div>
          <button
            onClick={() => {
              setFile(null);
              setResult(null);
              setError(null);
            }}
            className="text-xs text-muted-foreground hover:text-red-400 transition-colors"
          >
            Remove
          </button>
        </div>
      )}

      {/* Action buttons */}
      {file && (
        <div className="mt-4 flex gap-3">
          <button
            onClick={onSubmitQuick}
            disabled={uploading}
            className="flex-1 px-4 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 transition-colors font-medium"
          >
            {uploading ? "Uploading..." : "Quick Upload (save only)"}
          </button>
          <button
            onClick={onSubmitFull}
            disabled={uploading}
            className="flex-1 px-4 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 transition-colors font-medium"
          >
            {uploading ? "Processing..." : "Full Pipeline (OCR + AI)"}
          </button>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="mt-4 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* Result */}
      {result && (
        <div className="mt-4 p-4 rounded-lg bg-white/5 border border-white/10">
          <h3 className="text-sm font-semibold text-green-400 mb-2">
            {result.success ? "✓ Upload Successful" : "⚠ Upload Completed"}
          </h3>
          <div className="text-xs text-muted-foreground space-y-1">
            <p>File: {result.filename}</p>
            <p>Saved as: {result.saved_as}</p>
            {result.size_bytes > 0 && (
              <p>Size: {(result.size_bytes / 1024).toFixed(1)} KB</p>
            )}
            <p className="text-muted-foreground mt-2">{result.message}</p>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Dashboard Section ───────────────────────────────────────────────────────

function DashboardSection() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [patterns, setPatterns] = useState<{
    period: string;
    patterns: { type: string; data: Record<string, number> }[];
    emotional_trends: Record<string, unknown>;
    insights: string[];
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([getDashboard(), getPatterns()])
      .then(([s, p]) => {
        setStats(s);
        setPatterns(p);
      })
      .catch((err) =>
        setError(err instanceof Error ? err.message : "Failed to load")
      )
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-pulse text-muted-foreground">
          Loading dashboard...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto p-6 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400">
        {error}
        <p className="text-sm mt-2 text-muted-foreground">
          Make sure the backend server is running on port 8000.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold">Dashboard</h2>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard label="Total Entries" value={stats?.total_entries ?? 0} />
        <MetricCard label="Total Chunks" value={stats?.total_chunks ?? 0} />
        <MetricCard
          label="Top Emotion"
          value={stats?.top_emotions?.[0]?.emotion ?? "—"}
        />
        <MetricCard
          label="Top Theme"
          value={stats?.top_themes?.[0]?.theme ?? "—"}
        />
      </div>

      {/* Emotions */}
      <Section title="Top Emotions">
        {stats?.top_emotions?.length ? (
          <div className="flex flex-wrap gap-2">
            {stats.top_emotions.map((e) => (
              <span
                key={e.emotion}
                className="px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-sm"
              >
                {e.emotion}{" "}
                <span className="text-indigo-400 ml-1">{e.count}</span>
              </span>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground text-sm">
            No emotions detected yet.
          </p>
        )}
      </Section>

      {/* Themes */}
      <Section title="Top Themes">
        {stats?.top_themes?.length ? (
          <div className="flex flex-wrap gap-2">
            {stats.top_themes.map((t) => (
              <span
                key={t.theme}
                className="px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-sm"
              >
                {t.theme}{" "}
                <span className="text-emerald-400 ml-1">{t.count}</span>
              </span>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground text-sm">
            No themes detected yet.
          </p>
        )}
      </Section>

      {/* Patterns */}
      {patterns && patterns.patterns.length > 0 && (
        <Section title={`Recurring Patterns (${patterns.period})`}>
          {patterns.patterns.map((p, i) => (
            <div key={i} className="text-sm text-foreground/80">
              <span className="font-medium capitalize">
                {p.type.replace(/_/g, " ")}:
              </span>
              <div className="flex flex-wrap gap-2 mt-2">
                {Object.entries(p.data).map(([key, val]) => (
                  <span
                    key={key}
                    className="px-2 py-1 rounded bg-white/5 text-foreground/70 text-xs"
                  >
                    {key}: {val}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </Section>
      )}

      {/* Insights */}
      {patterns?.insights && patterns.insights.length > 0 && (
        <Section title="Insights">
          <ul className="space-y-2">
            {patterns.insights.map((insight, i) => (
              <li
                key={i}
                className="flex items-start gap-2 text-sm text-foreground/80"
              >
                <span className="text-indigo-400 mt-0.5">💡</span>
                {insight}
              </li>
            ))}
          </ul>
        </Section>
      )}

      {/* Recent entries */}
      {stats?.recent_entries && stats.recent_entries.length > 0 && (
        <Section title="Recent Entries">
          <div className="space-y-2">
            {stats.recent_entries.map((entry) => (
              <div
                key={entry.id}
                className="p-3 rounded-lg bg-white/5 border border-white/10 text-sm"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-foreground font-medium">
                    {entry.filename}
                  </span>
                  <span className="text-muted-foreground text-xs">
                    {entry.uploaded_at}
                  </span>
                </div>
                <p className="text-muted-foreground text-xs line-clamp-2">
                  {entry.text || "No preview available"}
                </p>
                {entry.emotions.length > 0 && (
                  <div className="flex gap-1 mt-2">
                    {entry.emotions.map((em) => (
                      <span
                        key={em}
                        className="px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-300 text-[10px]"
                      >
                        {em}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </Section>
      )}
    </div>
  );
}

function MetricCard({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="p-4 rounded-xl bg-white/5 border border-white/10">
      <p className="text-xs text-muted-foreground mb-1">{label}</p>
      <p className="text-2xl font-bold text-foreground">{value}</p>
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="p-5 rounded-xl bg-white/5 border border-white/10">
      <h3 className="text-sm font-semibold text-foreground/80 mb-3">{title}</h3>
      {children}
    </div>
  );
}

// ─── Chat Section ────────────────────────────────────────────────────────────

interface Message {
  role: "user" | "assistant";
  content: string;
  sources?: {
    id?: string;
    text?: string;
    filename?: string;
    score?: number;
  }[];
}

function ChatSection() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "Hi! I am your Clarity AI assistant. Ask me anything about your diary entries — emotions, patterns, recurring themes, or specific memories.",
    },
  ]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const query = input.trim();
    if (!query || sending) return;

    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: query }]);
    setSending(true);

    try {
      const res = await chatWithAI(query);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: res.answer,
          sources: res.sources,
        },
      ]);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Chat request failed";
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: `⚠️ Error: ${msg}`,
        },
      ]);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto flex flex-col h-[calc(100vh-24rem)]">
      <h2 className="text-xl font-bold mb-2">Chat with Your Diary</h2>
      <p className="text-muted-foreground text-sm mb-4">
        Ask questions about your entries, explore patterns, or reflect on your
        growth.
      </p>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-2 mb-4">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${
              msg.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-[80%] rounded-xl px-4 py-3 text-sm ${
                msg.role === "user"
                  ? "bg-indigo-600 text-white"
                  : "bg-white/5 border border-white/10 text-foreground/90"
              }`}
            >
              <p className="whitespace-pre-wrap">{msg.content}</p>

              {/* Sources */}
              {msg.sources && msg.sources.length > 0 && (
                <details className="mt-2">
                  <summary className="text-xs text-muted-foreground cursor-pointer hover:text-foreground/70 transition-colors">
                    Sources ({msg.sources.length})
                  </summary>
                  <div className="mt-2 space-y-1 max-h-32 overflow-y-auto">
                    {msg.sources.map((s, j) => (
                      <div
                        key={j}
                        className="text-xs text-muted-foreground bg-white/5 rounded p-2"
                      >
                        {s.filename && (
                          <span className="text-foreground/70 block">
                            📄 {s.filename}
                          </span>
                        )}
                        {s.text && (
                          <p className="line-clamp-2 mt-0.5">"{s.text}"</p>
                        )}
                        {s.score !== undefined && (
                          <span className="text-muted-foreground">
                            Score: {(s.score * 100).toFixed(0)}%
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </details>
              )}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={onSubmit} className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about your diary entries..."
          disabled={sending}
          className="flex-1 px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-foreground placeholder-muted-foreground focus:outline-none focus:border-indigo-500 transition-colors disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={sending || !input.trim()}
          className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 transition-colors font-medium"
        >
          {sending ? (
            <span className="flex items-center gap-2">
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Thinking...
            </span>
          ) : (
            "Send"
          )}
        </button>
      </form>
    </div>
  );
}