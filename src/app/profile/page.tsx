"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface ConversationSummary {
  id: string;
  status: string;
  theme: string | null;
  createdAt: string;
  filmCount: number;
}

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/");
    }
  }, [status, router]);

  useEffect(() => {
    if (session?.user) {
      fetch("/api/conversation")
        .then((res) => res.json())
        .then((data) => setConversations(data))
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [session]);

  if (status === "loading" || loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex items-center gap-3 text-text-muted">
          <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-gold" />
          <span className="text-sm">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-10 flex items-center gap-5">
        <div className="flex h-16 w-16 items-center justify-center rounded-full border border-border-accent bg-gold-dim">
          <span className="font-serif text-2xl text-gold">
            {session?.user?.name?.[0]?.toUpperCase() || "?"}
          </span>
        </div>
        <div>
          <h1 className="font-serif text-3xl font-light tracking-wide text-text">
            {session?.user?.name}
          </h1>
          <p className="mt-1 text-sm text-text-muted">Your journey in films</p>
        </div>
      </div>

      {conversations.length === 0 ? (
        <div className="rounded-2xl border border-border bg-bg-card p-16 text-center">
          <div className="mx-auto mb-5 h-14 w-14 rounded-full bg-gold-dim flex items-center justify-center">
            <span className="font-serif text-2xl text-gold/60">◇</span>
          </div>
          <p className="font-serif text-xl italic text-text-muted">
            No conversations yet.
          </p>
          <p className="mt-2 text-sm text-text-muted">
            Begin your first session to discover the film that finds you.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {conversations.map((conv) => (
            <div
              key={conv.id}
              className="rounded-2xl border border-border bg-bg-card p-5 transition-all hover:border-border-accent"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={`h-2 w-2 rounded-full ${
                      conv.status === "resolved"
                        ? "bg-green-400"
                        : conv.status === "film-suggested"
                          ? "bg-gold"
                          : "bg-text-muted"
                    }`}
                  />
                  <span className="text-[11px] tracking-[0.15em] text-text-muted uppercase">
                    {conv.status === "resolved"
                      ? "Resolved"
                      : conv.status === "film-suggested"
                        ? "Film suggested"
                        : "Active"}
                  </span>
                </div>
                <span className="text-xs text-text-muted">
                  {new Date(conv.createdAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>
              </div>
              {conv.theme && (
                <p className="mt-3 text-sm text-gold">
                  Theme: {conv.theme}
                </p>
              )}
              <p className="mt-1 text-xs text-text-muted">
                {conv.filmCount} film{conv.filmCount !== 1 ? "s" : ""} suggested
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
