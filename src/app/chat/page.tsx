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
      // Add opening message from the mentor
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
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="text-sm text-zodiac-muted">Preparing the space...</div>
      </div>
    );
  }

  const isResolved = status_ === "resolved";

  return (
    <div className="flex flex-col">
      <div className="mb-4 border-b border-zodiac-border pb-4">
        <h2 className="text-sm tracking-widest text-zodiac-gold uppercase">
          {isResolved
            ? "The mirror is clear"
            : "Speak freely"}
        </h2>
        {isResolved && (
          <p className="mt-2 text-xs italic text-zodiac-muted">
            You already knew. You just needed to see it.
          </p>
        )}
      </div>

      <div className="space-y-6">
        {messages.map((msg) => (
          <div key={msg.id}>
            <ChatMessage message={msg} />
            {msg.film && !isResolved && (
              <div className="mt-4">
                <FilmSuggestion film={msg.film} onWatch={handleWatchFilm} />
              </div>
            )}
          </div>
        ))}

        {isLoading && (
          <div className="flex items-center gap-2 text-sm text-zodiac-muted">
            <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-zodiac-gold" />
            Reflecting...
          </div>
        )}

        {showReflection && currentFilm && (
          <ReflectionForm
            filmTitle={currentFilm.title}
            onSubmit={handleReflection}
          />
        )}

        {isResolved && (
          <div className="border border-zodiac-gold/30 bg-zodiac-card/50 p-6 text-center">
            <div className="mb-2 text-2xl text-zodiac-gold">◇</div>
            <p className="text-sm italic text-zodiac-muted">
              The film has served its purpose.
              <br />
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
              className="mt-4 border border-zodiac-border px-4 py-2 text-xs tracking-wider text-zodiac-muted hover:border-zodiac-gold hover:text-zodiac-gold"
            >
              Begin anew
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
          className="mt-6 flex gap-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={
              showReflection
                ? "Share your reflection..."
                : currentFilm
                  ? "Watch the film first, then reflect..."
                  : "Speak..."
            }
            disabled={isLoading || !!currentFilm}
            className="flex-1 border border-zodiac-border bg-zodiac-bg px-4 py-3 text-sm text-zodiac-fg placeholder-zodiac-muted/50 outline-none focus:border-zodiac-gold disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim() || !!currentFilm}
            className="border border-zodiac-gold px-6 py-3 text-sm tracking-wider text-zodiac-gold transition-colors hover:bg-zodiac-gold/10 disabled:opacity-30"
          >
            Send
          </button>
        </form>
      )}
    </div>
  );
}
