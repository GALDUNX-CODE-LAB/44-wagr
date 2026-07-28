"use client";

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface DataPoint {
  label: string;
  yes: number; // LMSR price $0–$1
  no: number;
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
          <XAxis dataKey="label" tick={{ fill: "#aaa", fontSize: 10 }} />
          <YAxis
            domain={[0, 1]}
            tickFormatter={(v: number) => `$${v.toFixed(2)}`}
            tick={{ fill: "#aaa", fontSize: 10 }}
          />
          <Tooltip formatter={(v: number) => `$${v.toFixed(2)}`} />
          <Line type="monotone" dataKey="yes" stroke="#C8A2FF" strokeWidth={2} dot={false} name="YES" />
          <Line type="monotone" dataKey="no" stroke="#ef4444" strokeWidth={2} dot={false} name="NO" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
