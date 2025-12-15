"use client";

import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { User, LogOut, ChevronDown } from "lucide-react";

export default function UserMenu() {
  const { user, signOut } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [avatarError, setAvatarError] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handleSignOut = async () => {
    await signOut();
    setIsOpen(false);
  };

  if (!user) return null;

  // Get avatar URL from user metadata (Google OAuth provides this)
  // Check multiple possible locations where Supabase might store the avatar
  const avatarUrl = 
    user.user_metadata?.avatar_url || 
    user.user_metadata?.picture ||
    user.user_metadata?.avatar ||
    (user.app_metadata as any)?.provider_metadata?.picture ||
    (user.app_metadata as any)?.avatar_url;
  
  const userInitial = user.email?.charAt(0).toUpperCase() || "U";

  // Debug: log user object to see what's available
  if (process.env.NODE_ENV === 'development') {
    console.log('User object:', user);
    console.log('Avatar URL:', avatarUrl);
  }

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-2 py-2 rounded-lg hover:bg-gray-100 transition-colors"
      >
        {avatarUrl && !avatarError ? (
          <img
            src={avatarUrl}
            alt="User avatar"
            className="w-8 h-8 rounded-full object-cover"
            onError={() => setAvatarError(true)}
          />
        ) : (
          <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-medium">
            {userInitial}
          </div>
        )}
        <ChevronDown className="w-4 h-4 text-gray-500" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
          <div className="px-4 py-2 border-b border-gray-200">
            <p className="text-sm font-medium text-gray-900">{user.email}</p>
          </div>
          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      )}
    </div>
  );
}

