export function cn(...parts: Array<string | undefined | null | false>) {
  return parts.filter(Boolean).join(" ");
}

export function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

export function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

export function prefersReducedMotion() {
  if (typeof window === "undefined") return false;
  return window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches ?? false;
}
