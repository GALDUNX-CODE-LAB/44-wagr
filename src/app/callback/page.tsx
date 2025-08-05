"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { googleLogin } from "../../lib/api/auth";

export default function AuthCallback() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Processing login...');
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const handleCallback = async () => {
      const code = searchParams.get('code');
      const error = searchParams.get('error');
      const state = searchParams.get('state');

      // Handle OAuth errors
      if (error) {
        console.error('OAuth error:', error);
        setStatus('error');
        setMessage(`Login failed: ${error}`);
        
        // Redirect back to home after 3 seconds
        setTimeout(() => {
          router.push('/');
        }, 3000);
        return;
      }

      // Handle missing code
      if (!code) {
        setStatus('error');
        setMessage('No authorization code received');
        setTimeout(() => {
          router.push('/');
        }, 3000);
        return;
      }

      try {
        // Exchange code for tokens
        const result = await googleLogin(code);
        
        console.log('🎯 Processing login result:', result);
        
        // Check for various token field names
        const token = result.access_token || 
                     result.token || 
                     result.accessToken || 
                     result.jwt || 
                     result.authToken;
        
        if (token) {
          // Store tokens
          localStorage.setItem("access-token", token);
          console.log('💾 Token stored successfully');
          
          // Store user info if available
          if (result.user || result.profile || result.userInfo) {
            const userInfo = result.user || result.profile || result.userInfo;
            localStorage.setItem("user", JSON.stringify(userInfo));
            console.log('👤 User info stored:', userInfo);
          }
          
          setStatus('success');
          setMessage('Login successful! Redirecting...');
          
          // Redirect to dashboard or home
          setTimeout(() => {
            router.push('/'); // Redirect to home page
          }, 2000);
        } else {
          console.error('❌ No token found in result:', result);
          throw new Error(`No access token received from server. Response: ${JSON.stringify(result)}`);
        }
      } catch (error) {
        console.error('Login failed:', error);
        setStatus('error');
        setMessage(error instanceof Error ? error.message : 'Login failed');
        
        // Redirect back to home after 3 seconds
        setTimeout(() => {
          router.push('/');
        }, 3000);
      }
    };

    handleCallback();
  }, [searchParams, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#1c1c1c]">
      <div className="bg-[#212121] p-8 rounded-[20px] border border-white/20 max-w-md w-full mx-4">
        <div className="text-center">
          {status === 'loading' && (
            <>
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#C8A2FF] mx-auto mb-4"></div>
              <h2 className="text-xl font-bold text-white mb-2">Processing Login</h2>
              <p className="text-white/70">{message}</p>
            </>
          )}
          
          {status === 'success' && (
            <>
              <div className="text-green-500 text-5xl mb-4">✓</div>
              <h2 className="text-xl font-bold text-white mb-2">Login Successful!</h2>
              <p className="text-white/70">{message}</p>
            </>
          )}
          
          {status === 'error' && (
            <>
              <div className="text-red-500 text-5xl mb-4">✗</div>
              <h2 className="text-xl font-bold text-white mb-2">Login Failed</h2>
              <p className="text-red-400">{message}</p>
              <p className="text-white/50 text-sm mt-2">Redirecting to home page...</p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}