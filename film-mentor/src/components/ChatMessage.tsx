"use client";

interface ChatMessageProps {
  message: {
    id: string;
    role: "user" | "assistant";
    content: string;
  };
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === "user";

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[80%] ${
          isUser
            ? "border border-zodiac-border bg-zodiac-card/50 px-4 py-3"
            : "px-4 py-3"
        }`}
      >
        {!isUser && (
          <div className="mb-2 text-xs tracking-widest text-zodiac-gold uppercase">
            ◆ Mentor
          </div>
        )}
        <p className="whitespace-pre-wrap text-sm leading-relaxed text-zodiac-fg">
          {message.content}
        </p>
      </div>
    </div>
  );
}
