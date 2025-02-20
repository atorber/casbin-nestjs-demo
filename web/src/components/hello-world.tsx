'use client';

import React, { useEffect, useState } from 'react';
import { getHelloWorld } from '@/lib/api-client';

interface HelloWorldData {
  message: string;
  timestamp: string;
}

export function HelloWorld() {
  const [data, setData] = useState<HelloWorldData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await getHelloWorld();
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch data');
      }
    };

    fetchData();
  }, []);

  if (error) {
    return (
      <div className="p-4 bg-red-50 text-red-700 rounded-md">
        Error: {error}
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-4">
        Loading...
      </div>
    );
  }

  return (
    <div className="p-4 bg-white shadow-md rounded-lg">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">
        {data.message}
      </h1>
      <p className="text-sm text-gray-500">
        Received at: {new Date(data.timestamp).toLocaleString()}
      </p>
    </div>
  );
} 