"use client";

/**
 * Intelligent Resume Auto-Fit System
 * 
 * Uses a density-based approach where a single value (0-1) controls
 * how compact the resume is. Different elements respond differently:
 * - Headers: Minimal scaling (0.95-1.0 range) to maintain hierarchy
 * - Body text: Moderate scaling (0.85-1.05 range)
 * - Spacing: Most flexible (0.6-1.15 range)
 * 
 * Uses binary search to find the exact density that fills the page.
 */

// A4 dimensions in pixels at 96 DPI
const A4_HEIGHT_PX = (297 * 96) / 25.4; // ~1122.52px
const A4_WIDTH_PX = (210 * 96) / 25.4;  // ~793.7px

// Bottom margin target: 20-25mm (consistent professional spacing)
const BOTTOM_MARGIN_TARGET_MM = 22; // 22mm = ~83px at 96 DPI
const BOTTOM_MARGIN_TARGET_PX = (BOTTOM_MARGIN_TARGET_MM * 96) / 25.4; // ~83px

// Top padding (page padding)
const TOP_PADDING_PX = 45; // Standard top padding

// Scaling limits for different element types
const SCALES = {
  // Minimum density (most compact allowed)
  min: {
    header: 0.88,         // Headers can compress a bit more
    body: 0.82,           // Body text minimum readable size
    mainSpacing: 0.35,    // Main content spacing can compress significantly
    sidebarSpacing: 0.9,  // Sidebar spacing narrow range for consistency (0.9-1.1)
    workExpansion: 0.35,  // Work experience spacing when projects hidden (can compress)
    lineHeight: 1.15,     // Line height minimum
  },
  // Maximum density (most expanded allowed) 
  max: {
    header: 1.0,          // Don't expand headers
    body: 1.05,           // Slight body expansion for underfilled
    mainSpacing: 1.15,    // Main content spacing can expand
    sidebarSpacing: 1.1,  // Sidebar spacing narrow range for consistency (0.9-1.1)
    workExpansion: 3.0,   // Work experience spacing can expand very aggressively when projects hidden (increased from 2.0)
    lineHeight: 1.8,      // Line height max (increased from 1.55 for better expansion)
  },
  // Base (density = 0.5)
  base: {
    header: 1.0,
    body: 1.0,
    mainSpacing: 1.0,
    sidebarSpacing: 1.0,
    workExpansion: 1.0,
    lineHeight: 1.4,
  }
};

export interface FitResult {
  density: number;           // 0 = max compact, 1 = max expanded
  headerScale: number;       // Scale for h1, h2, section headers
  bodyScale: number;         // Scale for body text, bullets
  mainSpacingScale: number;  // Scale for main content margins, padding
  sidebarSpacingScale: number; // Scale for sidebar margins (narrow range: 0.9-1.1)
  workExperienceSpacingScale: number; // Scale for work experience spacing (aggressive expansion when projects hidden)
  lineHeight: number;        // Line height value
  contentHeight: number;     // Measured content height
  targetHeight: number;      // Target page height
  status: 'fit' | 'overflow' | 'underfill';
}

/**
 * Calculate scales from density value (0-1)
 * 0 = maximum compression, 0.5 = baseline, 1 = maximum expansion
 * @param density - Density value (0-1)
 * @param showProjects - Whether projects are shown (affects work experience expansion)
 */
export function densityToScales(density: number, showProjects: boolean = true): Omit<FitResult, 'contentHeight' | 'targetHeight' | 'status'> {
  const clampedDensity = Math.max(0, Math.min(1, density));
  
  // Interpolate between min (density=0) and max (density=1)
  const lerp = (min: number, max: number) => min + (max - min) * clampedDensity;
  
  // Work experience expansion: always allow aggressive expansion when content is sparse
  // More aggressive when projects are hidden, but still expand when projects shown
  let workExpansionScale: number;
  
  // Always use workExpansion range for work experience (not mainSpacing)
  workExpansionScale = lerp(SCALES.min.workExpansion, SCALES.max.workExpansion);
  
  // Boost expansion when density is high (sparse content)
  // More aggressive boost for higher densities
  if (clampedDensity > 0.5) {
    const expansionBoost = (clampedDensity - 0.5) * 0.6; // Up to 0.6x extra boost
    workExpansionScale = Math.min(SCALES.max.workExpansion, workExpansionScale + expansionBoost);
  }
  
  // For very high densities (0.8+), allow even more expansion
  if (clampedDensity > 0.8) {
    const extraBoost = (clampedDensity - 0.8) * 0.5; // Additional 0.5x boost
    workExpansionScale = Math.min(SCALES.max.workExpansion * 1.2, workExpansionScale + extraBoost);
  }
  
  // Extra boost when projects are hidden
  if (!showProjects && clampedDensity > 0.6) {
    const projectsHiddenBoost = (clampedDensity - 0.6) * 0.3; // Additional boost when projects hidden
    workExpansionScale = Math.min(SCALES.max.workExpansion * 1.3, workExpansionScale + projectsHiddenBoost);
  }
  
  return {
    density: clampedDensity,
    headerScale: lerp(SCALES.min.header, SCALES.max.header),
    bodyScale: lerp(SCALES.min.body, SCALES.max.body),
    mainSpacingScale: lerp(SCALES.min.mainSpacing, SCALES.max.mainSpacing),
    sidebarSpacingScale: lerp(SCALES.min.sidebarSpacing, SCALES.max.sidebarSpacing),
    workExperienceSpacingScale: workExpansionScale,
    lineHeight: lerp(SCALES.min.lineHeight, SCALES.max.lineHeight),
  };
}

/**
 * Measure the height of content at given scales
 */
function measureContentHeight(
  wrapper: HTMLElement,
  scales: ReturnType<typeof densityToScales>
): number {
  // Store original values
  const origStyles = {
    overflow: wrapper.style.overflow,
    height: wrapper.style.height,
    headerScale: wrapper.style.getPropertyValue('--fit-header-scale'),
    bodyScale: wrapper.style.getPropertyValue('--fit-content-font-scale'),
    mainSpacingScale: wrapper.style.getPropertyValue('--fit-main-spacing-scale'),
    sidebarSpacingScale: wrapper.style.getPropertyValue('--fit-sidebar-spacing-scale'),
    workExpansionScale: wrapper.style.getPropertyValue('--fit-work-expansion-scale'),
    lineHeight: wrapper.style.getPropertyValue('--fit-line-height'),
  };

  // Apply measurement scales
  wrapper.style.setProperty('--fit-header-scale', scales.headerScale.toString());
  wrapper.style.setProperty('--fit-content-font-scale', scales.bodyScale.toString());
  wrapper.style.setProperty('--fit-main-spacing-scale', scales.mainSpacingScale.toString());
  wrapper.style.setProperty('--fit-sidebar-spacing-scale', scales.sidebarSpacingScale.toString());
  wrapper.style.setProperty('--fit-work-expansion-scale', scales.workExperienceSpacingScale.toString());
  wrapper.style.setProperty('--fit-line-height', scales.lineHeight.toString());
  
  // Allow natural height measurement
  wrapper.style.overflow = 'visible';
  wrapper.style.height = 'auto';
  
  // Force multiple reflows to ensure CSS variables are applied
  void wrapper.offsetHeight;
  void wrapper.scrollHeight;
  void getComputedStyle(wrapper).height;
  
  // Small delay-like reflow pattern
  const tempDiv = document.createElement('div');
  wrapper.appendChild(tempDiv);
  wrapper.removeChild(tempDiv);
  
  // Get wrapper's top position as reference
  const wrapperRect = wrapper.getBoundingClientRect();
  const wrapperTop = wrapperRect.top;
  
  // Measure both main and sidebar, take maximum
  const mainEl = wrapper.querySelector('main');
  const asideEl = wrapper.querySelector('aside');
  
  let maxHeight = 0;
  
  if (mainEl) {
    const mainStyles = getComputedStyle(mainEl);
    const paddingBottom = parseFloat(mainStyles.paddingBottom) || 0;
    
    // Find the absolute bottom of all content in main
    // Look at all descendant elements to find the one that extends furthest
    // Exclude flexbox spacer elements - they're for layout distribution, not content
    const allElements = mainEl.querySelectorAll('*');
    let maxBottom = 0;
    
    allElements.forEach((el) => {
      // Skip flexbox spacer elements
      if ((el as HTMLElement).classList.contains('section-spacer') ||
          (el as HTMLElement).classList.contains('main-content-spacer')) {
        return;
      }
      const rect = (el as HTMLElement).getBoundingClientRect();
      const styles = getComputedStyle(el as HTMLElement);
      const marginBottom = parseFloat(styles.marginBottom) || 0;
      maxBottom = Math.max(maxBottom, rect.bottom + marginBottom);
    });
    
    // Also check main element itself
    const mainRect = mainEl.getBoundingClientRect();
    maxBottom = Math.max(maxBottom, mainRect.bottom);
    
    // Calculate height relative to wrapper top, plus padding
    const contentHeight = maxBottom - wrapperTop + paddingBottom;
    maxHeight = Math.max(maxHeight, contentHeight);
  }
  
  if (asideEl) {
    const asideRect = asideEl.getBoundingClientRect();
    const asideHeight = asideRect.bottom - wrapperTop;
    maxHeight = Math.max(maxHeight, asideHeight);
  }
  
  // Also check scrollHeight as a fallback (add extra buffer)
  maxHeight = Math.max(maxHeight, wrapper.scrollHeight + 20);
  
  // Restore original values
  wrapper.style.overflow = origStyles.overflow;
  wrapper.style.height = origStyles.height;
  wrapper.style.setProperty('--fit-header-scale', origStyles.headerScale || '1');
  wrapper.style.setProperty('--fit-content-font-scale', origStyles.bodyScale || '1');
  wrapper.style.setProperty('--fit-main-spacing-scale', origStyles.mainSpacingScale || '1');
  wrapper.style.setProperty('--fit-sidebar-spacing-scale', origStyles.sidebarSpacingScale || '1');
  wrapper.style.setProperty('--fit-work-expansion-scale', origStyles.workExpansionScale || '1');
  wrapper.style.setProperty('--fit-line-height', origStyles.lineHeight || '1.45');
  
  return maxHeight;
}

/**
 * Binary search to find the optimal density
 */
function findOptimalDensity(wrapper: HTMLElement, showProjects: boolean = true): FitResult {
  // Get current applied scales
  const currentBodyScale = parseFloat(wrapper.style.getPropertyValue('--fit-content-font-scale')) || 1;
  const currentMainSpacing = parseFloat(wrapper.style.getPropertyValue('--fit-main-spacing-scale')) || 1;
  
  // Measure current state (with current scales applied)
  wrapper.style.overflow = 'visible';
  wrapper.style.height = 'auto';
  void wrapper.offsetHeight;
  
  const mainEl = wrapper.querySelector('main');
  let currentHeight = 0;
  let actualPaddingTop = 0;
  let actualPaddingBottom = 0;
  
  if (mainEl) {
    const mainStyles = getComputedStyle(mainEl);
    actualPaddingTop = parseFloat(mainStyles.paddingTop) || 0;
    actualPaddingBottom = parseFloat(mainStyles.paddingBottom) || 0;
    
    // Find the last visible section to measure bottom accurately
    const sections = mainEl.querySelectorAll('.resume-section');
    let maxBottom = 0;
    
    sections.forEach((section) => {
      // Skip project sections if projects are hidden
      if (!showProjects) {
        const sectionHeader = section.querySelector('h2.section-header');
        if (sectionHeader) {
          const headerText = sectionHeader.textContent?.toLowerCase() || '';
          // Check if this is a projects section by looking at the header or project cards
          if (headerText.includes('project') || section.querySelector('.project-card')) {
            return; // Skip this section
          }
        }
      }
      
      const rect = section.getBoundingClientRect();
      const styles = getComputedStyle(section);
      const marginBottom = parseFloat(styles.marginBottom) || 0;
      maxBottom = Math.max(maxBottom, rect.bottom + marginBottom);
    });
    
    // If no sections found, fall back to main element
    if (maxBottom === 0) {
      const mainRect = mainEl.getBoundingClientRect();
      maxBottom = mainRect.bottom;
    }
    
    // Measure from the top of main content (after padding-top) to bottom of content (before padding-bottom)
    const mainRect = mainEl.getBoundingClientRect();
    const contentTop = mainRect.top + actualPaddingTop;
    
    // Find the absolute bottom of all content in main (including header, sections, etc.)
    let absoluteBottom = maxBottom;
    
    // Also check header and all other elements
    const headerEl = mainEl.querySelector('header');
    if (headerEl) {
      const headerRect = headerEl.getBoundingClientRect();
      const headerStyles = getComputedStyle(headerEl);
      const headerMarginBottom = parseFloat(headerStyles.marginBottom) || 0;
      absoluteBottom = Math.max(absoluteBottom, headerRect.bottom + headerMarginBottom);
    }
    
    // Check all elements in main to find the absolute bottom
    // Exclude flexbox spacer elements - they're for layout distribution, not content
    const allElements = mainEl.querySelectorAll('*');
    allElements.forEach((el) => {
      // Skip flexbox spacer elements (they absorb remaining space, not content)
      if ((el as HTMLElement).classList.contains('section-spacer') ||
          (el as HTMLElement).classList.contains('main-content-spacer')) {
        return;
      }
      
      // Skip project-related elements if projects are hidden
      if (!showProjects) {
        if (el.closest('.project-card') || 
            el.classList.contains('project-card') ||
            el.closest('.resume-section')?.querySelector('.project-card')) {
          return;
        }
      }
      const rect = (el as HTMLElement).getBoundingClientRect();
      const styles = getComputedStyle(el as HTMLElement);
      const marginBottom = parseFloat(styles.marginBottom) || 0;
      absoluteBottom = Math.max(absoluteBottom, rect.bottom + marginBottom);
    });
    
    // Measure content height from content top to absolute bottom
    currentHeight = absoluteBottom - contentTop;
  }
  
  wrapper.style.overflow = 'hidden';
  wrapper.style.height = '297mm';
  
  // Calculate target height: A4 height minus actual padding-top and padding-bottom
  // Padding-top scales with mainSpacingScale, padding-bottom is fixed at 83px
  // For target calculation, we want to fill 95-98% of available space
  const targetFillRatio = showProjects ? 0.95 : 0.98;
  const availableHeight = A4_HEIGHT_PX - actualPaddingTop - actualPaddingBottom;
  const targetHeight = availableHeight * targetFillRatio;
  
  const fillRatio = currentHeight / targetHeight;
  console.log(`[Auto-fit] Current: ${currentHeight.toFixed(0)}px, target: ${targetHeight.toFixed(0)}px, fill: ${(fillRatio * 100).toFixed(0)}%, scale: ${currentBodyScale.toFixed(2)}`);
  
  // Detect content density: sparse (<70%) vs packed (>100%)
  const isSparse = fillRatio < 0.70;
  const isPacked = fillRatio > 1.0;
  
  // Hysteresis: if we're between 90-100%, keep current state to avoid oscillation
  // Only apply hysteresis if we're actually close to target (not sparse)
  const targetRangeMin = showProjects ? 0.90 : 0.92;
  if (fillRatio >= targetRangeMin && fillRatio <= 1.0) {
    // Only keep stable if we're actually well-filled
    // If we're sparse, always try to expand
    if (fillRatio >= 0.90) {
      const currentScales = currentBodyScale < 0.95 ? densityToScales(0, showProjects) : densityToScales(0.5, showProjects);
      console.log(`[Auto-fit] In target range (${(fillRatio * 100).toFixed(0)}%), keeping stable`);
      return {
        ...currentScales,
        contentHeight: currentHeight,
        targetHeight,
        status: 'fit',
      };
    }
  }
  
  // Content overflows - compress
  if (isPacked) {
    const minScales = densityToScales(0, showProjects);
    console.log(`[Auto-fit] Overflow (${(fillRatio * 100).toFixed(0)}%), compressing`);
    return {
      ...minScales,
      contentHeight: currentHeight,
      targetHeight,
      status: 'fit',
    };
  }
  
  // Content underfills - use baseline density
  // Flexbox spacers in the layout handle extra vertical space distribution
  // We just need to ensure content is at a comfortable baseline size
  if (fillRatio < 1.0) {
    // Use baseline density (0.5) - flexbox spacers will absorb extra space
    const baseScales = densityToScales(0.5, showProjects);
    console.log(`[Auto-fit] Underfill (${(fillRatio * 100).toFixed(0)}%), using baseline - flexbox handles space distribution`);
    return {
      ...baseScales,
      contentHeight: currentHeight,
      targetHeight,
      status: 'underfill',
    };
  }
  
  // Should not reach here, but fallback
  const expandScales = densityToScales(0.5, showProjects);
  console.log(`[Auto-fit] Fallback, using baseline density`);
  return {
    ...expandScales,
    contentHeight: currentHeight,
    targetHeight,
    status: 'underfill',
  };
}

/**
 * Apply fit result to wrapper element
 */
export function applyFitResult(wrapper: HTMLElement, result: FitResult | Omit<FitResult, 'contentHeight' | 'targetHeight' | 'status'>) {
  wrapper.style.setProperty('--fit-header-scale', result.headerScale.toString());
  wrapper.style.setProperty('--fit-content-font-scale', result.bodyScale.toString());
  wrapper.style.setProperty('--fit-main-spacing-scale', result.mainSpacingScale.toString());
  wrapper.style.setProperty('--fit-sidebar-spacing-scale', result.sidebarSpacingScale.toString());
  wrapper.style.setProperty('--fit-work-expansion-scale', result.workExperienceSpacingScale.toString());
  wrapper.style.setProperty('--fit-line-height', result.lineHeight.toString());
}

/**
 * Main auto-fit function
 */
export function calculateAutoFit(wrapperId: string, showProjects: boolean = true): FitResult | null {
  const wrapper = document.getElementById(wrapperId);
  if (!wrapper) return null;
  
  return findOptimalDensity(wrapper, showProjects);
}

export function applyAutoFit(wrapperId: string, showProjects: boolean = true): FitResult | null {
  const wrapper = document.getElementById(wrapperId);
  if (!wrapper) return null;
  
  const result = findOptimalDensity(wrapper, showProjects);
  applyFitResult(wrapper, result);
  
  console.log(`Auto-fit: density=${result.density.toFixed(2)}, ` +
    `body=${result.bodyScale.toFixed(3)}, mainSpacing=${result.mainSpacingScale.toFixed(3)}, ` +
    `sidebarSpacing=${result.sidebarSpacingScale.toFixed(3)}, ` +
    `workExpansion=${result.workExperienceSpacingScale.toFixed(3)}, ` +
    `height=${result.contentHeight.toFixed(0)}/${result.targetHeight.toFixed(0)}px, ` +
    `status=${result.status}`);
  
  return result;
}

/**
 * Hook version for React components
 */
import { useEffect, useState, useCallback, useRef } from "react";

export function useAutoFit(elementId: string, showProjects: boolean = true) {
  const [fitResult, setFitResult] = useState<FitResult | null>(null);
  const isAdjustingRef = useRef(false);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const isEditingRef = useRef(false);
  
  const runAutoFit = useCallback(() => {
    if (isAdjustingRef.current || isEditingRef.current) return;
    
    const wrapper = document.getElementById(elementId);
    if (!wrapper) return;
    
    isAdjustingRef.current = true;
    
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        const result = findOptimalDensity(wrapper, showProjects);
        applyFitResult(wrapper, result);
        setFitResult(result);
        isAdjustingRef.current = false;
      });
    });
  }, [elementId, showProjects]);
  
  const debouncedAutoFit = useCallback(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    debounceRef.current = setTimeout(() => {
      runAutoFit();
    }, 500);
  }, [runAutoFit]);
  
  const setEditing = useCallback((editing: boolean) => {
    isEditingRef.current = editing;
    if (!editing) {
      // Run auto-fit after editing ends with delay
      setTimeout(() => {
        if (!isEditingRef.current) {
          runAutoFit();
        }
      }, 300);
    }
  }, [runAutoFit]);
  
  // Re-run auto-fit when showProjects changes
  useEffect(() => {
    if (!isEditingRef.current) {
      const timeout = setTimeout(() => {
        runAutoFit();
      }, 300);
      return () => clearTimeout(timeout);
    }
  }, [showProjects, runAutoFit]);

  useEffect(() => {
    const wrapper = document.getElementById(elementId);
    if (!wrapper) return;
    
    // Initialize CSS variables
    wrapper.style.setProperty('--fit-header-scale', '1');
    wrapper.style.setProperty('--fit-content-font-scale', '1');
    wrapper.style.setProperty('--fit-main-spacing-scale', '1');
    wrapper.style.setProperty('--fit-sidebar-spacing-scale', '1');
    wrapper.style.setProperty('--fit-work-expansion-scale', '1');
    wrapper.style.setProperty('--fit-line-height', '1.45');
    
    // Initial fit
    const initialTimeout = setTimeout(runAutoFit, 100);
    
    // Watch for content changes (not during editing)
    const observer = new MutationObserver((mutations) => {
      if (isEditingRef.current) return;
      
      // Skip if mutation is from contentEditable
      const isContentEditableChange = mutations.some(m => {
        const target = m.target;
        if (target.nodeType !== Node.ELEMENT_NODE) return false;
        const el = target as HTMLElement;
        return el.hasAttribute?.('contenteditable') || el.closest?.('[contenteditable]');
      });
      
      if (!isContentEditableChange) {
        debouncedAutoFit();
      }
    });
    
    observer.observe(wrapper, {
      childList: true,
      subtree: true,
      characterData: true,
    });
    
    // Handle resize
    const handleResize = () => debouncedAutoFit();
    window.addEventListener('resize', handleResize);
    
    return () => {
      clearTimeout(initialTimeout);
      if (debounceRef.current) clearTimeout(debounceRef.current);
      observer.disconnect();
      window.removeEventListener('resize', handleResize);
    };
  }, [elementId, runAutoFit, debouncedAutoFit]);
  
  return {
    fitResult,
    runAutoFit,
    setEditing,
    isEditing: () => isEditingRef.current,
  };
}

