export default function ChatMessage({
  role,
  text,
}: {
  role: "user" | "ai";
  text: string;
}) {
  const base = "whitespace-pre-wrap font-mono tracking-wide";

  return (
    <div
      className={
        role === "user"
          ? `${base} text-green-400`
          : `${base} text-gray-300`
      }
    >
      {text}
    </div>
  );
}
