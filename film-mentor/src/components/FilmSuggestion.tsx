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
    <div className="border border-zodiac-border bg-zodiac-card p-5">
      <div className="mb-3 flex items-start gap-4">
        <div className="w-24 shrink-0">
          {posterUrl ? (
            <img
              src={posterUrl}
              alt={film.title}
              className="w-full border border-zodiac-border"
            />
          ) : (
            <div className="flex aspect-[2/3] items-center justify-center border border-zodiac-border bg-zodiac-bg">
              <span className="text-xs text-zodiac-muted">◇</span>
            </div>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="text-base tracking-wide text-zodiac-gold">
            {film.title}
          </h3>
          <p className="text-xs text-zodiac-muted">{film.year}</p>
          <p className="mt-3 text-sm leading-relaxed text-zodiac-fg/80">
            {film.whyThisFilm}
          </p>
        </div>
      </div>

      <div className="mt-4 flex items-center gap-3 border-t border-zodiac-border pt-4">
        <button
          onClick={onWatch}
          className="border border-zodiac-gold px-5 py-2 text-xs tracking-wider text-zodiac-gold transition-colors hover:bg-zodiac-gold/10"
        >
          I&apos;ve watched it
        </button>
        {film.letterboxdUrl && (
          <a
            href={film.letterboxdUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs tracking-wider text-zodiac-muted underline underline-offset-4 hover:text-zodiac-fg"
          >
            View on Letterboxd →
          </a>
        )}
      </div>
    </div>
  );
}
