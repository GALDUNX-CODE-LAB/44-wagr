'use client';

import { useState } from 'react';

interface DebugPanelProps {
  marketId?: string;
}

export default function DebugPanel({ marketId = "687f52e72ada36ddd0986afa" }: DebugPanelProps) {
  const [debugResults, setDebugResults] = useState<string[]>([]);

  const addDebugLog = (message: string) => {
    setDebugResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const testEndpoint = async () => {
    const token = localStorage.getItem('access-token');
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
    const endpoint = `${baseUrl}/${marketId}/bet`;
    
    addDebugLog(`🔍 Testing endpoint: ${endpoint}`);
    addDebugLog(`🔑 Token exists: ${!!token}`);
    addDebugLog(`🌐 Base URL: ${baseUrl}`);
    
    try {
      // First test with OPTIONS to see if endpoint exists
      const optionsResponse = await fetch(endpoint, {
        method: 'OPTIONS',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      });
      
      addDebugLog(`✅ OPTIONS response: ${optionsResponse.status}`);
      
      // Then test with actual POST
      const postResponse = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify({ side: 'YES', stake: 10 }),
      });
      
      addDebugLog(`📡 POST response status: ${postResponse.status}`);
      
      if (postResponse.ok) {
        const data = await postResponse.json();
        addDebugLog(`🎉 Success! Response: ${JSON.stringify(data)}`);
      } else {
        const errorData = await postResponse.json();
        addDebugLog(`❌ Error: ${JSON.stringify(errorData)}`);
      }
      
    } catch (error) {
      addDebugLog(`💥 Network error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      
      if (error instanceof TypeError && error.message.includes('fetch')) {
        addDebugLog(`🚨 This looks like a CORS or server connection issue`);
      }
    }
  };

  const checkEnvironment = () => {
    addDebugLog('🔍 Environment Check:');
    addDebugLog(`NEXT_PUBLIC_API_BASE_URL: ${process.env.NEXT_PUBLIC_API_BASE_URL || 'NOT SET'}`);
    addDebugLog(`NEXT_PUBLIC_META_MARKET_ENDPOINT: ${process.env.NEXT_PUBLIC_META_MARKET_ENDPOINT || 'NOT SET'}`);
    addDebugLog(`Token in localStorage: ${!!localStorage.getItem('access-token')}`);
    addDebugLog(`Current origin: ${window.location.origin}`);
  };

  const clearLogs = () => {
    setDebugResults([]);
  };

  if (process.env.NODE_ENV === 'production') {
    return null; // Don't show in production
  }

  return (
    <div className="fixed bottom-4 right-4 w-96 bg-black/90 text-white p-4 rounded-lg border border-gray-600 max-h-96 overflow-hidden z-50">
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-bold text-sm">API Debug Panel</h3>
        <button
          onClick={clearLogs}
          className="text-xs bg-gray-700 px-2 py-1 rounded"
        >
          Clear
        </button>
      </div>
      
      <div className="flex gap-2 mb-2">
        <button
          onClick={checkEnvironment}
          className="text-xs bg-blue-600 hover:bg-blue-700 px-2 py-1 rounded"
        >
          Check Env
        </button>
        <button
          onClick={testEndpoint}
          className="text-xs bg-green-600 hover:bg-green-700 px-2 py-1 rounded"
        >
          Test Bet API
        </button>
      </div>
      
      <div className="bg-gray-900 p-2 rounded text-xs max-h-48 overflow-y-auto">
        {debugResults.length === 0 ? (
          <p className="text-gray-400">Click buttons above to start debugging...</p>
        ) : (
          debugResults.map((result, index) => (
            <div key={index} className="mb-1 font-mono text-xs">
              {result}
            </div>
          ))
        )}
      </div>
      
      <div className="mt-2 text-xs text-gray-400">
        Market ID: {marketId}
      </div>
    </div>
  );
}