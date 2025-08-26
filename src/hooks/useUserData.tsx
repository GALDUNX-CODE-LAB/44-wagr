"use client";
import { useQuery } from "@tanstack/react-query";
import { getUserData } from "../lib/api";

export function useUser() {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["user-data"],
    queryFn: getUserData,
  });

  return {
    balance: data?.balance ?? 0,
    points: data?.points ?? 0,
    referralBalance: data?.referralBalance ?? 0,
    role: data?.role ?? "user",
    email: data?.walletAddress ?? "",
    nonce: data?.nonceCounter ?? 0,
    clientSeed: data?.clientSeed ?? "",
    serverSeed: data?.serverSeed ?? "",
    serverSeedHash: data?.serverSeedHash ?? "",
    createdAt: data?.createdAt ?? "",
    updatedAt: data?.updatedAt ?? "",
    id: data?._id ?? "",

    // query helpers
    isLoading,
    error,
    refetch,
  };
}
