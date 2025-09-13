"use client";

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface DataPoint {
  label: string; // x-axis value (e.g., "Step 1", "Day 1", or "Time")
  yes: number; // probability percentage (0–100)
  no: number; // probability percentage (0–100)
}

interface Props {
  data: DataPoint[];
}

export default function Graph({ data }: Props) {
  return (
    <div className="relative mt-4 h-[212px] w-full max-w-[95%]">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 10 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
          <XAxis dataKey="label" tick={{ fill: "#aaa", fontSize: 12 }} />
          <YAxis domain={[0, 100]} tickFormatter={(v) => `${v}%`} tick={{ fill: "#aaa", fontSize: 12 }} />
          <Tooltip formatter={(v) => `${v}%`} />
          <Line type="monotone" dataKey="yes" stroke="#C8A2FF" strokeWidth={2} dot={false} />
          <Line type="monotone" dataKey="no" stroke="#ef4444" strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
