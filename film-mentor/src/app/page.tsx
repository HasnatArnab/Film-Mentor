"use client";

import { useSession } from "next-auth/react";
import Link from "next/link";

export default function Home() {
  const { data: session } = useSession();

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center text-center">
      <div className="mb-8">
        <div className="mb-4 text-4xl text-zodiac-gold">◆</div>
        <h1 className="mb-3 text-3xl font-light tracking-wider text-zodiac-fg">
          Film Mentor
        </h1>
        <p className="mx-auto max-w-md text-sm leading-relaxed text-zodiac-muted">
          A film is a mirror. You do not watch it — it watches you.
          <br />
          Speak your struggle. A film will find you.
        </p>
      </div>

      <div className="h-px w-16 bg-zodiac-gold/50" />

      <div className="mt-8 text-xs italic text-zodiac-muted">
        &ldquo;The teacher appears when the student is ready.&rdquo;
      </div>

      {session?.user ? (
        <Link
          href="/chat"
          className="mt-8 border border-zodiac-gold px-6 py-3 text-sm tracking-wider text-zodiac-gold transition-colors hover:bg-zodiac-gold/10"
        >
          Begin, {session.user.name}
        </Link>
      ) : (
        <p className="mt-8 text-xs text-zodiac-muted">
          Enter your name above to begin.
        </p>
      )}
    </div>
  );
}
