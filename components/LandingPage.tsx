"use client";

import { useState } from "react";
import { ArrowRight } from "lucide-react";
import AuthModal from "./AuthModal";

export default function LandingPage() {
  const [showAuthModal, setShowAuthModal] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-1/2 w-72 h-72 bg-pink-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative z-10 text-center px-6">
        <div className="mb-8">
          <div className="w-16 h-16 rounded-full overflow-hidden bg-white border-2 border-gray-200 flex-shrink-0 flex items-center justify-center shadow-sm mx-auto mb-6">
            <img
              src="/morph_avatar_1.png"
              alt="morph-mini logo"
              className="w-full h-full object-cover"
            />
          </div>
          <p className="text-sm text-gray-500 mb-2">morph-mini</p>
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-4">
            Format Your Resume
          </h1>
          <p className="text-lg text-gray-600 mb-8">
            Simple as that.
          </p>
        </div>

        <button
          onClick={() => setShowAuthModal(true)}
          className="group px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all hover:scale-105 flex items-center gap-2 mx-auto"
        >
          Get Started
          <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>

      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />
    </div>
  );
}

