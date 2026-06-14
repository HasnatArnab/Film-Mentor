"use client";

import Link from "next/link";
import { useSession, signIn, signOut } from "next-auth/react";
import { useState, useEffect } from "react";

export function Navbar() {
  const { data: session, update } = useSession();
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
    <nav className="sticky top-0 z-50 border-b border-border bg-bg-secondary/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-3">
        <Link
          href="/"
          className="group flex items-center gap-2 text-base tracking-wider text-text-primary transition-colors hover:text-gold"
        >
          <span className="font-serif text-lg italic text-gold">M</span>
          <span className="hidden sm:inline">Film Mentor</span>
        </Link>

        <div className="flex items-center gap-5">
          {session?.user ? (
            <>
              <Link
                href="/chat"
                className="text-xs tracking-widest text-text-muted transition-colors hover:text-text-primary uppercase"
              >
                New session
              </Link>
              <Link
                href="/profile"
                className="flex items-center gap-2 text-xs tracking-widest text-text-muted transition-colors hover:text-text-primary uppercase"
              >
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gold-dim text-[10px] text-gold">
                  {session.user.name?.[0]?.toUpperCase() || "?"}
                </span>
                {session.user.name}
              </Link>
              <button
                onClick={() => signOut()}
                className="text-xs tracking-widest text-text-muted transition-colors hover:text-text-primary uppercase"
              >
                Exit
              </button>
            </>
          ) : (
            <button
              onClick={() => setShowNameInput(!showNameInput)}
              className="rounded-full border border-border-accent px-5 py-1.5 text-xs tracking-widest text-gold transition-all hover:bg-gold-dim uppercase"
            >
              Enter
            </button>
          )}
        </div>
      </div>

      {showNameInput && (
        <div className="border-t border-border px-4 py-5">
          <form onSubmit={handleEnter} className="mx-auto max-w-sm">
            <label className="mb-2 block text-center text-xs tracking-widest text-text-muted uppercase">
              What shall I call you?
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name..."
                className="flex-1 rounded-lg border border-border bg-bg-primary/60 px-4 py-2.5 text-sm text-text-primary placeholder-text-muted/50 outline-none transition-colors focus:border-gold/40"
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
        <div className="border-t border-border px-4 py-5">
          <form onSubmit={handleMentorName} className="mx-auto max-w-sm">
            <label className="mb-2 block text-center text-xs tracking-widest text-text-muted uppercase">
              Who should the Mentor speak as?
            </label>
            <p className="mb-3 text-center text-xs text-text-muted/60">
              A best friend? Someone you trust? Leave blank to use your own name.
            </p>
            <div className="flex gap-2">
              <input
                type="text"
                value={mentorName}
                onChange={(e) => setMentorName(e.target.value)}
                placeholder="Friend's name..."
                className="flex-1 rounded-lg border border-border bg-bg-primary/60 px-4 py-2.5 text-sm text-text-primary placeholder-text-muted/50 outline-none transition-colors focus:border-gold/40"
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
                className="rounded-lg px-4 py-2.5 text-xs text-text-muted transition-colors hover:text-text-primary"
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
