"use client";

import { useState } from "react";
import { Send } from "lucide-react";
import useIsLoggedIn from "../../../hooks/useIsLoggedIn";

export default function CommentInput({ onSubmit }: { onSubmit: (text: string) => void }) {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const isLoggedIn = useIsLoggedIn();

  const handleSubmit = async () => {
    if (!text.trim()) return;
    setLoading(true);
    await onSubmit(text.trim());
    setText("");
    setLoading(false);
  };

  if (!isLoggedIn) {
    return (
      <div className="w-full text-center py-2 bg-[#212121] rounded-[10px] text-xs text-white/70 border border-white/10">
        Please log in to comment
      </div>
    );
  }

  return (
    <div className="relative mb-4">
      <input
        type="text"
        placeholder="Add a comment..."
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSubmit();
          }
        }}
        disabled={loading}
        className="w-full h-[28px] lg:h-[40px] text-[10px] pl-3 pr-10 bg-[#212121] border border-white/6 lg:rounded-[12px] rounded outline-0 lg:text-xs"
      />
      <button
        onClick={handleSubmit}
        disabled={!text.trim() || loading}
        className={`absolute right-1 top-1/2 -translate-y-1/2 p-2 lg:p-4 rounded lg:rounded-[10px] ${
          !text.trim() || loading ? "bg-gray-600" : "bg-[#C8A2FF] hover:bg-[#D5B3FF]"
        }`}
      >
        <Send className="text-black lg:w-4 lg:h-4 w-2 h-2" />
      </button>
    </div>
  );
}
