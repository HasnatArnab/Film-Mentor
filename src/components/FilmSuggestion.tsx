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
    ? `https://image.tmdb.org/t/p/w342${film.posterPath}`
    : null;

  return (
    <div className="overflow-hidden rounded-xl glass-accent">
      <div className="flex flex-col sm:flex-row">
        <div className="w-full shrink-0 sm:w-28">
          {posterUrl ? (
            <img
              src={posterUrl}
              alt={film.title}
              className="h-40 w-full object-cover sm:h-full sm:w-28"
            />
          ) : (
            <div className="flex h-40 w-full items-center justify-center bg-gold-dim/20 sm:h-full sm:w-28">
              <span className="font-serif text-3xl italic text-gold/40">M</span>
            </div>
          )}
        </div>
        <div className="flex flex-1 flex-col p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="font-serif text-xl font-medium tracking-wide text-gold">
                {film.title}
              </h3>
              <p className="text-xs text-text-muted">{film.year}</p>
            </div>
          </div>
          <p className="mt-3 flex-1 text-sm leading-relaxed text-text-secondary">
            {film.whyThisFilm}
          </p>
          <div className="mt-4 flex items-center gap-3">
            <button
              onClick={onWatch}
              className="rounded-lg border border-gold/60 px-5 py-2 text-xs tracking-widest text-gold transition-all hover:bg-gold-dim uppercase"
            >
              I&apos;ve watched it
            </button>
            {film.letterboxdUrl && (
              <a
                href={film.letterboxdUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs tracking-wider text-text-muted underline underline-offset-4 transition-colors hover:text-text-primary"
              >
                View on Letterboxd →
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
