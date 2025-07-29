import { CrashBetPayload } from "../../interfaces/interface";
import apiHandler from "../api-handler";

export const fetchLiveWins = async () => {
  const response = await apiHandler("/live-wins", { method: "GET" });
  return response;
};

export const fetchCoinflipWins = async () => {
  const response = await apiHandler("/live-wins/coinflip", { method: "GET" });
  return response;
};

export const fetchDiceWins = async () => {
  const response = await apiHandler("/live-wins/dice", { method: "GET" });
  return response;
};

export const fetchCrashWins = async () => {
  const response = await apiHandler("/live-wins/crash", { method: "GET" });
  return response;
};

export const placeCrashBet = async (payload: CrashBetPayload) => {
  const response = await apiHandler("/live-wins/crash", { method: "POST", data: payload });
  return response;
};
