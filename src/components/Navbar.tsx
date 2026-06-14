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
    <nav className="border-b border-zodiac-border bg-zodiac-card/80 backdrop-blur-sm">
      <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-3">
        <Link
          href="/"
          className="text-lg tracking-wider text-zodiac-gold hover:text-zodiac-accent"
        >
          ◆ Film Mentor
        </Link>

        <div className="flex items-center gap-4">
          {session?.user ? (
            <>
              <Link
                href="/chat"
                className="text-sm text-zodiac-muted hover:text-zodiac-fg"
              >
                New Session
              </Link>
              <Link
                href="/profile"
                className="text-sm text-zodiac-muted hover:text-zodiac-fg"
              >
                {session.user.name}
              </Link>
              <button
                onClick={() => signOut()}
                className="text-sm text-zodiac-muted hover:text-zodiac-fg"
              >
                Exit
              </button>
            </>
          ) : (
            <button
              onClick={() => setShowNameInput(!showNameInput)}
              className="text-sm text-zodiac-gold hover:text-zodiac-accent"
            >
              Enter
            </button>
          )}
        </div>
      </div>

      {showNameInput && (
        <div className="border-t border-zodiac-border bg-zodiac-shadow px-4 py-4">
          <form onSubmit={handleEnter} className="mx-auto max-w-md">
            <label className="mb-2 block text-xs tracking-widest text-zodiac-muted uppercase">
              What shall I call you?
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name..."
                className="flex-1 border border-zodiac-border bg-zodiac-bg px-3 py-2 text-sm text-zodiac-fg placeholder-zodiac-muted/50 outline-none focus:border-zodiac-gold"
                autoFocus
              />
              <button
                type="submit"
                className="border border-zodiac-gold px-4 py-2 text-sm text-zodiac-gold hover:bg-zodiac-gold/10"
              >
                Begin
              </button>
            </div>
          </form>
        </div>
      )}

      {showMentorPrompt && (
        <div className="border-t border-zodiac-border bg-zodiac-shadow px-4 py-4">
          <form onSubmit={handleMentorName} className="mx-auto max-w-md">
            <label className="mb-2 block text-xs tracking-widest text-zodiac-muted uppercase">
              Who should the Mentor speak as?
            </label>
            <p className="mb-3 text-xs italic text-zodiac-muted/70">
              A best friend? Someone you trust? Leave blank to use your own name.
            </p>
            <div className="flex gap-2">
              <input
                type="text"
                value={mentorName}
                onChange={(e) => setMentorName(e.target.value)}
                placeholder="Friend's name..."
                className="flex-1 border border-zodiac-border bg-zodiac-bg px-3 py-2 text-sm text-zodiac-fg placeholder-zodiac-muted/50 outline-none focus:border-zodiac-gold"
                autoFocus
              />
              <button
                type="submit"
                className="border border-zodiac-gold px-4 py-2 text-sm text-zodiac-gold hover:bg-zodiac-gold/10"
              >
                Set
              </button>
              <button
                type="button"
                onClick={skipMentorName}
                className="px-3 py-2 text-xs text-zodiac-muted hover:text-zodiac-fg"
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
