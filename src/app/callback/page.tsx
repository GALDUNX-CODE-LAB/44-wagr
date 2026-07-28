"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { googleLogin, setAuthTokens } from "../../lib/api/auth";
import SetupProfileModal from "../../components/set-profile-modal";
import { CircleCheck, CircleX } from "lucide-react";

export default function AuthCallback() {
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("Processing login...");
  const [openProfileSetup, setOpenProfileSetup] = useState(false);

  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const handleCallback = async () => {
      const code = searchParams.get("code");
      const error = searchParams.get("error");

      // Handle OAuth errors
      if (error) {
        console.error("OAuth error:", error);
        setStatus("error");
        setMessage(`Login failed: ${error}`);

        // Redirect back to home after 3 seconds
        setTimeout(() => {
          router.push("/");
        }, 3000);
        return;
      }

      // Handle missing code
      if (!code) {
        setStatus("error");
        setMessage("No authorization code received");
        setTimeout(() => {
          router.push("/");
        }, 3000);
        return;
      }

      try {
        console.log("Processing Google login with code:", code);

        // Exchange code for tokens using the existing googleLogin function
        const result = await googleLogin(code);

        const usernameChanged = result.user.usernameChanged;

        if (usernameChanged == false) {
          setOpenProfileSetup(true);
          return;
        }

        console.log("Google login result:", result);

        // The googleLogin function already calls setAuthTokens internally,
        // so we just need to verify the tokens were set
        const storedToken = document.cookie
          .split("; ")
          .find((row) => row.startsWith("access-token="))
          ?.split("=")[1];

        if (storedToken) {
          console.log("Tokens stored successfully in cookies");

          setStatus("success");
          setMessage("Login successful! Redirecting...");

          // Trigger auth state update
          window.dispatchEvent(new Event("auth-change"));
          window.location.href = "/";
        } else {
          console.error("No token found in cookies after login");
          throw new Error("Authentication failed - no tokens stored");
        }
      } catch (error) {
        console.error("Google login failed:", error);
        setStatus("error");
        setMessage(error instanceof Error ? error.message : "Login failed");

        // Redirect back to home after 3 seconds
        setTimeout(() => {
          router.push("/");
        }, 3000);
      }
    };

    handleCallback();
  }, [searchParams, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#1c1c1c]">
      <SetupProfileModal
        open={openProfileSetup}
        onClose={() => {
          setOpenProfileSetup(false);
        }}
      />
      <div className="bg-[#212121] p-8 rounded-[20px] border border-white/20 max-w-md w-full mx-4">
        <div className="text-center">
          {status === "loading" && (
            <>
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#C8A2FF] mx-auto mb-4"></div>
              <h2 className="text-xl font-bold text-white mb-2">Processing Login</h2>
              <p className="text-white/70">{message}</p>
            </>
          )}

          {status === "success" && (
            <>
              <div className="flex justify-center mb-4">
                <CircleCheck className="w-14 h-14 text-green-500" strokeWidth={1.75} aria-hidden />
              </div>
              <h2 className="text-xl font-bold text-white mb-2">Login Successful!</h2>
              <p className="text-white/70">{message}</p>
            </>
          )}

          {status === "error" && (
            <>
              <div className="flex justify-center mb-4">
                <CircleX className="w-14 h-14 text-red-500" strokeWidth={1.75} aria-hidden />
              </div>
              <h2 className="text-xl font-bold text-white mb-2">Login Failed</h2>
              <p className="text-red-400 text-sm">{message}</p>
              <p className="text-white/50 text-sm mt-2">Redirecting to home page...</p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
