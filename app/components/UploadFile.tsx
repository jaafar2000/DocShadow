
"use client";
import React, { useState } from "react";

interface Props {
  setShowUpload: (v: boolean) => void;
  setProfileName: (v: string) => void;
  setFileName: (v: string) => void;
}

export default function UploadFileTerminal({
  setShowUpload,
  setProfileName,
  setFileName,
}: Props) {
  const [file, setFile] = useState<File | null>(null);
  const [localProfileName, setLocalProfileName] = useState("");
  const [localFileName, setLocalFileName] = useState("");

  const [steps, setSteps] = useState<string[]>([]);
  const [processing, setProcessing] = useState(false);

  // Push new terminal step
  function log(step: string) {
    setSteps((prev) => [...prev, step]);
  }

  // Adds a short delay to simulate real processing
  const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !localProfileName || !localFileName) return;

    setProfileName(localProfileName);
    setFileName(localFileName);

    setProcessing(true);
    log("INITIALIZING MODULES...");
    await wait(400);

    // Simulate file upload prep
    log("ALLOCATING MEMORY FOR PDF...");
    await wait(400);

    // Upload
    log("UPLOADING FILE TO REMOTE STORAGE...");
    const form = new FormData();
    form.append("file", file);
    form.append("profile", localProfileName);
    form.append("fileName", localFileName);

    const upload = await fetch("/api/upload", {
      method: "POST",
      body: form,
    });

    const data = await upload.json();
    await wait(500);

    // Parsing
    log("PARSING DOCUMENT STRUCTURE...");
    await fetch("/api/process-pdf", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        url: data.url,
        fileName: localFileName,
        profileName: localProfileName,
      }),
    });

    await wait(800);

    // Embeddings
    log("GENERATING EMBEDDINGS VECTOR SPACE...");
    await wait(700);

    log("PROCESS COMPLETE. READY FOR QUERYING.");
    await wait(500);

    setProcessing(false);
    setTimeout(() => setShowUpload(false), 800);
  };

  return (
    <div className="p-7 max-w-3xl w-[450px] mx-auto bg-black text-white font-mono border border-white shadow-[0_0_18px_rgba(255,255,255,0.25)]">
      {/* TITLE */}
      <h2 className="text-xl pb-2 border-b border-white mb-4 tracking-widest">
        <span className="text-green-400">root@system:</span>~/ingest_v1.2
      </h2>

      {/* FORM */}
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-xs text-gray-400 tracking-widest mb-1">
            &gt; USER_IDENTIFIER
          </label>
          <input
            className="w-full p-2 bg-black border border-white text-white placeholder-gray-600 tracking-wide"
            placeholder="ENTER USER NAME"
            value={localProfileName}
            onChange={(e) => setLocalProfileName(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-xs text-gray-400 tracking-widest mb-1">
            &gt; DOCUMENT_REFERENCE
          </label>
          <input
            className="w-full p-2 bg-black border border-white text-white placeholder-gray-600 tracking-wide"
            placeholder="ENTER DOCUMENT NAME"
            value={localFileName}
            onChange={(e) => setLocalFileName(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-xs text-gray-400 tracking-widest mb-1">
            &gt; SELECT_DATA_FILE (.PDF)
          </label>
          <input
            type="file"
            accept=".pdf"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="block w-full text-sm text-white mt-1
            file:py-1 file:px-4 file:border file:border-white
            file:bg-black file:text-white file:font-bold file:cursor-pointer
            hover:file:bg-[#111]"
          />
        </div>

        <button
          type="submit"
          disabled={!file || !localProfileName || !localFileName}
          className="w-full py-2 bg-white text-black font-bold border border-white tracking-widest hover:bg-gray-200"
        >
          EXECUTE_INGEST
        </button>
      </form>

      {/* TERMINAL OUTPUT */}
      <div className="mt-5 pt-3  text-sm whitespace-pre tracking-widest">
        {steps.map((s, i) => (
          <div key={i} className="text-green-400">
            {">> "}
            {s}
          </div>
        ))}

        {/* SPINNER for silent waiting */}
        {processing && (
          <div className="text-white animate-pulse mt-3">
           { processing ?  "[ PROCESSING ... ]" : "[ DONE ... ]" }
          </div>
        )}
      </div>
    </div>
  );
}
