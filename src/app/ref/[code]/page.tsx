"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";

const REF_STORAGE_KEY = "44wagr_ref_code";

export default function RefPage() {
  const params = useParams();
  const router = useRouter();
  const code = params?.code as string;

  useEffect(() => {
    if (typeof window === "undefined" || !code) return;

    sessionStorage.setItem(REF_STORAGE_KEY, code);
    router.replace("/");
  }, [code, router]);

  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="animate-pulse text-white/60 text-sm">Redirecting...</div>
    </div>
  );
}
