"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import SidebarEditor from "@/components/SidebarEditor";
import ResumePreview from "@/components/ResumePreview";
import PDFDownloadModal from "@/components/PDFDownloadModal";
import MetadataModal from "@/components/MetadataModal";
import LandingPage from "@/components/LandingPage";
import AuthModal from "@/components/AuthModal";
import UserMenu from "@/components/UserMenu";
import { exportResumeToPDF } from "@/lib/pdf-export";
import { useResume } from "@/lib/resume-context";
import { useAuth } from "@/lib/auth-context";
import { useToast } from "@/lib/toast-context";
import { Download, LogIn, Save, FileText } from "lucide-react";
import { createResumeVersion } from "@/lib/supabase/database";

export default function Home() {
  const [isExporting, setIsExporting] = useState(false);
  const [showPDFModal, setShowPDFModal] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showMetadataModal, setShowMetadataModal] = useState(false);
  const [missingFields, setMissingFields] = useState<{ name?: boolean; targetRole?: boolean; targetCompany?: boolean }>({});
  const [isSaving, setIsSaving] = useState(false);
  const { resumeData, importResumeData, updatePersonalInfo, updateMetadata } = useResume();
  const { user, loading: authLoading } = useAuth();
  const { showToast } = useToast();
  const [sidebarWidth, setSidebarWidth] = useState(400); // Default sidebar width
  const resizerRef = useRef<HTMLDivElement>(null);
  const isResizingRef = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const generateFilename = (extension: string): string => {
    try {
      // Parse name into first and last name
      const name = resumeData.personalInfo?.name?.trim() || "Resume";
      const nameParts = name.split(/\s+/).filter(part => part.length > 0);
      const firstName = nameParts[0] || "Resume";
      const lastName = nameParts.length > 1 ? nameParts[nameParts.length - 1] : "";
      
      // Get target company
      const targetCompany = resumeData.metadata?.targetCompany?.trim() || "Resume";
      
      // Sanitize for filename (remove special characters, replace spaces with underscores)
      const sanitize = (str: string) => {
        if (!str) return "Resume";
        return str
          .replace(/[^a-zA-Z0-9\s-]/g, "") // Remove special characters except spaces and hyphens
          .replace(/\s+/g, "_") // Replace spaces with underscores
          .replace(/_+/g, "_") // Replace multiple underscores with single
          .replace(/^_|_$/g, "") // Remove leading/trailing underscores
          || "Resume"; // Fallback if empty after sanitization
      };
      
      const sanitizedFirstName = sanitize(firstName);
      const sanitizedLastName = sanitize(lastName);
      const sanitizedCompany = sanitize(targetCompany);
      
      // Build filename
      if (sanitizedLastName && sanitizedLastName !== "Resume") {
        return `${sanitizedFirstName}_${sanitizedLastName}_Resume_${sanitizedCompany}.${extension}`;
      } else {
        return `${sanitizedFirstName}_Resume_${sanitizedCompany}.${extension}`;
      }
    } catch (error) {
      console.error("Error generating filename:", error);
      return `resume.${extension}`;
    }
  };

  const handleDownloadPDF = () => {
    // Show modal first
    setShowPDFModal(true);
  };

  const handleConfirmPDFDownload = async () => {
    setShowPDFModal(false);
    setIsExporting(true);
    try {
      const filename = generateFilename("pdf");
      console.log("Exporting PDF with filename:", filename);
      await exportResumeToPDF({
        filename: filename,
        resumeData: resumeData,
      });
    } catch (error) {
      console.error("Error exporting PDF:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      showToast(`Failed to export PDF: ${errorMessage}`, "error");
    } finally {
      setIsExporting(false);
    }
  };


  const validateMetadata = (): { 
    isValid: boolean; 
    missingFields?: { name?: boolean; targetRole?: boolean; targetCompany?: boolean } 
  } => {
    const name = resumeData.personalInfo?.name?.trim();
    const targetRole = resumeData.metadata?.targetRole?.trim();
    const targetCompany = resumeData.metadata?.targetCompany?.trim();

    const missingFields: { name?: boolean; targetRole?: boolean; targetCompany?: boolean } = {};

    if (!name || name.length === 0) {
      missingFields.name = true;
    }

    if (!targetRole || targetRole.length === 0) {
      missingFields.targetRole = true;
    }

    if (!targetCompany || targetCompany.length === 0) {
      missingFields.targetCompany = true;
    }

    if (Object.keys(missingFields).length > 0) {
      return { isValid: false, missingFields };
    }

    return { isValid: true };
  };

  const handleSaveVersion = async () => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }

    // Validate metadata before saving
    const validation = validateMetadata();
    if (!validation.isValid && validation.missingFields) {
      // Store missing fields and show modal to enter missing data
      setMissingFields(validation.missingFields);
      setShowMetadataModal(true);
      return;
    }

    await performSave();
  };

  const handleMetadataSave = (data: { name?: string; targetRole?: string; targetCompany?: string }) => {
    // Update resume data with the entered values
    if (data.name) {
      updatePersonalInfo({ name: data.name });
    }
    if (data.targetRole || data.targetCompany) {
      updateMetadata({
        targetRole: data.targetRole || resumeData.metadata?.targetRole,
        targetCompany: data.targetCompany || resumeData.metadata?.targetCompany,
      });
    }

    // Close modal
    setShowMetadataModal(false);

    // Prepare updated resume data with the new values
    const updatedResumeData = {
      ...resumeData,
      personalInfo: {
        ...resumeData.personalInfo,
        name: data.name || resumeData.personalInfo?.name || "",
      },
      metadata: {
        ...resumeData.metadata,
        targetRole: data.targetRole || resumeData.metadata?.targetRole || "",
        targetCompany: data.targetCompany || resumeData.metadata?.targetCompany || "",
        dateCreated: resumeData.metadata?.dateCreated || new Date().toISOString(),
      },
    };

    // Proceed with save using updated data
    performSave(updatedResumeData);
  };

  const performSave = async (dataToSave?: typeof resumeData) => {
    setIsSaving(true);
    try {
      // Use provided data or current resumeData
      const resumeDataToSave = dataToSave || resumeData;
      
      // Prepare resume data with updated metadata
      const versionData = {
        ...resumeDataToSave,
        metadata: {
          ...resumeDataToSave.metadata,
          dateCreated: resumeDataToSave.metadata?.dateCreated || new Date().toISOString(),
        },
      };

      const { data, error } = await createResumeVersion(versionData);
      if (error) {
        console.error("Error saving version:", error);
        showToast(`Failed to save version: ${error.message || "Unknown error"}`, "error");
      } else {
        showToast("Version saved successfully!", "success");
      }
    } catch (error) {
      console.error("Error saving version:", error);
      showToast("Failed to save version. Please try again.", "error");
    } finally {
      setIsSaving(false);
    }
  };

  // Handle sidebar resizing
  useEffect(() => {
    const resizer = resizerRef.current;
    const container = containerRef.current;
    if (!resizer || !container) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizingRef.current) {
        return;
      }
      
      if (!container) {
        isResizingRef.current = false;
        return;
      }
      
      e.preventDefault();
      e.stopPropagation();
      
      const rect = container.getBoundingClientRect();
      // Calculate sidebar width based on mouse X position relative to container
      const newWidth = e.clientX - rect.left;
      
      // Calculate max width as 40% of container width
      const maxWidth = rect.width * 0.4;
      const minWidth = 300; // Minimum width for usability
      const clampedWidth = Math.max(minWidth, Math.min(maxWidth, newWidth));
      
      setSidebarWidth(clampedWidth);
    };

    const handleMouseUp = () => {
      if (isResizingRef.current) {
        isResizingRef.current = false;
        if (document.body) {
          document.body.style.cursor = '';
          document.body.style.userSelect = '';
        }
      }
    };

    const handleMouseDown = (e: MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      isResizingRef.current = true;
      if (document.body) {
        document.body.style.cursor = 'col-resize';
        document.body.style.userSelect = 'none';
      }
    };

    resizer.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      resizer.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      if (document.body) {
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
      }
    };
  }, []);

  // Show landing page if not authenticated
  if (!authLoading && !user) {
    return <LandingPage />;
  }

  // Show loading state
  if (authLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 px-8 py-3 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-8 h-8 rounded-lg overflow-hidden bg-gradient-to-br from-blue-500 to-blue-600 flex-shrink-0 flex items-center justify-center shadow-sm">
            <img
              src="/morph_avatar_1.png"
              alt="morph-mini logo"
              className="w-full h-full object-cover"
            />
          </div>
          <h1 className="text-lg font-semibold text-gray-900 tracking-tight">morph-mini</h1>
        </div>
        <div className="flex items-center gap-2">
          {/* User Menu */}
          {!authLoading && (
            <>
              {user ? (
                <UserMenu />
              ) : (
                <button
                  onClick={() => setShowAuthModal(true)}
                  className="px-4 py-1.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors flex items-center gap-2 shadow-sm"
                >
                  <LogIn className="w-4 h-4" />
                  <span className="hidden sm:inline">Sign In</span>
                </button>
              )}
            </>
          )}
        </div>
      </header>

      {/* Main Content */}
      <div ref={containerRef} className="flex-1 flex overflow-hidden">
        {/* Sidebar Editor */}
        <div className="flex flex-col flex-shrink-0" style={{ width: `${sidebarWidth}px` }}>
          <div className="bg-white border-r border-b border-gray-200 px-4 py-3">
            <Link
              href="/versions"
              className="w-full px-3 py-2 text-sm font-medium text-gray-700 bg-gray-50 hover:bg-gray-100 rounded-md transition-colors flex items-center justify-center gap-2 border border-gray-200"
            >
              <FileText className="w-4 h-4" />
              <span>Versions</span>
            </Link>
          </div>
          <div className="flex-1 overflow-hidden">
            <SidebarEditor width={sidebarWidth} />
          </div>
        </div>

        {/* Resizer */}
        <div
          ref={resizerRef}
          className="bg-transparent hover:bg-gray-200 cursor-col-resize transition-colors flex-shrink-0 relative z-10 group"
          style={{ 
            width: '4px', 
            minWidth: '4px',
            cursor: 'col-resize',
            touchAction: 'none'
          }}
          title="Drag to resize sidebar"
        >
          <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-0.5 bg-gray-300 group-hover:bg-blue-500 transition-colors" />
        </div>

        {/* Resume Preview */}
        <div className="flex-1 flex flex-col overflow-hidden bg-gray-100">
          <div className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between gap-4">
            <h2 className="text-sm font-semibold text-gray-900">Preview</h2>
            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                onClick={handleSaveVersion}
                disabled={isSaving || !user}
                className="px-4 py-1.5 text-sm font-medium text-gray-700 bg-green-50 hover:bg-green-100 rounded-md transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm whitespace-nowrap"
                title={!user ? "Sign in to save versions" : "Save current resume as a version"}
              >
                <Save className="w-4 h-4" />
                {isSaving ? "Saving..." : "Save Version"}
              </button>
              <button
                onClick={handleDownloadPDF}
                disabled={isExporting}
                className="px-4 py-1.5 text-sm font-semibold text-gray-700 bg-blue-50 hover:bg-blue-100 rounded-md transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm whitespace-nowrap"
              >
                <Download className="w-4 h-4" />
                {isExporting ? "Exporting..." : "Export PDF"}
              </button>
            </div>
          </div>
          <div className="flex-1 overflow-auto p-8" style={{ userSelect: 'text', WebkitUserSelect: 'text' }}>
            <div className="max-w-4xl mx-auto" style={{ userSelect: 'text', WebkitUserSelect: 'text' }}>
              <ResumePreview />
            </div>
          </div>
        </div>
      </div>

      {/* PDF Download Modal */}
      <PDFDownloadModal
        isOpen={showPDFModal}
        onClose={() => setShowPDFModal(false)}
        onConfirm={handleConfirmPDFDownload}
      />

      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />

      {/* Metadata Modal */}
      <MetadataModal
        isOpen={showMetadataModal}
        onClose={() => setShowMetadataModal(false)}
        onSave={handleMetadataSave}
        currentData={{
          name: resumeData.personalInfo?.name,
          targetRole: resumeData.metadata?.targetRole,
          targetCompany: resumeData.metadata?.targetCompany,
        }}
        missingFields={missingFields}
      />
    </div>
  );
}
