/**
 * PDF Export using Browser Print
 * 
 * Uses the browser's native print-to-PDF:
 * - Exact visual match to preview
 * - All text is selectable and searchable (ATS-friendly)
 * - Supports all CSS styling including custom bullets
 */

import type { ResumeData } from "./types";

interface PDFExportOptions {
  filename?: string;
  resumeData: ResumeData;
}

export async function exportResumeToPDF(_options: PDFExportOptions) {
  // Get the resume preview element
  const resumeElement = document.getElementById('resume-preview');
  if (!resumeElement) {
    throw new Error('Resume preview element not found');
  }

  // Clone the resume for printing
  const printContent = resumeElement.cloneNode(true) as HTMLElement;
  
  // Remove any interactive elements and editing indicators
  printContent.querySelectorAll('[contenteditable]').forEach(el => {
    el.removeAttribute('contenteditable');
  });

  // Create print window
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    alert('Please allow popups for this site to download PDF');
    return;
  }

  // Get computed styles from the preview
  const computedStyles = getComputedStyle(resumeElement);
  const sidebarWidth = computedStyles.getPropertyValue('--fit-sidebar-width') || '220px';
  const fontScale = computedStyles.getPropertyValue('--fit-content-font-scale') || '1';
  const spacingScale = computedStyles.getPropertyValue('--fit-spacing-scale') || '1';

  // Write the print document
  printWindow.document.write(`<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Resume</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Manrope:wght@400;700;800&display=swap" rel="stylesheet">
  <style>
    @page {
      size: A4;
      margin: 0;
    }
    
    * {
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
      color-adjust: exact !important;
      box-sizing: border-box;
    }
    
    html, body {
      margin: 0;
      padding: 0;
      width: 210mm;
      height: 297mm;
      font-family: 'Inter', sans-serif;
      background: white;
    }
    
    :root {
      --bg-sidebar: #fafafa;
      --bg-main: #ffffff;
      --text-primary: #111111;
      --text-secondary: #444444;
      --accent-color: #000000;
      --border-color: #e0e0e0;
      --sidebar-width: ${sidebarWidth};
      --page-padding: 45px;
      --fit-font-scale: 1;
      --fit-content-font-scale: ${fontScale};
      --fit-spacing-scale: ${spacingScale};
      --fit-line-height: 1.5;
      --fit-sidebar-width: ${sidebarWidth};
    }
    
    .resume-wrapper {
      display: grid;
      grid-template-columns: var(--sidebar-width) 1fr;
      width: 210mm;
      height: 297mm;
      margin: 0;
      background: var(--bg-main);
      font-family: 'Inter', sans-serif;
      color: var(--text-primary);
      font-size: calc(14px * var(--fit-content-font-scale));
      line-height: var(--fit-line-height);
      overflow: hidden;
    }
    
    aside {
      background-color: var(--bg-sidebar) !important;
      padding: calc(var(--page-padding) * var(--fit-spacing-scale)) calc(24px * var(--fit-spacing-scale));
      border-right: 1px solid var(--border-color);
      height: 100%;
      display: flex;
      flex-direction: column;
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
    }
    
    .contact-value {
      font-weight: 500;
      font-size: calc(13px * var(--fit-content-font-scale));
      color: var(--text-primary);
      display: block;
    }
    
    .contact-value a {
      color: inherit;
      text-decoration: none;
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
    }
    
    header {
      margin-bottom: calc(35px * var(--fit-spacing-scale));
      margin-top: calc(-8px * var(--fit-spacing-scale));
    }
    
    h1 {
      font-family: 'Manrope', sans-serif;
      font-size: 38px;
      font-weight: 800;
      letter-spacing: -0.5px;
      color: #333333;
      line-height: 1;
      margin: 0;
      margin-bottom: calc(12px * var(--fit-spacing-scale));
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
      border-radius: 4px;
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
      border-bottom: none;
    }
    
    .resume-section:first-of-type h2.section-header {
      margin-top: 0;
    }
    
    .job-card {
      margin-bottom: calc(20px * var(--fit-spacing-scale));
    }
    
    .company-name {
      font-weight: 800;
      font-size: calc(16px * var(--fit-content-font-scale));
      color: #000000;
      display: block;
      margin-bottom: calc(6px * var(--fit-spacing-scale));
      letter-spacing: calc(-0.2px * var(--fit-content-font-scale));
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
    
    .job-title-text {
      font-family: 'Inter', sans-serif;
      font-weight: 600;
      font-style: normal;
      color: #222222;
      display: block;
      font-size: calc(14px * var(--fit-content-font-scale));
      margin-bottom: calc(6px * var(--fit-spacing-scale));
      line-height: 1.2;
    }
    
    .job-date {
      font-size: calc(12px * var(--fit-content-font-scale));
      font-weight: 600;
      color: #444444;
      text-align: right;
      white-space: nowrap;
      line-height: 1.2;
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
      font-weight: 400;
    }
    
    ul.job-bullets li::before {
      content: "▪";
      position: absolute;
      left: 0;
      top: calc(2px * var(--fit-content-font-scale));
      color: #000000;
      font-size: calc(12px * var(--fit-content-font-scale));
      font-weight: 700;
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
    
    /* Hide UI elements */
    [style*="position: fixed"],
    .sidebar-resizer,
    button {
      display: none !important;
    }
    
    /* Remove editing styles */
    [contenteditable]:hover,
    [contenteditable]:focus {
      background: transparent !important;
      outline: none !important;
    }
  </style>
</head>
<body>
  ${printContent.outerHTML}
  <script>
    // Wait for fonts to load then print
    document.fonts.ready.then(function() {
      setTimeout(function() {
        window.print();
        setTimeout(function() {
          window.close();
        }, 1000);
      }, 500);
    });
  </script>
</body>
</html>`);

  printWindow.document.close();
}
