"use client";

import { useParams } from "next/navigation";
import dynamic from "next/dynamic";
import { useSidebarCollapsed } from "../../../components/sidebar-collapsed-context";
// import DiceGame from '../components/games/dice'

// Dynamically import components based on slug
const gamesMap: Record<string, any> = {
  dice: dynamic(() => import("../components/games/dice")),
  coin: dynamic(() => import("../components/games/coin")),
  crash: dynamic(() => import("../components/games/crash")),
  wheel: dynamic(() => import("../components/games/wheel")),
  plinko: dynamic(() => import("../components/games/plinko")),
  mines: dynamic(() => import("../components/games/mines")),
};

export default function GamePage() {
  const { slug } = useParams() as { slug: string };
  const { collapsed } = useSidebarCollapsed();

  const GameComponent = gamesMap[slug];

  return (
    <div className={collapsed ? undefined : "px-5"}>
      {GameComponent ? <GameComponent /> : <p>Game not found.</p>}
    </div>
  );
}
