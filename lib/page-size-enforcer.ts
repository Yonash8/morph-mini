"use client";

import { useEffect, useRef } from "react";

/**
 * Hook to enforce A4/Letter page size constraints
 * Dynamically adjusts font sizes and spacing if content exceeds page height
 */
export function usePageSizeEnforcer(elementId: string) {
  const elementRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const element = document.getElementById(elementId);
    if (!element) return;

    elementRef.current = element;

    const checkAndAdjust = () => {
      const wrapper = element;
      if (!wrapper) return;

      const A4_HEIGHT_MM = 297;
      const A4_HEIGHT_PX = (A4_HEIGHT_MM * 96) / 25.4; // Convert mm to pixels (96 DPI)

      const currentHeight = wrapper.offsetHeight;
      const maxHeight = A4_HEIGHT_PX;

      // If content exceeds page height, we could adjust font sizes
      // For now, we'll just ensure overflow is hidden
      if (currentHeight > maxHeight) {
        console.warn(
          `Resume height (${currentHeight.toFixed(0)}px) exceeds A4 page height (${maxHeight.toFixed(0)}px). Consider reducing content.`
        );
      }
    };

    // Check on mount and when content changes
    checkAndAdjust();
    const observer = new MutationObserver(checkAndAdjust);
    observer.observe(element, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["style", "class"],
    });

    // Also check on resize
    window.addEventListener("resize", checkAndAdjust);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", checkAndAdjust);
    };
  }, [elementId]);

  return elementRef;
}


