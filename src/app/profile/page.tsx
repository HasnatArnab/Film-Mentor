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
    <div>
      <div className="mb-8 rounded-xl glass p-6">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gold-dim">
            <span className="font-serif text-xl text-gold">
              {session?.user?.name?.[0]?.toUpperCase() || "?"}
            </span>
          </div>
          <div>
            <h1 className="font-serif text-2xl font-light tracking-wide text-text-primary">
              {session?.user?.name}
            </h1>
            <p className="text-sm text-text-muted">Your journey in films</p>
          </div>
        </div>
      </div>

      {conversations.length === 0 ? (
        <div className="rounded-xl glass p-12 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gold-dim">
            <span className="font-serif text-xl text-gold/60">◇</span>
          </div>
          <p className="font-serif text-lg italic text-text-muted">
            No conversations yet.
          </p>
          <p className="mt-1 text-sm text-text-muted">
            Begin your first session to discover the film that finds you.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {conversations.map((conv) => (
            <div
              key={conv.id}
              className="group rounded-xl glass p-5 transition-all hover:border-gold/20"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={`h-2.5 w-2.5 rounded-full ${
                      conv.status === "resolved"
                        ? "bg-green-500"
                        : conv.status === "film-suggested"
                          ? "bg-gold"
                          : "bg-text-muted"
                    }`}
                  />
                  <span className="text-xs tracking-widest text-text-muted uppercase">
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
