"use client";

import { AnimatePresence, motion } from "framer-motion";
import { X, Bell } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { useUser } from "../hooks/useUserData";
import { INotification } from "../interfaces/interface";
import { getNotifications, markNotificationRead } from "../lib/api";

interface NotificationsModalProps {
  open: boolean;
  onClose: () => void;
}

function formatTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString();
}

export default function NotificationsModal({ open, onClose }: NotificationsModalProps) {
  const queryClient = useQueryClient();
  const user = useUser() as any;
  const userId = user?._id || user?.id;

  const { data, isLoading } = useQuery<INotification[]>({
    queryKey: ["notifications", userId],
    queryFn: () => getNotifications(userId),
    enabled: open && !!userId,
  });

  const notifications = data ?? [];

  const markReadMutation = useMutation({
    mutationFn: (id: string) => markNotificationRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications", userId] });
    },
  });

  const handleMarkAllRead = () => {
    if (!notifications.length) return;
    notifications.forEach((n) => {
      if (!n.read) {
        markReadMutation.mutate(n._id);
      }
    });
  };

  const handleClickNotification = (id: string, read: boolean) => {
    if (!read) markReadMutation.mutate(id);
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-start justify-end md:items-center md:justify-center bg-black/40"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="w-full max-w-md md:max-w-lg bg-[#1C1C1C] border border-white/10 rounded-2xl shadow-2xl mx-3 mt-20 md:mt-0 text-white overflow-hidden"
            initial={{ opacity: 0, y: -10, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.96 }}
            transition={{ type: "spring", stiffness: 260, damping: 22 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-4 md:px-5 py-3 border-b border-white/10">
              <div className="flex items-center gap-2 text-sm font-semibold">
                <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-primary/10">
                  <Bell className="w-4 h-4 text-primary" />
                </span>
                Notifications
                {notifications.length > 0 && (
                  <span className="ml-1 rounded-full bg-white/10 px-2 py-0.5 text-[10px] text-white/70">
                    {notifications.filter((n) => !n.read).length} unread
                  </span>
                )}
              </div>
              <button
                className="w-7 h-7 inline-flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 transition"
                onClick={onClose}
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {isLoading ? (
              <div className="px-5 py-6 space-y-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="flex gap-3 animate-pulse">
                    <div className="h-7 w-7 rounded-full bg-white/10" />
                    <div className="flex-1 space-y-2">
                      <div className="h-3 w-2/3 rounded bg-white/10" />
                      <div className="h-3 w-full rounded bg-white/5" />
                    </div>
                  </div>
                ))}
              </div>
            ) : notifications.length === 0 ? (
              <div className="px-5 py-10 text-center text-xs text-white/60">
                No notifications yet. We’ll let you know when something happens.
              </div>
            ) : (
              <div className="max-h-[380px] overflow-y-auto divide-y divide-white/5">
                {notifications.map((n) => (
                  <button
                    key={n._id}
                    type="button"
                    onClick={() => handleClickNotification(n._id, n.read)}
                    className={`w-full text-left px-4 md:px-5 py-3.5 flex gap-3 hover:bg-white/5 transition ${
                      !n.read ? "bg-white/[0.03]" : ""
                    }`}
                  >
                    <div className="flex-shrink-0 mt-1">
                      <span
                        className={`inline-flex h-7 w-7 items-center justify-center rounded-full text-[11px] font-semibold ${
                          n.read ? "bg-white/5 text-white/60" : "bg-primary/15 text-primary"
                        }`}
                      >
                        {!n.read ? "•" : "✓"}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-xs md:text-sm font-medium truncate">{n.title}</p>
                        <span className="text-[10px] text-white/40 whitespace-nowrap">{formatTime(n.createdAt)}</span>
                      </div>
                      <p className="mt-1 text-[11px] md:text-xs text-white/70 leading-relaxed line-clamp-3">
                        {n.message}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            )}

            <div className="px-4 md:px-5 py-3 border-t border-white/10 flex items-center justify-between text-[11px] text-white/50">
              <span>Only you can see these notifications.</span>
              <button
                className="text-primary hover:text-primary/80 font-medium disabled:opacity-40 disabled:cursor-not-allowed"
                disabled={!notifications.some((n) => !n.read)}
                onClick={handleMarkAllRead}
              >
                Mark all read
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
