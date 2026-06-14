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
    <div className="rounded-xl glass-accent p-6">
      <h3 className="font-serif text-lg font-medium tracking-wide text-gold">
        Reflect on &ldquo;{filmTitle}&rdquo;
      </h3>
      <p className="mt-1 text-sm text-text-muted">
        What did you see in the film? What did it show you about yourself?
      </p>

      <form onSubmit={handleSubmit} className="mt-4">
        <textarea
          value={reflection}
          onChange={(e) => setReflection(e.target.value)}
          placeholder="The film showed me..."
          rows={4}
          className="w-full rounded-lg border border-border bg-bg-primary/60 p-4 text-sm text-text-primary placeholder-text-muted/50 outline-none transition-colors focus:border-gold/40"
        />
        <div className="mt-3 flex justify-end">
          <button
            type="submit"
            disabled={!reflection.trim()}
            className="rounded-lg border border-gold/60 px-6 py-2.5 text-xs tracking-widest text-gold transition-all hover:bg-gold-dim disabled:opacity-30 disabled:cursor-not-allowed uppercase"
          >
            Share reflection
          </button>
        </div>
      </form>
    </div>
  );
}
