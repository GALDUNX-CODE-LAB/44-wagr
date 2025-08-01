// "use client"

// import { useState, useEffect, useRef } from "react"
// import { useQuery } from "@tanstack/react-query"
// import { Award } from "lucide-react"
// import { getCrashBets } from "../lib/api" // adjust path as needed

// interface Bet {
//   user: string
//   multiplier: string
//   payout: string
// }

// export default function LiveWatchTables() {
//   const [bets, setBets] = useState<Bet[]>([])
//   const ws = useRef<WebSocket | null>(null)

//   const { data: initialBets = [] } = useQuery<Bet[]>({
//     queryKey: ["crash-bets"],
//     queryFn: getCrashBets,
//   })

//   useEffect(() => {
//     setBets(initialBets)
//   }, [initialBets])

//   useEffect(() => {
//     const wsUrl = process.env.NEXT_PUBLIC_WS
//     if (!wsUrl) return

//     const socket = new WebSocket(wsUrl)
//     ws.current = socket

//     socket.onmessage = (event) => {
//       const msg = JSON.parse(event.data)
//       if (msg.event === "crash-bets") {
//         const bet: Bet = {
//           user: msg.data.user,
//           multiplier: `${msg.data.multiplier}x`,
//           payout: `${msg.data.payout} BTC`,
//         }
//         setBets((prev) => [bet, ...prev])
//       }
//     }

//     return () => {
//       ws.current?.close()
//       ws.current = null
//     }
//   }, [])

//   return (
//     <section className="w-full">
//       <div className="flex items-center gap-2 mb-4">
//         <Award className="text-[#c8a2ff]" />
//         <h2 className="text-xl font-bold text-white">Live Watch</h2>
//       </div>
//       <div className="bg-[#212121] rounded-lg overflow-auto w-full max-h-[350px]">
//         <table className="w-full">
//           <thead className="bg-[#1C1C1C] text-[#ffffff]/60 text-[13px]">
//             <tr>
//               <th className="p-4 text-left">User</th>
//               <th className="p-4 text-left">Multiplier</th>
//               <th className="p-4 text-left">Payout</th>
//             </tr>
//           </thead>
//           <tbody>
//             {bets.map((item, idx) => (
//               <tr
//                 key={idx}
//                 className={`${idx % 2 === 0 ? "bg-[#1C1C1C]" : "bg-[#212121]"} text-[13px]`}
//               >
//                 <td className="p-4 text-green-400 font-medium">{item.user}</td>
//                 <td className="p-4 text-white">{item.multiplier}</td>
//                 <td className="p-4">{item.payout}</td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       </div>
//     </section>
//   )
// }
