"use client"

import { useState } from "react"
import { X } from 'lucide-react';

interface AccountSettingsModalProps {
  open: boolean
  onClose: () => void
}

export function AccountSettingsModal({ open, onClose }: AccountSettingsModalProps) {
  const [username, setUsername] = useState("john_doe")
  const [email, setEmail] = useState("john@example.com")
  const [clientSeeds, setClientSeeds] = useState("abc123def456")
  const [activeSeeds, setActiveSeeds] = useState("xyz789uvw012")

  if (!open) return null

  const handleSave = () => {
    // Handle save logic here
    console.log("Saving changes:", { username, email, clientSeeds, activeSeeds })
    onClose()
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
                  className="w-full px-3 py-2 bg-[#2A2A2A] border border-white/20 rounded-md text-white placeholder:text-white/40 focus:border-white/40 focus:outline-none"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="email" className="text-white/60 text-sm block">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 bg-[#2A2A2A] border border-white/20 rounded-md text-white placeholder:text-white/40 focus:border-white/40 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Seeds Card */}
          <div className="bg-[#1C1C1C] rounded-[20px] p-5">
            <h3 className="text-white text-lg font-medium mb-4 text-left">Seeds</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="clientSeeds" className="text-white/80 text-sm block">
                  Client Seeds
                </label>
                <input
                  id="clientSeeds"
                  type="text"
                  value={clientSeeds}
                  onChange={(e) => setClientSeeds(e.target.value)}
                  className="w-full px-3 py-2 bg-[#2A2A2A] border border-white/20 rounded-md text-white placeholder:text-white/40 focus:border-white/40 focus:outline-none font-mono text-sm"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="activeSeeds" className="text-white/80 text-sm block">
                  Active Seeds
                </label>
                <input
                  id="activeSeeds"
                  type="text"
                  value={activeSeeds}
                  onChange={(e) => setActiveSeeds(e.target.value)}
                  className="w-full px-3 py-2 bg-[#2A2A2A] border border-white/20 rounded-md text-white placeholder:text-white/40 focus:border-white/40 focus:outline-none font-mono text-sm"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end mt-6">
          <button
            onClick={handleSave}
            className="bg-[#c8a2ff] text-black hover:bg-white/90 px-6 py-2 rounded-[10px] font-medium transition-colors"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  )
}
