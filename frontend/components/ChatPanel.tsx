"use client";

import { useState, useRef, useEffect } from "react";
import { ChatMessage, Question } from "@/lib/types";

interface Props {
  question: Question | null;
  history: ChatMessage[];
  onAddMessage: (msg: ChatMessage) => void;
  onUpdateLastMessage: (content: string) => void;
}

const SUGGESTIONS = [
  "Why is this the correct answer?",
  "Walk me through the formula",
  "What's a common mistake here?",
  "Give me a harder version of this",
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

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-6 py-5 border-b border-white/[0.06] shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-2 h-2 rounded-full bg-brand shrink-0" />
          <p className="text-sm font-semibold text-white tracking-tight">AI Tutor</p>
        </div>
        <p className="text-xs text-neutral-600 mt-0.5">
          Ask anything about the current question
        </p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
        {!question && (
          <div className="flex items-center justify-center h-full">
            <p className="text-xs text-neutral-700 text-center">
              A question will load shortly
            </p>
          </div>
        )}

        {question && history.length === 0 && (
          <div className="space-y-2 pt-2">
            <p className="text-xs text-neutral-700 mb-3">Suggested questions</p>
            {SUGGESTIONS.map((q) => (
              <button
                key={q}
                onClick={() => send(q)}
                className="w-full text-left text-xs p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] text-neutral-500 hover:bg-white/[0.06] hover:text-neutral-300 hover:border-white/[0.1] transition-all duration-150"
              >
                {q}
              </button>
            ))}
          </div>
        )}

        {history.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            {msg.role === "assistant" && (
              <div className="w-5 h-5 rounded-full bg-brand/20 border border-brand/30 flex items-center justify-center mr-2 mt-1 shrink-0">
                <span className="text-brand text-[9px] font-bold">AI</span>
              </div>
            )}
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-3 text-[13px] leading-relaxed ${
                msg.role === "user"
                  ? "bg-brand-muted border border-brand-border text-neutral-200 rounded-br-sm"
                  : "bg-white/[0.05] border border-white/[0.07] text-neutral-300 rounded-bl-sm"
              }`}
            >
              {msg.content || (
                <span className="flex gap-1 items-center py-0.5">
                  <span
                    className="w-1.5 h-1.5 rounded-full bg-neutral-600 animate-bounce"
                    style={{ animationDelay: "0ms" }}
                  />
                  <span
                    className="w-1.5 h-1.5 rounded-full bg-neutral-600 animate-bounce"
                    style={{ animationDelay: "150ms" }}
                  />
                  <span
                    className="w-1.5 h-1.5 rounded-full bg-neutral-600 animate-bounce"
                    style={{ animationDelay: "300ms" }}
                  />
                </span>
              )}
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="px-5 py-4 border-t border-white/[0.06] shrink-0">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && send()}
            placeholder={question ? "Ask the tutor..." : "Load a question first"}
            disabled={!question || isSending}
            className="flex-1 bg-white/[0.05] border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-neutral-200 placeholder:text-neutral-700 focus:outline-none focus:border-brand/40 focus:bg-white/[0.07] disabled:opacity-30 transition-all duration-150"
          />
          <button
            onClick={() => send()}
            disabled={!input.trim() || isSending || !question}
            className="w-11 h-11 rounded-xl bg-brand text-white font-bold text-sm flex items-center justify-center disabled:opacity-30 hover:bg-brand-light transition-colors shrink-0 shadow-lg shadow-brand/20"
          >
            ↑
          </button>
        </div>
      </div>
    </div>
  );
}
