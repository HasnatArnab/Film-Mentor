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
          "Sit. Breathe. Tell me what brings you here. What is the weight you carry?",
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
    <div className="flex flex-col">
      <div className="mb-6 rounded-xl glass px-5 py-4">
        <div className="flex items-center gap-3">
          <div
            className={`h-2 w-2 rounded-full ${
              isResolved ? "bg-green-500" : "bg-gold"
            }`}
          />
          <h2 className="text-xs tracking-widest text-text-secondary uppercase">
            {isResolved ? "The mirror is clear" : "Speak freely"}
          </h2>
        </div>
        {isResolved && (
          <p className="mt-2 font-serif text-sm italic text-text-muted">
            You already knew. You just needed to see it.
          </p>
        )}
      </div>

      <div className="space-y-6">
        {messages.length === 0 && !isLoading && (
          <div className="py-8 text-center">
            <p className="font-serif text-lg italic text-text-muted">
              The silence between words speaks loudest.
            </p>
          </div>
        )}

        {messages.map((msg, i) => (
          <div
            key={msg.id}
            className="animate-fade-in"
            style={{ animationDelay: `${i * 0.05}s` }}
          >
            <ChatMessage message={msg} />
            {msg.film && !isResolved && (
              <div className="mt-4">
                <FilmSuggestion film={msg.film} onWatch={handleWatchFilm} />
              </div>
            )}
          </div>
        ))}

        {isLoading && (
          <div className="flex items-center gap-3 text-sm text-text-muted">
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
          <div className="rounded-xl glass-accent p-8 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gold-dim">
              <span className="font-serif text-xl text-gold">◇</span>
            </div>
            <p className="font-serif text-lg italic text-text-secondary">
              The film has served its purpose.
            </p>
            <p className="mt-1 text-sm text-text-muted">
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
              className="group mt-6 inline-flex items-center gap-2 rounded-full border border-border-accent px-6 py-2.5 text-xs tracking-widest text-gold transition-all hover:bg-gold-dim uppercase"
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
          className="mt-6"
        >
          <div className="glass flex items-center gap-2 rounded-xl p-1.5">
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
              className="flex-1 bg-transparent px-3 py-2.5 text-sm text-text-primary placeholder-text-muted/50 outline-none disabled:opacity-40"
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim() || !!currentFilm}
              className="rounded-lg border border-gold/60 px-5 py-2 text-xs tracking-widest text-gold transition-all hover:bg-gold-dim disabled:opacity-30 disabled:cursor-not-allowed uppercase"
            >
              Send
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
