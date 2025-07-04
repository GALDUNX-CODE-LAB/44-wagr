'use client'

import { Home, Gamepad2 } from 'lucide-react'
import { useState } from 'react'

export default function Sidebar() {
  const [activeItem, setActiveItem] = useState('homepage')

  return (
    <div 
      className="fixed h-[835px] w-[245px] border-r border-white/10 bg-[#212121]"
      style={{
        borderRight: '1px solid rgba(255, 255, 255, 0.1)'
      }}
    >
      <div className="flex flex-col px-6 gap-1 pt-25">
        {/* Homepage Item */}
        <button
          onClick={() => setActiveItem('homepage')}
          className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-all ${
            activeItem === 'homepage' 
              ? 'w-[175px] h-[36px] bg-[#C8A2FF] text-black' 
              : 'text-white/70 hover:bg-white/10'
          }`}
        >
          <Home className="w-5 h-5" />
          <span className="text-sm font-medium">Homepage</span>
        </button>

        {/* Games Item */}
        <button
          onClick={() => setActiveItem('games')}
          className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-all ${
            activeItem === 'games' 
              ? 'w-[175px] h-[36px] bg-[#C8A2FF] text-black' 
              : 'text-white/70 hover:bg-white/10'
          }`}
        >
          <Gamepad2 className="w-5 h-5" />
          <span className="text-sm font-medium">Games</span>
        </button>
      </div>
    </div>
  )
}