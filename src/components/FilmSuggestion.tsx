"use client";

interface FilmSuggestionProps {
  film: {
    title: string;
    year: number;
    posterPath: string;
    whyThisFilm: string;
    letterboxdUrl: string;
  };
  onWatch: () => void;
}

export function FilmSuggestion({ film, onWatch }: FilmSuggestionProps) {
  const posterUrl = film.posterPath
    ? `https://image.tmdb.org/t/p/w500${film.posterPath}`
    : null;

  return (
    <div className="group overflow-hidden rounded-2xl border border-border bg-bg-card transition-all hover:border-border-accent">
      <div className="flex flex-col sm:flex-row">
        <div className="relative w-full overflow-hidden sm:w-48">
          {posterUrl ? (
            <img
              src={posterUrl}
              alt={film.title}
              className="h-56 w-full object-cover transition-transform duration-700 group-hover:scale-105 sm:h-full sm:w-48"
            />
          ) : (
            <div className="flex h-56 w-full items-center justify-center bg-gold-dim/10 sm:h-full sm:w-48">
              <span className="font-serif text-4xl italic text-gold/30">M</span>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-black/40 sm:to-transparent" />
        </div>
        <div className="flex flex-1 flex-col p-6">
          <div>
            <h3 className="font-serif text-2xl font-light tracking-wide text-gold">
              {film.title}
            </h3>
            <p className="mt-0.5 text-xs text-text-muted">{film.year}</p>
          </div>
          <p className="mt-4 flex-1 text-sm leading-relaxed text-text-secondary">
            {film.whyThisFilm}
          </p>
          <div className="mt-5 flex items-center gap-3">
            <button
              onClick={onWatch}
              className="rounded-full border border-gold/60 px-6 py-2 text-[11px] tracking-[0.15em] text-gold transition-all hover:bg-gold-dim uppercase"
            >
              I&apos;ve watched it
            </button>
            {film.letterboxdUrl && (
              <a
                href={film.letterboxdUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs tracking-wider text-text-muted underline underline-offset-4 transition-colors hover:text-text"
              >
                Letterboxd →
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
