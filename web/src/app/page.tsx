import { HelloWorld } from '@/components/hello-world';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm">
        <HelloWorld />
      </div>
    </main>
  );
} 