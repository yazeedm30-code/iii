let context: AudioContext | null = null;

function ensureContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  const AudioContextCtor =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
  if (!AudioContextCtor) return null;
  if (!context) context = new AudioContextCtor();
  return context;
}

function tone(ctx: AudioContext, frequency: number, when: number, durationMs: number, gain = 0.18) {
  const oscillator = ctx.createOscillator();
  const envelope = ctx.createGain();
  oscillator.type = 'sine';
  oscillator.frequency.value = frequency;
  envelope.gain.value = 0;
  envelope.gain.linearRampToValueAtTime(gain, when + 0.01);
  envelope.gain.linearRampToValueAtTime(0, when + durationMs / 1000);
  oscillator.connect(envelope);
  envelope.connect(ctx.destination);
  oscillator.start(when);
  oscillator.stop(when + durationMs / 1000 + 0.05);
}

export function playNewOrderChime(): void {
  const ctx = ensureContext();
  if (!ctx) return;
  if (ctx.state === 'suspended') ctx.resume().catch(() => undefined);
  const now = ctx.currentTime;
  tone(ctx, 880, now, 160);
  tone(ctx, 1320, now + 0.18, 220);
}

export function playArrivalChime(): void {
  const ctx = ensureContext();
  if (!ctx) return;
  if (ctx.state === 'suspended') ctx.resume().catch(() => undefined);
  const now = ctx.currentTime;
  tone(ctx, 660, now, 180, 0.14);
  tone(ctx, 660, now + 0.22, 180, 0.14);
}

/**
 * Browsers block audio until the user interacts with the page.
 * Calling this from a button click warms up the context so later
 * chimes don't get silently dropped.
 */
export function primeAudio(): void {
  const ctx = ensureContext();
  if (ctx?.state === 'suspended') ctx.resume().catch(() => undefined);
}
