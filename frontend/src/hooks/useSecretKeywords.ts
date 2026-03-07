"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export type SecretKeyword = "ai" | "ml" | "kabi";

const KEYWORDS: SecretKeyword[] = ["kabi", "ai", "ml"];
const RESET_AFTER_MS = 1500;
const MAX_BUFFER = 28;

function shouldIgnoreKeydown(target: EventTarget | null): boolean {
  const element = target as HTMLElement | null;
  if (!element) {
    return false;
  }

  const tag = element.tagName.toLowerCase();
  if (["input", "textarea", "select", "button"].includes(tag)) {
    return true;
  }

  if (element.isContentEditable || element.closest("[contenteditable='true']")) {
    return true;
  }

  return false;
}

export function useSecretKeywords(routeKey?: string) {
  const [activeKeyword, setActiveKeyword] = useState<SecretKeyword | null>(null);
  const bufferRef = useRef("");
  const timerRef = useRef<number | null>(null);

  const dismiss = useCallback(() => {
    setActiveKeyword(null);
  }, []);

  const resetBufferTimer = useCallback(() => {
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current);
    }

    timerRef.current = window.setTimeout(() => {
      bufferRef.current = "";
      timerRef.current = null;
    }, RESET_AFTER_MS);
  }, []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.metaKey || event.ctrlKey || event.altKey || shouldIgnoreKeydown(event.target)) {
        return;
      }

      if (event.key === "Escape") {
        dismiss();
        bufferRef.current = "";
        return;
      }

      if (event.key === "Backspace") {
        bufferRef.current = bufferRef.current.slice(0, -1);
        resetBufferTimer();
        return;
      }

      if (event.key.length !== 1) {
        return;
      }

      bufferRef.current = `${bufferRef.current}${event.key.toLowerCase()}`.slice(-MAX_BUFFER);
      resetBufferTimer();

      const matched = KEYWORDS.find((keyword) => bufferRef.current.endsWith(keyword));
      if (!matched) {
        return;
      }

      setActiveKeyword(matched);
      bufferRef.current = "";
    };

    window.addEventListener("keydown", onKeyDown);

    return () => {
      window.removeEventListener("keydown", onKeyDown);
      if (timerRef.current !== null) {
        window.clearTimeout(timerRef.current);
      }
    };
  }, [dismiss, resetBufferTimer]);

  useEffect(() => {
    bufferRef.current = "";
    dismiss();
  }, [dismiss, routeKey]);

  return {
    activeKeyword,
    dismiss,
  };
}
