const REF_STORAGE_KEY = "44wagr_ref_code";

/** Peek at the stored referral code without removing it */
export function peekStoredRefCode(): string | null {
  if (typeof window === "undefined") return null;
  return sessionStorage.getItem(REF_STORAGE_KEY);
}

/** Get and consume stored referral code (removes it from storage) */
export function getStoredRefCode(): string | null {
  if (typeof window === "undefined") return null;
  const code = sessionStorage.getItem(REF_STORAGE_KEY);
  if (code) {
    sessionStorage.removeItem(REF_STORAGE_KEY);
    return code;
  }
  return null;
}
