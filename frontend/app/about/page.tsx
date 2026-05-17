import Link from "next/link";
import Image from "next/image";

export const metadata = {
  title: "TABF FinMentor · About",
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-14">
      <h2 className="text-[10px] font-semibold text-neutral-600 uppercase tracking-widest mb-6 pb-3 border-b border-white/[0.06]">
        {title}
      </h2>
      {children}
    </section>
  );
}

function FeatureCard({ icon, title, desc }: { icon: string; title: string; desc: string }) {
  return (
    <div className="bg-surface-1 border border-white/[0.07] rounded-2xl p-5 hover:border-white/[0.12] transition-colors">
      <div className="text-2xl mb-3">{icon}</div>
      <h3 className="text-sm font-semibold text-white mb-2">{title}</h3>
      <p className="text-xs text-neutral-500 leading-relaxed">{desc}</p>
    </div>
  );
}

function Box({ label, sub, accent }: { label: string; sub?: string; accent?: string }) {
  return (
    <div className={`rounded-xl border px-4 py-3 text-center bg-surface ${accent ?? "border-white/[0.10]"}`}>
      <p className="text-xs font-semibold text-white">{label}</p>
      {sub && <p className="text-[10px] text-neutral-600 mt-0.5">{sub}</p>}
    </div>
  );
}

function Arrow() {
  return (
    <div className="flex justify-center my-1">
      <span className="text-neutral-700 text-lg">↓</span>
    </div>
  );
}

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-surface text-white">

      {/* Nav */}
      <nav className="sticky top-0 z-10 border-b border-white/[0.06] bg-surface-1 backdrop-blur-sm">
        <div className="max-w-5xl mx-auto px-6 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg overflow-hidden border border-white/[0.08]">
              <Image src="/tabf-logo.png" alt="TABF" width={28} height={28} className="w-full h-full object-cover" />
            </div>
            <span className="text-sm font-semibold text-white">TABF FinMentor</span>
            <span className="text-neutral-600 mx-1">·</span>
            <span className="text-xs text-neutral-500">About</span>
          </div>
          <Link href="/" className="px-4 py-2 text-xs font-semibold rounded-xl bg-brand text-white hover:bg-brand-light transition-colors shadow-sm shadow-brand/20">
            ← Back to Training
          </Link>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-6 py-14">

        {/* Hero */}
        <div className="mb-16">
          <div className="inline-flex items-center gap-2 text-[10px] font-semibold uppercase tracking-widest px-3 py-1.5 rounded-full mb-6 bg-brand-muted border border-brand/25 text-brand">
            Taiwan Academy of Banking and Finance
          </div>
          <h1 className="text-4xl font-black text-white mb-4 tracking-tight">TABF FinMentor</h1>
          <p className="text-neutral-400 text-base max-w-2xl leading-relaxed">
            An AI-powered adaptive training platform for financial certification candidates —
            combining local LLM generation, interactive visualisations, and a contextual AI tutor.
          </p>
          <div className="flex items-center gap-6 mt-8 text-xs text-neutral-600">
            <span>11 Topic Areas</span>
            <span className="w-1 h-1 rounded-full bg-neutral-700" />
            <span>8 Interactive Charts</span>
            <span className="w-1 h-1 rounded-full bg-neutral-700" />
            <span>AI Question Generation</span>
            <span className="w-1 h-1 rounded-full bg-neutral-700" />
            <span>Streaming AI Tutor</span>
          </div>
        </div>

        {/* Features */}
        <Section title="Product Features">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <FeatureCard icon="🎯" title="Adaptive MCQ Practice"
              desc="AI generates fresh CFA-style multiple-choice questions on demand, tailored to topic, difficulty level (L1/L2/L3), and the candidate's weak areas — never the same question twice." />
            <FeatureCard icon="🃏" title="Flashcard Mode"
              desc="Flip-card format for rapid concept review. Candidates mark cards as 'Got It' or 'Review Again', building a spaced-repetition intuition before exam day." />
            <FeatureCard icon="📊" title="8 Interactive Visualisations"
              desc="Drag sliders to see compound growth curves, bond price-yield relationships, options payoff diagrams, ESG radar charts, risk matrices, and more — in real time." />
            <FeatureCard icon="🤖" title="Streaming AI Tutor"
              desc="A context-aware chat panel explains the current question, walks through formulas step-by-step, and answers follow-up questions — with full knowledge of the question and correct answer." />
            <FeatureCard icon="💡" title="Smart Study Path"
              desc="After each answer, the system analyses score history and surfaces a smart recommendation: 'Your weakest area is Risk Management (42%) — drill it next?' One click to accept." />
            <FeatureCard icon="🌱" title="ESG & New Finance Topics"
              desc="Beyond classic CFA curriculum: questions on ESG scoring, TCFD, Basel III capital requirements, AML/KYC frameworks, FATF recommendations — critical for modern banking professionals." />
            <FeatureCard icon="📡" title="Exhibition Demo Mode"
              desc="One-click mode for trade show screens: the app auto-cycles through questions, auto-answers, and moves on — no human needed. Designed for TABF's October exhibition." />
            <FeatureCard icon="📈" title="Progress Analytics"
              desc="A radar chart in the sidebar shows accuracy across all 11 topic areas at a glance. Colour-coded category bars (red/amber/green) show where the candidate stands." />
            <FeatureCard icon="🏦" title="Banking-Focused Coverage"
              desc="Covers both international certifications (CFA) and banking-specific domains — Compliance & AML, Risk Management, ESG — aligned with TABF's own proficiency testing areas." />
          </div>
        </Section>

        {/* System Architecture */}
        <Section title="System Architecture">
          <p className="text-xs text-neutral-500 mb-8 leading-relaxed max-w-2xl">
            The platform is built as a 3-tier system: a Next.js 14 frontend, a Python FastAPI backend, and a PostgreSQL data layer. AI inference runs entirely on-device via Ollama — no external API calls, no data leaves the server.
          </p>

          <div className="bg-surface border border-white/[0.07] rounded-2xl p-8 overflow-x-auto">
            <div className="min-w-[640px]">

              <div className="flex justify-center mb-2">
                <div className="bg-surface-2 border border-white/[0.10] rounded-xl px-6 py-3 text-center">
                  <p className="text-xs font-semibold text-white">User Browser</p>
                  <p className="text-[10px] text-neutral-600 mt-0.5">React 18 · Recharts · Tailwind CSS</p>
                </div>
              </div>
              <Arrow />

              <div className="border border-brand/25 rounded-2xl p-5 bg-brand-muted mb-2">
                <p className="text-[10px] text-brand font-semibold uppercase tracking-widest mb-4 text-center">Next.js 14 — App Router</p>
                <div className="grid grid-cols-3 gap-3 mb-4">
                  <Box label="Server Components" sub="SSR · prefetch scores" />
                  <Box label="Client Components" sub="AppShell · Charts · Chat" />
                  <Box label="API Routes" sub="/api/* proxy layer" />
                </div>
                <div className="grid grid-cols-4 gap-2">
                  <Box label="/api/questions" sub="GET · DB query" />
                  <Box label="/api/sessions" sub="POST · save answer" />
                  <Box label="/api/scores" sub="GET · all scores" />
                  <Box label="/api/ai/*" sub="proxy to Python" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="flex flex-col">
                  <Arrow />
                  <div className="border border-sky-500/25 rounded-2xl p-4 bg-sky-500/5">
                    <p className="text-[10px] text-sky-400 font-semibold uppercase tracking-widest mb-3 text-center">PostgreSQL · DrizzleORM</p>
                    <div className="space-y-2">
                      <Box label="questions" sub="seed questions · jsonb params" accent="border-sky-500/20" />
                      <Box label="user_sessions" sub="per-answer log" accent="border-sky-500/20" />
                      <Box label="user_scores" sub="UNIQUE(category, level) upsert" accent="border-sky-500/20" />
                    </div>
                  </div>
                </div>
                <div className="flex flex-col">
                  <Arrow />
                  <div className="border border-emerald-500/25 rounded-2xl p-4 bg-emerald-500/5">
                    <p className="text-[10px] text-emerald-400 font-semibold uppercase tracking-widest mb-3 text-center">Python FastAPI · Port 8000</p>
                    <div className="space-y-2">
                      <Box label="POST /generate" sub="JSON question · 2 retries" accent="border-emerald-500/20" />
                      <Box label="POST /chat" sub="StreamingResponse · text/plain" accent="border-emerald-500/20" />
                      <Arrow />
                      <Box label="Ollama · localhost:11434" sub="llama3.2:1b · gpt-oss:20b" accent="border-emerald-500/30" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Section>

        {/* AI Pipeline */}
        <Section title="AI Pipeline — Question Generation">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-0 items-stretch">
            {[
              { step: "1", label: "Request", desc: "User selects category + level. Frontend picks a random category from the active filter and POSTs to /api/ai/generate." },
              { step: "2", label: "Prompt Build", desc: "FastAPI constructs a structured prompt with category guidance, CFA-style requirements, and explicit JSON schema. No markdown allowed." },
              { step: "3", label: "LLM Inference", desc: "Ollama runs the local model (llama3.2:1b or gpt-oss:20b). No tokens leave the machine — full data privacy." },
              { step: "4", label: "JSON Extraction", desc: "Response is parsed with a regex fallback (extract_json) in case the model wraps output in prose. 2 retries on parse failure." },
              { step: "5", label: "Deliver", desc: "Validated question JSON returns to Next.js, which merges in default visualisation params and serves it to the client." },
            ].map((item, i, arr) => (
              <div key={item.step} className="flex items-stretch">
                <div className="bg-surface-1 border border-white/[0.07] rounded-2xl p-4 flex-1">
                  <div className="w-6 h-6 rounded-full bg-brand-muted border border-brand/35 flex items-center justify-center mb-3">
                    <span className="text-[10px] font-bold text-brand">{item.step}</span>
                  </div>
                  <p className="text-xs font-semibold text-white mb-1.5">{item.label}</p>
                  <p className="text-[11px] text-neutral-500 leading-relaxed">{item.desc}</p>
                </div>
                {i < arr.length - 1 && (
                  <div className="flex items-center px-2 text-neutral-700 text-lg shrink-0">→</div>
                )}
              </div>
            ))}
          </div>

          <div className="mt-6 bg-surface-1 border border-white/[0.07] rounded-2xl p-5">
            <p className="text-xs font-semibold text-white mb-3">AI Tutor — Streaming Chat Pipeline</p>
            <div className="flex flex-wrap items-center gap-2 text-xs">
              {[
                "User types message",
                "Next.js /api/ai/chat",
                "FastAPI /chat",
                "Ollama stream_completion()",
                "AsyncGenerator yields chunks",
                "StreamingResponse (text/plain)",
                "Response.body piped directly",
                "Typewriter effect in browser",
              ].map((step, i, arr) => (
                <span key={step} className="flex items-center gap-2">
                  <span className="bg-surface-2 border border-white/[0.07] rounded-lg px-2.5 py-1 text-neutral-400">{step}</span>
                  {i < arr.length - 1 && <span className="text-neutral-700">→</span>}
                </span>
              ))}
            </div>
            <p className="text-[11px] text-neutral-600 mt-3">
              The chat route passes <code className="text-neutral-400 bg-white/[0.05] px-1 py-0.5 rounded">pythonResponse.body</code> directly
              as a <code className="text-neutral-400 bg-white/[0.05] px-1 py-0.5 rounded">ReadableStream</code> — never buffered — so the first token appears in under 100ms.
            </p>
          </div>
        </Section>

        {/* Security */}
        <Section title="Security & Output Validation">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-xs font-semibold text-white mb-4">Attack Prevention</h3>
              <div className="space-y-3">
                {[
                  { threat: "Prompt Injection", severity: "High",
                    mitigation: "User input is wrapped in a structured system prompt with clearly delimited boundaries. The model is instructed to treat injected instructions as data, not commands." },
                  { threat: "Jailbreak / Policy Bypass", severity: "Medium",
                    mitigation: "All prompts include explicit role-locking. Outputs are validated against expected structure (JSON schema for questions, plaintext for chat) before being served." },
                  { threat: "Data Exfiltration", severity: "Low",
                    mitigation: "Ollama runs fully on-device (localhost:11434). No user data, responses, or chat history is sent to external APIs. The architecture is air-gap friendly." },
                  { threat: "SQL Injection", severity: "Low",
                    mitigation: "All database queries use DrizzleORM with parameterised queries. No raw SQL string interpolation anywhere in the codebase." },
                ].map((item) => (
                  <div key={item.threat} className="bg-surface-1 border border-white/[0.07] rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs font-semibold text-white">{item.threat}</p>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                        item.severity === "High" ? "bg-brand-muted text-brand border border-brand/25" :
                        item.severity === "Medium" ? "bg-amber-500/12 text-amber-400 border border-amber-500/25" :
                        "bg-emerald-500/12 text-emerald-400 border border-emerald-500/25"
                      }`}>{item.severity}</span>
                    </div>
                    <p className="text-[11px] text-neutral-500 leading-relaxed">{item.mitigation}</p>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h3 className="text-xs font-semibold text-white mb-4">Output Quality Validation</h3>
              <div className="space-y-3">
                {[
                  { label: "JSON Schema Enforcement", desc: "AI questions must conform to a strict schema: question_text, choice_a/b/c, correct_answer (A/B/C only), explanation. Any deviation triggers a retry." },
                  { label: "extract_json() Fallback", desc: "A regex fallback extracts valid JSON from responses that include surrounding prose — common with smaller models like llama3.2:1b." },
                  { label: "2-Retry Logic", desc: "If JSON parsing fails on the first attempt, the full prompt is retried. After 2 failures the API falls back to a random seed question from the database." },
                  { label: "Answer Validation", desc: "correct_answer is forced to uppercase and must be exactly 'A', 'B', or 'C'. Any other value triggers the seed fallback." },
                  { label: "Score Integrity", desc: "Session records use database transactions — score upsert and session insert are atomic. A crash mid-transaction does not produce partial state." },
                ].map((item) => (
                  <div key={item.label} className="bg-surface-1 border border-white/[0.07] rounded-xl p-4">
                    <p className="text-xs font-semibold text-emerald-400 mb-1.5">{item.label}</p>
                    <p className="text-[11px] text-neutral-500 leading-relaxed">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Section>

        {/* Tech Stack */}
        <Section title="Technology Stack">
          <div className="overflow-hidden rounded-2xl border border-white/[0.07]">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/[0.07] bg-surface-1">
                  <th className="text-left px-5 py-3 text-[10px] font-semibold text-neutral-600 uppercase tracking-widest">Layer</th>
                  <th className="text-left px-5 py-3 text-[10px] font-semibold text-neutral-600 uppercase tracking-widest">Technology</th>
                  <th className="text-left px-5 py-3 text-[10px] font-semibold text-neutral-600 uppercase tracking-widest">Role</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {[
                  ["Frontend", "Next.js 14 · App Router", "SSR pages, API proxy routes, streaming"],
                  ["UI", "React 18 · TypeScript · Tailwind CSS", "Component tree, type safety, styling"],
                  ["Charts", "Recharts", "8 interactive financial visualisations"],
                  ["State", "useReducer (custom hook)", "All app state — no external state library"],
                  ["Database", "PostgreSQL 16 · Docker", "Questions, sessions, scores"],
                  ["ORM", "DrizzleORM · postgres driver", "Type-safe SQL, schema push, seed"],
                  ["AI Backend", "Python FastAPI", "Question generation, streaming chat proxy"],
                  ["LLM Runtime", "Ollama", "Local inference — llama3.2:1b / gpt-oss:20b"],
                  ["Font", "DM Sans (Google Fonts)", "Clean modern financial aesthetic"],
                ].map(([layer, tech, role]) => (
                  <tr key={layer} className="bg-surface hover:bg-surface-1 transition-colors">
                    <td className="px-5 py-3 text-xs text-neutral-500 font-medium">{layer}</td>
                    <td className="px-5 py-3 text-xs text-white font-mono">{tech}</td>
                    <td className="px-5 py-3 text-xs text-neutral-600">{role}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Section>

        {/* Use Cases */}
        <Section title="Use Cases & Target Audience">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { audience: "CFA Candidates", icon: "🎓", scenarios: [
                "Daily MCQ practice across all 11 curriculum areas",
                "Flashcard review of formulas and definitions",
                "Ask the AI tutor to walk through a calculation step-by-step",
                "Identify weak areas via the radar analytics chart",
              ]},
              { audience: "Banking Professionals", icon: "🏦", scenarios: [
                "Regulatory compliance and AML scenario training",
                "Risk management — Basel III, VaR interpretation",
                "ESG integration and sustainable finance concepts",
                "Level-appropriate questions (L1 refresher → L3 advanced)",
              ]},
              { audience: "TABF Exhibition", icon: "🖥️", scenarios: [
                "One-click Exhibition Demo Mode for unattended screens",
                "Showcases AI question generation live to visitors",
                "Interactive chart demos — visitors can move sliders",
                "AI tutor conversation demonstrates real-time streaming",
              ]},
            ].map((item) => (
              <div key={item.audience} className="bg-surface-1 border border-white/[0.07] rounded-2xl p-5">
                <div className="text-2xl mb-3">{item.icon}</div>
                <h3 className="text-sm font-semibold text-white mb-3">{item.audience}</h3>
                <ul className="space-y-2">
                  {item.scenarios.map((s) => (
                    <li key={s} className="flex items-start gap-2 text-[11px] text-neutral-500">
                      <span className="text-brand mt-0.5 shrink-0">·</span>
                      {s}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </Section>

        {/* Footer */}
        <div className="border-t border-white/[0.06] pt-8 flex items-center justify-between">
          <p className="text-xs text-neutral-700">TABF FinMentor · Built for Taiwan Academy of Banking and Finance</p>
          <Link href="/" className="px-4 py-2 text-xs font-semibold rounded-xl bg-brand text-white hover:bg-brand-light transition-colors">
            ← Back to Training
          </Link>
        </div>
      </div>
    </div>
  );
}
