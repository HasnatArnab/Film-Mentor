"use client";

import { useState } from "react";

interface ReflectionFormProps {
  filmTitle: string;
  onSubmit: (reflection: string) => void;
}

export function ReflectionForm({ filmTitle, onSubmit }: ReflectionFormProps) {
  const [reflection, setReflection] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reflection.trim()) return;
    onSubmit(reflection.trim());
    setReflection("");
  };

  return (
    <div className="border border-zodiac-border bg-zodiac-card/30 p-5">
      <h3 className="mb-1 text-sm tracking-wider text-zodiac-gold">
        Reflect on &ldquo;{filmTitle}&rdquo;
      </h3>
      <p className="mb-4 text-xs text-zodiac-muted">
        What did you see in the film? What did it show you about yourself?
      </p>

      <form onSubmit={handleSubmit}>
        <textarea
          value={reflection}
          onChange={(e) => setReflection(e.target.value)}
          placeholder="The film showed me..."
          rows={4}
          className="w-full border border-zodiac-border bg-zodiac-bg p-3 text-sm text-zodiac-fg placeholder-zodiac-muted/50 outline-none focus:border-zodiac-gold"
        />
        <button
          type="submit"
          disabled={!reflection.trim()}
          className="mt-3 border border-zodiac-gold px-5 py-2 text-xs tracking-wider text-zodiac-gold transition-colors hover:bg-zodiac-gold/10 disabled:opacity-30"
        >
          Share
        </button>
      </form>
    </div>
  );
}
