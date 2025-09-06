import apiHandler from "../api-handler";

export type DynamicSegment = {
  color: string;
  multiplier: number;
};

// ✅ Hardcoded segments to match backend (do not change this order)
export const HARD_CODED_SEGMENTS: DynamicSegment[] = [
  { color: "green", multiplier: 2 },
  { color: "yellow", multiplier: 1.5 },
  { color: "lightgray", multiplier: 0 },
  { color: "blue", multiplier: 3 },
  { color: "lightgray", multiplier: 0 },
  { color: "red", multiplier: 2.5 },
  { color: "lightgray", multiplier: 0 },
  { color: "purple", multiplier: 1.2 },
];

export const SINGLE_CODED_SEGMENTS: DynamicSegment[] = [
  { color: "green", multiplier: 2 },
  { color: "yellow", multiplier: 1.5 },
  { color: "lightgray", multiplier: 0 },
  { color: "blue", multiplier: 3 },
  { color: "red", multiplier: 2.5 },
  { color: "purple", multiplier: 1.2 },
];

export const fetchSegments = async (): Promise<DynamicSegment[]> => {
  return HARD_CODED_SEGMENTS;
};

export const placeWheelBet = async ({ stake }: { stake: number }) => {
  const payload = {
    stake,
  };
  console.log("[placeWheelBet] Payload being sent to backend:", payload);

  try {
    const response = await apiHandler("/spin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      data: JSON.stringify(payload),
    });

    console.log("[placeWheelBet] SUCCESS:", response);
    return response;
  } catch (error: any) {
    console.error("[placeWheelBet] Error response:", error?.response?.data || error);
    throw error;
  }
};
