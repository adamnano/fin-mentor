import Link from "next/link";

export const metadata = {
  title: "FinMentor AI — Product Architecture | TABF",
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-16">
      <h2 className="text-xs font-semibold text-neutral-500 uppercase tracking-widest mb-6 pb-3 border-b border-white/[0.06]">
        {title}
      </h2>
      {children}
    </section>
  );
}

function FeatureCard({ icon, title, desc }: { icon: string; title: string; desc: string }) {
  return (
    <div className="bg-[#111111] border border-white/[0.07] rounded-2xl p-5 hover:border-white/[0.12] transition-colors">
      <div className="text-2xl mb-3">{icon}</div>
      <h3 className="text-sm font-semibold text-white mb-2">{title}</h3>
      <p className="text-xs text-neutral-500 leading-relaxed">{desc}</p>
    </div>
  );
}

function Box({ label, sub, color = "border-white/[0.12]", bg = "bg-[#111]" }: { label: string; sub?: string; color?: string; bg?: string }) {
  return (
    <div className={`rounded-xl border ${color} ${bg} px-4 py-3 text-center`}>
      <p className="text-xs font-semibold text-white">{label}</p>
      {sub && <p className="text-[10px] text-neutral-600 mt-0.5">{sub}</p>}
    </div>
  );
}

function Arrow({ dir = "down" }: { dir?: "down" | "right" }) {
  return (
    <div className={`flex ${dir === "down" ? "justify-center" : "items-center"} ${dir === "down" ? "my-1" : "mx-1"}`}>
      <span className="text-neutral-700 text-lg">{dir === "down" ? "↓" : "→"}</span>
    </div>
  );
}

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Nav */}
      <nav className="border-b border-white/[0.06] bg-[#111111] sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg bg-[#E63C3A] flex items-center justify-center shadow-lg">
              <span className="text-white text-[10px] font-bold">FM</span>
            </div>
            <div>
              <span className="text-sm font-semibold text-white">FinMentor AI</span>
              <span className="text-neutral-600 mx-2 text-sm">·</span>
              <span className="text-xs text-neutral-600">Product Architecture</span>
            </div>
          </div>
          <Link
            href="/"
            className="px-4 py-2 text-xs font-medium rounded-lg bg-[#E63C3A] text-white hover:bg-[#ff6b69] transition-colors"
          >
            Launch App →
          </Link>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-6 py-16">

        {/* Hero */}
        <div className="mb-20 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E63C3A]/10 border border-[#E63C3A]/25 text-[#E63C3A] text-xs font-semibold mb-6 tracking-wide">
            Taiwan Academy of Banking and Finance
          </div>
          <h1 className="text-4xl font-bold text-white mb-4 tracking-tight">
            FinMentor AI
          </h1>
          <p className="text-neutral-400 text-lg max-w-2xl mx-auto leading-relaxed">
            An AI-powered adaptive training platform for financial certification candidates —
            combining local LLM generation, interactive visualizations, and a contextual AI tutor.
          </p>
          <div className="flex items-center justify-center gap-6 mt-8 text-xs text-neutral-600">
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
            <FeatureCard
              icon="🎯"
              title="Adaptive MCQ Practice"
              desc="AI generates fresh CFA-style multiple-choice questions on demand, tailored to topic, difficulty level (L1/L2/L3), and the candidate's weak areas — never the same question twice."
            />
            <FeatureCard
              icon="🃏"
              title="Flashcard Mode"
              desc="Flip-card format for rapid concept review. Candidates mark cards as 'Got It' or 'Review Again', building a spaced-repetition intuition before exam day."
            />
            <FeatureCard
              icon="📊"
              title="8 Interactive Visualizations"
              desc="Drag sliders to see compound growth curves, bond price-yield relationships, options payoff diagrams, ESG radar charts, risk matrices, and more — in real time."
            />
            <FeatureCard
              icon="🤖"
              title="Streaming AI Tutor"
              desc="A context-aware chat panel explains the current question, walks through formulas step-by-step, and answers follow-up questions — all with full knowledge of the question and correct answer."
            />
            <FeatureCard
              icon="💡"
              title="Smart Study Path"
              desc="After each answer, the system analyses score history and surfaces a smart recommendation: 'Your weakest area is Risk Management (42%) — drill it next?' One click to accept."
            />
            <FeatureCard
              icon="🌱"
              title="ESG & New Finance Topics"
              desc="Beyond classic CFA curriculum: questions on ESG scoring, TCFD, Basel III capital requirements, AML/KYC frameworks, FATF recommendations — critical for modern banking professionals."
            />
            <FeatureCard
              icon="📡"
              title="Exhibition Demo Mode"
              desc="One-click mode for trade show screens: the app auto-cycles through questions, auto-answers, and moves on — no human needed. Designed for TABF's October exhibition."
            />
            <FeatureCard
              icon="📈"
              title="Progress Analytics"
              desc="A radar chart in the sidebar shows accuracy across all 11 topic areas at a glance. Colour-coded category bars (red/amber/green) show where the candidate stands."
            />
            <FeatureCard
              icon="🏦"
              title="Banking-Focused Coverage"
              desc="Covers both international certifications (CFA) and banking-specific domains — Compliance & AML, Risk Management, ESG — aligned with TABF's own proficiency testing areas."
            />
          </div>
        </Section>

        {/* System Architecture */}
        <Section title="System Architecture">
          <p className="text-xs text-neutral-500 mb-8 leading-relaxed max-w-2xl">
            The platform is built as a 3-tier system: a Next.js 14 frontend, a Python FastAPI backend, and a PostgreSQL data layer. AI inference runs entirely on-device via Ollama — no external API calls, no data leaves the server.
          </p>

          {/* Architecture diagram */}
          <div className="bg-[#0d0d0d] border border-white/[0.07] rounded-2xl p-8 overflow-x-auto">
            <div className="min-w-[640px]">

              {/* Top: User */}
              <div className="flex justify-center mb-2">
                <div className="bg-[#1a1a1a] border border-white/[0.12] rounded-xl px-6 py-3 text-center">
                  <p className="text-xs font-semibold text-white">User Browser</p>
                  <p className="text-[10px] text-neutral-600 mt-0.5">React 18 · Framer Motion · Recharts</p>
                </div>
              </div>
              <Arrow dir="down" />

              {/* Next.js Layer */}
              <div className="border border-[#E63C3A]/30 rounded-2xl p-5 bg-[#E63C3A]/5 mb-2">
                <p className="text-[10px] text-[#E63C3A] font-semibold uppercase tracking-widest mb-4 text-center">Next.js 14 — App Router</p>
                <div className="grid grid-cols-3 gap-3 mb-4">
                  <Box label="Server Components" sub="SSR · prefetch scores" />
                  <Box label="Client Components" sub="AppShell · Charts · Chat" />
                  <Box label="API Routes" sub="/api/* proxy layer" />
                </div>
                <div className="grid grid-cols-4 gap-2">
                  <Box label="/api/questions" sub="GET · DB query" color="border-neutral-800" bg="bg-[#0d0d0d]" />
                  <Box label="/api/sessions" sub="POST · save answer" color="border-neutral-800" bg="bg-[#0d0d0d]" />
                  <Box label="/api/scores" sub="GET · all scores" color="border-neutral-800" bg="bg-[#0d0d0d]" />
                  <Box label="/api/ai/*" sub="proxy to Python" color="border-neutral-800" bg="bg-[#0d0d0d]" />
                </div>
              </div>

              {/* Split into DB + FastAPI */}
              <div className="grid grid-cols-2 gap-6">
                <div className="flex flex-col">
                  <Arrow dir="down" />
                  <div className="border border-sky-500/30 rounded-2xl p-4 bg-sky-500/5">
                    <p className="text-[10px] text-sky-400 font-semibold uppercase tracking-widest mb-3 text-center">PostgreSQL · DrizzleORM</p>
                    <div className="space-y-2">
                      <Box label="questions" sub="21 seed questions · jsonb params" color="border-neutral-800" bg="bg-[#0d0d0d]" />
                      <Box label="user_sessions" sub="per-answer log" color="border-neutral-800" bg="bg-[#0d0d0d]" />
                      <Box label="user_scores" sub="UNIQUE(category, level) upsert" color="border-neutral-800" bg="bg-[#0d0d0d]" />
                    </div>
                  </div>
                </div>
                <div className="flex flex-col">
                  <Arrow dir="down" />
                  <div className="border border-emerald-500/30 rounded-2xl p-4 bg-emerald-500/5">
                    <p className="text-[10px] text-emerald-400 font-semibold uppercase tracking-widest mb-3 text-center">Python FastAPI · Port 8000</p>
                    <div className="space-y-2">
                      <Box label="POST /generate" sub="JSON question · 2 retries" color="border-neutral-800" bg="bg-[#0d0d0d]" />
                      <Box label="POST /chat" sub="StreamingResponse · text/plain" color="border-neutral-800" bg="bg-[#0d0d0d]" />
                      <Arrow dir="down" />
                      <Box label="Ollama · localhost:11434" sub="llama3.2:1b default · gpt-oss:20b quality" color="border-emerald-800/50" bg="bg-emerald-950/20" />
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
              { step: "5", label: "Deliver", desc: "Validated question JSON returns to Next.js, which merges in default visualization params and serves it to the client." },
            ].map((item, i, arr) => (
              <div key={item.step} className="flex items-stretch">
                <div className="bg-[#111] border border-white/[0.07] rounded-2xl p-4 flex-1">
                  <div className="w-6 h-6 rounded-full bg-[#E63C3A]/20 border border-[#E63C3A]/40 flex items-center justify-center mb-3">
                    <span className="text-[10px] font-bold text-[#E63C3A]">{item.step}</span>
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

          {/* Chat streaming pipeline */}
          <div className="mt-6 bg-[#111] border border-white/[0.07] rounded-2xl p-5">
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
                  <span className="bg-[#1a1a1a] border border-white/[0.07] rounded-lg px-2.5 py-1 text-neutral-400">{step}</span>
                  {i < arr.length - 1 && <span className="text-neutral-700">→</span>}
                </span>
              ))}
            </div>
            <p className="text-[11px] text-neutral-600 mt-3">
              Critical implementation detail: the chat route passes <code className="text-neutral-400 bg-white/[0.05] px-1 py-0.5 rounded">pythonResponse.body</code> directly
              as a <code className="text-neutral-400 bg-white/[0.05] px-1 py-0.5 rounded">ReadableStream</code> — never buffered — so the first token appears in &lt;100ms.
            </p>
          </div>
        </Section>

        {/* RAG Architecture */}
        <Section title="RAG Architecture (Forward Design)">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-xs text-neutral-500 leading-relaxed mb-5">
                The current system uses a prompted LLM without retrieval. The forward design adds a
                Retrieval-Augmented Generation (RAG) layer so the AI tutor can cite TABF training materials,
                financial regulations, and CFA curriculum content with precision.
              </p>
              <div className="space-y-3">
                {[
                  { label: "Document Ingestion", color: "border-violet-500/30 bg-violet-500/5 text-violet-400", desc: "TABF materials, CFA curriculum PDFs, Basel III texts, FATF recommendations — chunked into ~512-token segments." },
                  { label: "Embedding & Storage", color: "border-sky-500/30 bg-sky-500/5 text-sky-400", desc: "Each chunk is embedded via a local model (nomic-embed-text via Ollama) and stored in pgvector, co-located with PostgreSQL." },
                  { label: "Retrieval", color: "border-emerald-500/30 bg-emerald-500/5 text-emerald-400", desc: "On each user message, the top-k most semantically similar chunks are fetched using cosine similarity." },
                  { label: "Augmented Prompt", color: "border-amber-500/30 bg-amber-500/5 text-amber-400", desc: "Retrieved chunks are injected into the system prompt before the user's question, grounding the LLM response in official sources." },
                  { label: "Citation Output", color: "border-[#E63C3A]/30 bg-[#E63C3A]/5 text-[#E63C3A]", desc: "The LLM is instructed to cite the source document and page, which is rendered as a link in the chat UI." },
                ].map((item) => (
                  <div key={item.label} className={`border ${item.color} rounded-xl p-3`}>
                    <p className={`text-[10px] font-semibold uppercase tracking-widest mb-1 ${item.color.split(" ")[2]}`}>{item.label}</p>
                    <p className="text-[11px] text-neutral-500 leading-relaxed">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-[#0d0d0d] border border-white/[0.07] rounded-2xl p-5 flex flex-col gap-2">
              <p className="text-[10px] text-neutral-600 uppercase tracking-widest font-semibold mb-2">RAG Flow Diagram</p>
              <Box label="User Question" color="border-white/[0.12]" />
              <Arrow dir="down" />
              <Box label="Embedding Model (nomic-embed-text)" sub="via Ollama · local" color="border-violet-500/30" bg="bg-violet-500/5" />
              <Arrow dir="down" />
              <Box label="Vector Search · pgvector" sub="cosine similarity · top-k=5 chunks" color="border-sky-500/30" bg="bg-sky-500/5" />
              <Arrow dir="down" />
              <Box label="Context Assembly" sub="system prompt + retrieved chunks + question" color="border-amber-500/30" bg="bg-amber-500/5" />
              <Arrow dir="down" />
              <Box label="LLM Generation" sub="Ollama · grounded answer + citations" color="border-emerald-500/30" bg="bg-emerald-500/5" />
              <Arrow dir="down" />
              <Box label="Streaming Response to User" color="border-[#E63C3A]/30" bg="bg-[#E63C3A]/5" />
            </div>
          </div>
        </Section>

        {/* Security */}
        <Section title="Security & Output Validation">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-xs font-semibold text-white mb-4">Attack Prevention</h3>
              <div className="space-y-3">
                {[
                  {
                    threat: "Prompt Injection",
                    mitigation: "User input passed to the AI tutor is wrapped in a structured system prompt with a clearly delimited boundary. The model is instructed to treat injected instructions as data, not commands.",
                    severity: "High",
                  },
                  {
                    threat: "Jailbreak / Policy Bypass",
                    mitigation: "All prompts include an explicit role-locking instruction. Outputs are validated against expected structure (JSON schema for questions, plaintext for chat) before being served.",
                    severity: "Medium",
                  },
                  {
                    threat: "Data Exfiltration",
                    mitigation: "Ollama runs fully on-device (localhost:11434). No user data, question responses, or chat history is sent to external APIs. The architecture is air-gap friendly.",
                    severity: "Low",
                  },
                  {
                    threat: "SQL Injection",
                    mitigation: "All database queries use DrizzleORM with parameterized queries. No raw SQL string interpolation is used anywhere in the codebase.",
                    severity: "Low",
                  },
                ].map((item) => (
                  <div key={item.threat} className="bg-[#111] border border-white/[0.07] rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs font-semibold text-white">{item.threat}</p>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                        item.severity === "High"
                          ? "bg-red-500/15 text-red-400"
                          : item.severity === "Medium"
                          ? "bg-amber-500/15 text-amber-400"
                          : "bg-emerald-500/15 text-emerald-400"
                      }`}>
                        {item.severity}
                      </span>
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
                  { label: "JSON Schema Enforcement", desc: "AI-generated questions must conform to a strict schema: question_text, choice_a/b/c, correct_answer (A/B/C only), explanation. Any deviation triggers a retry." },
                  { label: "extract_json() Fallback", desc: "A regex fallback extracts valid JSON from responses that include surrounding prose — common with smaller models like llama3.2:1b." },
                  { label: "2-Retry Logic", desc: "If JSON parsing fails on the first attempt, the full prompt is retried. After 2 failures, the API falls back to a random seed question from the database." },
                  { label: "Answer Validation", desc: "correct_answer is forced to uppercase and must be exactly 'A', 'B', or 'C'. Any other value triggers the seed fallback." },
                  { label: "Score Integrity", desc: "Session records use database transactions — score upsert and session insert are atomic. A crash mid-transaction does not produce partial state." },
                ].map((item) => (
                  <div key={item.label} className="bg-[#111] border border-white/[0.07] rounded-xl p-4">
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
                <tr className="border-b border-white/[0.07] bg-[#111]">
                  <th className="text-left px-5 py-3 text-[10px] font-semibold text-neutral-600 uppercase tracking-widest">Layer</th>
                  <th className="text-left px-5 py-3 text-[10px] font-semibold text-neutral-600 uppercase tracking-widest">Technology</th>
                  <th className="text-left px-5 py-3 text-[10px] font-semibold text-neutral-600 uppercase tracking-widest">Role</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {[
                  ["Frontend", "Next.js 14 · App Router", "SSR pages, API proxy routes, streaming"],
                  ["UI", "React 18 · TypeScript · Tailwind CSS", "Component tree, type safety, styling"],
                  ["Animation", "Framer Motion", "Question card transitions, flashcard flip"],
                  ["Charts", "Recharts", "8 interactive financial visualizations"],
                  ["State", "useReducer (custom hook)", "All app state — no external state library"],
                  ["Database", "PostgreSQL 16 · Docker", "Questions, sessions, scores"],
                  ["ORM", "DrizzleORM · postgres driver", "Type-safe SQL, schema push, seed"],
                  ["AI Backend", "Python FastAPI", "Question generation, streaming chat proxy"],
                  ["LLM Runtime", "Ollama 0.18.3", "Local inference — llama3.2:1b / gpt-oss:20b"],
                  ["Font", "DM Sans (Google Fonts)", "Clean modern financial aesthetic"],
                ].map(([layer, tech, role]) => (
                  <tr key={layer} className="bg-[#0d0d0d] hover:bg-[#111] transition-colors">
                    <td className="px-5 py-3 text-xs text-neutral-500 font-medium">{layer}</td>
                    <td className="px-5 py-3 text-xs text-white font-mono">{tech}</td>
                    <td className="px-5 py-3 text-xs text-neutral-600">{role}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Section>

        {/* Use Scenarios */}
        <Section title="Use Cases & Target Audience">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              {
                audience: "CFA Candidates",
                icon: "🎓",
                scenarios: [
                  "Daily MCQ practice across all 11 curriculum areas",
                  "Flashcard review of formulas and definitions",
                  "Ask the AI tutor to walk through a calculation step-by-step",
                  "Identify weak areas via the radar analytics chart",
                ],
              },
              {
                audience: "Banking Professionals",
                icon: "🏦",
                scenarios: [
                  "Regulatory compliance and AML scenario training",
                  "Risk management — Basel III, VaR interpretation",
                  "ESG integration and sustainable finance concepts",
                  "Level-appropriate questions (L1 refresher → L3 advanced)",
                ],
              },
              {
                audience: "TABF Exhibition",
                icon: "🖥️",
                scenarios: [
                  "One-click Exhibition Demo Mode for unattended screens",
                  "Showcases AI question generation live to visitors",
                  "Interactive chart demos — visitors can move sliders",
                  "AI tutor conversation demonstrates real-time streaming",
                ],
              },
            ].map((item) => (
              <div key={item.audience} className="bg-[#111] border border-white/[0.07] rounded-2xl p-5">
                <div className="text-2xl mb-3">{item.icon}</div>
                <h3 className="text-sm font-semibold text-white mb-3">{item.audience}</h3>
                <ul className="space-y-2">
                  {item.scenarios.map((s) => (
                    <li key={s} className="flex items-start gap-2 text-[11px] text-neutral-500">
                      <span className="text-[#E63C3A] mt-0.5 shrink-0">·</span>
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
          <p className="text-xs text-neutral-700">
            FinMentor AI · Built for Taiwan Academy of Banking and Finance · TABF October Exhibition
          </p>
          <Link
            href="/"
            className="px-4 py-2 text-xs font-medium rounded-lg bg-[#E63C3A] text-white hover:bg-[#ff6b69] transition-colors"
          >
            Launch App →
          </Link>
        </div>
      </div>
    </div>
  );
}
