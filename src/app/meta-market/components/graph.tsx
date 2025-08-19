"use client";

interface Props {
  yesProbability: number;
  noProbability: number;
}

export default function Graph({ yesProbability, noProbability }: Props) {
  const generateData = () => {
    const points = 20;
    const yesData = [];
    const noData = [];
    for (let i = 0; i <= points; i++) {
      const x = (i / points) * 100;
      const yesVariation = Math.sin(i * 0.3) * 10 + (Math.random() - 0.5) * 15;
      const noVariation = Math.cos(i * 0.4) * 8 + (Math.random() - 0.5) * 12;
      const yesY = Math.max(10, Math.min(90, yesProbability + yesVariation));
      const noY = Math.max(10, Math.min(90, noProbability + noVariation));
      yesData.push({ x, y: 100 - yesY });
      noData.push({ x, y: 100 - noY });
    }
    return { yesData, noData };
  };

  const createPath = (data: { x: number; y: number }[]) =>
    data.reduce((path, point, i) => `${path} ${i === 0 ? "M" : "L"} ${point.x} ${point.y}`, "");

  const { yesData, noData } = generateData();

  return (
    <div className="relative mt-4 h-[212px] w-full max-w-[95%]">
      {/* Grid */}
      <div className="absolute inset-0 flex flex-col justify-between">
        {[90, 70, 50, 30, 10].map((p) => (
          <div
            key={p}
            className="flex items-center justify-between border-t border-dotted border-white/10 text-xs text-white/65"
          >
            <span></span>
            <span className="-mr-2 sm:-mr-8 -mt-2">{100 - p}%</span>
          </div>
        ))}
      </div>

      {/* SVG */}
      <svg
        className="absolute inset-0 w-full h-full"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        style={{ overflow: "visible" }}
      >
        <path d={createPath(yesData)} stroke="#C8A2FF" strokeWidth="2" fill="none" />
        <path d={createPath(noData)} stroke="#ef4444" strokeWidth="2" fill="none" />
      </svg>
    </div>
  );
}
