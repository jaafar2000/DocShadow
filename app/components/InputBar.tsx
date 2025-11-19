export default function InputBar({
  input,
  setInput,
  loading,
  onSubmit,
}: {
  input: string;
  setInput: (t: string) => void;
  loading: boolean;
  onSubmit: () => void;
}) {
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit();
      }}
      className="p-3 bg-black border-t border-white flex gap-3"
    >
      <label
        htmlFor="terminal-input"
        className="text-white flex items-center justify-center font-bold tracking-widest"
      >
        PROMPT &gt;
      </label>

      <input
        id="terminal-input"
        type="text"
        className="flex-1 bg-black text-white border-b border-white p-2 focus:outline-none placeholder:text-gray-500 tracking-wide"
        placeholder="ENTER COMMAND OR QUERY"
        value={input}
        onChange={(e) => setInput(e.target.value)}
      />

      <button
        className="bg-white text-black px-4 py-2 font-bold border border-white tracking-widest hover:bg-gray-200"
        disabled={loading}
      >
        {loading ? "..." : "EXECUTE"}
      </button>
    </form>
  );
}
