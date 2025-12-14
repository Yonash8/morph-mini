"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { useResume } from "@/lib/resume-context";
import { useToast } from "@/lib/toast-context";
import { getResumeVersions, deleteResumeVersion, type ResumeVersion } from "@/lib/supabase/database";
import { ArrowLeft, Trash2, FileText, Calendar, Building2, Briefcase, Loader2 } from "lucide-react";
import LandingPage from "@/components/LandingPage";

export default function VersionsPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { importResumeData } = useResume();
  const { showToast } = useToast();
  const [versions, setVersions] = useState<ResumeVersion[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && user) {
      loadVersions();
    }
  }, [authLoading, user]);

  const loadVersions = async () => {
    setLoading(true);
    try {
      const { data, error } = await getResumeVersions();
      if (error) {
        console.error("Error loading versions:", error);
        showToast("Failed to load versions. Please try again.", "error");
      } else {
        setVersions(data || []);
      }
    } catch (error) {
      console.error("Error loading versions:", error);
      showToast("Failed to load versions. Please try again.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleLoadVersion = async (version: ResumeVersion) => {
    try {
      importResumeData(version.metadata);
      showToast("Version loaded successfully!", "success");
      router.push("/");
    } catch (error) {
      console.error("Error loading version:", error);
      showToast("Failed to load version. Please try again.", "error");
    }
  };

  const handleDeleteVersion = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Are you sure you want to delete this version?")) {
      return;
    }

    setDeletingId(id);
    try {
      const { error } = await deleteResumeVersion(id);
      if (error) {
        console.error("Error deleting version:", error);
        showToast("Failed to delete version. Please try again.", "error");
      } else {
        setVersions(versions.filter((v) => v.id !== id));
        showToast("Version deleted successfully!", "success");
      }
    } catch (error) {
      console.error("Error deleting version:", error);
      showToast("Failed to delete version. Please try again.", "error");
    } finally {
      setDeletingId(null);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Show landing page if not authenticated
  if (!authLoading && !user) {
    return <LandingPage />;
  }

  // Show loading state
  if (authLoading || loading) {
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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push("/")}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              aria-label="Back to editor"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full overflow-hidden bg-white border-2 border-gray-200 flex-shrink-0 flex items-center justify-center shadow-sm">
                <img
                  src="/morph_avatar_1.png"
                  alt="morph-mini logo"
                  className="w-full h-full object-cover"
                />
              </div>
              <h1 className="text-xl font-bold text-gray-900 tracking-tight">Resume Versions</h1>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {versions.length === 0 ? (
          <div className="text-center py-16">
            <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">No versions yet</h2>
            <p className="text-gray-600 mb-6">Save your first resume version to get started.</p>
            <button
              onClick={() => router.push("/")}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Go to Editor
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {versions.map((version) => {
              // version.metadata is the ResumeData object
              const resumeData = version.metadata || {};
              const metadata = resumeData.metadata || {};
              const targetRole = metadata.targetRole || resumeData.personalInfo?.role || "No role specified";
              const targetCompany = metadata.targetCompany || "No company specified";
              const lastModified = formatDate(version.updated_at);

              return (
                <div
                  key={version.id}
                  onClick={() => handleLoadVersion(version)}
                  className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-all cursor-pointer group"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-1">
                        {resumeData.personalInfo?.name || "Untitled Resume"}
                      </h3>
                    </div>
                    <button
                      onClick={(e) => handleDeleteVersion(version.id, e)}
                      disabled={deletingId === version.id}
                      className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-600 transition-colors opacity-0 group-hover:opacity-100"
                      aria-label="Delete version"
                    >
                      {deletingId === version.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </button>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-start gap-2">
                      <Briefcase className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-gray-500 mb-0.5">Target Role</p>
                        <p className="text-sm font-medium text-gray-900 truncate">{targetRole}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-2">
                      <Building2 className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-gray-500 mb-0.5">Target Company</p>
                        <p className="text-sm font-medium text-gray-900 truncate">{targetCompany}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-2">
                      <Calendar className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-gray-500 mb-0.5">Last Modified</p>
                        <p className="text-sm font-medium text-gray-900">{lastModified}</p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <p className="text-xs text-gray-500">Click to load this version</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
