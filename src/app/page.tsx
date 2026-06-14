"use client";

import { useSession } from "next-auth/react";
import Link from "next/link";

export default function Home() {
  const { data: session } = useSession();

  return (
    <div className="flex min-h-[80vh] flex-col items-center justify-center text-center">
      <div className="animate-fade-in">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full border border-border-accent bg-gold-dim">
          <span className="font-serif text-2xl italic text-gold">M</span>
        </div>
        <h1 className="font-serif text-5xl font-light tracking-wide text-text-primary">
          Film Mentor
        </h1>
        <p className="mx-auto mt-4 max-w-lg font-serif text-lg italic leading-relaxed text-text-secondary">
          A film is a mirror. You do not watch it — it watches you.
        </p>
        <p className="mt-2 text-sm text-text-muted">
          Speak your struggle. A film will find you.
        </p>
      </div>

      <div className="mt-6 h-px w-12 bg-gold/40" />

      <div className="animate-fade-in-delayed">
        <p className="mt-6 text-xs text-text-muted">
          &ldquo;The teacher appears when the student is ready.&rdquo;
        </p>

        {session?.user ? (
          <Link
            href="/chat"
            className="group mt-8 inline-flex items-center gap-2 rounded-full border border-gold/60 px-8 py-3 text-sm tracking-wider text-gold transition-all hover:bg-gold-dim hover:border-gold"
          >
            Begin session
            <span className="transition-transform group-hover:translate-x-0.5">→</span>
          </Link>
        ) : (
          <p className="mt-8 text-sm text-text-muted">
            Enter your name above to begin.
          </p>
        )}
      </div>

      <div className="mt-16 grid grid-cols-3 gap-8 text-center">
        {[
          { icon: "◆", label: "Speak your truth" },
          { icon: "◇", label: "Receive a film" },
          { icon: "◈", label: "See yourself" },
        ].map((item, i) => (
          <div key={i} className="animate-fade-in" style={{ animationDelay: `${0.5 + i * 0.2}s` }}>
            <div className="mb-2 text-lg text-gold/60">{item.icon}</div>
            <p className="text-xs tracking-widest text-text-muted uppercase">{item.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
