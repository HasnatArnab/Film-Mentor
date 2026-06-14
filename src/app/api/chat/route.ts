import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getLLMResponse } from "@/lib/llm";
import {
  buildMentorSystemPrompt,
  buildReflectionSystemPrompt,
  buildReflectionAnalysisPrompt,
} from "@/lib/mentor-prompt";
import {
  curatedFilms,
  findThemesInText,
  getRandomFilmByTheme,
  getThemeById,
} from "@/lib/films";
import { fetchMoviePoster } from "@/lib/tmdb";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { conversationId, message, hasWatched, reflection } =
      await req.json();

    if (!conversationId) {
      return NextResponse.json(
        { error: "conversationId required" },
        { status: 400 }
      );
    }

    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
      include: {
        messages: { orderBy: { createdAt: "asc" } },
        films: true,
      },
    });

    if (!conversation || conversation.userId !== session.user.id) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

      // Determine the mentor's voice: friend's name, or null (reverts to "yourself")
      const dbUser = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { mentorName: true },
      });
      const mentorName = dbUser?.mentorName || null;

    // Save user message
    if (message) {
      await prisma.message.create({
        data: {
          conversationId,
          role: "user",
          content: message,
        },
      });
    }

    // Handle reflection after watching
    if (hasWatched && reflection) {
      await prisma.message.create({
        data: {
          conversationId,
          role: "user",
          content: `[After watching "${conversation.films[0]?.title}"]: ${reflection}`,
        },
      });

      const latestFilm = conversation.films[conversation.films.length - 1];
      if (latestFilm) {
        await prisma.filmSuggestion.update({
          where: { id: latestFilm.id },
          data: { reflection, watched: true },
        });
      }

      const history = conversation.messages
        .map((m) => `${m.role}: ${m.content}`)
        .join("\n");

      const analysisMessages: { role: "system" | "user" | "assistant"; content: string }[] = [
        { role: "system", content: buildReflectionSystemPrompt(mentorName) },
        { role: "user", content: buildReflectionAnalysisPrompt(
            latestFilm?.title || "",
            reflection,
            latestFilm?.whyThisFilm || ""
          ),
        },
      ];

      const aiResponse = await getLLMResponse(analysisMessages);

      // Check if they understood
      const understood = aiResponse.includes("You already knew");
      const suggestNewFilm = aiResponse.includes("[SUGGEST_FILM]");
      const cleanReflectionResponse = aiResponse.replace("[SUGGEST_FILM]", "").trim();

      if (suggestNewFilm || (!understood && aiResponse.length > 0)) {
        const responseMessage = suggestNewFilm ? cleanReflectionResponse : aiResponse;
        // Find a different film
        const themes = findThemesInText(
          conversation.messages.map((m) => m.content).join(" ")
        );
        const usedIds = new Set(conversation.films.map((f) => f.tmdbId));
        let newFilm = curatedFilms.find(
          (f) =>
            f.themes.some((t) => themes.includes(t)) && !usedIds.has(f.tmdbId)
        );
        if (!newFilm) {
          newFilm = curatedFilms.find((f) => !usedIds.has(f.tmdbId));
        }

        if (newFilm) {
          const suggestionData = await createSuggestionData(newFilm);
          await prisma.filmSuggestion.create({
            data: { ...suggestionData, conversationId },
          });

          await prisma.message.create({
            data: {
              conversationId,
              role: "assistant",
              content: responseMessage,
            },
          });

          await prisma.conversation.update({
            where: { id: conversationId },
            data: { status: "film-suggested" },
          });

          return NextResponse.json({
            message: responseMessage,
            film: { ...newFilm, ...suggestionData },
            status: "film-suggested",
          });
        }
      }

      // Resolved
      await prisma.conversation.update({
        where: { id: conversationId },
        data: { status: "resolved" },
      });

      await prisma.message.create({
        data: {
          conversationId,
          role: "assistant",
          content: cleanReflectionResponse,
        },
      });

      if (latestFilm) {
        await prisma.filmSuggestion.update({
          where: { id: latestFilm.id },
          data: { resolved: understood },
        });
      }

      if (latestFilm) {
        await prisma.conversation.update({
          where: { id: conversationId },
          data: { theme: getThemeById(latestFilm.whyThisFilm)?.name || "" },
        });
      }

      return NextResponse.json({
        message: cleanReflectionResponse,
        status: understood ? "resolved" : "film-suggested",
      });
    }

    // Normal conversation flow
    const allMessages: { role: "system" | "user" | "assistant"; content: string }[] = [
      { role: "system", content: buildMentorSystemPrompt(mentorName) },
    ];

    // Add past messages (last 10 for context)
    const recentMessages = conversation.messages.slice(-10);
    for (const msg of recentMessages) {
      allMessages.push({
        role: msg.role as "user" | "assistant",
        content: msg.content,
      });
    }

    // Add current message if it wasn't already the last
    if (message) {
      allMessages.push({ role: "user" as const, content: message });
    }

    const aiResponse = await getLLMResponse(allMessages);
    if (!aiResponse) {
      return NextResponse.json(
        { error: "AI response failed" },
        { status: 500 }
      );
    }

    // Save assistant message
    const cleanResponse = aiResponse.replace("[SUGGEST_FILM]", "").trim();
    await prisma.message.create({
      data: {
        conversationId,
        role: "assistant",
        content: cleanResponse,
      },
    });

    const suggestsFilm = aiResponse.includes("[SUGGEST_FILM]");

    if (suggestsFilm) {
      const themes = findThemesInText(
        [...conversation.messages.map((m) => m.content), message || ""].join(
          " "
        )
      );

      const mainTheme = themes[0] || "existential";
      const matchedFilm = getRandomFilmByTheme(mainTheme);

      if (matchedFilm) {
        const suggestionData = await createSuggestionData(matchedFilm);
        await prisma.filmSuggestion.create({
          data: { ...suggestionData, conversationId },
        });

        await prisma.conversation.update({
          where: { id: conversationId },
          data: { status: "film-suggested" },
        });

        return NextResponse.json({
          message: cleanResponse,
          film: { ...matchedFilm, ...suggestionData },
          status: "film-suggested",
        });
      }
    }

    return NextResponse.json({
      message: cleanResponse,
      status: "active",
    });
  } catch (error) {
    console.error("Chat error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

async function createSuggestionData(film: typeof curatedFilms[0]) {
  let posterPath = film.posterPath;
  if (!posterPath) {
    const tmdbPoster = await fetchMoviePoster(film.tmdbId);
    if (tmdbPoster) posterPath = tmdbPoster;
  }
  return {
    tmdbId: film.tmdbId,
    title: film.title,
    year: film.year,
    posterPath: posterPath || "",
    whyThisFilm: film.overview,
    letterboxdUrl: `https://letterboxd.com/film/${film.letterboxdSlug}/`,
  };
}


