'use client';

import { useState } from 'react';

export default function Home() {
  const [status, setStatus] = useState<string>('Not tested yet');

  const testConnection = async () => {
    setStatus('Pinging...');
    try {
      const res = await fetch('http://localhost:8000/api/v1/health');
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const data = await res.json();
      setStatus(JSON.stringify(data, null, 2));
    } catch (error) {
      setStatus('Failed to connect. Check if FastAPI is running and CORS is configured.');
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-gray-950 text-white">
      <h1 className="text-4xl font-bold mb-8 tracking-tight">Bioavailability Estimator</h1>
      <button
        onClick={testConnection}
        className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 rounded-md font-semibold transition-colors shadow-lg"
      >
        Ping AI Service
      </button>
      <pre className="mt-8 p-4 bg-gray-900 rounded-lg min-w-[320px] min-h-[100px] overflow-auto text-sm text-emerald-400 border border-gray-800">
        {status}
      </pre>
    </main>
  );
}
