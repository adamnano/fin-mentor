"use client";

import { useReducer, useCallback } from "react";
import {
  Question,
  CategoryScore,
  ChatMessage,
  CFACategory,
  CFALevel,
  ALL_CATEGORIES,
  AppMode,
  normalizeQuestion,
} from "@/lib/types";

export interface StudyPathSuggestion {
  category: CFACategory;
  accuracy: number;
}

interface AppState {
  currentQuestion: Question | null;
  selectedAnswer: "A" | "B" | "C" | null;
  hasAnswered: boolean;
  scores: CategoryScore[];
  selectedCategories: CFACategory[];
  selectedLevel: CFALevel;
  chatHistory: ChatMessage[];
  isGenerating: boolean;
  isDarkMode: boolean;
  questionStartTime: number;
  useAI: boolean;
  mode: AppMode;
  isDemoMode: boolean;
  isFlipped: boolean;
  studyPath: StudyPathSuggestion | null;
}

type Action =
  | { type: "SET_QUESTION"; question: Question }
  | { type: "SELECT_ANSWER"; answer: "A" | "B" | "C" }
  | { type: "SET_HAS_ANSWERED" }
  | { type: "LOAD_SCORES"; scores: CategoryScore[] }
  | { type: "TOGGLE_CATEGORY"; category: CFACategory }
  | { type: "SET_ALL_CATEGORIES"; selected: boolean }
  | { type: "SET_LEVEL"; level: CFALevel }
  | { type: "ADD_CHAT_MESSAGE"; message: ChatMessage }
  | { type: "UPDATE_LAST_CHAT"; content: string }
  | { type: "CLEAR_CHAT" }
  | { type: "SET_GENERATING"; value: boolean }
  | { type: "TOGGLE_DARK_MODE" }
  | { type: "TOGGLE_AI" }
  | { type: "SET_MODE"; mode: AppMode }
  | { type: "TOGGLE_DEMO_MODE" }
  | { type: "FLIP_CARD" }
  | { type: "SET_STUDY_PATH"; suggestion: StudyPathSuggestion | null }
  | { type: "ACCEPT_STUDY_PATH"; category: CFACategory }
  | { type: "DISMISS_STUDY_PATH" };

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case "SET_QUESTION":
      return {
        ...state,
        currentQuestion: action.question,
        selectedAnswer: null,
        hasAnswered: false,
        chatHistory: [],
        questionStartTime: Date.now(),
        isGenerating: false,
        isFlipped: false,
        studyPath: null,
      };
    case "SELECT_ANSWER":
      return { ...state, selectedAnswer: action.answer };
    case "SET_HAS_ANSWERED":
      return { ...state, hasAnswered: true };
    case "LOAD_SCORES":
      return { ...state, scores: action.scores };
    case "TOGGLE_CATEGORY": {
      const has = state.selectedCategories.includes(action.category);
      const next = has
        ? state.selectedCategories.filter((c) => c !== action.category)
        : [...state.selectedCategories, action.category];
      return { ...state, selectedCategories: next.length > 0 ? next : state.selectedCategories };
    }
    case "SET_ALL_CATEGORIES":
      return { ...state, selectedCategories: action.selected ? [...ALL_CATEGORIES] : [ALL_CATEGORIES[0]] };
    case "SET_LEVEL":
      return { ...state, selectedLevel: action.level };
    case "ADD_CHAT_MESSAGE":
      return { ...state, chatHistory: [...state.chatHistory, action.message] };
    case "UPDATE_LAST_CHAT": {
      const history = [...state.chatHistory];
      if (history.length > 0 && history[history.length - 1].role === "assistant") {
        history[history.length - 1] = { ...history[history.length - 1], content: action.content };
      }
      return { ...state, chatHistory: history };
    }
    case "CLEAR_CHAT":
      return { ...state, chatHistory: [] };
    case "SET_GENERATING":
      return { ...state, isGenerating: action.value };
    case "TOGGLE_DARK_MODE":
      return { ...state, isDarkMode: !state.isDarkMode };
    case "TOGGLE_AI":
      return { ...state, useAI: !state.useAI };
    case "SET_MODE":
      return { ...state, mode: action.mode, isFlipped: false, selectedAnswer: null, hasAnswered: false };
    case "TOGGLE_DEMO_MODE":
      return { ...state, isDemoMode: !state.isDemoMode, selectedAnswer: null, hasAnswered: false, isFlipped: false };
    case "FLIP_CARD":
      return { ...state, isFlipped: !state.isFlipped };
    case "SET_STUDY_PATH":
      return { ...state, studyPath: action.suggestion };
    case "ACCEPT_STUDY_PATH":
      return { ...state, selectedCategories: [action.category], studyPath: null };
    case "DISMISS_STUDY_PATH":
      return { ...state, studyPath: null };
    default:
      return state;
  }
}

const initialState: AppState = {
  currentQuestion: null,
  selectedAnswer: null,
  hasAnswered: false,
  scores: [],
  selectedCategories: [...ALL_CATEGORIES],
  selectedLevel: 1,
  chatHistory: [],
  isGenerating: false,
  isDarkMode: true,
  questionStartTime: Date.now(),
  useAI: true,
  mode: "mcq",
  isDemoMode: false,
  isFlipped: false,
  studyPath: null,
};

export function useAppState(initialScores: CategoryScore[]) {
  const [state, dispatch] = useReducer(reducer, {
    ...initialState,
    scores: initialScores,
  });

  const fetchQuestion = useCallback(
    async (categories: CFACategory[], level: CFALevel, useAI: boolean) => {
      dispatch({ type: "SET_GENERATING", value: true });
      try {
        if (useAI) {
          const category = categories[Math.floor(Math.random() * categories.length)];
          const res = await fetch("/api/ai/generate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ category, level, difficulty: 2 }),
          });
          if (!res.ok) throw new Error("AI failed");
          const raw = await res.json();
          dispatch({ type: "SET_QUESTION", question: normalizeQuestion(raw) });
        } else {
          const cats = categories.join(",");
          const res = await fetch(`/api/questions?categories=${encodeURIComponent(cats)}&level=${level}`);
          if (!res.ok) throw new Error("DB fetch failed");
          const raw = await res.json();
          dispatch({ type: "SET_QUESTION", question: normalizeQuestion(raw) });
        }
      } catch {
        try {
          const res = await fetch(`/api/questions?level=${level}`);
          const raw = await res.json();
          dispatch({ type: "SET_QUESTION", question: normalizeQuestion(raw) });
        } catch {
          dispatch({ type: "SET_GENERATING", value: false });
        }
      }
    },
    []
  );

  const submitAnswer = useCallback(
    async (answer: "A" | "B" | "C", question: Question, timeSpentSeconds: number) => {
      dispatch({ type: "SET_HAS_ANSWERED" });
      const isCorrect = answer === question.correctAnswer;

      try {
        await fetch("/api/sessions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            questionId: question.id ?? null,
            selectedAnswer: answer,
            isCorrect,
            category: question.category,
            level: question.level,
            timeSpentSeconds,
          }),
        });
        const scoresRes = await fetch("/api/scores");
        const scores: CategoryScore[] = await scoresRes.json();
        dispatch({ type: "LOAD_SCORES", scores });

        // Compute weakest category for smart study path
        const candidates = scores
          .map((s) => {
            const attempts = s.totalAttempts ?? s.total_attempts ?? 0;
            const correct = s.correctCount ?? s.correct_count ?? 0;
            return { category: s.category as CFACategory, accuracy: attempts >= 3 ? (correct / attempts) * 100 : null };
          })
          .filter((s) => s.accuracy !== null && s.category !== question.category && (s.accuracy as number) < 70)
          .sort((a, b) => (a.accuracy as number) - (b.accuracy as number));

        if (candidates.length > 0) {
          dispatch({
            type: "SET_STUDY_PATH",
            suggestion: { category: candidates[0].category, accuracy: Math.round(candidates[0].accuracy as number) },
          });
        }
      } catch {
        // scores update can fail silently
      }
    },
    []
  );

  return { state, dispatch, fetchQuestion, submitAnswer };
}
