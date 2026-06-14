"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { ChatMessage } from "@/components/ChatMessage";
import { FilmSuggestion } from "@/components/FilmSuggestion";
import { ReflectionForm } from "@/components/ReflectionForm";

interface Film {
  id: string;
  tmdbId: number;
  title: string;
  year: number;
  posterPath: string;
  whyThisFilm: string;
  letterboxdUrl: string;
}

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  film?: Film;
}

export default function ChatPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [status_, setStatus_] = useState<
    "active" | "questioning" | "film-suggested" | "awaiting-reflection" | "resolved"
  >("active");
  const [currentFilm, setCurrentFilm] = useState<Film | null>(null);
  const [showReflection, setShowReflection] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/");
    }
  }, [status, router]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (!conversationId && session?.user) {
      startConversation();
    }
  }, [session, conversationId]);

  async function startConversation() {
    try {
      const res = await fetch("/api/conversation", { method: "POST" });
      const data = await res.json();
      setConversationId(data.id);
      const openingMsg: Message = {
        id: "opening",
        role: "assistant",
        content:
          "Sit. Breathe. What brings you here?",
      };
      setMessages([openingMsg]);
    } catch (err) {
      console.error("Failed to start conversation", err);
    }
  }

  async function sendMessage(content: string) {
    if (!content.trim() || !conversationId || isLoading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content: content.trim(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conversationId,
          message: content.trim(),
        }),
      });

      if (!res.ok) {
        throw new Error(`API returned ${res.status}`);
      }

      const data = await res.json();

      const assistantMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.message,
        film: data.film || undefined,
      };

      setMessages((prev) => [...prev, assistantMsg]);
      setStatus_(data.status);

      if (data.film) {
        setCurrentFilm(data.film);
        setShowReflection(false);
      }
    } catch (err) {
      console.error("Chat error", err);
      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "I'm having trouble connecting. Please check that GEMINI_API_KEY and DATABASE_URL are set in your Vercel environment variables.",
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleReflection(reflection: string) {
    if (!conversationId || !currentFilm) return;

    const reflectionMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content: `[After watching "${currentFilm.title}"]: ${reflection}`,
    };

    setMessages((prev) => [...prev, reflectionMsg]);
    setShowReflection(false);
    setIsLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conversationId,
          message: "",
          hasWatched: true,
          reflection,
        }),
      });

      if (!res.ok) {
        throw new Error(`API returned ${res.status}`);
      }

      const data = await res.json();

      const assistantMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.message,
        film: data.film || undefined,
      };

      setMessages((prev) => [...prev, assistantMsg]);
      setStatus_(data.status);

      if (data.film) {
        setCurrentFilm(data.film);
      } else if (data.status === "resolved") {
        setCurrentFilm(null);
      }
    } catch (err) {
      console.error("Reflection error", err);
      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "I'm having trouble connecting. Please check that GEMINI_API_KEY and DATABASE_URL are set in your Vercel environment variables.",
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  }

  function handleWatchFilm() {
    setShowReflection(true);
  }

  if (status === "loading") {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex items-center gap-3 text-text-muted">
          <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-gold" />
          <span className="text-sm">Preparing the space...</span>
        </div>
      </div>
    );
  }

  const isResolved = status_ === "resolved";

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-8 text-center">
        <div
          className={`inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-[11px] tracking-[0.15em] uppercase ${
            isResolved
              ? "bg-green-500/10 text-green-400"
              : "bg-gold-dim text-gold"
          }`}
        >
          <div className={`h-1.5 w-1.5 rounded-full ${isResolved ? "bg-green-400" : "bg-gold"}`} />
          {isResolved ? "The mirror is clear" : "Speak freely"}
        </div>
        {isResolved && (
          <p className="mt-3 font-serif text-lg italic text-text-secondary">
            You already knew. You just needed to see it.
          </p>
        )}
      </div>

      <div className="space-y-6">
        {messages.map((msg, i) => (
          <div
            key={msg.id}
            className="animate-fade-in"
            style={{ animationDelay: `${i * 0.05}s` }}
          >
            <ChatMessage message={msg} />
            {msg.film && !isResolved && (
              <div className="mt-5">
                <FilmSuggestion film={msg.film} onWatch={handleWatchFilm} />
              </div>
            )}
          </div>
        ))}

        {isLoading && (
          <div className="flex items-center gap-3 px-1 py-3 text-sm text-text-muted">
            <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-gold" />
            <span className="font-serif italic">Reflecting...</span>
          </div>
        )}

        {showReflection && currentFilm && (
          <ReflectionForm
            filmTitle={currentFilm.title}
            onSubmit={handleReflection}
          />
        )}

        {isResolved && (
          <div className="animate-reveal rounded-2xl border border-border bg-bg-card p-12 text-center">
            <div className="mx-auto mb-5 h-14 w-14 rounded-full bg-gold-dim flex items-center justify-center">
              <span className="font-serif text-2xl text-gold">◇</span>
            </div>
            <p className="font-serif text-2xl font-light italic text-text-secondary">
              The film has served its purpose.
            </p>
            <p className="mt-2 text-sm text-text-muted">
              When you are ready for a new mirror, return.
            </p>
            <button
              onClick={() => {
                setConversationId(null);
                setMessages([]);
                setCurrentFilm(null);
                setStatus_("active");
                setShowReflection(false);
                startConversation();
              }}
              className="group mt-8 inline-flex items-center gap-2 rounded-full border border-border-accent px-7 py-2.5 text-[11px] tracking-[0.15em] text-gold transition-all hover:bg-gold-dim uppercase"
            >
              Begin anew
              <span className="transition-transform group-hover:translate-x-0.5">→</span>
            </button>
          </div>
        )}
      </div>

      <div ref={bottomRef} />

      {!isResolved && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            sendMessage(input);
          }}
          className="mt-8"
        >
          <div className="glass-strong flex items-center gap-2 rounded-2xl p-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={
                showReflection
                  ? "Share your reflection..."
                  : currentFilm
                    ? "Watch the film first, then reflect..."
                    : "Speak what weighs on your mind..."
              }
              disabled={isLoading || !!currentFilm}
              className="flex-1 bg-transparent px-4 py-3 text-sm text-text placeholder-text-muted/50 outline-none disabled:opacity-40"
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim() || !!currentFilm}
              className="rounded-xl border border-gold/60 px-6 py-2.5 text-[11px] tracking-[0.15em] text-gold transition-all hover:bg-gold-dim disabled:opacity-30 disabled:cursor-not-allowed uppercase"
            >
              Send
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
