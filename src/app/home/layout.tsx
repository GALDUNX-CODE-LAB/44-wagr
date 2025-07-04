'use client'

import Sidebar from '../../components/sidebar'
import Navbar from '../../components/navbar'

export default function HomeLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen bg-[#0A0A0A] text-white">
      {/* Fixed Sidebar */}
      <div className="fixed h-full w-[245px] border-r border-white/10 z-20">
        <Sidebar />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col ml-[245px]">
       
        <Navbar />

        {/* Scrollable Content */}
        <main className="flex-1 overflow-y-auto p-4">
          {children}
        </main>
      </div>
    </div>
  )
}