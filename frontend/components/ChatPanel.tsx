"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import { ChatMessage, Question } from "@/lib/types";

// Normalise LLM math output before ReactMarkdown sees it:
// 1. \[...\] → $$...$$ (markdown strips the \ before remark-math can parse it)
// 2. \(...\) → $...$
// 3. Escape bare currency dollar signs ($58) so they aren't treated as math
function normaliseMath(raw: string): string {
  return raw
    .replace(/\$(?=\d)/g, "\\$")                                         // $58 → \$58
    .replace(/\\\[([\s\S]*?)\\\]/g, (_, m) => `\n$$\n${m}\n$$\n`)        // \[...\] → $$...$$
    .replace(/\\\(([\s\S]*?)\\\)/g, (_, m) => `$${m}$`);                 // \(...\) → $...$
}

function MathMessage({ content }: { content: string }) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkMath]}
      rehypePlugins={[rehypeKatex]}
      components={{
        p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
        ul: ({ children }) => <ul className="list-disc pl-4 mb-2 space-y-0.5">{children}</ul>,
        ol: ({ children }) => <ol className="list-decimal pl-4 mb-2 space-y-0.5">{children}</ol>,
        li: ({ children }) => <li className="text-[13px]">{children}</li>,
        strong: ({ children }) => <strong className="font-semibold text-white">{children}</strong>,
        em: ({ children }) => <em className="italic text-neutral-300">{children}</em>,
        code: ({ children }) => (
          <code className="font-mono text-[12px] bg-white/[0.08] px-1.5 py-0.5 rounded text-brand">{children}</code>
        ),
      }}
    >
      {normaliseMath(content)}
    </ReactMarkdown>
  );
}

interface Props {
  question: Question | null;
  history: ChatMessage[];
  onAddMessage: (msg: ChatMessage) => void;
  onUpdateLastMessage: (content: string) => void;
}

const SUGGESTIONS_DEFAULT = [
  "Why is this the correct answer?",
  "Walk me through the formula",
  "What's a common mistake here?",
  "Give me a harder version of this",
];

const SUGGESTIONS_AFTER_CORRECT = [
  "How can I apply this in practice?",
  "What related concepts should I know?",
  "Give me a harder follow-up question",
  "Summarize the key formula",
];

const SUGGESTIONS_AFTER_WRONG = [
  "Explain why I was wrong",
  "Break down the correct approach step by step",
  "What concept am I missing?",
  "Give me a similar practice question",
];

export default function ChatPanel({
  question,
  history,
  onAddMessage,
  onUpdateLastMessage,
}: Props) {
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [history]);

  const send = async (text?: string) => {
    const message = (text ?? input).trim();
    if (!message || isSending || !question) return;

    setInput("");
    setIsSending(true);
    onAddMessage({ role: "user", content: message });
    onAddMessage({ role: "assistant", content: "" });

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question_text: question.questionText,
          choice_a: question.choiceA,
          choice_b: question.choiceB,
          choice_c: question.choiceC,
          correct_answer: question.correctAnswer,
          explanation: question.explanation,
          history: history.slice(-6),
          user_message: message,
        }),
      });

      if (!res.body) throw new Error("No stream");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let accumulated = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        accumulated += decoder.decode(value, { stream: true });
        onUpdateLastMessage(accumulated);
      }
    } catch {
      onUpdateLastMessage("The AI tutor is unavailable. Make sure the Python backend is running on port 8000.");
    } finally {
      setIsSending(false);
    }
  };

  // Pick suggestions based on chat history context
  const lastUserMsg = history.findLast((m) => m.role === "user")?.content ?? "";
  const suggestions =
    history.length === 0
      ? SUGGESTIONS_DEFAULT
      : lastUserMsg.toLowerCase().includes("wrong") || lastUserMsg.toLowerCase().includes("mistake")
      ? SUGGESTIONS_AFTER_WRONG
      : SUGGESTIONS_AFTER_CORRECT;

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-5 py-4 border-b border-white/[0.06] shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-full overflow-hidden shrink-0 border border-white/[0.1] shadow-sm">
            <Image src="/tabf-logo.png" alt="AI Tutor" width={28} height={28} className="w-full h-full object-cover" />
          </div>
          <div>
            <p className="text-sm font-semibold text-white tracking-tight leading-tight">AI Tutor</p>
            <p className="text-[10px] text-neutral-500 mt-0.5">Ask anything about this question</p>
          </div>
          <div className="ml-auto">
            <span className="flex items-center gap-1.5 text-[10px] text-brand font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-brand animate-pulse" />
              Online
            </span>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {!question && (
          <div className="flex items-center justify-center h-full">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 rounded-2xl overflow-hidden mx-auto border border-white/[0.08] shadow-sm">
                <Image src="/tabf-logo.png" alt="TABF" width={48} height={48} className="w-full h-full object-cover opacity-60" />
              </div>
              <p className="text-xs text-neutral-600">A question will load shortly</p>
            </div>
          </div>
        )}

        {question && history.length === 0 && (
          <div className="space-y-2 pt-1">
            <p className="text-[10px] text-neutral-600 uppercase tracking-widest font-semibold px-1">Suggested</p>
            {suggestions.map((q) => (
              <button
                key={q}
                onClick={() => send(q)}
                className="w-full text-left text-xs p-3 rounded-2xl bg-white/[0.04] border border-white/[0.07] text-neutral-400 hover:bg-brand-muted hover:border-brand-border hover:text-neutral-200 transition-all duration-150"
              >
                {q}
              </button>
            ))}
          </div>
        )}

        {history.map((msg, i) => (
          <div
            key={i}
            className={`flex gap-2.5 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            {msg.role === "assistant" && (
              <div className="w-6 h-6 rounded-full overflow-hidden shrink-0 mt-1 border border-white/[0.1]">
                <Image src="/tabf-logo.png" alt="AI" width={24} height={24} className="w-full h-full object-cover" />
              </div>
            )}
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-[13px] leading-relaxed ${
                msg.role === "user"
                  ? "bg-brand text-white rounded-br-sm shadow-sm shadow-brand/20"
                  : "bg-white/[0.06] border border-white/[0.08] text-neutral-300 rounded-bl-sm"
              }`}
            >
              {msg.role === "assistant" ? (
                msg.content ? (
                  <MathMessage content={msg.content} />
                ) : (
                  <span className="flex gap-1 items-center py-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-brand/60 animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-brand/60 animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-brand/60 animate-bounce" style={{ animationDelay: "300ms" }} />
                  </span>
                )
              ) : (
                msg.content
              )}
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="px-4 py-3.5 border-t border-white/[0.06] shrink-0 space-y-2">
        {/* Quick suggestion chips when chatting */}
        {history.length > 0 && (
          <div className="flex gap-1.5 flex-wrap">
            {suggestions.slice(0, 2).map((s) => (
              <button
                key={s}
                onClick={() => send(s)}
                disabled={isSending}
                className="text-[10px] px-2.5 py-1 rounded-full border border-white/[0.08] text-neutral-500 hover:border-brand-border hover:text-brand hover:bg-brand-muted transition-all disabled:opacity-30"
              >
                {s}
              </button>
            ))}
          </div>
        )}
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && send()}
            placeholder={question ? "Ask the tutor…" : "Load a question first"}
            disabled={!question || isSending}
            className="flex-1 bg-white/[0.05] border border-white/[0.08] rounded-2xl px-4 py-2.5 text-sm text-neutral-200 placeholder:text-neutral-600 focus:outline-none focus:border-brand/50 focus:bg-white/[0.07] disabled:opacity-30 transition-all duration-150"
          />
          <button
            onClick={() => send()}
            disabled={!input.trim() || isSending || !question}
            className="w-10 h-10 rounded-2xl bg-brand text-white flex items-center justify-center disabled:opacity-30 hover:bg-brand-light transition-colors shrink-0 shadow-md shadow-brand/25"
          >
            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
