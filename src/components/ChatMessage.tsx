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
        className={`max-w-[85%] ${
          isUser
            ? "rounded-2xl rounded-br-sm bg-gold-dim/30 px-5 py-3.5"
            : "px-1 py-1"
        }`}
      >
        {!isUser && (
          <div className="mb-2 flex items-center gap-2">
            <span className="font-serif text-xs italic text-gold">M</span>
            <span className="text-[11px] tracking-[0.15em] text-gold uppercase">
              Mentor
            </span>
          </div>
        )}
        <p
          className={`whitespace-pre-wrap text-sm leading-relaxed ${
            isUser ? "text-text" : "text-text-secondary"
          }`}
        >
          {message.content}
        </p>
      </div>
    </div>
  );
}
