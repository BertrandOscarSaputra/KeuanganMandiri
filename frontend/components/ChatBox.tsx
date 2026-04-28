"use client";

import { useState, useEffect, useRef } from "react";
import { chatService } from "@/services/chatServices";
import { useAuthStore } from "@/store/useAuthStore";

export default function ChatBox() {
  const user = useAuthStore((state) => state.user);
  const [message, setMessage] = useState("");
  const [chat, setChat] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const history = await chatService.getHistory();
        setChat(history);
      } catch (error) {
        // Silently catch errors so Next.js doesn't show an overlay.
        // The api.ts interceptor will handle 401/403 redirects.
      }
    };
    fetchHistory();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat]);

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!message.trim() || !user?.id) return;

    const userMsg = { role: "user", message };
    setChat((prev) => [...prev, userMsg]);
    setMessage("");
    setIsLoading(true);

    try {
      const response = await chatService.sendMessage(user.id, userMsg.message);
      setChat((prev) => [...prev, response]);
    } catch (error) {
      console.error("Failed to send message", error);
      setChat((prev) => [...prev, { role: "system", message: "Failed to connect to AI." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full font-sans">
      <div className="border-b border-gray-100 pb-3 mb-3 flex items-center gap-2">
        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-500 to-[#2E76EF] flex items-center justify-center text-white font-bold text-xs">
          AI
        </div>
        <div>
          <h3 className="font-semibold text-gray-900 text-sm">Mandiri AI</h3>
          <p className="text-xs text-green-500">Online</p>
        </div>
      </div>
      
      {/* ✅ CHAT AREA */}
      <div className="flex-1 overflow-y-auto mb-4 pr-2 space-y-3">
        {chat.length === 0 && (
          <div className="text-center text-gray-400 text-sm mt-10">
            Tanya tentang pengeluaran, saldo, atau saran keuangan.
          </div>
        )}
        {chat.map((msg, i) => {
          const isUser = msg.role === "user";
          return (
            <div key={i} className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[85%] p-3 rounded-2xl text-sm ${
                  isUser
                    ? "bg-[#2E76EF] text-white rounded-br-none"
                    : "bg-gray-100 text-gray-800 rounded-bl-none"
                }`}
              >
                {msg.message}
              </div>
            </div>
          );
        })}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 p-3 rounded-2xl rounded-bl-none text-sm text-gray-500 flex gap-1">
              <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></span>
              <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></span>
              <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* ✅ INPUT AREA */}
      <form onSubmit={handleSend} className="flex flex-row gap-2">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="border border-gray-300 p-2.5 rounded-xl flex-1 min-w-0 text-sm focus:border-[#2E76EF] focus:ring-1 focus:ring-[#2E76EF] outline-none"
          placeholder="Ask AI about your finances..."
          disabled={isLoading}
        />

        <button
          type="submit"
          disabled={isLoading || !message.trim()}
          className="bg-[#2E76EF] hover:bg-[#2563EB] text-white p-2.5 rounded-xl transition-colors disabled:opacity-70 flex items-center justify-center w-11 h-11 shrink-0"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
          </svg>
        </button>
      </form>
    </div>
  );
}