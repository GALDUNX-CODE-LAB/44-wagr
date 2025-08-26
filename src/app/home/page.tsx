"use client";

import { useRouter } from "next/navigation";
import { ChevronDown, ArrowUpRight } from "lucide-react";
import Image from "next/image";
import LiveWinsSection from "../../components/live-wins";
import { useAccount } from "wagmi";
import HomeV2 from "./home-v2";
import { useEffect, useState } from "react";
import { getGoogleCallback } from "../../lib/api";
import { setCookie } from "../../lib/api/cookie";
import { RiLoaderLine } from "react-icons/ri";

export default function HomePage() {
  const router = useRouter();
  const { address, isConnected } = useAccount();

  const availableGames = [
    { name: "Crash", players: 1248, image: "/assets/games/crash.png" },
    { name: "Dice", players: 892, image: "/assets/games/dice.png" },
    { name: "Coin", players: 1532, image: "/assets/games/coin-flip.png" },
    { name: "Wheel", players: 721, image: "/assets/games/wheels.png" },
  ];

  const trendingGames = [
    { name: "Roulette Royale", players: 1248, image: "/assets/games/crash.png" },
    { name: "Blackjack Pro", players: 1248, image: "/assets/games/coin-flip.png" },
    { name: "Slots Mania", players: 1248, image: "/assets/games/Dice.png" },
    { name: "Poker Stars", players: 1248, image: "/assets/games/glass-bridge.png" },
    { name: "Baccarat Elite", players: 1248, image: "/assets/games/mine.png" },
    { name: "Craps Champion", players: 1248, image: "/assets/games/Plinko.png" },
    { name: "Texas Holdem", players: 1248, image: "/assets/games/pump.png" },
    { name: "Dice Master", players: 1248, image: "/assets/games/red-light.png" },
    { name: "Virtual Sports", players: 1248, image: "/assets/games/rock.png" },
    { name: "Wheel of Fortune", players: 1248, image: "/assets/games/wheels.png" },
  ];

  const cardData = [
    "What is Peejayy all about?",
    "How does peejayy standout from others?",
    "What is the possibility we won't have dash?",
    "Is Peejayy staying longer?",
    "How secure is Peejayy?",
    "What support do we get?",
  ];

  const [isAuthenticating, setIsAuthenticating] = useState(false);

  useEffect(() => {
    const url = window.location.href;
    const getUrl = new URL(url);
    const code = getUrl.searchParams.get("code");
    const refCode = getUrl.searchParams.get("refCode");

    if (code) {
      setIsAuthenticating(true);
      handlGoogleCallback(code);
    }
  }, []);

  const handlGoogleCallback = async (code: string) => {
    try {
      // alert("Reacheed herererrrrrr");
      const res = await getGoogleCallback(code);
      setCookie("access-token", res.accessToken);
      // toast.success("Logged in ");
      setTimeout(() => {
        window.location.href = "/home";
      }, 2000);
    } catch (error) {
      console.log(error);
      window.location.href = "/home";
    }
  };

  // return (
  //   <div className="p-4 sm:p-6 text-white container mx-auto">
  //     <div className="flex justify-end mb-6">
  //       {/* <div className="flex items-center gap-3">
  //         {isLoading ? (
  //           <div className="text-sm px-3 py-1 bg-yellow-500/10 rounded-full text-yellow-400">Authenticating...</div>
  //         ) : isAuthenticated ? (
  //           <div className="flex items-center gap-2 px-3 py-1 bg-green-500/20 rounded-full">
  //             <div className="w-2 h-2 rounded-full bg-green-500"></div>
  //             <span className="text-sm">Verified</span>
  //           </div>
  //         ) : authError ? (
  //           <div className="text-sm text-red-400 px-3 py-1 bg-red-500/10 rounded-full">{authError}</div>
  //         ) : (
  //           <div className="text-sm px-3 py-1 bg-gray-500/10 rounded-full">Not Authenticated</div>
  //         )}
  //       </div> */}
  //     </div>

  //     <div className="w-[full] h-[223px] bg-[#212121] rounded-[20px] overflow-hidden relative border border-white/6 mb-8">
  //       <Image src={"/assets/banners/banner-lg.jpg"} fill className="object-cover hidden lg:block" alt="banner" />
  //       <Image src={"/assets/banners/banner-mb.jpg"} fill className="object-cover lg:hidden" alt="banner" />
  //     </div>

  //     <div className="wrap w-full hidden lg:block overflow-hidden mb-10 bg-[#212121] pb-8 lg:ml-auto">
  //       <ContinuePlaying />
  //     </div>

  //     <section className="mb-8">
  //       <h1 className="text-2xl font-normal text-[18px] text-white/50 mb-6 ml-1">44wagr Originals</h1>
  //       <div className="grid gap-4 grid-cols-2 sm:grid-cols-2 lg:grid-cols-4">
  //         {availableGames.map((game, index) => (
  //           <div
  //             key={index}
  //             onClick={() => handleGameClick(game.name)}
  //             className="cursor-pointer w-full overflow-clip relative rounded-[20px] border border-white/10 bg-[#212121] md:flex items-center justify-between px-4 py-3 hover:bg-[#2a2a2a] transition"
  //           >
  //             <img
  //               src={"/assets/blurs/game-blur.png"}
  //               alt={game.name}
  //               className="object-contain hidden md:block absolute left-0 top-0 bottom-0"
  //             />
  //             <img
  //               src={game.image}
  //               alt={game.name}
  //               className="object-contain md:block absolute left-0 top-0 bottom-0 opacity-10"
  //             />
  //             <img
  //               src={"/assets/blurs/game-blur-mb.png"}
  //               alt={game.name}
  //               className="object-contain mb:hidden block absolute left-0 top-0 bottom-0"
  //             />
  //             <Image
  //               src={game.image}
  //               alt={game.name}
  //               width={70}
  //               height={70}
  //               className="object-cover relative z-10 hidden md:block rounded-lg"
  //             />
  //             <div className="flex-col items-end hidden md:flex relative z-10">
  //               <h3 className="font-medium text-white/70 text-sm">{game.name}</h3>
  //               <div className="flex items-center mt-1">
  //                 <div className="w-2 h-2 rounded-full bg-red-500 mr-2"></div>
  //                 <span className="text-xs text-white text-[12px]">{game.players.toLocaleString()}</span>
  //               </div>
  //             </div>
  //             <h3 className="font-medium text-white/70 text-sm md:hidden">{game.name}</h3>
  //             <div className="flex items-end justify-between h-[80px] md:hidden">
  //               <Image
  //                 src={game.image}
  //                 alt={game.name}
  //                 width={80}
  //                 height={80}
  //                 className="object-cover relative rounded-lg z-10"
  //               />
  //               <div className="flex items-center mt-1 mb-3">
  //                 <div className="w-2 h-2 rounded-full bg-red-500 mr-2"></div>
  //                 <span className="text-xs text-white text-[12px]">{game.players.toLocaleString()}</span>
  //               </div>
  //             </div>
  //           </div>
  //         ))}
  //       </div>
  //     </section>

  //     <section className="mb-10 md:bg-[#212121] md:border border-[#ffffff]/6 rounded-[15px] md:p-5">
  //       <div className="flex items-center gap-2 mb-5 ml-1">
  //         <Image src="/assets/casino.svg" alt="casino logo" width={24} height={24} />
  //         <h2 className="text-[18px] font-medium">Trending Games</h2>
  //       </div>
  //       <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 gap-y-10">
  //         {trendingGames.map((game, index) => (
  //           <div key={index} className="flex flex-col items-start">
  //             <div className="w-full h-[180px] overflow-hidden bg-[#2c2c2c] border border-white/10 rounded-[16px] relative hover:bg-[#2a2a2a] transition">
  //               <div className="absolute z-10 top-2 left-2 w-6 h-6 bg-[#C8A2FF] rounded-full flex items-center justify-center">
  //                 <ArrowUpRight className="w-3 h-3 text-black" />
  //               </div>
  //               <div className="relative h-full">
  //                 <Image src={game.image} alt={game.name} fill className="object-cover rounded-lg" />
  //               </div>
  //             </div>
  //             <h3 className="font-medium mt-3 text-left text-sm text-white/70">{game.name}</h3>
  //             <div className="flex items-center mt-1">
  //               <div className="w-2 h-2 rounded-full bg-red-500 mr-2" />
  //               <span className="text-[10px] text-white/60">{game.players.toLocaleString()} Playing</span>
  //             </div>
  //           </div>
  //         ))}
  //       </div>
  //       <div className="mt-16">
  //         <LiveWinsSection />
  //       </div>
  //     </section>

  //     <section className="mt-20 flex flex-col md:flex-row gap-10">
  //       <div className="flex-1 flex flex-col justify-center">
  //         <div className="bg-[#C8A2FF] max-w-fit text-white font-medium px-3 py-1 rounded-[10px] text-sm mb-4">
  //           FAQs
  //         </div>
  //         <h3 className="text-2xl font-semibold mb-2">Why use 44-wagr for gaming</h3>
  //         <p className="text-gray-400 text-base mb-6 max-w-md">
  //           Lorem ipsum dolor sit amet consectetur. Ac iaculis in nullam etiam. At non cursus
  //         </p>
  //         <button className="w-fit px-4 py-2 rounded-full bg-[#C8A2FF] text-white text-sm font-medium hover:bg-[#D5B3FF] transition">
  //           Start Free Trial
  //         </button>
  //       </div>
  //       <div className="flex-1 flex flex-col gap-4">
  //         {cardData.map((text, index) => (
  //           <div
  //             key={index}
  //             className="w-full h-[50px] bg-[#212121] rounded-[10px] flex items-center justify-between px-4 text-white border border-white/10 shadow-sm"
  //           >
  //             <span className="text-sm font-semibold">{text}</span>
  //             <ChevronDown size={20} />
  //           </div>
  //         ))}
  //       </div>
  //     </section>
  //   </div>
  // );

  return (
    <div className="wrap w-full lg:max-w-8xl mx-auto">
      {isAuthenticating && (
        <div className="fixed bg-black/60 top-0 bottom-0 left-0 right-0 z-[10000] flex items-center justify-center">
          <RiLoaderLine size={30} color="#fff" className="animate-spin" />
        </div>
      )}
      <HomeV2 />
    </div>
  );
}
