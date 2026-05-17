"use client";

import Link from "next/link";
import Image from "next/image";

// ── Forgetting Curve SVG ──────────────────────────────────────────────────────
function ForgettingCurveDiagram() {
  // Generate smooth forgetting curve data points
  const w = 560;
  const h = 200;
  const pad = { t: 20, r: 20, b: 40, l: 48 };
  const iw = w - pad.l - pad.r;
  const ih = h - pad.t - pad.b;

  // Natural forgetting: y = e^(-t/20) * 100
  const curve = Array.from({ length: 100 }, (_, i) => {
    const t = (i / 99) * 90;
    return { t, y: Math.exp(-t / 22) * 100 };
  });

  const toX = (t: number) => pad.l + (t / 90) * iw;
  const toY = (y: number) => pad.t + ih - (y / 100) * ih;

  const pathD = curve
    .map((p, i) => `${i === 0 ? "M" : "L"}${toX(p.t).toFixed(1)},${toY(p.y).toFixed(1)}`)
    .join(" ");

  // Spaced repetition sawtooth: reviews at days 1, 3, 9, 27
  const reviews = [
    { day: 0, startY: 100 },
    { day: 1, reset: 100 },
    { day: 3, reset: 100 },
    { day: 9, reset: 100 },
    { day: 27, reset: 100 },
  ];

  const srSegments: string[] = [];
  let lastDay = 0;
  let lastY = 100;
  const reviewDays = [1, 3, 9, 27, 90];

  reviewDays.forEach((reviewDay) => {
    const pts: string[] = [];
    for (let i = 0; i <= 40; i++) {
      const t = lastDay + (i / 40) * (reviewDay - lastDay);
      const elapsed = t - lastDay;
      const y = lastY * Math.exp(-elapsed / 22);
      pts.push(`${toX(t).toFixed(1)},${toY(y).toFixed(1)}`);
    }
    srSegments.push("M" + pts.join(" L"));
    if (reviewDay < 90) {
      lastDay = reviewDay;
      lastY = Math.min(100, 85 + Math.random() * 10); // reset high on review
    }
  });

  // Review markers
  const reviewMarkers = [1, 3, 9, 27];

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full" style={{ maxHeight: 220 }}>
      {/* Grid lines */}
      {[25, 50, 75, 100].map((y) => (
        <g key={y}>
          <line
            x1={pad.l} y1={toY(y)} x2={pad.l + iw} y2={toY(y)}
            stroke="rgba(255,255,255,0.05)" strokeWidth={1}
          />
          <text x={pad.l - 6} y={toY(y) + 4} textAnchor="end" fill="rgb(82,82,91)" fontSize={9}>
            {y}%
          </text>
        </g>
      ))}

      {/* Axes */}
      <line x1={pad.l} y1={pad.t} x2={pad.l} y2={pad.t + ih} stroke="rgba(255,255,255,0.12)" strokeWidth={1} />
      <line x1={pad.l} y1={pad.t + ih} x2={pad.l + iw} y2={pad.t + ih} stroke="rgba(255,255,255,0.12)" strokeWidth={1} />
      <text x={pad.l + iw / 2} y={h - 4} textAnchor="middle" fill="rgb(82,82,91)" fontSize={9}>Days since learning</text>

      {/* Forgetting curve (red) */}
      <path d={pathD} fill="none" stroke="#E63C3A" strokeWidth={2} strokeOpacity={0.5} strokeDasharray="5 3" />

      {/* SR curve (brand) */}
      {srSegments.map((d, i) => (
        <path key={i} d={d} fill="none" stroke="#E63C3A" strokeWidth={2.5} />
      ))}

      {/* Review markers */}
      {reviewMarkers.map((day) => (
        <g key={day}>
          <line
            x1={toX(day)} y1={toY(100)} x2={toX(day)} y2={pad.t + ih}
            stroke="rgba(255,255,255,0.12)" strokeWidth={1} strokeDasharray="3 2"
          />
          <circle cx={toX(day)} cy={toY(100)} r={4} fill="#E63C3A" />
          <text x={toX(day)} y={pad.t + ih + 14} textAnchor="middle" fill="rgb(113,113,122)" fontSize={8.5}>
            d{day}
          </text>
        </g>
      ))}

      {/* Labels */}
      <text x={toX(55)} y={toY(8)} fill="rgba(230,60,58,0.55)" fontSize={9}>Without review</text>
      <text x={toX(18)} y={toY(90)} fill="rgba(230,60,58,0.9)" fontSize={9} fontWeight="600">With spaced review</text>
    </svg>
  );
}

// ── Bandit Flow Diagram ───────────────────────────────────────────────────────
function BanditFlowDiagram() {
  return (
    <svg viewBox="0 0 560 240" className="w-full" style={{ maxHeight: 250 }}>
      {/* Student answers question */}
      <rect x={20} y={95} width={110} height={50} rx={10} fill="rgba(255,255,255,0.05)" stroke="rgba(255,255,255,0.12)" strokeWidth={1.5} />
      <text x={75} y={116} textAnchor="middle" fill="white" fontSize={10} fontWeight="600">Student</text>
      <text x={75} y={131} textAnchor="middle" fill="rgb(161,161,170)" fontSize={9}>answers question</text>

      {/* Arrow right */}
      <line x1={130} y1={120} x2={165} y2={120} stroke="rgba(255,255,255,0.3)" strokeWidth={1.5} markerEnd="url(#arr)" />

      {/* Result node */}
      <rect x={165} y={95} width={100} height={50} rx={10} fill="rgba(255,255,255,0.05)" stroke="rgba(255,255,255,0.12)" strokeWidth={1.5} />
      <text x={215} y={116} textAnchor="middle" fill="white" fontSize={10} fontWeight="600">Result logged</text>
      <text x={215} y={131} textAnchor="middle" fill="rgb(161,161,170)" fontSize={9}>reward updated</text>

      {/* Arrow right */}
      <line x1={265} y1={120} x2={300} y2={120} stroke="rgba(255,255,255,0.3)" strokeWidth={1.5} markerEnd="url(#arr)" />

      {/* Epsilon decision */}
      <polygon points="330,95 380,120 330,145 280,120" fill="rgba(230,60,58,0.12)" stroke="#E63C3A" strokeWidth={1.5} />
      <text x={330} y={116} textAnchor="middle" fill="white" fontSize={9} fontWeight="600">ε-greedy</text>
      <text x={330} y={130} textAnchor="middle" fill="rgb(161,161,170)" fontSize={8.5}>decide</text>

      {/* Explore branch — up */}
      <line x1={330} y1={95} x2={330} y2={42} stroke="rgba(255,255,255,0.25)" strokeWidth={1.5} markerEnd="url(#arr)" />
      <rect x={270} y={8} width={120} height={34} rx={8} fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.10)" strokeWidth={1} />
      <text x={330} y={22} textAnchor="middle" fill="rgb(161,161,170)" fontSize={9}>10% Explore</text>
      <text x={330} y={35} textAnchor="middle" fill="white" fontSize={9} fontWeight="600">Random topic</text>

      {/* Exploit branch — down */}
      <line x1={330} y1={145} x2={330} y2={196} stroke="rgba(255,255,255,0.25)" strokeWidth={1.5} markerEnd="url(#arr)" />
      <rect x={270} y={196} width={120} height={34} rx={8} fill="rgba(230,60,58,0.10)" stroke="rgba(230,60,58,0.3)" strokeWidth={1} />
      <text x={330} y={210} textAnchor="middle" fill="rgb(252,165,165)" fontSize={9}>90% Exploit</text>
      <text x={330} y={223} textAnchor="middle" fill="white" fontSize={9} fontWeight="600">Weakest topic</text>

      {/* Labels */}
      <text x={348} y={72} fill="rgba(255,255,255,0.3)" fontSize={8}>explore</text>
      <text x={348} y={165} fill="rgba(255,255,255,0.3)" fontSize={8}>exploit</text>

      {/* Next question boxes */}
      <line x1={390} y1={25} x2={430} y2={25} stroke="rgba(255,255,255,0.2)" strokeWidth={1.5} markerEnd="url(#arr)" />
      <rect x={430} y={8} width={110} height={34} rx={8} fill="rgba(255,255,255,0.03)" stroke="rgba(255,255,255,0.08)" strokeWidth={1} />
      <text x={485} y={22} textAnchor="middle" fill="rgb(161,161,170)" fontSize={9}>Serves variety,</text>
      <text x={485} y={35} textAnchor="middle" fill="rgb(161,161,170)" fontSize={9}>discovers new gaps</text>

      <line x1={390} y1={213} x2={430} y2={213} stroke="rgba(255,255,255,0.2)" strokeWidth={1.5} markerEnd="url(#arr)" />
      <rect x={430} y={196} width={110} height={34} rx={8} fill="rgba(230,60,58,0.06)" stroke="rgba(230,60,58,0.2)" strokeWidth={1} />
      <text x={485} y={210} textAnchor="middle" fill="rgb(252,165,165)" fontSize={9}>Targets weak area,</text>
      <text x={485} y={223} textAnchor="middle" fill="rgb(252,165,165)" fontSize={9}>maximises score gain</text>

      {/* Arrow marker */}
      <defs>
        <marker id="arr" markerWidth={6} markerHeight={6} refX={5} refY={3} orient="auto">
          <path d="M0,0 L0,6 L6,3 z" fill="rgba(255,255,255,0.3)" />
        </marker>
      </defs>
    </svg>
  );
}

// ── Cluster Diagram ───────────────────────────────────────────────────────────
function ClusterDiagram() {
  // Wrong answer "clusters" in 2D space
  const clusters = [
    {
      label: "Concept Gap",
      color: "#E63C3A",
      cx: 130,
      cy: 110,
      points: [
        [110, 95], [125, 105], [140, 90], [118, 115], [135, 120], [148, 100], [105, 108],
      ],
    },
    {
      label: "Calculation Error",
      color: "#f59e0b",
      cx: 290,
      cy: 75,
      points: [
        [270, 65], [285, 80], [300, 60], [310, 78], [278, 88], [295, 68],
      ],
    },
    {
      label: "Misread Question",
      color: "#6366f1",
      cx: 250,
      cy: 160,
      points: [
        [230, 150], [248, 165], [265, 155], [240, 172], [258, 178], [272, 162],
      ],
    },
    {
      label: "Pacing Issue",
      color: "#10b981",
      cx: 390,
      cy: 120,
      points: [
        [375, 110], [390, 125], [405, 112], [382, 132], [398, 130],
      ],
    },
  ];

  return (
    <svg viewBox="0 0 560 230" className="w-full" style={{ maxHeight: 240 }}>
      {/* Background grid */}
      {[60, 120, 180].map((y) => (
        <line key={y} x1={40} y1={y} x2={520} y2={y} stroke="rgba(255,255,255,0.04)" strokeWidth={1} />
      ))}
      {[120, 200, 280, 360, 440].map((x) => (
        <line key={x} x1={x} y1={20} x2={x} y2={210} stroke="rgba(255,255,255,0.04)" strokeWidth={1} />
      ))}

      {/* Axes labels */}
      <text x={280} y={222} textAnchor="middle" fill="rgb(82,82,91)" fontSize={9}>Semantic embedding — dimension 1</text>
      <text x={14} y={115} textAnchor="middle" fill="rgb(82,82,91)" fontSize={9} transform="rotate(-90,14,115)">dim 2</text>

      {/* Cluster halos */}
      {clusters.map((c) => (
        <ellipse
          key={c.label}
          cx={c.cx} cy={c.cy} rx={48} ry={38}
          fill={`${c.color}12`} stroke={c.color} strokeWidth={1} strokeOpacity={0.4} strokeDasharray="4 3"
        />
      ))}

      {/* Points */}
      {clusters.map((c) =>
        c.points.map(([x, y], i) => (
          <circle key={`${c.label}-${i}`} cx={x} cy={y} r={4} fill={c.color} fillOpacity={0.75} />
        ))
      )}

      {/* Labels */}
      {clusters.map((c) => (
        <g key={c.label + "-label"}>
          <rect
            x={c.cx - 48} y={c.cy - 56} width={96} height={18}
            rx={6} fill="rgba(15,15,20,0.85)"
          />
          <text x={c.cx} y={c.cy - 44} textAnchor="middle" fill={c.color} fontSize={9} fontWeight="700">
            {c.label}
          </text>
        </g>
      ))}

      {/* Pipeline annotation — right side */}
      <line x1={460} y1={40} x2={510} y2={40} stroke="rgba(255,255,255,0.15)" strokeWidth={1} />
      <text x={515} y={43} fill="rgb(113,113,122)" fontSize={8.5}>Wrong answers</text>
      <text x={515} y={55} fill="rgb(113,113,122)" fontSize={8.5}>→ embeddings</text>
      <text x={515} y={67} fill="rgb(113,113,122)" fontSize={8.5}>→ k-means clusters</text>
      <text x={515} y={79} fill="rgb(113,113,122)" fontSize={8.5}>→ label & insight</text>
    </svg>
  );
}

// ── Section Component ─────────────────────────────────────────────────────────
interface SectionProps {
  number: string;
  title: string;
  subtitle: string;
  description: string;
  detail: string;
  diagram: React.ReactNode;
  accent: string;
  tags: string[];
  outcomes: string[];
}

function Section({ number, title, subtitle, description, detail, diagram, accent, tags, outcomes }: SectionProps) {
  return (
    <div className="relative">
      {/* Vertical line connector */}
      <div
        className="absolute left-9 top-16 bottom-0 w-px"
        style={{ background: `linear-gradient(to bottom, ${accent}40, transparent)` }}
      />

      <div className="flex gap-8">
        {/* Number bubble */}
        <div className="shrink-0 relative z-10">
          <div
            className="w-[72px] h-[72px] rounded-2xl flex items-center justify-center text-2xl font-black"
            style={{ background: `${accent}15`, border: `1.5px solid ${accent}35`, color: accent }}
          >
            {number}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 pb-16">
          {/* Tags */}
          <div className="flex flex-wrap gap-2 mb-4">
            {tags.map((t) => (
              <span
                key={t}
                className="text-[10px] font-semibold uppercase tracking-widest px-2.5 py-1 rounded-full"
                style={{ background: `${accent}12`, color: accent, border: `1px solid ${accent}30` }}
              >
                {t}
              </span>
            ))}
          </div>

          <h2 className="text-2xl font-bold text-white mb-1">{title}</h2>
          <p className="text-sm font-medium mb-4" style={{ color: accent }}>{subtitle}</p>
          <p className="text-sm text-neutral-400 leading-relaxed mb-3">{description}</p>
          <p className="text-xs text-neutral-600 leading-relaxed mb-6">{detail}</p>

          {/* Diagram */}
          <div
            className="rounded-2xl p-5 mb-6"
            style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.06)" }}
          >
            {diagram}
          </div>

          {/* Outcomes */}
          <div>
            <p className="text-[10px] uppercase tracking-widest text-neutral-600 font-semibold mb-3">Expected Outcomes</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {outcomes.map((o) => (
                <div
                  key={o}
                  className="flex items-start gap-2.5 px-3 py-2.5 rounded-xl"
                  style={{ background: `${accent}08`, border: `1px solid ${accent}18` }}
                >
                  <div className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0" style={{ background: accent }} />
                  <p className="text-xs text-neutral-400 leading-snug">{o}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function RoadmapPanel() {
  return (
    <div className="min-h-screen bg-surface text-white">

      {/* Nav */}
      <nav className="sticky top-0 z-10 border-b border-white/[0.06] bg-surface-1 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto px-6 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg overflow-hidden border border-white/[0.08]">
              <Image src="/tabf-logo.png" alt="TABF" width={28} height={28} className="w-full h-full object-cover" />
            </div>
            <span className="text-sm font-semibold text-white">TABF FinMentor</span>
            <span className="text-neutral-600 mx-1">·</span>
            <span className="text-xs text-neutral-500">ML Roadmap</span>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/stats"
              className="px-4 py-2 text-xs font-semibold rounded-xl bg-white/[0.06] border border-white/[0.08] text-neutral-400 hover:text-white hover:bg-white/[0.10] transition-colors">
              ← Stats
            </Link>
            <Link href="/"
              className="px-4 py-2 text-xs font-semibold rounded-xl bg-brand text-white hover:bg-brand-light transition-colors shadow-sm shadow-brand/20">
              ← Training
            </Link>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-14">

        {/* Header */}
        <div className="mb-16">
          <div
            className="inline-flex items-center gap-2 text-[10px] font-semibold uppercase tracking-widest px-3 py-1.5 rounded-full mb-6"
            style={{ background: "rgba(230,60,58,0.10)", border: "1px solid rgba(230,60,58,0.25)", color: "#E63C3A" }}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-brand animate-pulse" />
            Proposed Feature Roadmap
          </div>
          <h1 className="text-4xl font-black text-white mb-4 leading-tight">
            Possible Next Features
          </h1>
          <p className="text-base text-neutral-400 leading-relaxed max-w-2xl">
            Three ideas for improving the app using ML — none are built yet, but each would make studying more effective.
          </p>
        </div>

        {/* Sections */}
        <Section
          number="01"
          title="Spaced Repetition"
          subtitle="Learned forgetting-curve decay rates"
          description="The human brain forgets at a predictable exponential rate. Spaced repetition exploits this by scheduling each question for review at exactly the moment your retention is about to drop — right before you forget."
          detail="Rather than using a fixed Leitner-box schedule (review after 1 day, 3 days, 7 days…), the ML model fits a personal decay constant λ per category from your own answer history. A question you consistently get right in Fixed Income is scheduled further out; one you keep failing in Derivatives is surfaced more aggressively. The result: the same study hours yield measurably higher retention."
          diagram={<ForgettingCurveDiagram />}
          accent="#E63C3A"
          tags={["Retention Science", "Personalised Scheduling", "Exponential Decay"]}
          outcomes={[
            "Fewer re-studied questions that are already mastered",
            "Higher exam-day recall for weak topics",
            "Automatic interval lengthening as you improve",
          ]}
        />

        <Section
          number="02"
          title="Adaptive Difficulty Routing"
          subtitle="ε-greedy multi-armed bandit for topic selection"
          description="Instead of letting you choose which topic to study next (most people avoid their weak areas), an epsilon-greedy bandit model makes that decision — balancing targeted drilling with occasional exploration of untouched subjects."
          detail="Each topic is treated as a 'slot machine arm.' After every answer, the model updates its expected reward (score improvement per question) for that arm using Bayesian updating. Most of the time (90%) it routes you to the topic with the highest expected gain — your current worst area. But 10% of the time it explores a random topic, discovering hidden weaknesses early. Over a 200-question session this can double the score improvement versus self-directed study."
          diagram={<BanditFlowDiagram />}
          accent="#f59e0b"
          tags={["Bandit Algorithm", "Explore vs Exploit", "Real-time Routing"]}
          outcomes={[
            "Automatic targeting of high-value weak areas",
            "Early detection of untouched knowledge gaps",
            "Study sessions that adapt every single question",
          ]}
        />

        <Section
          number="03"
          title="Wrong-Answer Pattern Detection"
          subtitle="Clustering to find why you fail, not just what you fail"
          description="Knowing you score 45% in Derivatives is only half the picture. Pattern detection clusters your incorrect answers into interpretable failure modes — so you know whether to re-read the textbook, practice arithmetic, or slow down when reading multi-part questions."
          detail="Each wrong answer is encoded using a small language model into a feature vector capturing: the question's concept domain, the distractor you chose, and the time you spent. K-means clustering groups your mistakes into 3–6 categories. A lightweight LLM then labels each cluster with a human-readable insight: 'You confuse modified duration with Macaulay duration in Fixed Income' or 'You select the right formula but miscalculate under time pressure in TVM.' This converts raw wrong answers into a targeted study plan."
          diagram={<ClusterDiagram />}
          accent="#6366f1"
          tags={["NLP Embeddings", "K-Means Clustering", "Explainable AI"]}
          outcomes={[
            "Root-cause diagnosis, not just topic scores",
            "Targeted remediation: concept vs. calculation vs. pacing",
            "Feedback that improves with every wrong answer",
          ]}
        />

        {/* Implementation timeline */}
        <div className="border-t border-white/[0.06] pt-12 mt-4">
          <p className="text-[10px] uppercase tracking-widest text-neutral-600 font-semibold mb-6">Implementation Complexity</p>
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: "Spaced Repetition", effort: "Medium", stack: "PostgreSQL scheduler + decay fitting", time: "2–3 weeks" },
              { label: "Adaptive Routing", effort: "Low–Medium", stack: "Stateless bandit in API route", time: "1–2 weeks" },
              { label: "Pattern Detection", effort: "High", stack: "Embedding model + k-means pipeline", time: "4–6 weeks" },
            ].map((item) => (
              <div key={item.label} className="p-4 rounded-2xl bg-surface-1 border border-white/[0.06]">
                <p className="text-xs font-semibold text-white mb-1">{item.label}</p>
                <p className="text-[10px] text-neutral-500 mb-3">{item.stack}</p>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-semibold text-neutral-600">{item.time}</span>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-white/[0.06] text-neutral-400 border border-white/[0.08]">
                    {item.effort}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-10 mt-10 border-t border-white/[0.06]">
          <p className="text-xs text-neutral-700">TABF FinMentor · ML Roadmap</p>
          <div className="flex items-center gap-2">
            <Link href="/stats" className="px-4 py-2 text-xs font-semibold rounded-xl bg-white/[0.06] border border-white/[0.08] text-neutral-500 hover:text-white hover:bg-white/[0.10] transition-colors">
              ← My Stats
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
