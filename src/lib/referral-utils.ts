const REF_STORAGE_KEY = "44wagr_ref_code";

/** Get and consume stored referral code (for use during wallet connect / signup) */
export function getStoredRefCode(): string | null {
  if (typeof window === "undefined") return null;
  const code = sessionStorage.getItem(REF_STORAGE_KEY);
  if (code) {
    sessionStorage.removeItem(REF_STORAGE_KEY);
    return code;
  }
  return null;
}
