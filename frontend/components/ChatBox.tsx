"use client";

import { useState } from "react";

export default function ChatBox() {
  const [message, setMessage] = useState("");
  const [chat, setChat] = useState<string[]>([]);

  const handleSend = () => {
    if (!message.trim()) return;

    setChat((prev) => [...prev, message]);
    setMessage("");
  };

  return (
    <div className="flex flex-col h-full">
      
      {/* ✅ CHAT AREA */}
      <div className="flex-1 overflow-y-auto mb-3">
        {chat.map((msg, i) => (
          <p
            key={i}
            className="bg-gray-200 p-2 mb-2 rounded-lg text-sm break-words"
          >
            {msg}
          </p>
        ))}
      </div>

      {/* ✅ INPUT AREA (NEMPEL BAWAH) */}
      <div className="flex flex-col sm:flex-row gap-2 justify-end">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="border border-gray-300 p-2 rounded-lg flex-1 min-w-0 text-sm focus:border-blue-500 outline-none"
          placeholder="Ask AI..."
        />

        <button
          type="button"
          onClick={handleSend}
          className="bg-blue-500 text-white px-4 py-2 rounded-lg text-sm w-full sm:w-auto"
        >
          Send
        </button>
      </div>
    </div>
  );
}