"use client"

import { useState, useEffect } from "react"
import { X } from 'lucide-react';
import { useUser } from "../hooks/useUserData";
import { updateProfile } from "../lib/api";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

interface AccountSettingsModalProps {
  open: boolean
  onClose: () => void
}

export function AccountSettingsModal({ open, onClose }: AccountSettingsModalProps) {
  const { username: currentUsername, email, clientSeed, serverSeedHash, refetch } = useUser();
  const [username, setUsername] = useState(currentUsername || "")
  const [loading, setLoading] = useState(false);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (open && currentUsername) {
      setUsername(currentUsername);
    }
  }, [open, currentUsername]);

  if (!open) return null

  const handleSave = async () => {
    if (!username.trim()) {
      toast.error("Username cannot be empty");
      return;
    }

    if (username.trim() === currentUsername) {
      toast.info("No changes to save");
      return;
    }

    if (username.trim().length < 3) {
      toast.error("Username must be at least 3 characters");
      return;
    }

    if (username.trim().length > 20) {
      toast.error("Username must be less than 20 characters");
      return;
    }

    setLoading(true);
    try {
      await updateProfile({ username: username.trim() });
      toast.success("Profile updated successfully!");
      await refetch();
      queryClient.invalidateQueries({ queryKey: ["user-data"] });
      onClose();
    } catch (error: any) {
      console.error("Failed to update profile:", error);
      toast.error(error?.response?.data?.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div
        className="w-full max-w-[759px] bg-[#212121] border border-white/10 rounded-[20px] p-5 relative"
        style={{ maxHeight: "90vh" }}
      >
          <button
                  onClick={onClose}
                  className="absolute top-3 right-3 p-1 rounded-full hover:bg-white/10"
                >
                  <X className="w-5 h-5" />
                </button>

        {/* Header */}
        <h2 className="text-white text-[24px] font-medium mb-6 text-left">Account Settings</h2>

        <div className="space-y-5">
          {/* Profile Card */}
          <div className="bg-[#1C1C1C] rounded-[20px] p-5">
            <h3 className="text-white text-lg font-medium mb-4 text-left">Profile</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="username" className="text-white/60 text-sm block">
                  Username
                </label>
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter username"
                  className="w-full px-3 py-2 bg-[#2A2A2A] border border-white/20 rounded-md text-white placeholder:text-white/40 focus:border-white/40 focus:outline-none"
                />
                <p className="text-xs text-white/40">3-20 characters</p>
              </div>

              <div className="space-y-2">
                <label htmlFor="email" className="text-white/60 text-sm block">
                  Wallet Address
                </label>
                <input
                  id="email"
                  type="text"
                  value={email}
                  readOnly
                  className="w-full px-3 py-2 bg-[#1A1A1A] border border-white/10 rounded-md text-white/60 cursor-not-allowed"
                />
                <p className="text-xs text-white/40">Cannot be changed</p>
              </div>
            </div>
          </div>

          <div className="bg-[#1C1C1C] rounded-[20px] p-5">
            <h3 className="text-white text-lg font-medium mb-4 text-left">Seeds</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="clientSeeds" className="text-white/80 text-sm block">
                  Client Seed
                </label>
                <input
                  id="clientSeeds"
                  type="text"
                  value={clientSeed || ""}
                  readOnly
                  className="w-full px-3 py-2 bg-[#1A1A1A] border border-white/10 rounded-md text-white/60 cursor-not-allowed font-mono text-sm"
                />
                <p className="text-xs text-white/40">Read-only</p>
              </div>

              <div className="space-y-2">
                <label htmlFor="activeSeeds" className="text-white/80 text-sm block">
                  Server Seed Hash
                </label>
                <input
                  id="activeSeeds"
                  type="text"
                  value={serverSeedHash || ""}
                  readOnly
                  className="w-full px-3 py-2 bg-[#1A1A1A] border border-white/10 rounded-md text-white/60 cursor-not-allowed font-mono text-sm"
                />
                <p className="text-xs text-white/40">Read-only</p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-6 py-2 rounded-[10px] font-medium transition-colors bg-white/10 text-white hover:bg-white/20 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={loading || !username.trim() || username.trim() === currentUsername}
            className="bg-[#c8a2ff] text-black hover:bg-[#b892ff] px-6 py-2 rounded-[10px] font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  )
}
