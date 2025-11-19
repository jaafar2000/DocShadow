"use client";

import { useState, useEffect } from "react";
import ChatWindow from "./ChatWindow";
import InputBar from "./InputBar";
import UploadFile from "./UploadFile";

export type Msg = { role: "user" | "ai"; text: string };

function isSmallTalk(t: string) {
  t = t.toLowerCase().trim();
  return ["hi", "hey", "hello", "yo", "ok", "ok bro", "thx"].includes(t) ||
    t.startsWith("thanks");
}

export default function Main() {
  const [input, setInput] = useState("");
  const [answer, setAnswer] = useState("");

  const [profileName, setProfileName] = useState("");
  const [fileName, setFileName] = useState("");

  const [showConfirm, setShowConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showUpload, setShowUpload] = useState(true);

  const [arr, setArr] = useState<Msg[]>([
    {
      role: "ai",
      text: "BOOT: v2.5.1 ACTIVE\nSYSTEM READY FOR INPUT.",
    },
  ]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key.toLowerCase() === "c" && !showUpload) {
        setShowConfirm(true);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [showUpload]);

  const handleSubmit = async () => {
    if (!input.trim() || loading) return;

    const userMsg = input.trim();
    setInput("");
    setAnswer("");
    setLoading(true);

    setArr((prev) => [
      ...prev,
      { role: "user", text: `QUERY > ${userMsg}` },
      { role: "ai", text: "PROCESSING..." },
    ]);

    if (isSmallTalk(userMsg)) {
      setArr((prev) => {
        const u = prev.slice(0, -1);
        return [...u, { role: "ai", text: "ACKNOWLEDGED. READY." }];
      });
      setLoading(false);
      return;
    }

    try {
      const ragRes = await fetch("/api/rag", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: userMsg, profileName, fileName }),
      });

      const { context } = await ragRes.json();

      const ansRes = await fetch("/api/llm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: userMsg, context }),
      });

      const reader = ansRes.body?.getReader();
      const decoder = new TextDecoder();
      let full = "";

      while (true) {
        const { value, done } = await reader!.read();
        if (done) break;
        const chunk = decoder.decode(value);
        full += chunk;
        setAnswer((p) => p + chunk);
      }

      setAnswer("");

      setArr((prev) => {
        const u = [...prev];
        u.pop();
        u.push({ role: "ai", text: `RESPONSE > ${full.trim()}` });
        return u;
      });
    } catch {
      setArr((prev) => {
        const u = [...prev];
        u.pop();
        u.push({
          role: "ai",
          text: "ERROR > SYSTEM FAILURE. ABORT.",
        });
        return u;
      });
    } finally {
      setLoading(false);
    }
  };

  if (showUpload) {
    return (
      <div className="w-full h-dvh flex items-center justify-center bg-black px-4">
        <UploadFile
          setShowUpload={setShowUpload}
          setProfileName={setProfileName}
          setFileName={setFileName}
        />
      </div>
    );
  }

  return (
    <div className="bg-black text-white font-mono w-full max-w-5xl mx-auto h-dvh flex flex-col border-x border-white px-2 sm:px-4">

      <div className="px-2 sm:px-4 py-2 border-b border-white text-xs tracking-widest">
        ACTIVE_PROFILE={profileName || "NULL"}  
        &nbsp;&nbsp;FILE={fileName || "NULL"}
      </div>

      <ChatWindow arr={arr} answer={answer} loading={loading} />

      <InputBar
        input={input}
        setInput={setInput}
        loading={loading}
        onSubmit={handleSubmit}
      />

      <button
        onClick={() => setShowConfirm(true)}
        className="mt-2 w-full py-2 border border-white text-white hover:bg-white hover:text-black tracking-widest transition"
      >
        CTRL+C TERMINATE_SESSION
      </button>

      {showConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center px-4">
          <div className="bg-black border-2 border-red-600 p-6 w-full max-w-xs sm:max-w-sm text-center shadow-lg">
            <h2 className="text-red-500 font-bold text-xl mb-4 tracking-widest">
              CONFIRM TERMINATION
            </h2>

            <p className="text-red-400 mb-6 text-sm tracking-wide">
              THIS ACTION WILL DELETE ALL STORED DATA.
            </p>

            {!deleting ? (
              <div className="flex gap-4 justify-center">
                <button
                  onClick={() => setShowConfirm(false)}
                  className="px-4 py-2 border border-white text-white hover:bg-gray-800 tracking-widest"
                >
                  CANCEL
                </button>

                <button
                  onClick={async () => {
                    setDeleting(true);
                    await fetch("/api/delete-profile", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ profileName, fileName }),
                    });

                    setProfileName("");
                    setFileName("");
                    setShowUpload(true);
                    setDeleting(false);
                    setShowConfirm(false);
                  }}
                  className="px-4 py-2 border border-red-600 text-red-400 hover:bg-red-600 hover:text-white transition font-bold tracking-widest"
                >
                  TERMINATE
                </button>
              </div>
            ) : (
              <p className="text-red-400 animate-pulse mt-4 tracking-widest">
                DELETING…
              </p>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
