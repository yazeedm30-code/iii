'use client';

import { useState } from 'react';

const states = ['preparing', 'ready'] as const;
type State = (typeof states)[number];

const seed: Record<State, string[]> = {
  preparing: ['O-9F4-A1', 'O-9F4-A2', 'O-9F4-A3'],
  ready: ['O-9F3-Z9', 'O-9F3-Z8'],
};

const labels: Record<State, string> = {
  preparing: 'قيد التحضير',
  ready: 'جاهز للاستلام',
};

export default function BranchDisplayPage() {
  const [board] = useState(seed);
  return (
    <main className="grid grid-cols-2 gap-6 p-10 min-h-screen">
      {states.map((state) => (
        <section key={state} className="bg-white/5 rounded-3xl p-8 flex flex-col">
          <h2 className="text-3xl font-bold mb-6 text-center">{labels[state]}</h2>
          <div className="grid grid-cols-2 gap-4 flex-1 content-start">
            {board[state].map((number) => (
              <div
                key={number}
                className={`rounded-2xl py-10 text-center text-4xl font-mono tracking-widest ${
                  state === 'ready' ? 'bg-emerald-500' : 'bg-amber-500'
                }`}
              >
                {number}
              </div>
            ))}
          </div>
        </section>
      ))}
    </main>
  );
}
