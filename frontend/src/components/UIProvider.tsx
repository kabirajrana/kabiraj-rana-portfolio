"use client";

import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode } from "react";

import FireworksCelebration, { FIREWORKS_CONFIG } from "@/components/FireworksCelebration";

type UIContextValue = {
  triggerFireworks: () => Promise<boolean>;
};

const UIContext = createContext<UIContextValue | null>(null);

export function UIProvider({ children }: { children: ReactNode }) {
  const [sessionId, setSessionId] = useState<number | null>(null);
  const resolverRef = useRef<((played: boolean) => void) | null>(null);
  const lastTriggerRef = useRef(0);

  const triggerFireworks = useCallback(async () => {
    const now = Date.now();
    if (now - lastTriggerRef.current < FIREWORKS_CONFIG.cooldownMs) {
      return false;
    }

    lastTriggerRef.current = now;

    return new Promise<boolean>((resolve) => {
      resolverRef.current = resolve;
      setSessionId(now);
    });
  }, []);

  const onFinished = useCallback(() => {
    setSessionId(null);
    resolverRef.current?.(true);
    resolverRef.current = null;
  }, []);

  const value = useMemo(
    () => ({
      triggerFireworks,
    }),
    [triggerFireworks]
  );

  return (
    <UIContext.Provider value={value}>
      {children}
      <FireworksCelebration sessionId={sessionId} onFinished={onFinished} />
    </UIContext.Provider>
  );
}

export function useUIEffects() {
  const context = useContext(UIContext);
  if (!context) {
    throw new Error("useUIEffects must be used inside UIProvider");
  }

  return context;
}
