"use client";

import { useCallback, useEffect, useState } from "react";

export type ContextMenuState = {
  isOpen: boolean;
  x: number;
  y: number;
  targetText: string;
  targetHref?: string;
};

const INITIAL_STATE: ContextMenuState = {
  isOpen: false,
  x: 0,
  y: 0,
  targetText: "",
};

function shouldAllowNativeMenu(target: HTMLElement | null): boolean {
  if (!target) {
    return true;
  }

  const tag = target.tagName.toLowerCase();
  if (["input", "textarea", "select", "option"].includes(tag)) {
    return true;
  }

  if (target.isContentEditable || target.closest("[contenteditable='true']")) {
    return true;
  }

  if (target.closest("[data-native-context-menu='true']")) {
    return true;
  }

  return false;
}

export function useContextMenu(routeKey?: string) {
  const [menuState, setMenuState] = useState<ContextMenuState>(INITIAL_STATE);

  const closeMenu = useCallback(() => {
    setMenuState(INITIAL_STATE);
  }, []);

  useEffect(() => {
    const onContextMenu = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      if (shouldAllowNativeMenu(target)) {
        return;
      }

      event.preventDefault();

      const selectedText = window.getSelection?.()?.toString().trim() ?? "";
      const anchor = target?.closest("a") as HTMLAnchorElement | null;
      const inferredText = selectedText || anchor?.textContent?.trim() || target?.textContent?.trim() || "Section";

      setMenuState({
        isOpen: true,
        x: event.clientX,
        y: event.clientY,
        targetText: inferredText.slice(0, 68),
        targetHref: anchor?.href,
      });
    };

    document.addEventListener("contextmenu", onContextMenu);

    return () => {
      document.removeEventListener("contextmenu", onContextMenu);
    };
  }, []);

  useEffect(() => {
    if (!menuState.isOpen) {
      return;
    }

    const onEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeMenu();
      }
    };

    const onDismiss = () => {
      closeMenu();
    };

    window.addEventListener("keydown", onEscape);
    window.addEventListener("scroll", onDismiss, true);
    window.addEventListener("resize", onDismiss);
    window.addEventListener("blur", onDismiss);

    return () => {
      window.removeEventListener("keydown", onEscape);
      window.removeEventListener("scroll", onDismiss, true);
      window.removeEventListener("resize", onDismiss);
      window.removeEventListener("blur", onDismiss);
    };
  }, [closeMenu, menuState.isOpen]);

  useEffect(() => {
    closeMenu();
  }, [closeMenu, routeKey]);

  return {
    menuState,
    closeMenu,
  };
}
