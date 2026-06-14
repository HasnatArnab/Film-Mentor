export interface Film {
  id: string;
  tmdbId: number;
  title: string;
  year: number;
  director: string;
  posterPath: string;
  overview: string;
  themes: string[];
  whyRecommended: string;
  letterboxdSlug: string;
}

export interface FilmTheme {
  id: string;
  name: string;
  description: string;
  keywords: string[];
}

export interface MessageType {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  film?: Film;
}

export type ConversationStatus = "active" | "questioning" | "film-suggested" | "awaiting-reflection" | "resolved";

export interface ChatState {
  conversationId: string;
  status: ConversationStatus;
  messages: MessageType[];
  currentFilm: Film | null;
}
