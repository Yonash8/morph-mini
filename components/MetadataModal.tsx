"use client";

import { useState, useEffect, useRef } from "react";
import { X, Save, User, Briefcase, Building2 } from "lucide-react";

interface MetadataModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: { name?: string; targetRole?: string; targetCompany?: string }) => void;
  currentData: {
    name?: string;
    targetRole?: string;
    targetCompany?: string;
  };
  missingFields: {
    name?: boolean;
    targetRole?: boolean;
    targetCompany?: boolean;
  };
}

export default function MetadataModal({
  isOpen,
  onClose,
  onSave,
  currentData,
  missingFields,
}: MetadataModalProps) {
  const [name, setName] = useState(currentData.name || "");
  const [targetRole, setTargetRole] = useState(currentData.targetRole || "");
  const [targetCompany, setTargetCompany] = useState(currentData.targetCompany || "");
  const nameInputRef = useRef<HTMLInputElement>(null);

  // Update form when currentData changes
  useEffect(() => {
    setName(currentData.name || "");
    setTargetRole(currentData.targetRole || "");
    setTargetCompany(currentData.targetCompany || "");
  }, [currentData]);

  // Focus first missing field when modal opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        if (missingFields.name && nameInputRef.current) {
          nameInputRef.current.focus();
        } else if (missingFields.targetRole) {
          const roleInput = document.getElementById("target-role-input");
          roleInput?.focus();
        } else if (missingFields.targetCompany) {
          const companyInput = document.getElementById("target-company-input");
          companyInput?.focus();
        }
      }, 100);
    }
  }, [isOpen, missingFields]);

  // Close on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate that all required fields are filled
    if (missingFields.name && !name.trim()) {
      return;
    }
    if (missingFields.targetRole && !targetRole.trim()) {
      return;
    }
    if (missingFields.targetCompany && !targetCompany.trim()) {
      return;
    }

    onSave({
      name: name.trim() || undefined,
      targetRole: targetRole.trim() || undefined,
      targetCompany: targetCompany.trim() || undefined,
    });
  };

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
        <form onSubmit={handleSubmit} className="p-6">
          {/* Icon */}
          <div className="flex items-center justify-center w-12 h-12 rounded-full bg-blue-100 mb-4 mx-auto">
            <Save className="w-6 h-6 text-blue-600" />
          </div>

          {/* Title */}
          <h2 className="text-xl font-semibold text-gray-900 text-center mb-2">
            Complete Required Information
          </h2>
          <p className="text-sm text-gray-600 text-center mb-6">
            Please fill in the missing fields to save your resume version.
          </p>

          {/* Form Fields */}
          <div className="space-y-4 mb-6">
            {/* Name Field */}
            {missingFields.name && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-2">
                  <User className="w-4 h-4 text-gray-500" />
                  Your Name <span className="text-red-500">*</span>
                </label>
                <input
                  ref={nameInputRef}
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., John Doe"
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  required={missingFields.name}
                />
              </div>
            )}

            {/* Target Role Field */}
            {missingFields.targetRole && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-gray-500" />
                  Target Role <span className="text-red-500">*</span>
                </label>
                <input
                  id="target-role-input"
                  type="text"
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
                  placeholder="e.g., Senior Software Engineer"
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  required={missingFields.targetRole}
                />
              </div>
            )}

            {/* Target Company Field */}
            {missingFields.targetCompany && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-gray-500" />
                  Target Company <span className="text-red-500">*</span>
                </label>
                <input
                  id="target-company-input"
                  type="text"
                  value={targetCompany}
                  onChange={(e) => setTargetCompany(e.target.value)}
                  placeholder="e.g., Google"
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  required={missingFields.targetCompany}
                />
              </div>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center justify-center gap-2"
            >
              <Save className="w-4 h-4" />
              Save & Continue
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
