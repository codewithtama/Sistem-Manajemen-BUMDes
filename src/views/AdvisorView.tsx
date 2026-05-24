import React, { useRef, useEffect } from "react";
import { Sparkles, Send, Bot, User, Loader2, FileSearch } from "lucide-react";

interface AdvisorViewProps {
  isAuditLoading: boolean;
  aiAuditReport: string;
  handleGenerateAuditReport: () => Promise<void>;
  aiChatHistory: Array<{ role: "user" | "model"; text: string }>;
  isAiLoading: boolean;
  aiChatInput: string;
  setAiChatInput: (val: string) => void;
  handleSendAiMessage: (e: React.FormEvent) => Promise<void>;
}

function renderMarkdown(text: string): React.ReactNode[] {
  return text.split("\n").map((line, i) => {
    if (line.startsWith("# "))   return <h2 key={i} className="text-base font-bold text-slate-900 mt-4 mb-2">{line.slice(2)}</h2>;
    if (line.startsWith("## "))  return <h3 key={i} className="text-sm font-bold text-emerald-700 mt-3 mb-1.5 uppercase tracking-wide">{line.slice(3)}</h3>;
    if (line.startsWith("### ")) return <h4 key={i} className="text-sm font-semibold text-slate-800 mt-2 mb-1">{line.slice(4)}</h4>;
    if (line.startsWith("- ") || line.startsWith("* "))
      return <li key={i} className="ml-4 list-disc text-sm text-slate-700 leading-relaxed">{line.slice(2)}</li>;
    if (line.trim() === "") return <div key={i} className="h-2" />;
    return <p key={i} className="text-sm text-slate-700 leading-relaxed">{line}</p>;
  });
}

export default function AdvisorView({
  isAuditLoading, aiAuditReport, handleGenerateAuditReport,
  aiChatHistory, isAiLoading, aiChatInput, setAiChatInput, handleSendAiMessage,
}: AdvisorViewProps) {
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [aiChatHistory, isAiLoading]);

  return (
    <div id="view_ai_advisor" className="space-y-6">

      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center">
            <Sparkles className="w-4 h-4" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Asisten Regulasi AI</h2>
          <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-bold uppercase tracking-wider">Gemini</span>
        </div>
        <p className="text-sm text-slate-500">Evaluasi kepatuhan pembukuan terhadap Permendesa No. 3/2021 menggunakan Gemini AI.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Panel 1: Audit Otomatis */}
        <div className="bg-white rounded-2xl border border-slate-200 flex flex-col h-[560px]">
          {/* Panel header */}
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileSearch className="w-4 h-4 text-slate-600" />
              <h3 className="font-semibold text-slate-900 text-sm">Audit Kepatuhan Regulasi</h3>
            </div>
            <button
              onClick={handleGenerateAuditReport}
              disabled={isAuditLoading}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-200 text-white disabled:text-slate-400 text-xs font-semibold rounded-lg transition cursor-pointer"
            >
              {isAuditLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
              {isAuditLoading ? "Memproses..." : "Jalankan Audit"}
            </button>
          </div>

          {/* Report area */}
          <div className="flex-1 overflow-y-auto p-6">
            {isAuditLoading ? (
              <div className="flex flex-col items-center justify-center h-full gap-4 text-center">
                <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center">
                  <Loader2 className="w-6 h-6 text-emerald-600 animate-spin" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-700">AI sedang mengaudit data...</p>
                  <p className="text-xs text-slate-400 mt-1">Memverifikasi buku kas, simpanan, dan kredit Anda</p>
                </div>
              </div>
            ) : aiAuditReport ? (
              <div className="space-y-1">{renderMarkdown(aiAuditReport)}</div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full gap-3 text-center">
                <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center">
                  <FileSearch className="w-6 h-6 text-slate-400" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-600">Belum ada laporan audit</p>
                  <p className="text-xs text-slate-400 mt-1 max-w-xs leading-relaxed">
                    Klik "Jalankan Audit" untuk mendapatkan evaluasi kepatuhan real-time dari Gemini AI terhadap data BUMDes Anda.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Panel 2: Chat Advisor */}
        <div className="bg-white rounded-2xl border border-slate-200 flex flex-col h-[560px]">
          {/* Panel header */}
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bot className="w-4 h-4 text-slate-600" />
              <h3 className="font-semibold text-slate-900 text-sm">Penasihat BUMDes AI</h3>
            </div>
            <span className="flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Live
            </span>
          </div>

          {/* Chat history */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {/* Show greeting/empty state when only initial model message exists */}
            {aiChatHistory.length <= 1 && !isAiLoading && (
              <div className="flex flex-col items-center justify-center h-full gap-3 text-center">
                <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center">
                  <Bot className="w-6 h-6 text-emerald-500" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-700">Asisten BUMDes siap membantu</p>
                  {aiChatHistory[0] && (
                    <p className="text-xs text-slate-500 mt-2 max-w-xs leading-relaxed">{aiChatHistory[0].text}</p>
                  )}
                </div>
                <div className="flex flex-wrap gap-2 justify-center mt-2">
                  {["NPL saya tinggi, apa solusinya?", "Cara hitung SHU yang benar?"].map(q => (
                    <button
                      key={q}
                      onClick={() => setAiChatInput(q)}
                      className="text-xs text-slate-600 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg px-3 py-1.5 transition cursor-pointer"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Render chat messages; skip initial model greeting when it's the only message */}
            {aiChatHistory.map((msg, i) => {
              if (i === 0 && msg.role === "model" && aiChatHistory.length <= 1) return null;
              return (
                <div key={i} className={`flex items-end gap-2.5 ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                  {msg.role === "model" && (
                    <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                      <Bot className="w-3.5 h-3.5" />
                    </div>
                  )}
                  <div className={`max-w-xs sm:max-w-sm px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                    msg.role === "user"
                      ? "bg-slate-900 text-white rounded-br-none"
                      : "bg-slate-100 text-slate-800 rounded-bl-none"
                  }`}>
                    {msg.text}
                  </div>
                  {msg.role === "user" && (
                    <div className="w-7 h-7 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center shrink-0">
                      <User className="w-3.5 h-3.5" />
                    </div>
                  )}
                </div>
              );
            })}


            {isAiLoading && (
              <div className="flex items-end gap-2.5 justify-start">
                <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                  <Bot className="w-3.5 h-3.5" />
                </div>
                <div className="bg-slate-100 rounded-2xl rounded-bl-none px-4 py-3 flex gap-1.5 items-center">
                  <span className="w-2 h-2 rounded-full bg-slate-400 animate-bounce [animation-delay:0ms]" />
                  <span className="w-2 h-2 rounded-full bg-slate-400 animate-bounce [animation-delay:150ms]" />
                  <span className="w-2 h-2 rounded-full bg-slate-400 animate-bounce [animation-delay:300ms]" />
                </div>
              </div>
            )}

            <div ref={chatEndRef} />
          </div>

          {/* Chat input */}
          <div className="px-4 py-3 border-t border-slate-100">
            <form onSubmit={handleSendAiMessage} className="flex gap-2">
              <input
                type="text"
                value={aiChatInput}
                onChange={e => setAiChatInput(e.target.value)}
                placeholder="Tanyakan perihal aturan BUMDes..."
                disabled={isAiLoading}
                className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:opacity-60"
              />
              <button
                type="submit"
                disabled={isAiLoading || !aiChatInput.trim()}
                className="w-10 h-10 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-200 text-white disabled:text-slate-400 rounded-xl flex items-center justify-center transition cursor-pointer shrink-0"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
