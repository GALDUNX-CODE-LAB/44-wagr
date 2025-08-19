"use client";

import { useState, useEffect } from "react";
import { Award } from "lucide-react";
import { fetchComments, addMetaMarketComment, likeComment } from "../../../lib/api";
import type { Comment, Market } from "../../../interfaces/interface";
import CommentInput from "./comment-input";
import CommentItem from "./comment-item";
import CommentsPagination from "./comments-pagination";

interface Pagination {
  total: number;
  page: number;
  pages: number;
}

export default function Comments({ market }: { market: Market }) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<Pagination>({ total: 0, page: 1, pages: 1 });
  const [commentSort, setCommentSort] = useState<"Newest" | "Oldest">("Newest");
  const [likingCommentId, setLikingCommentId] = useState<string | null>(null);

  // Load comments
  useEffect(() => {
    const load = async () => {
      if (!market._id) return;
      try {
        setLoading(true);
        const res = await fetchComments(market._id, pagination.page);
        if (res?.success && res.data) {
          setComments(res.data);
          setPagination(res.pagination);
        } else throw new Error(res?.message || "Failed to load comments");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load comments");
        setComments([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [market._id, pagination.page]);

  const handleAddComment = async (text: string) => {
    try {
      const res = await addMetaMarketComment(market._id, text);
      if (res?.success && res.data) {
        setComments((prev) => [{ ...res.data, user: { _id: res.data.user }, likes: 0 }, ...prev]);
      }
    } catch (err) {
      console.error("❌ Failed to add comment:", err);
    }
  };

  const handleLikeComment = async (id: string) => {
    if (likingCommentId === id) return;
    setLikingCommentId(id);
    try {
      const res = await likeComment(id);
      if (res?.success) {
        setComments((prev) => prev.map((c) => (c._id === id ? { ...c, likes: (c.likes || 0) + 1 } : c)));
      }
    } finally {
      setLikingCommentId(null);
    }
  };

  return (
    <div className="w-full pb-16 lg:bg-[#212121] rounded-[20px] lg:border border-white/10 lg:p-4 sm:p-6 flex flex-col">
      <div className="flex items-center gap-2 mb-4">
        <Award className="text-[#c8a2ff]" size={13} />
        <h2 className="text-base lg:text-xl font-bold text-white/70">Comments</h2>
      </div>

      {/* Input */}
      <CommentInput onSubmit={handleAddComment} />

      {/* Sort + count */}
      <div className="flex items-center gap-4 mb-4">
        <select
          className="bg-[#212121] text-white text-xs lg:text-sm px-4 py-2 rounded-md lg:rounded-full border border-white/6"
          value={commentSort}
          onChange={(e) => setCommentSort(e.target.value as "Newest" | "Oldest")}
        >
          <option value="Newest">Newest</option>
          <option value="Oldest">Oldest</option>
        </select>
        <span className="text-sm text-white/60">
          {pagination.total} comment{pagination.total !== 1 ? "s" : ""}
        </span>
      </div>

      {/* List */}
      <div className="flex flex-col gap-4 overflow-auto">
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#C8A2FF]" />
          </div>
        ) : error ? (
          <p className="text-center text-red-400 py-8">{error}</p>
        ) : comments.length === 0 ? (
          <p className="text-center text-white/40 py-8">No comments yet. Be the first!</p>
        ) : (
          [...comments]
            .sort((a, b) =>
              commentSort === "Newest"
                ? new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
                : new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
            )
            .map((c) => (
              <CommentItem
                key={c._id}
                comment={c}
                onLike={() => handleLikeComment(c._id)}
                liking={likingCommentId === c._id}
              />
            ))
        )}
      </div>

      {/* Pagination */}
      {pagination.pages > 1 && (
        <CommentsPagination
          current={pagination.page}
          pages={pagination.pages}
          onChange={(p) => setPagination((prev) => ({ ...prev, page: p }))}
        />
      )}
    </div>
  );
}
