interface Message {
  role: "system" | "user" | "assistant";
  content: string;
}

interface OllamaResponse {
  message: { content: string };
  done: boolean;
}

const OLLAMA_URL = "http://localhost:11434/api/chat";
const OLLAMA_MODEL = "llama3.2";

export async function getLLMResponse(messages: Message[]): Promise<string> {
  // 1. Try Ollama (local, free, no key needed)
  const ollamaResult = await tryOllama(messages);
  if (ollamaResult !== null) return ollamaResult;

  // 2. Try Grok (xAI, OpenAI-compatible API)
  const grokResult = await tryGrok(messages);
  if (grokResult !== null) return grokResult;

  // 3. Try Google Gemini (free tier, requires free API key)
  const geminiResult = await tryGemini(messages);
  if (geminiResult !== null) return geminiResult;

  // 4. Fallback to OpenAI (paid)
  const openaiResult = await tryOpenAI(messages);
  if (openaiResult !== null) return openaiResult;

  return "";
}

async function tryOllama(messages: Message[]): Promise<string | null> {
  try {
    const res = await fetch(OLLAMA_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: OLLAMA_MODEL,
        messages,
        stream: false,
        options: { temperature: 0.8 },
      }),
      signal: AbortSignal.timeout(30000),
    });

    if (!res.ok) return null;

    const data: OllamaResponse = await res.json();
    return data.message?.content || "";
  } catch {
    return null;
  }
}

async function tryGrok(messages: Message[]): Promise<string | null> {
  const apiKey = process.env.GROK_API_KEY;
  if (!apiKey) return null;

  try {
    const res = await fetch("https://api.x.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "grok-beta",
        messages,
        temperature: 0.8,
        max_tokens: 600,
      }),
      signal: AbortSignal.timeout(30000),
    });

    if (!res.ok) return null;

    const data = await res.json();
    return data.choices?.[0]?.message?.content || "";
  } catch {
    return null;
  }
}

async function tryGemini(messages: Message[]): Promise<string | null> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;

  try {
    const systemMsg = messages.find((m) => m.role === "system");
    const chatMessages = messages.filter((m) => m.role !== "system");

    const contents = chatMessages.map((m) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    }));

    const body: Record<string, unknown> = { contents };
    if (systemMsg) {
      body.systemInstruction = { parts: [{ text: systemMsg.content }] };
    }

    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(30000),
      }
    );

    if (!res.ok) return null;

    const data = await res.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || "";
  } catch {
    return null;
  }
}

async function tryOpenAI(messages: Message[]): Promise<string | null> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return null;

  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4",
        messages,
        temperature: 0.8,
        max_tokens: 600,
      }),
      signal: AbortSignal.timeout(30000),
    });

    if (!res.ok) return null;

    const data = await res.json();
    return data.choices?.[0]?.message?.content || "";
  } catch {
    return null;
  }
}
