"use client";

import { useSession } from "next-auth/react";
import Link from "next/link";

export default function Home() {
  const { data: session } = useSession();

  return (
    <div className="flex min-h-[85vh] flex-col items-center justify-center">
      <div className="animate-fade-in-up text-center">
        <div className="mx-auto mb-8 h-20 w-20">
          <div
            className="h-full w-full rounded-full border border-border-accent bg-cover bg-center"
            style={{
              backgroundImage:
                "url('https://images.unsplash.com/photo-1485846234645-a62644f84728?q=80&w=200&auto=format&fit=crop')",
            }}
          />
        </div>

        <h1 className="font-serif text-6xl font-light tracking-tight text-text">
          Film Therapist
        </h1>
        <p className="mx-auto mt-5 max-w-md font-serif text-xl leading-relaxed text-text-secondary">
          A film is a mirror. You do not watch it — it watches you.
        </p>

        <div className="mt-3 h-px w-10 bg-gold/30" />
      </div>

      <div className="animate-fade-in-up mt-10" style={{ animationDelay: "0.3s" }}>
        {session?.user ? (
          <Link
            href="/chat"
            className="group inline-flex items-center gap-2 rounded-full border border-gold/60 px-8 py-3 text-sm tracking-wider text-gold transition-all hover:bg-gold-dim"
          >
            Begin session
            <span className="transition-transform group-hover:translate-x-0.5">→</span>
          </Link>
        ) : (
          <p className="text-sm text-text-muted">Enter your name above to begin.</p>
        )}
      </div>

      <div className="animate-fade-in-up mt-20 flex gap-12 text-center" style={{ animationDelay: "0.5s" }}>
        {[
          { icon: "◆", label: "Speak your truth" },
          { icon: "◇", label: "Receive a film" },
          { icon: "◈", label: "See yourself" },
        ].map((item, i) => (
          <div key={i}>
            <div className="mb-2 text-lg text-gold/40">{item.icon}</div>
            <p className="text-[11px] tracking-[0.15em] text-text-muted uppercase">
              {item.label}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
