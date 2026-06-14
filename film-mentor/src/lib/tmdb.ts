const TMDB_BASE = "https://api.themoviedb.org/3";
const TMDB_IMAGE = "https://image.tmdb.org/t/p";

export async function fetchMoviePoster(tmdbId: number): Promise<string | null> {
  const key = process.env.TMDB_API_KEY;
  if (!key) return null;

  try {
    const res = await fetch(
      `${TMDB_BASE}/movie/${tmdbId}?api_key=${key}&language=en-US`,
      { next: { revalidate: 86400 } }
    );
    if (!res.ok) return null;
    const data = await res.json();
    return data.poster_path || null;
  } catch {
    return null;
  }
}

export function getPosterUrl(path: string | null, size: "w342" | "w500" | "original" = "w342"): string | null {
  if (!path) return null;
  return `${TMDB_IMAGE}/${size}${path}`;
}

export async function fetchMovieDetails(tmdbId: number) {
  const key = process.env.TMDB_API_KEY;
  if (!key) return null;

  try {
    const res = await fetch(
      `${TMDB_BASE}/movie/${tmdbId}?api_key=${key}&language=en-US`,
      { next: { revalidate: 86400 } }
    );
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}
