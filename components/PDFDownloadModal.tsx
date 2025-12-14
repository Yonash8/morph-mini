"use client";

import { X, FileText, AlertCircle } from "lucide-react";
import { useEffect } from "react";

interface PDFDownloadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export default function PDFDownloadModal({ isOpen, onClose, onConfirm }: PDFDownloadModalProps) {
  // Close on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      // Prevent body scroll when modal is open
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity" />

      {/* Modal */}
      <div
        className="relative bg-white rounded-xl shadow-2xl max-w-md w-full mx-auto transform transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Content */}
        <div className="p-6">
          {/* Icon */}
          <div className="flex items-center justify-center w-12 h-12 rounded-full bg-blue-100 mb-4 mx-auto">
            <FileText className="w-6 h-6 text-blue-600" />
          </div>

          {/* Title */}
          <h2 className="text-xl font-semibold text-gray-900 text-center mb-2">
            Save as PDF for Best Results
          </h2>

          {/* Message */}
          <div className="space-y-3 mb-6">
            <p className="text-sm text-gray-600 text-center leading-relaxed">
              When the print dialog opens, make sure to <strong className="text-gray-900">save as PDF</strong> instead of printing to PDF.
            </p>
            
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex items-start gap-2.5">
              <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm text-amber-900 font-medium mb-1">
                  Important for ATS Compatibility
                </p>
                <p className="text-xs text-amber-800 leading-relaxed">
                  Using &quot;Save as PDF&quot; ensures your resume maintains proper formatting and text selectability, making it ATS-friendly. Printing to PDF may cause formatting issues.
                </p>
              </div>
            </div>
          </div>

          {/* Action button */}
          <button
            onClick={onConfirm}
            className="w-full px-4 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
}
