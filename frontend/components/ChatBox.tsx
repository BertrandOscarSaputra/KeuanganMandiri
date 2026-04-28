"use client";

import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import api from "../services/api";

export default function ChatBox() {
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [chat, setChat] = useState<{role: 'user' | 'ai', text: string}[]>([
    { role: 'ai', text: 'Halo! Saya asisten AI keuangan Anda. Tanyakan apa saja tentang pengeluaran dan pemasukan Anda!' }
  ]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleSend = async () => {
    if (!message.trim()) return;

    const userMsg = message;
    setChat((prev) => [...prev, { role: 'user', text: userMsg }]);
    setMessage("");
    setLoading(true);

    try {
      const userStr = localStorage.getItem("user");
      const user = userStr ? JSON.parse(userStr) : null;
      
      const response = await api.post("/ai/chat", {
        userId: user?.userId || 0, // Fallback ke 0 jika gagal, tapi harusnya selalu ada
        message: userMsg
      });

      setChat((prev) => [...prev, { 
        role: 'ai', 
        text: response.data.message 
      }]);
    } catch (error: any) {
      console.error("Gagal mengirim pesan AI", error);
      const errorMsg = error?.response?.data?.message || error?.response?.data || error.message;
      setChat((prev) => [...prev, { 
        role: 'ai', 
        text: `Error dari Server: ${typeof errorMsg === 'string' ? errorMsg : JSON.stringify(errorMsg)}` 
      }]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [chat]);

  const [isExpanded, setIsExpanded] = useState(false);

  const chatContent = (
    <div className={`flex flex-col h-full bg-white/5 rounded-2xl border border-white/5 overflow-hidden ${isExpanded ? 'shadow-inner' : ''}`}>
      {/* ✅ CHAT AREA */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-white/10 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-white/20">
        {chat.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] rounded-2xl p-3.5 text-sm shadow-md leading-relaxed ${
              msg.role === 'user' 
                ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-br-none' 
                : 'bg-slate-700/80 text-gray-200 rounded-bl-none border border-slate-600/50'
            }`}>
              {msg.text}
            </div>
          </div>
        ))}
      </div>

      {/* ✅ INPUT AREA */}
      <div className="p-3 bg-slate-800/80 border-t border-slate-700/50 backdrop-blur-md">
        <form 
          className="flex gap-2"
          onSubmit={(e) => { e.preventDefault(); handleSend(); }}
        >
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="flex-1 bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
            placeholder="Ask AI about expenses..."
          />

          <button
            type="submit"
            disabled={!message.trim() || loading}
            className="bg-gradient-to-r cursor-pointer from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white p-2.5 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg flex items-center justify-center w-11 h-11"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 transform rotate-90" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
              </svg>
            )}
          </button>
        </form>
      </div>
    </div>
  );

  return (
    <>
      {!isExpanded ? (
        <div className="relative h-full flex flex-col">
          <button 
            onClick={() => setIsExpanded(true)} 
            className="absolute -top-12 right-0 flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-purple-300 hover:text-white bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/20 rounded-lg transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
            </svg>
            Expand
          </button>
          {chatContent}
        </div>
      ) : isMounted ? createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-8 bg-slate-900/90 backdrop-blur-md animate-fade-in">
          <div className="bg-slate-900 border border-slate-700 w-full max-w-5xl h-[85vh] rounded-3xl shadow-2xl flex flex-col p-6 relative">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-300 to-pink-300">Mandiri AI - Extended Chat</h2>
              <button 
                onClick={() => setIsExpanded(false)} 
                className="text-gray-400 hover:text-white px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 transition-colors flex items-center gap-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                Close
              </button>
            </div>
            <div className="flex-1 min-h-0">
              {chatContent}
            </div>
          </div>
        </div>,
        document.body
      ) : null}
    </>
  );
}