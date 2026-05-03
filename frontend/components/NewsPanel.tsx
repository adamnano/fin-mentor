"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

// ── Types ──────────────────────────────────────────────────────────────────────
interface Headline {
  title: string;
  url: string;
  snippet: string;
  published: string;
  source: string;
}

interface Question {
  id: number;
  text: string;
}

interface Analysis {
  summary: string;
  questions: Question[];
}

interface DiscussionMessage {
  role: "user" | "assistant";
  content: string;
}

// ── Helpers ────────────────────────────────────────────────────────────────────
function parseAnalysis(raw: string): Analysis {
  const summaryMatch = raw.match(/SUMMARY:\s*([\s\S]*?)(?=QUESTIONS:|$)/i);
  const summary = summaryMatch ? summaryMatch[1].trim() : raw.slice(0, 300);

  const questionsSection = raw.match(/QUESTIONS:\s*([\s\S]*)/i)?.[1] ?? "";
  const questions: Question[] = [];
  for (const m of Array.from(questionsSection.matchAll(/Q(\d+):\s*([^\n]+)/g))) {
    questions.push({ id: Number(m[1]), text: m[2].trim() });
  }
  if (questions.length === 0 && questionsSection.trim()) {
    questionsSection.split("\n").filter(Boolean).slice(0, 3).forEach((l, i) =>
      questions.push({ id: i + 1, text: l.replace(/^[-•*Q\d.:]\s*/, "").trim() })
    );
  }
  return { summary, questions };
}

function formatPubDate(pub: string): string {
  if (!pub) return "";
  try {
    return new Date(pub).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
  } catch {
    return pub.slice(0, 16);
  }
}

// ── Component ──────────────────────────────────────────────────────────────────
export default function NewsPanel() {
  const [headlines, setHeadlines] = useState<Headline[]>([]);
  const [isLoadingHeadlines, setIsLoadingHeadlines] = useState(true);
  const [headlineError, setHeadlineError] = useState("");

  const [selectedArticle, setSelectedArticle] = useState<Headline | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [streamedText, setStreamedText] = useState("");
  const [analysis, setAnalysis] = useState<Analysis | null>(null);

  const [activeQuestion, setActiveQuestion] = useState<Question | null>(null);
  const [discussion, setDiscussion] = useState<DiscussionMessage[]>([]);
  const [isDiscussing, setIsDiscussing] = useState(false);

  // Load headlines on mount
  useEffect(() => {
    loadHeadlines();
  }, []);

  async function loadHeadlines() {
    setIsLoadingHeadlines(true);
    setHeadlineError("");
    setSelectedArticle(null);
    setAnalysis(null);
    setStreamedText("");
    setDiscussion([]);
    try {
      const res = await fetch("/api/ai/news/headlines");
      const data = await res.json();
      if (data.error) {
        setHeadlineError(data.error);
      } else {
        setHeadlines(data.headlines ?? []);
      }
    } catch {
      setHeadlineError("Could not reach the backend. Is the server running?");
    } finally {
      setIsLoadingHeadlines(false);
    }
  }

  async function analyzeArticle(article: Headline) {
    setSelectedArticle(article);
    setAnalysis(null);
    setStreamedText("");
    setActiveQuestion(null);
    setDiscussion([]);
    setIsAnalyzing(true);

    try {
      const res = await fetch("/api/ai/news", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: article.url,
          title: article.title,
          snippet: article.snippet,
        }),
      });
      if (!res.ok || !res.body) throw new Error("Analysis request failed");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let full = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        full += decoder.decode(value, { stream: true });
        setStreamedText(full);
      }
      setAnalysis(parseAnalysis(full));
    } catch {
      setStreamedText("Analysis failed. Check that the backend is running.");
    } finally {
      setIsAnalyzing(false);
    }
  }

  async function discussQuestion(q: Question) {
    if (!selectedArticle) return;
    setActiveQuestion(q);
    setDiscussion([
      { role: "user", content: q.text },
      { role: "assistant", content: "" },
    ]);
    setIsDiscussing(true);

    try {
      const res = await fetch("/api/ai/news/discuss", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: selectedArticle.title,
          summary: analysis?.summary ?? selectedArticle.snippet ?? "",
          question: q.text,
        }),
      });
      if (!res.ok || !res.body) throw new Error(`HTTP ${res.status}`);
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let full = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        full += decoder.decode(value, { stream: true });
        setDiscussion([
          { role: "user", content: q.text },
          { role: "assistant", content: full },
        ]);
      }
    } catch (err) {
      setDiscussion([
        { role: "user", content: q.text },
        { role: "assistant", content: "Failed to get a response. Make sure the backend is running." },
      ]);
    } finally {
      setIsDiscussing(false);
    }
  }

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="card card-hover p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {selectedArticle && (
            <button
              onClick={() => { setSelectedArticle(null); setAnalysis(null); setStreamedText(""); setDiscussion([]); }}
              className="w-7 h-7 flex items-center justify-center rounded-lg text-neutral-500 hover:text-white hover:bg-white/[0.06] transition-all"
              title="Back to headlines"
            >
              ←
            </button>
          )}
          <span className="text-lg">📰</span>
          <h3 className="text-sm font-semibold text-white">
            {selectedArticle ? "Article Analysis" : "News Insight"}
          </h3>
          <span className="px-2 py-0.5 text-[10px] font-semibold rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/25">
            Beta
          </span>
        </div>
        {!selectedArticle && (
          <button
            onClick={loadHeadlines}
            disabled={isLoadingHeadlines}
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs rounded-lg text-neutral-500 hover:text-neutral-300 hover:bg-white/[0.05] border border-white/[0.06] transition-all disabled:opacity-40"
            title="Refresh headlines"
          >
            <span className={isLoadingHeadlines ? "animate-spin" : ""}>↻</span>
            {isLoadingHeadlines ? "Loading…" : "Refresh"}
          </button>
        )}
      </div>

      <AnimatePresence mode="wait">

        {/* ── HEADLINE LIST ─────────────────────────────────────────────── */}
        {!selectedArticle && (
          <motion.div
            key="headlines"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="space-y-3"
          >
            {isLoadingHeadlines && (
              <div className="space-y-3">
                {[0, 1, 2].map((i) => (
                  <div key={i} className="animate-pulse p-4 rounded-xl border border-white/[0.06] bg-white/[0.02] space-y-2">
                    <div className="h-3 bg-white/[0.07] rounded w-3/4" />
                    <div className="h-2.5 bg-white/[0.04] rounded w-full" />
                    <div className="h-2.5 bg-white/[0.04] rounded w-5/6" />
                    <div className="h-2 bg-white/[0.03] rounded w-1/4 mt-1" />
                  </div>
                ))}
                <p className="text-center text-xs text-neutral-600 py-2">
                  Fetching top stories from Focus Taiwan &amp; BBC…
                </p>
              </div>
            )}

            {headlineError && !isLoadingHeadlines && (
              <div className="p-4 rounded-xl border border-brand/20 bg-brand-muted text-xs text-neutral-400">
                <p className="text-brand font-semibold mb-1">Could not load headlines</p>
                <p>{headlineError}</p>
              </div>
            )}

            {!isLoadingHeadlines && !headlineError && headlines.length === 0 && (
              <p className="text-center text-xs text-neutral-600 py-4">No headlines available.</p>
            )}

            {!isLoadingHeadlines && headlines.map((h, i) => (
              <motion.button
                key={h.url}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.07 }}
                onClick={() => analyzeArticle(h)}
                className="w-full text-left p-4 rounded-xl border border-white/[0.07] bg-white/[0.02] hover:border-brand/30 hover:bg-brand-muted group transition-all duration-200"
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <p className="text-xs font-semibold text-white leading-snug group-hover:text-brand transition-colors">
                    {h.title}
                  </p>
                  <span className="shrink-0 w-5 h-5 rounded-full bg-brand/10 border border-brand/20 text-brand text-[10px] flex items-center justify-center font-bold mt-0.5">
                    {i + 1}
                  </span>
                </div>
                {h.snippet && (
                  <p className="text-[11px] text-neutral-600 leading-relaxed line-clamp-2 mb-2">
                    {h.snippet}
                  </p>
                )}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-[10px] text-neutral-700">
                    <span>{h.source}</span>
                    {h.published && (
                      <>
                        <span>·</span>
                        <span>{formatPubDate(h.published)}</span>
                      </>
                    )}
                  </div>
                  <span className="text-[10px] text-brand opacity-0 group-hover:opacity-100 transition-opacity font-medium">
                    Analyze →
                  </span>
                </div>
              </motion.button>
            ))}

            {!isLoadingHeadlines && !headlineError && (
              <p className="text-center text-[10px] text-neutral-700 pt-1">
                Source: Focus Taiwan · BBC · Click any story to analyze
              </p>
            )}
          </motion.div>
        )}

        {/* ── ARTICLE ANALYSIS ──────────────────────────────────────────── */}
        {selectedArticle && (
          <motion.div
            key="analysis"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="space-y-4"
          >
            {/* Article title card */}
            <div className="p-3.5 rounded-xl border border-white/[0.07] bg-white/[0.02]">
              <p className="text-xs font-semibold text-white leading-snug mb-1">{selectedArticle.title}</p>
              <div className="flex items-center gap-2 text-[10px] text-neutral-700">
                <span>{selectedArticle.source}</span>
                {selectedArticle.published && (
                  <><span>·</span><span>{formatPubDate(selectedArticle.published)}</span></>
                )}
                <a
                  href={selectedArticle.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ml-auto text-brand hover:underline"
                  onClick={(e) => e.stopPropagation()}
                >
                  Open ↗
                </a>
              </div>
            </div>

            {/* Streaming / Summary */}
            {(isAnalyzing || analysis) && (
              <>
                <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                  <p className="text-[10px] text-neutral-500 uppercase tracking-widest font-semibold mb-2">
                    {isAnalyzing && !analysis ? "Analyzing…" : "Summary"}
                  </p>
                  {isAnalyzing && !analysis ? (
                    <div className="space-y-1.5">
                      <p className="text-xs text-neutral-600 whitespace-pre-wrap font-mono leading-relaxed">
                        {streamedText || <span className="animate-pulse">Reading article…</span>}
                      </p>
                    </div>
                  ) : (
                    <p className="text-xs text-neutral-300 leading-relaxed">{analysis?.summary}</p>
                  )}
                </div>

                {/* Intuition Questions */}
                {analysis && analysis.questions.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-[10px] text-neutral-500 uppercase tracking-widest font-semibold">
                      Test Your Intuition — click to explore
                    </p>
                    {analysis.questions.map((q) => (
                      <button
                        key={q.id}
                        onClick={() => discussQuestion(q)}
                        className={`w-full text-left p-3.5 rounded-xl border text-xs transition-all duration-150 ${
                          activeQuestion?.id === q.id
                            ? "border-brand/40 bg-brand-muted text-white"
                            : "border-white/[0.07] bg-white/[0.03] text-neutral-400 hover:border-white/[0.14] hover:text-neutral-200"
                        }`}
                      >
                        <span className="text-brand font-bold mr-2">Q{q.id}</span>
                        {q.text}
                      </button>
                    ))}
                  </div>
                )}

                {/* Discussion */}
                {discussion.length > 0 && (
                  <div className="space-y-3 pt-1 border-t border-white/[0.06]">
                    <p className="text-[10px] text-neutral-500 uppercase tracking-widest font-semibold pt-2">AI Explanation</p>
                    {discussion.map((msg, i) => (
                      <div
                        key={i}
                        className={`p-3.5 rounded-xl text-xs leading-relaxed ${
                          msg.role === "user"
                            ? "bg-brand-muted border border-brand-border text-neutral-200"
                            : "bg-white/[0.03] border border-white/[0.06] text-neutral-400"
                        }`}
                      >
                        {msg.role === "assistant" && (
                          <span className="text-[10px] font-semibold text-brand uppercase tracking-widest block mb-1.5">
                            {isDiscussing && !msg.content ? "Thinking…" : "AI Tutor"}
                          </span>
                        )}
                        <p className="whitespace-pre-wrap">
                          {msg.content || (isDiscussing ? "…" : "")}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}

            {/* Analyze button shown before streaming starts */}
            {!isAnalyzing && !analysis && !streamedText && (
              <button
                onClick={() => analyzeArticle(selectedArticle)}
                className="w-full py-3 rounded-xl text-xs font-semibold bg-brand text-white hover:bg-brand-light transition-all shadow-lg shadow-brand/20"
              >
                Analyze with AI →
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
