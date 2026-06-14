"use client";

import Link from "next/link";
import { useSession, signIn, signOut } from "next-auth/react";
import { useState, useEffect } from "react";

export function Navbar() {
  const { data: session } = useSession();
  const [showNameInput, setShowNameInput] = useState(false);
  const [showMentorPrompt, setShowMentorPrompt] = useState(false);
  const [name, setName] = useState("");
  const [mentorName, setMentorName] = useState("");

  const handleEnter = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    await signIn("credentials", { name: name.trim(), redirect: false });
    setShowNameInput(false);
    setName("");
  };

  useEffect(() => {
    if (session?.user && !showNameInput) {
      fetch("/api/user/mentor-name")
        .then((r) => r.json())
        .then((data) => {
          if (!data.mentorName) {
            setShowMentorPrompt(true);
          }
        })
        .catch(() => {});
    }
  }, [session, showNameInput]);

  const handleMentorName = async (e: React.FormEvent) => {
    e.preventDefault();
    const chosen = mentorName.trim();
    await fetch("/api/user/mentor-name", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mentorName: chosen || null }),
    });
    setShowMentorPrompt(false);
    setMentorName("");
  };

  const skipMentorName = async () => {
    await fetch("/api/user/mentor-name", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mentorName: null }),
    });
    setShowMentorPrompt(false);
  };

  return (
    <nav className="sticky top-0 z-50">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-5">
        <Link
          href="/"
          className="flex items-center gap-2 text-sm tracking-wider text-text-muted transition-colors hover:text-text"
        >
          <span className="font-serif text-lg italic text-gold">M</span>
          <span className="hidden sm:inline">Film Mentor</span>
        </Link>

        <div className="flex items-center gap-6">
          {session?.user ? (
            <>
              <Link
                href="/chat"
                className="text-[11px] tracking-[0.15em] text-text-muted transition-colors hover:text-text uppercase"
              >
                New session
              </Link>
              <Link
                href="/profile"
                className="flex items-center gap-2 text-[11px] tracking-[0.15em] text-text-muted transition-colors hover:text-text uppercase"
              >
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gold-dim text-[10px] text-gold">
                  {session.user.name?.[0]?.toUpperCase() || "?"}
                </span>
                {session.user.name}
              </Link>
              <button
                onClick={() => signOut()}
                className="text-[11px] tracking-[0.15em] text-text-muted transition-colors hover:text-text uppercase"
              >
                Exit
              </button>
            </>
          ) : (
            <button
              onClick={() => setShowNameInput(!showNameInput)}
              className="rounded-full border border-border-accent px-5 py-1.5 text-[11px] tracking-[0.15em] text-gold transition-all hover:bg-gold-dim uppercase"
            >
              Enter
            </button>
          )}
        </div>
      </div>

      {showNameInput && (
        <div className="border-t border-border px-6 py-6 glass-strong">
          <form onSubmit={handleEnter} className="mx-auto max-w-sm">
            <label className="mb-3 block text-center text-[11px] tracking-[0.15em] text-text-muted uppercase">
              What shall I call you?
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name..."
                className="flex-1 rounded-lg border border-border bg-bg/60 px-4 py-2.5 text-sm text-text placeholder-text-muted/50 outline-none transition-colors focus:border-gold/30"
                autoFocus
              />
              <button
                type="submit"
                className="rounded-lg border border-gold/60 px-5 py-2.5 text-sm text-gold transition-all hover:bg-gold-dim"
              >
                Begin
              </button>
            </div>
          </form>
        </div>
      )}

      {showMentorPrompt && (
        <div className="border-t border-border px-6 py-6 glass-strong">
          <form onSubmit={handleMentorName} className="mx-auto max-w-sm">
            <label className="mb-3 block text-center text-[11px] tracking-[0.15em] text-text-muted uppercase">
              Who should the Mentor speak as?
            </label>
            <p className="mb-4 text-center text-xs text-text-muted/60">
              A best friend? Someone you trust? Leave blank to use your own name.
            </p>
            <div className="flex gap-2">
              <input
                type="text"
                value={mentorName}
                onChange={(e) => setMentorName(e.target.value)}
                placeholder="Friend's name..."
                className="flex-1 rounded-lg border border-border bg-bg/60 px-4 py-2.5 text-sm text-text placeholder-text-muted/50 outline-none transition-colors focus:border-gold/30"
                autoFocus
              />
              <button
                type="submit"
                className="rounded-lg border border-gold/60 px-5 py-2.5 text-sm text-gold transition-all hover:bg-gold-dim"
              >
                Set
              </button>
              <button
                type="button"
                onClick={skipMentorName}
                className="rounded-lg px-4 py-2.5 text-xs text-text-muted transition-colors hover:text-text"
              >
                Skip
              </button>
            </div>
          </form>
        </div>
      )}
    </nav>
  );
}
