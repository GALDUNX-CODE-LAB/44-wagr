'use client'

import { Award } from 'lucide-react'

export default function LiveWatchTables() {
  const dummyData = [
    { user: 'Big boy', multiplier: '2.50x', profit: '2,500.76854 BTC' },
    { user: 'Champ', multiplier: '1.80x', profit: '1,800.12345 BTC' },
    { user: 'Legend', multiplier: '3.20x', profit: '3,200.67891 BTC' },
  ]

  const renderTable = () => (
    <div className="bg-[#212121] rounded-lg overflow-hidden w-full h-full flex flex-col">
      <table className="w-full flex-1">
        <thead className="bg-[#1C1C1C] text-[#ffffff]/60 text-[13px]">
          <tr>
            <th className="p-4 text-left">User</th>
            <th className="p-4 text-left">Multiplier</th>
            <th className="p-4 text-left">Profit</th>
          </tr>
        </thead>
        <tbody>
          {dummyData.map((item, index) => (
            <tr
              key={index}
              className={`${
                index % 2 === 0 ? 'bg-[#1C1C1C]' : 'bg-[#212121]'
              } text-[13px]`}
            >
              <td className="p-4 text-green-400 font-medium">{item.user}</td>
              <td className="p-4 text-white">{item.multiplier}</td>
              <td className="p-4">
                <div className="flex items-center gap-1">
                  <span>{item.profit}</span>
                  <div className="w-[15px] h-[15px] rounded-full bg-[#D9D9D9]" />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )

  return (
    <section className="mb-20 w-full">
      {/* Single Header */}
      <div className="flex items-center gap-2 mb-6">
        <Award className="text-[#c8a2ff]" />
        <h2 className="text-xl font-bold text-white">Live Watch</h2>
      </div>

      {/* 3 Evenly Aligned Tables */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 items-start">
        {[1, 2, 3].map((_, index) => (
          <div key={index} className="h-full">{renderTable()}</div>
        ))}
      </div>
    </section>
  )
}
