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
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="text-sm text-zodiac-muted">Loading...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8 border-b border-zodiac-border pb-4">
        <h1 className="text-xl tracking-wider text-zodiac-fg">
          {session?.user?.name}
        </h1>
        <p className="mt-1 text-xs text-zodiac-muted">
          Your journey in films
        </p>
      </div>

      {conversations.length === 0 ? (
        <div className="py-12 text-center">
          <p className="text-sm text-zodiac-muted">
            No conversations yet. Begin your first session.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {conversations.map((conv) => (
            <div
              key={conv.id}
              className="border border-zodiac-border bg-zodiac-card/30 p-4"
            >
              <div className="flex items-center justify-between">
                <div>
                  <span
                    className={`inline-block h-2 w-2 rounded-full ${
                      conv.status === "resolved"
                        ? "bg-green-600"
                        : conv.status === "film-suggested"
                          ? "bg-zodiac-gold"
                          : "bg-zodiac-muted"
                    }`}
                  />
                  <span className="ml-2 text-xs text-zodiac-muted">
                    {conv.status === "resolved"
                      ? "Resolved"
                      : conv.status === "film-suggested"
                        ? "Film suggested"
                        : "Active"}
                  </span>
                </div>
                <span className="text-xs text-zodiac-muted">
                  {new Date(conv.createdAt).toLocaleDateString()}
                </span>
              </div>
              {conv.theme && (
                <p className="mt-2 text-xs text-zodiac-gold">
                  Theme: {conv.theme}
                </p>
              )}
              <p className="mt-1 text-xs text-zodiac-muted">
                {conv.filmCount} film{conv.filmCount !== 1 ? "s" : ""} suggested
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
