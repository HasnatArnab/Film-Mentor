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
            ? "rounded-2xl rounded-br-md bg-gold-dim/40 px-5 py-3.5"
            : "px-1 py-1"
        }`}
      >
        {!isUser && (
          <div className="mb-2 flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gold-dim text-[10px] text-gold">
              M
            </span>
            <span className="text-[11px] tracking-widest text-gold uppercase">
              Mentor
            </span>
          </div>
        )}
        <p
          className={`whitespace-pre-wrap text-sm leading-relaxed ${
            isUser ? "text-text-primary" : "text-text-secondary"
          }`}
        >
          {message.content}
        </p>
      </div>
    </div>
  );
}
