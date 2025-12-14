"use client";

import { useEffect, useState } from "react";

interface FitOptions {
  minScale?: number;
  maxScale?: number;
  scaleStep?: number;
}

/**
 * Automatically scales resume content to fit within A4 page dimensions
 */
export function useAutoFitPage(
  elementId: string,
  options: FitOptions = {}
) {
  const { minScale = 0.7, maxScale = 1.0, scaleStep = 0.01 } = options;
  const [scale, setScale] = useState(1.0);
  const [isFitting, setIsFitting] = useState(false);

  useEffect(() => {
    const fitToPage = () => {
      const element = document.getElementById(elementId);
      if (!element) return;

      setIsFitting(true);

      // A4 dimensions
      const A4_HEIGHT_MM = 297;
      const A4_HEIGHT_PX = (A4_HEIGHT_MM * 96) / 25.4; // Convert mm to pixels

      // Reset scale to check natural height
      element.style.transform = "scale(1)";
      element.style.transformOrigin = "top left";

      // Use requestAnimationFrame to ensure DOM has updated
      requestAnimationFrame(() => {
        const naturalHeight = element.scrollHeight;
        const maxHeight = A4_HEIGHT_PX;

        if (naturalHeight <= maxHeight) {
          // Content fits, use normal scale
          setScale(1.0);
          element.style.transform = "scale(1)";
          setIsFitting(false);
          return;
        }

        // Calculate required scale
        let calculatedScale = maxHeight / naturalHeight;
        
        // Clamp scale between min and max
        calculatedScale = Math.max(minScale, Math.min(maxScale, calculatedScale));

        // Apply scale
        setScale(calculatedScale);
        element.style.transform = `scale(${calculatedScale})`;
        element.style.transformOrigin = "top left";
        
        // Adjust width to maintain aspect ratio
        const scaledWidth = element.offsetWidth * calculatedScale;
        element.style.width = `${scaledWidth}px`;

        setIsFitting(false);
      });
    };

    // Initial fit
    fitToPage();

    // Watch for content changes
    const observer = new MutationObserver(() => {
      fitToPage();
    });

    const element = document.getElementById(elementId);
    if (element) {
      observer.observe(element, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ["style", "class"],
        characterData: true,
      });
    }

    // Also check on resize
    window.addEventListener("resize", fitToPage);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", fitToPage);
    };
  }, [elementId, minScale, maxScale, scaleStep]);

  return { scale, isFitting };
}

