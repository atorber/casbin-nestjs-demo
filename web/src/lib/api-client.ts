/// <reference types="node" />

interface HelloWorldResponse {
  message: string;
  timestamp: string;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export async function getHelloWorld(): Promise<HelloWorldResponse> {
  const response = await fetch(`${API_BASE_URL}`);
  if (!response.ok) {
    throw new Error('Failed to fetch hello world message');
  }
  return response.json();
} 