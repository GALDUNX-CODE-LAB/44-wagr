export default function MarketPageSkeleton() {
  return (
    <div className="space-y-6 p-4 md:p-6 lg:max-w-6xl mx-auto">
      <div className="bg-[#212121] rounded-2xl p-4 md:p-6 flex flex-col lg:flex-row gap-6 animate-pulse">
        <div className="flex-1 space-y-4">
          <div className="h-7 w-72 bg-white/5 rounded-full" />
          <div className="h-4 w-64 bg-white/5 rounded-full" />
          <div className="flex items-center gap-4 text-[11px]">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#A855F7]" />
              <span className="h-3 w-16 bg-white/5 rounded-full" />
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#F43F5E]" />
              <span className="h-3 w-16 bg-white/5 rounded-full" />
            </div>
          </div>
          <div className="mt-4 h-64 w-full rounded-xl bg-gradient-to-b from-white/5 via-white/[0.03] to-transparent" />
        </div>

        <div className="w-full lg:w-[360px] bg-[#111317] border border-white/5 rounded-2xl p-4 md:p-5 space-y-4">
          <div className="h-4 w-56 bg-white/5 rounded-full" />
          <div className="flex gap-2">
            <div className="flex-1 h-10 rounded-xl bg-white/5" />
            <div className="flex-1 h-10 rounded-xl bg-white/5" />
          </div>
          <div className="h-10 rounded-xl bg-white/5" />
          <div className="h-4 w-28 bg-white/5 rounded-full" />
          <div className="h-11 rounded-xl bg-[#A855F7]/70" />
          <div className="space-y-1 pt-2 border-t border-white/5">
            <div className="h-3 w-32 bg-white/5 rounded-full" />
            <div className="flex justify-between text-xs">
              <div className="h-3 w-20 bg-white/5 rounded-full" />
              <div className="h-3 w-10 bg-white/5 rounded-full" />
            </div>
            <div className="flex justify-between text-xs">
              <div className="h-3 w-20 bg-white/5 rounded-full" />
              <div className="h-3 w-10 bg-white/5 rounded-full" />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-[#111317] rounded-2xl p-4 md:p-6 space-y-4 animate-pulse">
        <div className="h-4 w-20 bg-white/5 rounded-full" />
        <div className="h-10 w-full rounded-full bg-white/5" />
        <div className="flex items-center justify-between">
          <div className="h-3 w-24 bg-white/5 rounded-full" />
          <div className="h-3 w-20 bg-white/5 rounded-full" />
        </div>
        <div className="pt-6 pb-4 text-center">
          <div className="h-3 w-64 mx-auto bg-white/5 rounded-full" />
        </div>
      </div>
    </div>
  );
}
