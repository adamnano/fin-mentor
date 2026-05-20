import Link from "next/link";
import Image from "next/image";

export const metadata = {
  title: "TABF FinMentor · About",
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-12">
      <h2 className="text-[10px] font-semibold text-neutral-600 uppercase tracking-widest mb-5 pb-3 border-b border-white/[0.06]">
        {title}
      </h2>
      {children}
    </section>
  );
}

export default function AboutPage() {
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
            <span className="text-xs text-neutral-500">About</span>
          </div>
          <Link href="/" className="px-4 py-2 text-xs font-semibold rounded-xl bg-brand text-white hover:bg-brand-light transition-colors">
            ← Back to Training
          </Link>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-12">

        {/* Header */}
        <div className="mb-12">
          <h1 className="text-3xl font-black text-white mb-3">TABF FinMentor</h1>
          <p className="text-neutral-400 text-sm leading-relaxed max-w-2xl">
            A CFA exam practice tool built for the Taiwan Academy of Banking and Finance.
            It generates questions on demand using an LLM, records your answers in a database,
            and lets you chat with an AI tutor about each question.
          </p>
        </div>

        {/* How it works */}
        <Section title="How it works">
          <p className="text-xs text-neutral-500 leading-relaxed mb-6 max-w-2xl">
            Three tiers: a Next.js frontend, a Python FastAPI backend that handles all AI calls, and a PostgreSQL database.
            The frontend never calls OpenAI directly — everything goes through the Python backend.
          </p>

          {/* Architecture diagram */}
          <div className="rounded-2xl border border-white/[0.07] bg-surface overflow-hidden">

            {/* Browser row */}
            <div className="flex items-center justify-center px-8 py-5 border-b border-white/[0.06]">
              <div className="text-center">
                <p className="text-xs font-semibold text-white">Browser</p>
                <p className="text-[10px] text-neutral-600 mt-0.5">React 18 · Recharts · Tailwind</p>
              </div>
            </div>

            <div className="flex divide-x divide-white/[0.06]">
              {/* Next.js column */}
              <div className="flex-1 p-5">
                <p className="text-[10px] font-semibold text-brand uppercase tracking-widest mb-4">Next.js 14</p>
                <div className="space-y-2">
                  {[
                    ["Pages", "/, /stats, /roadmap, /about"],
                    ["Server components", "query DB directly (stats, scores)"],
                    ["API routes", "proxy layer to Python backend"],
                    ["State", "useReducer in useAppState hook"],
                  ].map(([k, v]) => (
                    <div key={k}>
                      <span className="text-[10px] font-semibold text-neutral-400">{k} </span>
                      <span className="text-[10px] text-neutral-600">{v}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Python column */}
              <div className="flex-1 p-5">
                <p className="text-[10px] font-semibold text-emerald-400 uppercase tracking-widest mb-4">Python FastAPI · port 8000</p>
                <div className="space-y-2">
                  {[
                    ["POST /generate", "build prompt → OpenAI → parse JSON"],
                    ["POST /chat", "question context → OpenAI stream"],
                    ["GET /news/headlines", "RSS feed fetch"],
                    ["POST /news/analyze", "article text → OpenAI stream"],
                    ["POST /news/discuss", "article discussion stream"],
                  ].map(([k, v]) => (
                    <div key={k}>
                      <code className="text-[10px] font-mono text-emerald-400">{k}</code>
                      <span className="text-[10px] text-neutral-600"> — {v}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* DB column */}
              <div className="flex-1 p-5">
                <p className="text-[10px] font-semibold text-sky-400 uppercase tracking-widest mb-4">PostgreSQL · Drizzle ORM</p>
                <div className="space-y-3">
                  {[
                    { table: "questions", desc: "seed questions with category, level, choices, correct answer, visualization params" },
                    { table: "user_sessions", desc: "one row per answered question — answer given, correct/wrong, time spent" },
                    { table: "user_scores", desc: "running totals per category+level, upserted on each answer" },
                  ].map((t) => (
                    <div key={t.table}>
                      <code className="text-[10px] font-mono text-sky-400">{t.table}</code>
                      <p className="text-[10px] text-neutral-600 mt-0.5">{t.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </Section>

        {/* Question generation */}
        <Section title="Question generation">
          <div className="flex items-stretch gap-0">
            {[
              { n: "1", label: "Request", text: "User picks a category + level (or it's chosen randomly from active filters). Frontend POSTs to /api/ai/generate." },
              { n: "2", label: "Prompt", text: "FastAPI builds a structured prompt: CFA exam expert persona, the category, difficulty level, and a strict JSON output schema." },
              { n: "3", label: "OpenAI call", text: "gpt-4.1-mini is called synchronously. No streaming here — we need the full JSON before we can show anything." },
              { n: "4", label: "Parse", text: "Response is JSON-extracted with a regex fallback (models sometimes wrap output in prose). 2 retries on failure." },
              { n: "5", label: "Fallback", text: "If both retries fail, a random question is pulled from the seed database instead." },
            ].map((step, i, arr) => (
              <div key={step.n} className="flex items-stretch flex-1">
                <div className="flex-1 bg-surface-1 border border-white/[0.07] p-4 rounded-none first:rounded-l-2xl last:rounded-r-2xl">
                  <div className="w-5 h-5 rounded-full bg-brand-muted border border-brand/30 flex items-center justify-center mb-3">
                    <span className="text-[9px] font-bold text-brand">{step.n}</span>
                  </div>
                  <p className="text-xs font-semibold text-white mb-1">{step.label}</p>
                  <p className="text-[11px] text-neutral-500 leading-relaxed">{step.text}</p>
                </div>
                {i < arr.length - 1 && (
                  <div className="flex items-center text-neutral-700 px-1 shrink-0">→</div>
                )}
              </div>
            ))}
          </div>
        </Section>

        {/* Chat streaming */}
        <Section title="AI tutor chat">
          <p className="text-xs text-neutral-500 mb-4 leading-relaxed max-w-2xl">
            The chat panel sends the full current question (text, all three choices, correct answer, explanation)
            plus the last 6 messages of conversation history. FastAPI pipes the OpenAI stream directly back
            — the Next.js route passes <code className="text-neutral-400 bg-white/[0.06] px-1 py-0.5 rounded text-[11px]">response.body</code> as
            a <code className="text-neutral-400 bg-white/[0.06] px-1 py-0.5 rounded text-[11px]">ReadableStream</code> without buffering,
            so the first token arrives in under 100ms. The frontend accumulates chunks and re-renders on each one.
            Responses are rendered with react-markdown + KaTeX so LaTeX formulas display correctly.
          </p>
          <div className="flex flex-wrap items-center gap-2">
            {[
              "User types",
              "/api/ai/chat (Next.js proxy)",
              "FastAPI /chat",
              "OpenAI stream",
              "StreamingResponse",
              "ReadableStream to browser",
              "Incremental render + LaTeX",
            ].map((step, i, arr) => (
              <span key={step} className="flex items-center gap-2">
                <span className="text-[11px] bg-surface-1 border border-white/[0.07] rounded-lg px-2.5 py-1 text-neutral-400">{step}</span>
                {i < arr.length - 1 && <span className="text-neutral-700 text-xs">→</span>}
              </span>
            ))}
          </div>
        </Section>

        {/* Visualisations */}
        <Section title="Visualisations">
          <p className="text-xs text-neutral-500 mb-4 leading-relaxed max-w-2xl">
            Each question category maps to a fixed chart type. The chart params come from the AI-generated question
            (or seed DB). Sliders let you explore the chart interactively — initial values are intentionally offset
            from the correct answer so you have to adjust them.
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { cat: "TVM", chart: "FV/PV compound growth" },
              { cat: "Fixed Income", chart: "Yield curve" },
              { cat: "Derivatives", chart: "Options payoff" },
              { cat: "Portfolio Mgmt", chart: "Efficient frontier" },
              { cat: "Economics", chart: "Supply & demand" },
              { cat: "FSA", chart: "Balance sheet bars" },
              { cat: "Risk Management", chart: "Risk matrix scatter" },
              { cat: "ESG", chart: "ESG radar chart" },
            ].map((v) => (
              <div key={v.cat} className="bg-surface-1 border border-white/[0.07] rounded-xl p-3">
                <p className="text-[10px] font-semibold text-white">{v.cat}</p>
                <p className="text-[10px] text-neutral-600 mt-0.5">{v.chart}</p>
              </div>
            ))}
          </div>
        </Section>

        {/* Tech stack */}
        <Section title="Tech stack">
          <div className="overflow-hidden rounded-2xl border border-white/[0.07]">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/[0.07] bg-surface-1">
                  <th className="text-left px-5 py-3 text-[10px] font-semibold text-neutral-600 uppercase tracking-widest">Layer</th>
                  <th className="text-left px-5 py-3 text-[10px] font-semibold text-neutral-600 uppercase tracking-widest">What</th>
                  <th className="text-left px-5 py-3 text-[10px] font-semibold text-neutral-600 uppercase tracking-widest">Why</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {[
                  ["Frontend", "Next.js 14 + React 18 + TypeScript", "App Router, server components, streaming-compatible API routes"],
                  ["Styling", "Tailwind CSS + CSS variables", "Dark/light theming via surface tokens"],
                  ["Charts", "Recharts", "8 interactive financial charts with Recharts + custom sliders"],
                  ["Math rendering", "react-markdown + KaTeX", "LaTeX formulas in chat responses rendered properly"],
                  ["State", "useReducer (no external library)", "All UI state in one hook — mode, answers, scores, chat history"],
                  ["Database", "PostgreSQL + DrizzleORM", "Type-safe queries, schema migrations, question + session storage"],
                  ["AI backend", "Python FastAPI", "Handles all OpenAI calls, streaming, news fetching"],
                  ["LLM", "OpenAI gpt-4.1-mini", "Question generation and chat; called via OpenAI Python SDK"],
                  ["Infra", "Docker Compose", "Runs Postgres locally; backend and frontend run separately"],
                ].map(([layer, what, why]) => (
                  <tr key={layer} className="bg-surface hover:bg-surface-1 transition-colors">
                    <td className="px-5 py-3 text-xs text-neutral-500 font-medium whitespace-nowrap">{layer}</td>
                    <td className="px-5 py-3 text-xs text-white font-mono">{what}</td>
                    <td className="px-5 py-3 text-xs text-neutral-600">{why}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Section>

        {/* What it doesn't do */}
        <Section title="What it doesn't do (yet)">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { label: "No RAG", desc: "RAG means searching a knowledge base at query time and injecting the results into the prompt. That doesn't happen here — the AI generates questions from its training data, and the question bank in the DB is only a fallback when generation fails, not a source the LLM retrieves from." },
              { label: "No user accounts", desc: "All scores and sessions are stored globally — there's no login, no per-user data separation." },
              { label: "No mobile layout", desc: "The three-column desktop layout doesn't adapt well to small screens. A mobile-first redesign is possible but not done." },
            ].map((item) => (
              <div key={item.label} className="bg-surface-1 border border-white/[0.07] rounded-xl p-4">
                <p className="text-xs font-semibold text-white mb-1.5">{item.label}</p>
                <p className="text-[11px] text-neutral-500 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </Section>

        {/* Footer */}
        <div className="flex items-center justify-between pt-8 border-t border-white/[0.06]">
          <p className="text-xs text-neutral-700">TABF FinMentor · Taiwan Academy of Banking and Finance</p>
          <Link href="/" className="px-4 py-2 text-xs font-semibold rounded-xl bg-brand text-white hover:bg-brand-light transition-colors">
            ← Back to Training
          </Link>
        </div>
      </div>
    </div>
  );
}
