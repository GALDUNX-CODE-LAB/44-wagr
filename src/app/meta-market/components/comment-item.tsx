"use client";

import { Heart } from "lucide-react";
import { Comment } from "../../../interfaces/interface";

interface Props {
  comment: Comment;
  onLike: () => void;
  liking: boolean;
}

export default function CommentItem({ comment, onLike, liking }: Props) {
  return (
    <div className="flex items-start gap-4 lg:p-3 hover:bg-white/5 border-b border-white/10">
      <div className="w-5 lg:w-8 h-5 lg:h-8 bg-white rounded-full flex-shrink-0" />
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <p className="font-medium text-[10px] lg:text-xs">
            {comment.user?.username || (comment.user?._id ? `User ${comment.user._id.slice(0, 4)}` : "Anonymous")}
          </p>
          <span className="text-[10px] text-white/65">
            •{" "}
            {new Date(comment.createdAt).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        </div>
        <p className="text-white/65 text-[10px] lg:text-xs mt-1">{comment.comment}</p>
        <button
          onClick={onLike}
          disabled={liking}
          className="flex items-center gap-1 mt-2 text-white/40 hover:text-[#C8A2FF] disabled:opacity-50"
        >
          <Heart size={14} />
          <span className="text-[10px]">{comment.likes || 0}</span>
        </button>
      </div>
    </div>
  );
}
