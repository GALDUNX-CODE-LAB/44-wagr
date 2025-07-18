'use client'

import { useParams } from 'next/navigation'
import dynamic from 'next/dynamic'
import DiceGame from '../components/games/dice'


// Dynamically import components based on slug
const gamesMap: Record<string, any> = {
  dice: dynamic(() => import('../components/games/dice')),
  coin: dynamic(() => import('../components/games/coin')),
  crash: dynamic(() => import('../components/games/crash')),
  wheel: dynamic(() => import('../components/games/wheel')),
  
 
}

export default function GamePage() {
  const { slug } = useParams() as { slug: string }

  const GameComponent = gamesMap[slug]

  return (
    <div>
      {GameComponent ? <GameComponent /> : <p>Game not found.</p>}
    </div>
  )
}
