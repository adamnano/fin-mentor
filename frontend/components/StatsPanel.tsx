"use client";

import Link from "next/link";
import Image from "next/image";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, LineChart, Line, ReferenceLine,
} from "recharts";
import { ALL_CATEGORIES, CFACategory } from "@/lib/types";

// ── Types ──────────────────────────────────────────────────────────────────────
interface DaySession { date: string; count: number; correct: number }
interface TimeEntry { category: string; avgSeconds: number; count: number }
interface RecentSession { isCorrect: boolean; category: string; createdAt: string }
interface Score {
  category: string; level: number;
  totalAttempts?: number; total_attempts?: number;
  correctCount?: number; correct_count?: number;
}
interface StatsData {
  scores: Score[];
  dailySessions: DaySession[];
  timeByCategory: TimeEntry[];
  recentSessions: RecentSession[];
  totalSessions: number;
  totalCorrect: number;
  avgTimeSeconds: number;
}

interface Props { data: StatsData | null }

const CATEGORY_ICONS: Record<string, string> = {
  TVM: "⏱", "Fixed Income": "📊", Derivatives: "📈", Economics: "🌐",
  FSA: "📋", "Portfolio Management": "💼", Ethics: "⚖️", Equity: "📉",
  "ESG & Sustainability": "🌱", "Risk Management": "🛡️", "Compliance & AML": "🔒",
};

// ── Heatmap helpers ─────────────────────────────────────────────────────────────
function buildHeatmap(dailySessions: DaySession[]) {
  const sessionMap = new Map(dailySessions.map((s) => [s.date, s]));
  const today = new Date();
  // Snap back to the most recent Sunday
  const startDate = new Date(today);
  startDate.setDate(startDate.getDate() - 90);
  startDate.setDate(startDate.getDate() - startDate.getDay()); // back to Sunday

  const weeks: { date: string; count: number; correct: number; isFuture: boolean }[][] = [];
  const cur = new Date(startDate);

  while (cur <= today || weeks.length < 13) {
    const week: typeof weeks[0] = [];
    for (let d = 0; d < 7; d++) {
      const dateStr = cur.toISOString().split("T")[0];
      const isFuture = cur > today;
      const session = sessionMap.get(dateStr);
      week.push({ date: dateStr, count: isFuture ? 0 : (session?.count ?? 0), correct: session?.correct ?? 0, isFuture });
      cur.setDate(cur.getDate() + 1);
    }
    weeks.push(week);
    if (weeks.length >= 13) break;
  }
  return weeks;
}

function heatColor(count: number, isFuture: boolean) {
  if (isFuture) return "bg-transparent";
  if (count === 0) return "bg-white/[0.05]";
  if (count <= 3) return "bg-brand/30";
  if (count <= 8) return "bg-brand/60";
  return "bg-brand";
}

// ── Streak ──────────────────────────────────────────────────────────────────────
function calcStreak(dailySessions: DaySession[]) {
  if (!dailySessions.length) return 0;
  const dateSet = new Set(dailySessions.map((s) => s.date));
  let streak = 0;
  const cur = new Date();
  while (true) {
    const d = cur.toISOString().split("T")[0];
    if (!dateSet.has(d)) break;
    streak++;
    cur.setDate(cur.getDate() - 1);
  }
  return streak;
}

// ── Score helpers ───────────────────────────────────────────────────────────────
function accuracy(attempts: number, correct: number) {
  return attempts > 0 ? Math.round((correct / attempts) * 100) : null;
}

function statusLabel(pct: number | null, attempts: number) {
  if (pct === null || attempts < 3) return { label: "Not Started", color: "text-neutral-600", bg: "bg-neutral-800/40" };
  if (pct >= 75) return { label: "Strong", color: "text-emerald-400", bg: "bg-emerald-500/12" };
  if (pct >= 55) return { label: "Improving", color: "text-amber-400", bg: "bg-amber-500/12" };
  return { label: "Focus Here", color: "text-brand", bg: "bg-brand-muted" };
}

// ── Main Component ─────────────────────────────────────────────────────────────
export default function StatsPanel({ data }: Props) {
  if (!data) {
    return (
      <div className="min-h-screen bg-surface flex flex-col items-center justify-center gap-4">
        <div className="text-4xl">📊</div>
        <p className="text-sm text-neutral-500">Could not load stats. Make sure the database is connected.</p>
        <Link href="/" className="px-4 py-2 text-xs font-semibold rounded-xl bg-brand text-white hover:bg-brand-light transition-colors">
          ← Back to Training
        </Link>
      </div>
    );
  }

  const { scores, dailySessions, timeByCategory, recentSessions, totalSessions, totalCorrect, avgTimeSeconds } = data;

  const overallAccuracy = accuracy(totalSessions, totalCorrect);
  const streak = calcStreak(dailySessions);
  const activeDays = dailySessions.filter((d) => d.count > 0).length;
  const heatmapWeeks = buildHeatmap(dailySessions);

  // Per-category aggregates across all levels
  const categoryStats = ALL_CATEGORIES.map((cat) => {
    const catScores = scores.filter((s) => s.category === cat);
    const attempts = catScores.reduce((n, s) => n + (s.totalAttempts ?? s.total_attempts ?? 0), 0);
    const correct = catScores.reduce((n, s) => n + (s.correctCount ?? s.correct_count ?? 0), 0);
    const pct = accuracy(attempts, correct);
    const status = statusLabel(pct, attempts);
    return { cat, attempts, correct, pct, status };
  }).sort((a, b) => {
    // Sort: focus first, then by accuracy desc
    if (a.pct === null && b.pct === null) return 0;
    if (a.pct === null) return 1;
    if (b.pct === null) return -1;
    return a.pct - b.pct;
  });

  // Level comparison
  const levelStats = [1, 2, 3].map((lvl) => {
    const lvlScores = scores.filter((s) => s.level === lvl);
    const att = lvlScores.reduce((n, s) => n + (s.totalAttempts ?? s.total_attempts ?? 0), 0);
    const cor = lvlScores.reduce((n, s) => n + (s.correctCount ?? s.correct_count ?? 0), 0);
    return { level: lvl, attempts: att, correct: cor, pct: accuracy(att, cor) };
  });

  // Recent trend: rolling 10-question accuracy windows
  const trendData = recentSessions.slice().reverse().map((s, i, arr) => {
    const window = arr.slice(Math.max(0, i - 9), i + 1);
    const windowAcc = Math.round((window.filter((x) => x.isCorrect).length / window.length) * 100);
    return { i: i + 1, acc: windowAcc };
  });

  // Improvement suggestions
  const suggestions: { icon: string; title: string; body: string; urgency: "high" | "medium" | "low" }[] = [];

  const weakest = categoryStats.filter((c) => c.attempts >= 3 && (c.pct ?? 100) < 55).slice(0, 2);
  weakest.forEach((c) => {
    suggestions.push({
      icon: CATEGORY_ICONS[c.cat] ?? "📚",
      title: `Drill ${c.cat}`,
      body: `${c.pct}% accuracy from ${c.attempts} attempts. Spend 10 minutes here before moving on.`,
      urgency: (c.pct ?? 100) < 40 ? "high" : "medium",
    });
  });

  const untried = categoryStats.filter((c) => c.attempts === 0).slice(0, 2);
  untried.forEach((c) => {
    suggestions.push({
      icon: CATEGORY_ICONS[c.cat] ?? "📚",
      title: `Try ${c.cat}`,
      body: `No attempts yet. Even a few questions here will reveal gaps before exam day.`,
      urgency: "low",
    });
  });

  const slowTopic = timeByCategory.filter((t) => t.count >= 3).sort((a, b) => b.avgSeconds - a.avgSeconds)[0];
  if (slowTopic && slowTopic.avgSeconds > 60) {
    suggestions.push({
      icon: "⏱",
      title: `Speed up on ${slowTopic.category}`,
      body: `You average ${slowTopic.avgSeconds}s per question here — well above the CFA target of ~90s total. Practice pacing.`,
      urgency: "medium",
    });
  }

  if (suggestions.length === 0) {
    suggestions.push({
      icon: "🎯",
      title: "Keep the momentum",
      body: totalSessions === 0
        ? "Answer your first questions to unlock personalised suggestions."
        : "You're covering your topics well. Maintain consistency and push for higher accuracy in your weakest areas.",
      urgency: "low",
    });
  }

  const urgencyStyle = { high: "border-brand/30 bg-brand-muted", medium: "border-amber-500/25 bg-amber-500/8", low: "border-white/[0.07] bg-white/[0.03]" };
  const urgencyBadge = { high: "text-brand bg-brand-muted border-brand/25", medium: "text-amber-400 bg-amber-500/12 border-amber-500/25", low: "text-neutral-500 bg-white/[0.04] border-white/[0.08]" };

  return (
    <div className="min-h-screen bg-surface text-white">

      {/* Nav */}
      <nav className="sticky top-0 z-10 border-b border-white/[0.06] bg-surface-1 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-6 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg overflow-hidden border border-white/[0.08]">
              <Image src="/tabf-logo.png" alt="TABF" width={28} height={28} className="w-full h-full object-cover" />
            </div>
            <span className="text-sm font-semibold text-white">TABF FinMentor</span>
            <span className="text-neutral-600 mx-1">·</span>
            <span className="text-xs text-neutral-500">My Stats</span>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/roadmap"
              className="px-4 py-2 text-xs font-semibold rounded-xl bg-white/[0.06] border border-white/[0.08] text-neutral-400 hover:text-white hover:bg-white/[0.10] transition-colors">
              ML Roadmap →
            </Link>
            <Link href="/"
              className="px-4 py-2 text-xs font-semibold rounded-xl bg-brand text-white hover:bg-brand-light transition-colors shadow-sm shadow-brand/20">
              ← Back to Training
            </Link>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-6 py-10 space-y-8">

        {/* ── Hero stats ──────────────────────────────────────────────── */}
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">Performance Overview</h1>
          <p className="text-sm text-neutral-500">Your complete practice history and improvement insights</p>
        </div>

        <div className="flex items-center divide-x divide-white/[0.07] border border-white/[0.07] rounded-2xl bg-surface-1 overflow-hidden">
          {[
            { label: "Questions Answered", value: totalSessions.toLocaleString(), sub: "all time" },
            { label: "Overall Accuracy", value: overallAccuracy !== null ? `${overallAccuracy}%` : "—", sub: `${totalCorrect} correct` },
            { label: "Day Streak", value: streak > 0 ? `${streak}d` : "—", sub: `${activeDays} active days` },
            { label: "Avg Time / Q", value: avgTimeSeconds > 0 ? `${avgTimeSeconds}s` : "—", sub: "across all topics" },
          ].map((stat) => (
            <div key={stat.label} className="flex-1 px-6 py-5">
              <p className="text-[10px] text-neutral-600 uppercase tracking-widest font-semibold mb-1">{stat.label}</p>
              <p className="text-3xl font-bold text-white tabular-nums">{stat.value}</p>
              <p className="text-xs text-neutral-600 mt-0.5">{stat.sub}</p>
            </div>
          ))}
        </div>

        {/* ── Practice Heatmap ────────────────────────────────────────── */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-sm font-semibold text-white">Practice Calendar</h2>
              <p className="text-xs text-neutral-600 mt-0.5">Questions answered per day — last 13 weeks</p>
            </div>
            <div className="flex items-center gap-2 text-[10px] text-neutral-600">
              <span>Less</span>
              {[0, 3, 8, 15].map((n) => (
                <div key={n} className={`w-3 h-3 rounded-sm ${heatColor(n, false)}`} />
              ))}
              <span>More</span>
            </div>
          </div>

          <div className="flex gap-1 overflow-x-auto pb-2">
            {/* Day labels */}
            <div className="flex flex-col gap-1 mr-1 shrink-0">
              {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
                <div key={i} className="w-3 h-3 flex items-center justify-center text-[9px] text-neutral-700">{d}</div>
              ))}
            </div>
            {/* Weeks */}
            {heatmapWeeks.map((week, wi) => (
              <div key={wi} className="flex flex-col gap-1">
                {week.map((day) => (
                  <div
                    key={day.date}
                    title={day.isFuture ? "" : `${day.date}: ${day.count} questions${day.count > 0 ? `, ${day.correct} correct` : ""}`}
                    className={`w-3 h-3 rounded-sm transition-colors ${heatColor(day.count, day.isFuture)} ${day.isFuture ? "opacity-0" : ""}`}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* ── Middle row ──────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Topic Performance — 2/3 width */}
          <div className="lg:col-span-2 card p-6">
            <h2 className="text-sm font-semibold text-white mb-1">Topic Performance</h2>
            <p className="text-xs text-neutral-600 mb-5">Accuracy across all CFA levels combined</p>

            <div className="space-y-2.5">
              {categoryStats.map(({ cat, attempts, pct, status }) => (
                <div key={cat} className="flex items-center gap-3">
                  <span className="text-sm w-5 shrink-0">{CATEGORY_ICONS[cat]}</span>
                  <span className="text-xs text-neutral-400 w-40 shrink-0 truncate">{cat}</span>
                  <div className="flex-1 h-2 bg-white/[0.06] rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${
                        pct === null ? "" :
                        pct >= 75 ? "bg-emerald-500" :
                        pct >= 55 ? "bg-amber-500" : "bg-brand"
                      }`}
                      style={{ width: pct !== null ? `${pct}%` : "0%" }}
                    />
                  </div>
                  <span className="text-xs font-mono tabular-nums w-10 text-right text-neutral-400">
                    {pct !== null ? `${pct}%` : "—"}
                  </span>
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border w-24 text-center shrink-0 ${status.bg} ${status.color} border-current/20`}>
                    {status.label}
                  </span>
                  <span className="text-[10px] text-neutral-700 w-14 text-right shrink-0">{attempts > 0 ? `${attempts} Q` : ""}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Level + Timing — 1/3 */}
          <div className="space-y-5">
            {/* Level breakdown */}
            <div className="card p-5">
              <h2 className="text-sm font-semibold text-white mb-4">By Level</h2>
              <div className="space-y-3">
                {levelStats.map(({ level, attempts, pct }) => (
                  <div key={level}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-neutral-400 font-medium">Level {level}</span>
                      <span className="text-xs font-mono tabular-nums text-neutral-400">
                        {pct !== null ? `${pct}%` : "—"}
                        <span className="text-neutral-700 ml-1.5">{attempts > 0 ? `(${attempts})` : ""}</span>
                      </span>
                    </div>
                    <div className="h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-700 ${
                          pct === null ? "" : pct >= 70 ? "bg-emerald-500" : pct >= 50 ? "bg-amber-500" : "bg-brand"
                        }`}
                        style={{ width: pct !== null ? `${pct}%` : "0%" }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Timing */}
            <div className="card p-5">
              <h2 className="text-sm font-semibold text-white mb-4">Avg Time per Topic</h2>
              {timeByCategory.length === 0 ? (
                <p className="text-xs text-neutral-600">No timing data yet</p>
              ) : (
                <div className="space-y-2">
                  {timeByCategory
                    .filter((t) => t.count >= 2)
                    .sort((a, b) => b.avgSeconds - a.avgSeconds)
                    .slice(0, 6)
                    .map((t) => (
                      <div key={t.category} className="flex items-center gap-2">
                        <span className="text-xs truncate flex-1 text-neutral-500">{t.category}</span>
                        <span className={`text-xs font-mono tabular-nums shrink-0 ${
                          t.avgSeconds > 90 ? "text-brand" : t.avgSeconds > 60 ? "text-amber-400" : "text-emerald-400"
                        }`}>
                          {t.avgSeconds}s
                        </span>
                      </div>
                    ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── Trend chart ─────────────────────────────────────────────── */}
        {trendData.length >= 10 && (
          <div className="card p-6">
            <h2 className="text-sm font-semibold text-white mb-1">Accuracy Trend</h2>
            <p className="text-xs text-neutral-600 mb-5">Rolling 10-question accuracy — most recent {recentSessions.length} answers</p>
            <ResponsiveContainer width="100%" height={120}>
              <LineChart data={trendData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis dataKey="i" stroke="#52525b" tick={{ fontSize: 10 }} label={{ value: "Question #", position: "insideBottom", offset: -2, fill: "#52525b", fontSize: 10 }} />
                <YAxis domain={[0, 100]} stroke="#52525b" tick={{ fontSize: 10 }} tickFormatter={(v) => `${v}%`} width={36} />
                <Tooltip
                  contentStyle={{ background: "var(--tooltip-bg)", border: "1px solid var(--tooltip-border)", borderRadius: 10, fontSize: 12 }}
                  formatter={(v: unknown) => [`${v}%`, "Accuracy"]}
                />
                <ReferenceLine y={70} stroke="#4ade80" strokeDasharray="4 4" strokeOpacity={0.4} />
                <Line type="monotone" dataKey="acc" stroke="#E63C3A" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
            <p className="text-[10px] text-neutral-700 mt-2">Green dashed line = 70% target</p>
          </div>
        )}

        {/* ── Category bar chart ──────────────────────────────────────── */}
        {categoryStats.some((c) => c.attempts > 0) && (
          <div className="card p-6">
            <h2 className="text-sm font-semibold text-white mb-1">Accuracy by Topic</h2>
            <p className="text-xs text-neutral-600 mb-5">Questions attempted per category</p>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart
                data={categoryStats.filter((c) => c.attempts > 0).map((c) => ({
                  name: c.cat.length > 10 ? c.cat.split(" ")[0] : c.cat,
                  accuracy: c.pct ?? 0,
                  attempts: c.attempts,
                }))}
                margin={{ top: 5, right: 10, left: 0, bottom: 30 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
                <XAxis dataKey="name" stroke="#52525b" tick={{ fontSize: 10 }} angle={-35} textAnchor="end" interval={0} />
                <YAxis domain={[0, 100]} stroke="#52525b" tick={{ fontSize: 10 }} tickFormatter={(v) => `${v}%`} width={36} />
                <Tooltip
                  contentStyle={{ background: "var(--tooltip-bg)", border: "1px solid var(--tooltip-border)", borderRadius: 10, fontSize: 12 }}
                  formatter={(v: unknown, name: unknown) => [
                    name === "accuracy" ? `${v}%` : `${v}`,
                    name === "accuracy" ? "Accuracy" : "Attempts",
                  ]}
                />
                <Bar dataKey="accuracy" radius={[4, 4, 0, 0]}
                  fill="#E63C3A"
                  // color by value via cell would need Cell import — keep it simple
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* ── Improvement Suggestions ─────────────────────────────────── */}
        <div>
          <h2 className="text-sm font-semibold text-white mb-1">Improvement Plan</h2>
          <p className="text-xs text-neutral-600 mb-4">Personalised suggestions based on your data</p>
          <div className="space-y-2">
            {suggestions.slice(0, 6).map((s, i) => (
              <div key={i} className={`flex items-start gap-4 px-5 py-4 rounded-xl border-l-2 bg-surface-1 ${
                s.urgency === "high" ? "border-l-brand" : s.urgency === "medium" ? "border-l-amber-500" : "border-l-white/20"
              }`}>
                <span className="text-lg shrink-0 mt-0.5">{s.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className="text-xs font-semibold text-white">{s.title}</p>
                    <span className={`text-[9px] font-semibold uppercase tracking-widest px-1.5 py-0.5 rounded-full border ${urgencyBadge[s.urgency]}`}>
                      {s.urgency === "high" ? "Priority" : s.urgency === "medium" ? "Suggested" : "Explore"}
                    </span>
                  </div>
                  <p className="text-xs text-neutral-500 leading-relaxed">{s.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-white/[0.06]">
          <p className="text-xs text-neutral-700">TABF FinMentor · Adaptive Finance Training</p>
          <div className="flex items-center gap-2">
            <Link href="/roadmap" className="px-4 py-2 text-xs font-semibold rounded-xl bg-white/[0.06] border border-white/[0.08] text-neutral-500 hover:text-white hover:bg-white/[0.10] transition-colors">
              ML Roadmap →
            </Link>
            <Link href="/" className="px-4 py-2 text-xs font-semibold rounded-xl bg-brand text-white hover:bg-brand-light transition-colors">
              ← Back to Training
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
