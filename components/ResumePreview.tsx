"use client";

import { useResume } from "@/lib/resume-context";
import { useEffect, useState, useRef } from "react";
import { Bold, Italic } from "lucide-react";

export default function ResumePreview() {
  const { resumeData, updatePersonalInfo, updateContact, updateExperience, updateProject, updateExpertise, updateTechStack, reorderContactFields, reorderBullets, reorderSections } = useResume();
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [fitLevel, setFitLevel] = useState(0);
  const [contentFontScale, setContentFontScale] = useState(1.0);
  const [sidebarWidth, setSidebarWidth] = useState(220);
  const isEditingRef = useRef(false);
  
  // Drag state for contact fields
  const [draggedContactIndex, setDraggedContactIndex] = useState<number | null>(null);
  const [dragOverContactIndex, setDragOverContactIndex] = useState<number | null>(null);
  
  // Drag state for bullets in preview
  const [draggedPreviewBullet, setDraggedPreviewBullet] = useState<{expId: string, index: number} | null>(null);
  const [dragOverPreviewBullet, setDragOverPreviewBullet] = useState<{expId: string, index: number} | null>(null);
  
  // Drag state for sections
  const [draggedSectionIndex, setDraggedSectionIndex] = useState<number | null>(null);
  const [dragOverSectionIndex, setDragOverSectionIndex] = useState<number | null>(null);

  // Initialize CSS variables immediately after component mounts
  useEffect(() => {
    const initVariables = () => {
      const wrapper = wrapperRef.current;
      if (wrapper) {
        wrapper.style.setProperty("--fit-font-scale", "1");
        wrapper.style.setProperty("--fit-content-font-scale", "1");
        wrapper.style.setProperty("--fit-spacing-scale", "1");
        wrapper.style.setProperty("--fit-line-height", "1.5");
        wrapper.style.setProperty("--fit-sidebar-width", `${sidebarWidth}px`);
      }
    };
    
    // Try immediately, then again after a short delay to ensure DOM is ready
    initVariables();
    const timeout = setTimeout(initVariables, 0);
    
    return () => clearTimeout(timeout);
  }, [sidebarWidth]);

  useEffect(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;

    let isAdjusting = false; // Prevent infinite loops

    const applyFitLevel = (level: number, contentFontScale?: number, spacingScale?: number) => {
      // Get current sidebar width from wrapper (always use the CSS variable, not state)
      const currentSidebarWidth = parseFloat(wrapper.style.getPropertyValue('--fit-sidebar-width')) || 220;
      // If contentFontScale is provided, use it directly (for dynamic scaling)
      if (contentFontScale !== undefined) {
        wrapper.style.setProperty("--fit-content-font-scale", contentFontScale.toString());
        setContentFontScale(contentFontScale); // Update state for display
        // Use provided spacing scale or default to 1
        wrapper.style.setProperty("--fit-spacing-scale", (spacingScale ?? 1).toString());
        wrapper.style.setProperty("--fit-line-height", "1.5");
        // Preserve current sidebar width instead of resetting
        wrapper.style.setProperty("--fit-sidebar-width", `${currentSidebarWidth}px`);
        return;
      }
      
      // Otherwise use predefined levels
      switch (level) {
        case -2: // Expanded to fill page
          wrapper.style.setProperty("--fit-content-font-scale", "1.05");
          setContentFontScale(1.05);
          wrapper.style.setProperty("--fit-spacing-scale", "1.1");
          wrapper.style.setProperty("--fit-line-height", "1.5");
          wrapper.style.setProperty("--fit-sidebar-width", `${currentSidebarWidth}px`);
          break;
        case -1: // Slightly expanded
          wrapper.style.setProperty("--fit-content-font-scale", "1.02");
          setContentFontScale(1.02);
          wrapper.style.setProperty("--fit-spacing-scale", "1.05");
          wrapper.style.setProperty("--fit-line-height", "1.5");
          wrapper.style.setProperty("--fit-sidebar-width", `${currentSidebarWidth}px`);
          break;
        case 0:
          wrapper.style.setProperty("--fit-content-font-scale", "1");
          setContentFontScale(1.0);
          wrapper.style.setProperty("--fit-spacing-scale", "1");
          wrapper.style.setProperty("--fit-line-height", "1.5");
          wrapper.style.setProperty("--fit-sidebar-width", `${currentSidebarWidth}px`);
          break;
        case 1:
          wrapper.style.setProperty("--fit-content-font-scale", "0.98");
          setContentFontScale(0.98);
          wrapper.style.setProperty("--fit-spacing-scale", "0.9");
          wrapper.style.setProperty("--fit-line-height", "1");
          wrapper.style.setProperty("--fit-sidebar-width", `${currentSidebarWidth}px`);
          break;
        case 2:
          wrapper.style.setProperty("--fit-content-font-scale", "0.96");
          setContentFontScale(0.96);
          wrapper.style.setProperty("--fit-spacing-scale", "0.82");
          wrapper.style.setProperty("--fit-line-height", "1");
          wrapper.style.setProperty("--fit-sidebar-width", `${currentSidebarWidth}px`);
          break;
        case 3:
          wrapper.style.setProperty("--fit-content-font-scale", "0.93");
          setContentFontScale(0.93);
          wrapper.style.setProperty("--fit-spacing-scale", "0.75");
          wrapper.style.setProperty("--fit-line-height", "1");
          wrapper.style.setProperty("--fit-sidebar-width", `${currentSidebarWidth}px`);
          break;
        case 4:
          wrapper.style.setProperty("--fit-content-font-scale", "0.90");
          setContentFontScale(0.90);
          wrapper.style.setProperty("--fit-spacing-scale", "0.7");
          wrapper.style.setProperty("--fit-line-height", "1");
          wrapper.style.setProperty("--fit-sidebar-width", `${currentSidebarWidth}px`);
          break;
        case 5:
          wrapper.style.setProperty("--fit-content-font-scale", "0.87");
          setContentFontScale(0.87);
          wrapper.style.setProperty("--fit-spacing-scale", "0.65");
          wrapper.style.setProperty("--fit-line-height", "1");
          wrapper.style.setProperty("--fit-sidebar-width", `${currentSidebarWidth}px`);
          break;
      }
    };

    const adjustToFit = () => {
      if (isAdjusting || !wrapperRef.current) return;
      
      // Don't adjust if user is currently editing
      if (isEditingRef.current) return;
      
      const activeElement = document.activeElement;
      if (activeElement && activeElement.hasAttribute('contenteditable')) return;
      
      isAdjusting = true;

      try {
        const A4_HEIGHT_PX = (297 * 96) / 25.4; // ~1122.52px
        const wrapper = wrapperRef.current;

        // Function to measure content height
        const measureHeight = () => {
          // Save original styles
          const origOverflow = wrapper.style.overflow;
          const origHeight = wrapper.style.height;
          
          // Allow content to expand naturally
          wrapper.style.overflow = 'visible';
          wrapper.style.height = 'auto';
          
          // Force reflow
          void wrapper.offsetHeight;
          
          // Measure both the main area and sidebar, take the max
          const mainEl = wrapper.querySelector('main');
          const asideEl = wrapper.querySelector('aside');
          
          let maxHeight = wrapper.scrollHeight;
          if (mainEl) {
            const mainRect = mainEl.getBoundingClientRect();
            const mainStyles = getComputedStyle(mainEl);
            const mainHeight = mainRect.height + parseFloat(mainStyles.paddingTop) + parseFloat(mainStyles.paddingBottom);
            maxHeight = Math.max(maxHeight, mainHeight);
          }
          if (asideEl) {
            const asideRect = asideEl.getBoundingClientRect();
            maxHeight = Math.max(maxHeight, asideRect.height);
          }
          
          // Restore
          wrapper.style.overflow = origOverflow;
          wrapper.style.height = origHeight;
          
          return maxHeight;
        };

        // Wait for DOM to be ready
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            if (!wrapperRef.current) {
              isAdjusting = false;
              return;
            }

            // Reset to base scale first
            wrapper.style.setProperty('--fit-content-font-scale', '1');
            wrapper.style.setProperty('--fit-spacing-scale', '1');
            void wrapper.offsetHeight;
            
            setTimeout(() => {
              if (!wrapperRef.current) {
                isAdjusting = false;
                return;
              }

              // Measure at base scale
              let currentHeight = measureHeight();
              
              let fontScale = 1.0;
              let spacingScale = 1.0;
              
              // If content fits, we're done
              if (currentHeight <= A4_HEIGHT_PX) {
                applyFitLevel(0, fontScale, spacingScale);
                isAdjusting = false;
                return;
              }
              
              // Step 1: Reduce font scale until min 0.85
              while (currentHeight > A4_HEIGHT_PX && fontScale > 0.85) {
                fontScale -= 0.01;
                wrapper.style.setProperty('--fit-content-font-scale', fontScale.toString());
                void wrapper.offsetHeight;
                currentHeight = measureHeight();
              }
              
              // Step 2: If still overflowing, reduce spacing scale until min 0.5
              while (currentHeight > A4_HEIGHT_PX && spacingScale > 0.5) {
                spacingScale -= 0.02;
                wrapper.style.setProperty('--fit-spacing-scale', spacingScale.toString());
                void wrapper.offsetHeight;
                currentHeight = measureHeight();
              }
              
              // Apply final values
              applyFitLevel(0, fontScale, spacingScale);
              setFitLevel(0);
              
              isAdjusting = false;
            }, 100);
          });
        });
      } catch (error) {
        console.error("Error in adjustToFit:", error);
        isAdjusting = false;
      }
    };

    // Initial adjustment
    const timeoutId = setTimeout(() => {
      if (!isEditingRef.current) {
        adjustToFit();
      }
    }, 500);
    
    // Expose adjustToFit for manual calls
    (window as any).adjustToFit = adjustToFit;

    // Watch for content changes - but NOT attribute changes (to avoid infinite loops)
    let debounceTimer: NodeJS.Timeout;
    let observer: MutationObserver | null = null;
    
    const createObserver = () => {
      if (observer) {
        observer.disconnect();
        observer = null;
      }
      
      if (isEditingRef.current) {
        return; // Don't create observer if editing
      }
      
      observer = new MutationObserver((mutations) => {
        // Completely skip if editing
        if (isEditingRef.current) {
          return;
        }
        
        // Skip mutations from contentEditable editing (to prevent jumping)
        const isContentEditableChange = mutations.some(mutation => {
          const target = mutation.target as HTMLElement;
          return target.hasAttribute('contenteditable') || 
                 target.closest('[contenteditable]') !== null;
        });
        
        if (isContentEditableChange) {
          return; // Skip auto-fit during editing
        }
        
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
          if (!isEditingRef.current && wrapperRef.current) {
            adjustToFit();
          }
        }, 2000);
      });

      if (wrapper && !isEditingRef.current) {
        observer.observe(wrapper, {
          childList: true,
          subtree: true,
          characterData: true,
          // attributes: true, // REMOVED - this was causing infinite loops
        });
      }
    };
    
    createObserver();
    
    // Handle focus/blur on contentEditable elements
    const handleFocus = () => {
      isEditingRef.current = true;
      if (observer) {
        observer.disconnect();
        observer = null;
      }
    };
    
    const handleBlur = () => {
      isEditingRef.current = false;
      setTimeout(() => {
        if (!isEditingRef.current) {
          createObserver();
        }
      }, 1000);
    };
    
    // Add event listeners to all contentEditable elements
    const contentEditables = wrapper?.querySelectorAll('[contenteditable]');
    contentEditables?.forEach(el => {
      el.addEventListener('focus', handleFocus);
      el.addEventListener('blur', handleBlur);
    });

    const handleResize = () => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        adjustToFit();
      }, 200);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      clearTimeout(timeoutId);
      clearTimeout(debounceTimer);
      if (observer) {
        observer.disconnect();
      }
      const contentEditables = wrapper?.querySelectorAll('[contenteditable]');
      contentEditables?.forEach(el => {
        el.removeEventListener('focus', handleFocus);
        el.removeEventListener('blur', handleBlur);
      });
      window.removeEventListener("resize", handleResize);
    };
  }, [resumeData, sidebarWidth]);

  const [editingElement, setEditingElement] = useState<HTMLElement | null>(null);
  const [showFormatToolbar, setShowFormatToolbar] = useState(false);
  const [toolbarPosition, setToolbarPosition] = useState({ top: 0, left: 0 });
  const toolbarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let selectionTimeout: NodeJS.Timeout;
    
    const handleSelectionChange = () => {
      clearTimeout(selectionTimeout);
      selectionTimeout = setTimeout(() => {
        const selection = window.getSelection();
        if (selection && selection.rangeCount > 0 && !selection.isCollapsed) {
          const range = selection.getRangeAt(0);
          const container = range.commonAncestorContainer;
          const element = container.nodeType === Node.TEXT_NODE 
            ? container.parentElement 
            : container as HTMLElement;
          
          // Check if selection is within a contentEditable element
          const contentEditableElement = element?.closest('[contenteditable]') as HTMLElement;
          
          if (contentEditableElement && contentEditableElement.hasAttribute('contenteditable')) {
            setEditingElement(contentEditableElement);
            const rect = range.getBoundingClientRect();
            setToolbarPosition({
              top: rect.top - 45,
              left: rect.left + (rect.width / 2) - 40
            });
            setShowFormatToolbar(true);
          } else {
            setShowFormatToolbar(false);
          }
        } else {
          setShowFormatToolbar(false);
        }
      }, 150);
    };

    const handleMouseUp = () => {
      setTimeout(() => {
        const selection = window.getSelection();
        if (!selection || selection.isCollapsed) {
          setShowFormatToolbar(false);
        } else {
          handleSelectionChange();
        }
      }, 10);
    };

    document.addEventListener('selectionchange', handleSelectionChange);
    document.addEventListener('mouseup', handleMouseUp);
    return () => {
      clearTimeout(selectionTimeout);
      document.removeEventListener('selectionchange', handleSelectionChange);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  const handleFormat = (command: string) => {
    document.execCommand(command, false);
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      setToolbarPosition({
        top: rect.top - 45,
        left: rect.left + (rect.width / 2) - 40
      });
    }
  };

  const isFormatActive = (command: string) => {
    try {
      return document.queryCommandState(command);
    } catch {
      return false;
    }
  };

  return (
    <>
      {showFormatToolbar && (
        <div
          ref={toolbarRef}
          className="fixed z-[1000] bg-white border border-gray-300 rounded-lg shadow-lg p-1 flex gap-1"
          style={{
            top: `${toolbarPosition.top}px`,
            left: `${toolbarPosition.left}px`,
            transform: 'translateX(-50%)'
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            type="button"
            onClick={() => handleFormat('bold')}
            className={`p-2 rounded hover:bg-gray-100 transition-colors ${
              isFormatActive('bold') ? 'bg-blue-100 text-blue-700' : 'text-gray-700'
            }`}
            title="Bold (Ctrl+B)"
          >
            <Bold className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => handleFormat('italic')}
            className={`p-2 rounded hover:bg-gray-100 transition-colors ${
              isFormatActive('italic') ? 'bg-blue-100 text-blue-700' : 'text-gray-700'
            }`}
            title="Italic (Ctrl+I)"
          >
            <Italic className="w-4 h-4" />
          </button>
        </div>
      )}
      <div 
        id="resume-preview" 
        ref={wrapperRef} 
        className="resume-wrapper"
        style={{ 
          userSelect: 'text', 
          WebkitUserSelect: 'text',
          MozUserSelect: 'text',
          msUserSelect: 'text'
        }}
        onMouseDown={(e) => {
          // Don't prevent default - allow normal text selection
          const target = e.target as HTMLElement;
          // If clicking on the resizer, let it handle the event and don't interfere
          if (target.classList.contains('sidebar-resizer') || target.closest('.sidebar-resizer')) {
            e.stopPropagation();
            return;
          }
          // If clicking on contentEditable, allow selection before focus
          if (target.hasAttribute('contenteditable') || target.closest('[contenteditable]')) {
            // Let the browser handle selection naturally
            return;
          }
        }}
      >
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Manrope:wght@400;700;800&display=swap');
        
        :root {
          --bg-sidebar: #fafafa;
          --bg-main: #ffffff;
          --text-primary: #111111;
          --text-secondary: #444444;
          --accent-color: #000000;
          --border-color: #e0e0e0;
          --sidebar-width: var(--fit-sidebar-width, 220px);
          --page-padding: 45px;
          --fit-font-scale: 1;
          --fit-content-font-scale: 1;
          --fit-spacing-scale: 1;
          --fit-line-height: 1.5;
          --fit-sidebar-width: 220px;
        }

        .resume-wrapper {
          display: grid;
          grid-template-columns: var(--sidebar-width) 1fr;
          width: 210mm;
          height: 297mm;
          margin: 0 auto;
          background: var(--bg-main);
          font-family: 'Inter', sans-serif;
          color: var(--text-primary);
          background: #fff;
          font-size: calc(14px * var(--fit-content-font-scale));
          line-height: var(--fit-line-height);
          -webkit-print-color-adjust: exact;
          overflow: hidden;
          position: relative;
          user-select: text !important;
          -webkit-user-select: text !important;
          -moz-user-select: text !important;
          -ms-user-select: text !important;
        }

        .resume-wrapper * {
          user-select: text !important;
          -webkit-user-select: text !important;
          -moz-user-select: text !important;
          -ms-user-select: text !important;
        }

        aside {
          background-color: var(--bg-sidebar);
          padding: calc(var(--page-padding) * var(--fit-spacing-scale)) calc(24px * var(--fit-spacing-scale));
          border-right: 1px solid var(--border-color);
          overflow: visible;
          height: 100%;
          display: flex;
          flex-direction: column;
          position: relative;
        }

        .sidebar-group {
          margin-bottom: calc(40px * var(--fit-spacing-scale));
          flex-shrink: 0;
        }

        .sidebar-group:last-child {
          margin-bottom: 0;
        }

        .sidebar-spacer {
          flex-grow: 1;
          flex-shrink: 1;
          min-height: 0;
        }

        .sidebar-title {
          font-family: 'Manrope', sans-serif;
          font-size: calc(13px * var(--fit-content-font-scale));
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: calc(1.2px * var(--fit-content-font-scale));
          color: var(--text-primary);
          margin-bottom: calc(15px * var(--fit-spacing-scale));
          display: block;
          border-bottom: calc(2px * var(--fit-content-font-scale)) solid #ddd;
          padding-bottom: calc(5px * var(--fit-spacing-scale));
        }

        .contact-item {
          margin-bottom: calc(12px * var(--fit-spacing-scale));
          cursor: move;
          transition: background-color 0.2s, opacity 0.2s;
          border-radius: 3px;
        }

        .contact-item:hover {
          background-color: rgba(59, 130, 246, 0.05);
        }

        .contact-item.contact-dragging {
          opacity: 0.4;
        }

        .contact-item.contact-drag-over {
          background-color: rgba(59, 130, 246, 0.15);
          outline: 2px dashed rgba(59, 130, 246, 0.5);
          outline-offset: 2px;
        }

        .contact-label {
          display: block;
          font-size: calc(10px * var(--fit-content-font-scale));
          font-weight: 700;
          color: #666;
          text-transform: uppercase;
          margin-bottom: calc(2px * var(--fit-spacing-scale));
        }

        .contact-value {
          font-weight: 500;
          font-size: calc(13px * var(--fit-content-font-scale));
          color: var(--text-primary);
          display: block;
          white-space: nowrap;
        }

        .contact-value a {
          color: inherit;
          text-decoration: none;
          white-space: nowrap;
        }

        .contact-value span {
          white-space: nowrap;
        }

        .contact-value a:hover {
          text-decoration: underline;
        }

        ul.skill-list {
          list-style: none;
          padding: 0;
          margin: 0;
        }

        ul.skill-list li {
          margin-bottom: calc(8px * var(--fit-spacing-scale));
          color: var(--text-secondary);
          font-weight: 500;
          font-size: calc(13px * var(--fit-content-font-scale));
        }

        main {
          padding: calc(var(--page-padding) * var(--fit-spacing-scale)) calc(45px * var(--fit-spacing-scale));
          overflow: visible;
          user-select: text;
          -webkit-user-select: text;
        }

        header {
          margin-bottom: calc(35px * var(--fit-spacing-scale));
          margin-top: calc(-8px * var(--fit-spacing-scale));
        }

        header .summary {
          margin-top: calc(18px * var(--fit-spacing-scale));
        }

        h1 {
          font-family: 'Manrope', sans-serif;
          font-size: 38px;
          font-weight: 800;
          letter-spacing: -0.5px;
          color: #333333;
          line-height: 1;
          margin-bottom: calc(12px * var(--fit-spacing-scale));
        }

        #resume-preview,
        #resume-preview * {
          user-select: text !important;
          -webkit-user-select: text !important;
          -moz-user-select: text !important;
          -ms-user-select: text !important;
        }

        h1[contenteditable],
        .summary[contenteditable],
        .company-name[contenteditable],
        .job-title-text[contenteditable],
        .job-bullets li[contenteditable],
        .project-title[contenteditable],
        .project-description[contenteditable],
        .contact-value[contenteditable],
        .skill-list li[contenteditable],
        h1[contenteditable] *,
        .summary[contenteditable] *,
        .company-name[contenteditable] *,
        .job-title-text[contenteditable] *,
        .job-bullets li[contenteditable] *,
        .project-title[contenteditable] *,
        .project-description[contenteditable] *,
        .contact-value[contenteditable] *,
        .skill-list li[contenteditable] * {
          user-select: text !important;
          -webkit-user-select: text !important;
          -moz-user-select: text !important;
          -ms-user-select: text !important;
          cursor: text !important;
          pointer-events: auto !important;
        }

        h1[contenteditable]:hover,
        .summary[contenteditable]:hover,
        .company-name[contenteditable]:hover,
        .job-title-text[contenteditable]:hover,
        .job-bullets li[contenteditable]:hover,
        .project-title[contenteditable]:hover,
        .project-description[contenteditable]:hover,
        .contact-value[contenteditable]:hover,
        .skill-list li[contenteditable]:hover {
          background-color: rgba(59, 130, 246, 0.05);
          border-radius: 2px;
          cursor: text;
        }

        h1[contenteditable]:focus,
        .summary[contenteditable]:focus,
        .company-name[contenteditable]:focus,
        .job-title-text[contenteditable]:focus,
        .job-bullets li[contenteditable]:focus,
        .project-title[contenteditable]:focus,
        .project-description[contenteditable]:focus,
        .contact-value[contenteditable]:focus,
        .skill-list li[contenteditable]:focus {
          background-color: rgba(59, 130, 246, 0.1);
          outline: 1px dashed rgba(59, 130, 246, 0.5);
        }

        [contenteditable] strong,
        [contenteditable] b {
          font-weight: 700;
        }

        [contenteditable] em,
        [contenteditable] i {
          font-style: italic;
        }

        .main-role {
          display: none;
        }

        .summary {
          color: var(--text-secondary);
          font-weight: 400;
          font-size: calc(14px * var(--fit-content-font-scale));
          max-width: 95%;
          line-height: 1.35;
          text-align: left;
          margin-top: calc(16px * var(--fit-spacing-scale));
          margin-bottom: 0;
        }

        .resume-section {
          transition: background-color 0.2s, opacity 0.2s;
          cursor: move;
          border-radius: 4px;
          position: relative;
        }

        .resume-section:hover {
          background-color: rgba(59, 130, 246, 0.02);
        }

        .resume-section.section-dragging {
          opacity: 0.4;
        }

        .resume-section.section-drag-over {
          background-color: rgba(59, 130, 246, 0.1);
          outline: 2px dashed rgba(59, 130, 246, 0.5);
          outline-offset: 4px;
        }

        .resume-section:first-of-type h2.section-header {
          margin-top: 0;
        }

        h2.section-header {
          font-family: 'Manrope', sans-serif;
          font-size: calc(14px * var(--fit-content-font-scale));
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: calc(1.5px * var(--fit-content-font-scale));
          color: var(--text-primary);
          padding-bottom: calc(4px * var(--fit-spacing-scale));
          margin-top: calc(35px * var(--fit-spacing-scale));
          margin-bottom: calc(12px * var(--fit-spacing-scale));
        }

        .job-card {
          margin-bottom: calc(20px * var(--fit-spacing-scale));
        }

        .job-top-row {
          display: block;
          margin-bottom: 6px;
        }

        .job-info {
          width: 100%;
        }

        .company-name {
          font-weight: 800;
          font-size: calc(16px * var(--fit-content-font-scale));
          color: #000000;
          display: block;
          margin-bottom: calc(6px * var(--fit-spacing-scale));
          letter-spacing: calc(-0.2px * var(--fit-content-font-scale));
        }

        .job-title-text {
          font-family: 'Inter', sans-serif;
          font-weight: 600;
          font-style: normal;
          color: #222222;
          display: block;
          font-size: calc(14px * var(--fit-content-font-scale));
          margin-bottom: calc(6px * var(--fit-spacing-scale));
        }

        .job-date {
          font-size: calc(12px * var(--fit-content-font-scale));
          font-weight: 600;
          color: #444444;
          text-align: right;
          white-space: nowrap;
          padding-top: calc(2px * var(--fit-spacing-scale));
          min-width: calc(120px * var(--fit-content-font-scale));
        }

        .role-entry {
          margin-bottom: calc(16px * var(--fit-spacing-scale));
        }

        .role-entry:last-child {
          margin-bottom: 0;
        }

        .role-header {
          display: flex;
          justify-content: space-between;
          align-items: baseline;
          margin-bottom: calc(8px * var(--fit-spacing-scale));
        }

        .role-header .job-title-text {
          margin-bottom: 0;
          line-height: 1.2;
        }

        .role-header .job-date {
          padding-top: 0;
          min-width: auto;
          line-height: 1.2;
          display: inline-block;
        }

        ul.job-bullets {
          padding-left: 0;
          list-style: none;
          margin: 0;
        }

        ul.job-bullets li {
          position: relative;
          padding-left: calc(18px * var(--fit-content-font-scale));
          margin-bottom: calc(10px * var(--fit-spacing-scale));
          color: #333333;
          line-height: 1.4;
          word-wrap: break-word;
          overflow-wrap: break-word;
          font-weight: 400;
          user-select: text !important;
          -webkit-user-select: text !important;
          -moz-user-select: text !important;
          -ms-user-select: text !important;
          transition: background-color 0.2s, opacity 0.2s;
          border-radius: 3px;
        }

        ul.job-bullets li.bullet-draggable {
          cursor: move;
        }

        ul.job-bullets li.bullet-draggable:hover {
          background-color: rgba(59, 130, 246, 0.03);
        }

        ul.job-bullets li.bullet-dragging {
          opacity: 0.4;
        }

        ul.job-bullets li.bullet-drag-over {
          background-color: rgba(59, 130, 246, 0.1);
          outline: 2px dashed rgba(59, 130, 246, 0.5);
          outline-offset: 2px;
        }

        ul.job-bullets li::before {
          content: "▪";
          position: absolute;
          left: 0;
          top: calc(2px * var(--fit-content-font-scale));
          color: #000000;
          font-size: calc(12px * var(--fit-content-font-scale));
          font-weight: 700;
          pointer-events: none;
          user-select: none;
          -webkit-user-select: none;
        }

        .project-card {
          margin-bottom: calc(16px * var(--fit-spacing-scale));
        }

        .project-title {
          font-weight: 700;
          font-size: calc(14px * var(--fit-content-font-scale));
          color: var(--text-primary);
          margin-bottom: calc(6px * var(--fit-spacing-scale));
          display: block;
        }

        .project-description {
          position: relative;
          padding-left: calc(18px * var(--fit-content-font-scale));
          color: var(--text-secondary);
          line-height: 1.4;
          margin-bottom: calc(10px * var(--fit-spacing-scale));
        }

        .project-description::before {
          content: "▪";
          position: absolute;
          left: 0;
          top: calc(1px * var(--fit-content-font-scale));
          color: #111;
          font-size: calc(14px * var(--fit-content-font-scale));
        }

        @media print {
          @page {
            size: A4;
            margin: 0;
          }
          body {
            margin: 0;
            background: #fff;
          }
          .resume-wrapper {
            box-shadow: none;
            margin: 0;
            width: 210mm;
            height: 297mm;
            max-height: 297mm;
            max-width: 210mm;
            overflow: hidden;
            page-break-after: always;
            page-break-inside: avoid;
          }
          aside {
            -webkit-print-color-adjust: exact;
            background-color: #fafafa !important;
          }
          a {
            text-decoration: none;
            color: #111;
          }
        }
      `}</style>

      <aside>
        <div className="sidebar-group">
          <span className="sidebar-title">Contact</span>
          {resumeData.contactOrder.map((field, idx) => {
            const value = resumeData.contact[field];
            const isDragging = draggedContactIndex === idx;
            const isDragOver = dragOverContactIndex === idx;
            
            return (
              <div
                key={field}
                className={`contact-item ${isDragging ? 'contact-dragging' : ''} ${isDragOver ? 'contact-drag-over' : ''}`}
                draggable={true}
                onDragStart={(e) => {
                  setDraggedContactIndex(idx);
                  e.dataTransfer.effectAllowed = "move";
                  e.dataTransfer.setData("text/html", "");
                }}
                onDragOver={(e) => {
                  e.preventDefault();
                  e.dataTransfer.dropEffect = "move";
                  if (draggedContactIndex !== idx) {
                    setDragOverContactIndex(idx);
                  }
                }}
                onDragLeave={() => {
                  setDragOverContactIndex(null);
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  if (draggedContactIndex !== null && draggedContactIndex !== idx) {
                    reorderContactFields(draggedContactIndex, idx);
                  }
                  setDraggedContactIndex(null);
                  setDragOverContactIndex(null);
                }}
                onDragEnd={() => {
                  setDraggedContactIndex(null);
                  setDragOverContactIndex(null);
                }}
              >
                {field === 'email' && value ? (
                  <div className="contact-value">
                    <a 
                      href={`mailto:${value}`} 
                      contentEditable
                      spellCheck={true}
                      suppressContentEditableWarning
                      onBlur={(e) => updateContact({ [field]: e.currentTarget.textContent || "" })}
                      onClick={(e) => {
                        // Allow link click when not editing
                        if (document.activeElement !== e.currentTarget) {
                          return;
                        }
                        e.preventDefault();
                      }}
                      style={{ outline: "none" }}
                    >
                      {value}
                    </a>
                  </div>
                ) : field === 'linkedin' && value ? (
                  <div className="contact-value">
                    <a 
                      href={`https://linkedin.com/in${value.startsWith('/') ? '' : '/'}${value}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      contentEditable
                      spellCheck={true}
                      suppressContentEditableWarning
                      onBlur={(e) => updateContact({ [field]: e.currentTarget.textContent || "" })}
                      onClick={(e) => {
                        // Allow link click when not editing
                        if (document.activeElement !== e.currentTarget) {
                          return;
                        }
                        e.preventDefault();
                      }}
                      style={{ outline: "none" }}
                    >
                      {value}
                    </a>
                  </div>
                ) : (
                  <div className="contact-value">
                    <span
                      contentEditable
                      spellCheck={true}
                      suppressContentEditableWarning
                      onBlur={(e) => updateContact({ [field]: e.currentTarget.textContent || "" })}
                      style={{ outline: "none" }}
                    >
                      {value}
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="sidebar-group">
          <span className="sidebar-title">{resumeData.sectionTitles?.expertise || "Expertise"}</span>
          <ul className="skill-list">
            {resumeData.expertise.map((skill, idx) => (
              <li
                key={idx}
                contentEditable
                spellCheck={true}
                suppressContentEditableWarning
                onBlur={(e) => {
                  const newExpertise = [...resumeData.expertise];
                  newExpertise[idx] = e.currentTarget.textContent || "";
                  updateExpertise(newExpertise);
                }}
                style={{ outline: "none" }}
              >
                {skill}
              </li>
            ))}
          </ul>
        </div>

        <div className="sidebar-group">
          <span className="sidebar-title">{resumeData.sectionTitles?.techStack || "Tech Stack"}</span>
          <ul className="skill-list">
            {resumeData.techStack.map((tech, idx) => (
              <li
                key={idx}
                contentEditable
                spellCheck={true}
                suppressContentEditableWarning
                onBlur={(e) => {
                  const newTechStack = [...resumeData.techStack];
                  newTechStack[idx] = e.currentTarget.textContent || "";
                  updateTechStack(newTechStack);
                }}
                style={{ outline: "none" }}
              >
                {tech}
              </li>
            ))}
          </ul>
        </div>

        {resumeData.education.length > 0 && (
          <div className="sidebar-group">
            <span className="sidebar-title">Education</span>
            {resumeData.education.map((edu) => (
              <div key={edu.id} className="contact-item">
                <span className="contact-value" style={{ fontWeight: 700, color: "var(--text-primary)" }}>
                  {edu.degree}
                </span>
                <br />
                <span className="contact-value" style={{ fontWeight: 400, color: "var(--text-secondary)" }}>
                  {edu.institution}
                </span>
                <div style={{ fontSize: "11px", color: "#888", marginTop: "2px" }}>
                  {edu.startDate} - {edu.endDate}
                </div>
              </div>
            ))}
          </div>
        )}
        <div className="sidebar-spacer"></div>
      </aside>

      <main>
        <header>
          <h1
            contentEditable
            spellCheck={true}
            suppressContentEditableWarning
            onFocus={() => { isEditingRef.current = true; }}
            onBlur={(e) => {
              isEditingRef.current = false;
              updatePersonalInfo({ name: e.currentTarget.innerHTML || "" });
              setTimeout(() => {
                if ((window as any).adjustToFit) {
                  (window as any).adjustToFit();
                }
              }, 300);
            }}
            onKeyDown={(e) => {
              if ((e.ctrlKey || e.metaKey) && (e.key === 'b' || e.key === 'B')) {
                e.preventDefault();
                document.execCommand('bold', false);
              }
              if ((e.ctrlKey || e.metaKey) && (e.key === 'i' || e.key === 'I')) {
                e.preventDefault();
                document.execCommand('italic', false);
              }
            }}
            style={{ outline: "none", userSelect: "text", WebkitUserSelect: "text", cursor: "text" }}
            dangerouslySetInnerHTML={{ __html: resumeData.personalInfo.name }}
          />
          <div className="main-role">{resumeData.personalInfo.role}</div>
          <p
            className="summary"
            contentEditable
            spellCheck={true}
            suppressContentEditableWarning
            onFocus={() => { isEditingRef.current = true; }}
            onBlur={(e) => {
              isEditingRef.current = false;
              updatePersonalInfo({ summary: e.currentTarget.innerHTML || "" });
              setTimeout(() => {
                if ((window as any).adjustToFit) {
                  (window as any).adjustToFit();
                }
              }, 500);
            }}
            onKeyDown={(e) => {
              if ((e.ctrlKey || e.metaKey) && (e.key === 'b' || e.key === 'B')) {
                e.preventDefault();
                document.execCommand('bold', false);
              }
              if ((e.ctrlKey || e.metaKey) && (e.key === 'i' || e.key === 'I')) {
                e.preventDefault();
                document.execCommand('italic', false);
              }
            }}
            style={{ outline: "none" }}
            dangerouslySetInnerHTML={{ __html: resumeData.personalInfo.summary }}
          />
        </header>

        {resumeData.sectionOrder.map((sectionType, sectionIdx) => {
          const isDraggingSection = draggedSectionIndex === sectionIdx;
          const isDragOverSection = dragOverSectionIndex === sectionIdx;
          
          if (sectionType === 'experience' && resumeData.experience.length > 0) {
            return (
              <div
                key="experience-section"
                className={`resume-section ${isDraggingSection ? 'section-dragging' : ''} ${isDragOverSection ? 'section-drag-over' : ''}`}
                draggable={true}
                onDragStart={(e) => {
                  setDraggedSectionIndex(sectionIdx);
                  e.dataTransfer.effectAllowed = "move";
                  e.dataTransfer.setData("text/html", "");
                }}
                onDragOver={(e) => {
                  e.preventDefault();
                  e.dataTransfer.dropEffect = "move";
                  if (draggedSectionIndex !== sectionIdx) {
                    setDragOverSectionIndex(sectionIdx);
                  }
                }}
                onDragLeave={() => {
                  setDragOverSectionIndex(null);
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  if (draggedSectionIndex !== null && draggedSectionIndex !== sectionIdx) {
                    reorderSections(draggedSectionIndex, sectionIdx);
                  }
                  setDraggedSectionIndex(null);
                  setDragOverSectionIndex(null);
                }}
                onDragEnd={() => {
                  setDraggedSectionIndex(null);
                  setDragOverSectionIndex(null);
                }}
              >
                <h2 className="section-header">{resumeData.sectionTitles?.experience ?? "Professional Experience"}</h2>
                {(() => {
                  // Group experiences by company
                  const groupedByCompany = resumeData.experience.reduce((acc, job) => {
                    const company = job.company.trim();
                    if (!acc[company]) {
                      acc[company] = [];
                    }
                    acc[company].push(job);
                    return acc;
                  }, {} as Record<string, typeof resumeData.experience>);

                  return Object.entries(groupedByCompany).map(([company, jobs]) => (
                <div key={company} className="job-card">
                  <div className="job-top-row">
                    <div className="job-info">
                      <span
                        className="company-name"
                        contentEditable
                        spellCheck={true}
                        suppressContentEditableWarning
                        onFocus={() => { isEditingRef.current = true; }}
                        onBlur={(e) => {
                          isEditingRef.current = false;
                          const newCompany = e.currentTarget.innerHTML || "";
                          jobs.forEach((job) => {
                            updateExperience(job.id, { company: newCompany });
                          });
                          setTimeout(() => {
                            if ((window as any).adjustToFit) {
                              (window as any).adjustToFit();
                            }
                          }, 500);
                        }}
                        onKeyDown={(e) => {
                          if ((e.ctrlKey || e.metaKey) && (e.key === 'b' || e.key === 'B')) {
                            e.preventDefault();
                            document.execCommand('bold', false);
                          }
                          if ((e.ctrlKey || e.metaKey) && (e.key === 'i' || e.key === 'I')) {
                            e.preventDefault();
                            document.execCommand('italic', false);
                          }
                        }}
                        style={{ outline: "none", userSelect: "text", WebkitUserSelect: "text", cursor: "text" }}
                        dangerouslySetInnerHTML={{ __html: company }}
                      />
                      {jobs.map((job) => (
                        <div key={job.id} className="role-entry">
                          <div className="role-header">
                            <span
                              className="job-title-text"
                              contentEditable
                              suppressContentEditableWarning
                              onBlur={(e) => updateExperience(job.id, { title: e.currentTarget.textContent || "" })}
                              style={{ outline: "none" }}
                            >
                              {job.title}
                            </span>
                            <span className="job-date">{job.startDate} – {job.endDate}</span>
                          </div>
                          <ul className="job-bullets">
                            {job.bullets.map((bullet, idx) => {
                              const isDragging = draggedPreviewBullet?.expId === job.id && draggedPreviewBullet?.index === idx;
                              const isDragOver = dragOverPreviewBullet?.expId === job.id && dragOverPreviewBullet?.index === idx;
                              
                              return (
                                <li
                                  key={idx}
                                  className={`bullet-draggable ${isDragging ? 'bullet-dragging' : ''} ${isDragOver ? 'bullet-drag-over' : ''}`}
                                  draggable={true}
                                  contentEditable
                                  spellCheck={true}
                                  suppressContentEditableWarning
                                  onDragStart={(e) => {
                                    // Only allow drag if not currently editing
                                    if (!isEditingRef.current) {
                                      setDraggedPreviewBullet({ expId: job.id, index: idx });
                                      e.dataTransfer.effectAllowed = "move";
                                      e.dataTransfer.setData("text/html", "");
                                    } else {
                                      e.preventDefault();
                                    }
                                  }}
                                  onDragOver={(e) => {
                                    e.preventDefault();
                                    e.dataTransfer.dropEffect = "move";
                                    if (draggedPreviewBullet?.expId === job.id && draggedPreviewBullet?.index !== idx) {
                                      setDragOverPreviewBullet({ expId: job.id, index: idx });
                                    }
                                  }}
                                  onDragLeave={() => {
                                    setDragOverPreviewBullet(null);
                                  }}
                                  onDrop={(e) => {
                                    e.preventDefault();
                                    if (draggedPreviewBullet && draggedPreviewBullet.expId === job.id && draggedPreviewBullet.index !== idx) {
                                      reorderBullets(job.id, draggedPreviewBullet.index, idx);
                                    }
                                    setDraggedPreviewBullet(null);
                                    setDragOverPreviewBullet(null);
                                  }}
                                  onDragEnd={() => {
                                    setDraggedPreviewBullet(null);
                                    setDragOverPreviewBullet(null);
                                  }}
                                  onFocus={() => { isEditingRef.current = true; }}
                                  onBlur={(e) => {
                                    isEditingRef.current = false;
                                    const newBullets = [...job.bullets];
                                    newBullets[idx] = e.currentTarget.innerHTML || "";
                                    updateExperience(job.id, { bullets: newBullets });
                                    setTimeout(() => {
                                      if ((window as any).adjustToFit) {
                                        (window as any).adjustToFit();
                                      }
                                    }, 500);
                                  }}
                                  onKeyDown={(e) => {
                                    if ((e.ctrlKey || e.metaKey) && (e.key === 'b' || e.key === 'B')) {
                                      e.preventDefault();
                                      document.execCommand('bold', false);
                                    }
                                    if ((e.ctrlKey || e.metaKey) && (e.key === 'i' || e.key === 'I')) {
                                      e.preventDefault();
                                      document.execCommand('italic', false);
                                    }
                                  }}
                                  style={{ 
                                    outline: "none", 
                                    userSelect: "text", 
                                    WebkitUserSelect: "text", 
                                    MozUserSelect: "text",
                                    msUserSelect: "text",
                                    cursor: isEditingRef.current ? "text" : "move",
                                    pointerEvents: "auto"
                                  }}
                                  dangerouslySetInnerHTML={{ __html: bullet }}
                                />
                              );
                            })}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                  ));
                })()}
              </div>
            );
          } else if (sectionType === 'projects' && resumeData.projects.length > 0) {
            return (
              <div
                key="projects-section"
                className={`resume-section ${isDraggingSection ? 'section-dragging' : ''} ${isDragOverSection ? 'section-drag-over' : ''}`}
                draggable={true}
                onDragStart={(e) => {
                  setDraggedSectionIndex(sectionIdx);
                  e.dataTransfer.effectAllowed = "move";
                  e.dataTransfer.setData("text/html", "");
                }}
                onDragOver={(e) => {
                  e.preventDefault();
                  e.dataTransfer.dropEffect = "move";
                  if (draggedSectionIndex !== sectionIdx) {
                    setDragOverSectionIndex(sectionIdx);
                  }
                }}
                onDragLeave={() => {
                  setDragOverSectionIndex(null);
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  if (draggedSectionIndex !== null && draggedSectionIndex !== sectionIdx) {
                    reorderSections(draggedSectionIndex, sectionIdx);
                  }
                  setDraggedSectionIndex(null);
                  setDragOverSectionIndex(null);
                }}
                onDragEnd={() => {
                  setDraggedSectionIndex(null);
                  setDragOverSectionIndex(null);
                }}
              >
                <h2 className="section-header">{resumeData.sectionTitles?.projects ?? "Key Technical Projects"}</h2>
                {resumeData.projects.map((project) => (
              <div key={project.id} className="project-card">
                <span
                  className="project-title"
                  contentEditable
                  spellCheck={true}
                  suppressContentEditableWarning
                  onFocus={() => { isEditingRef.current = true; }}
                  onBlur={(e) => {
                    isEditingRef.current = false;
                    updateProject(project.id, { title: e.currentTarget.innerHTML || "" });
                    setTimeout(() => {
                      if ((window as any).adjustToFit) {
                        (window as any).adjustToFit();
                      }
                    }, 500);
                  }}
                  onKeyDown={(e) => {
                    if ((e.ctrlKey || e.metaKey) && (e.key === 'b' || e.key === 'B')) {
                      e.preventDefault();
                      document.execCommand('bold', false);
                    }
                    if ((e.ctrlKey || e.metaKey) && (e.key === 'i' || e.key === 'I')) {
                      e.preventDefault();
                      document.execCommand('italic', false);
                    }
                  }}
                  style={{ outline: "none", userSelect: "text", WebkitUserSelect: "text", cursor: "text" }}
                  dangerouslySetInnerHTML={{ __html: project.title }}
                />
                <p
                  className="project-description"
                  contentEditable
                  spellCheck={true}
                  suppressContentEditableWarning
                  onFocus={() => { isEditingRef.current = true; }}
                  onBlur={(e) => {
                    isEditingRef.current = false;
                    updateProject(project.id, { description: e.currentTarget.innerHTML || "" });
                    setTimeout(() => {
                      if ((window as any).adjustToFit) {
                        (window as any).adjustToFit();
                      }
                    }, 500);
                  }}
                  onKeyDown={(e) => {
                    if ((e.ctrlKey || e.metaKey) && (e.key === 'b' || e.key === 'B')) {
                      e.preventDefault();
                      document.execCommand('bold', false);
                    }
                    if ((e.ctrlKey || e.metaKey) && (e.key === 'i' || e.key === 'I')) {
                      e.preventDefault();
                      document.execCommand('italic', false);
                    }
                  }}
                  style={{ outline: "none", userSelect: "text", WebkitUserSelect: "text", cursor: "text" }}
                  dangerouslySetInnerHTML={{ __html: project.description }}
                />
                  </div>
                ))}
              </div>
            );
          }
          return null;
        })}
      </main>
      </div>
    </>
  );
}
