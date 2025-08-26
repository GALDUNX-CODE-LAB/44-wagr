"use client";

interface Props {
  current: number;
  pages: number;
  onChange: (p: number) => void;
}

export default function CommentsPagination({ current, pages, onChange }: Props) {
  return (
    <div className="flex justify-center gap-2 mt-6">
      {Array.from({ length: Math.min(5, pages) }, (_, i) => {
        const p = i + 1;
        return (
          <button
            key={p}
            onClick={() => onChange(p)}
            className={`px-3 py-1 rounded ${current === p ? "bg-[#C8A2FF] text-black" : "bg-[#333]"}`}
          >
            {p}
          </button>
        );
      })}
      {pages > 5 && <span className="px-3 py-1 text-white/60">...</span>}
    </div>
  );
}
