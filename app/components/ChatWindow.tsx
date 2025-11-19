import { useEffect, useRef } from "react";
import ChatMessage from "./ChatMessage";
import { Msg } from "./main";

export default function ChatWindow({
  arr,
  answer,
  loading,
}: {
  arr: Msg[];
  answer: string;
  loading: boolean;
}) {
  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [arr, answer, loading]);

  return (
    <div className="flex-1 overflow-y-auto px-4 py-3 bg-black text-white font-mono">
      <div className="space-y-4">
        {arr.map((msg, i) => (
          <ChatMessage key={i} role={msg.role} text={msg.text} />
        ))}

        {loading && answer && (
          <div className="text-gray-400">
            <span className="text-white">PROCESS:</span> {answer}
          </div>
        )}

        <div ref={bottomRef} />
      </div>
    </div>
  );
}
