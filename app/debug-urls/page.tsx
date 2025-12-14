"use client";

import { useEffect, useState } from "react";

export default function DebugUrlsPage() {
  const [urls, setUrls] = useState<{
    origin: string;
    callbackUrl: string;
    currentUrl: string;
  } | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setUrls({
        origin: window.location.origin,
        callbackUrl: `${window.location.origin}/auth/callback`,
        currentUrl: window.location.href,
      });
    }
  }, []);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert("Copied to clipboard!");
  };

  if (!urls) {
    return <div className="p-8">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">🔍 URL Debugger</h1>

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Current URLs</h2>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Current Page Origin:
            </label>
            <div className="flex gap-2">
              <code className="flex-1 bg-gray-100 p-3 rounded border">
                {urls.origin}
              </code>
              <button
                onClick={() => copyToClipboard(urls.origin)}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Copy
              </button>
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Expected Callback URL (add this to Supabase):
            </label>
            <div className="flex gap-2">
              <code className="flex-1 bg-gray-100 p-3 rounded border">
                {urls.callbackUrl}
              </code>
              <button
                onClick={() => copyToClipboard(urls.callbackUrl)}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Copy
              </button>
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Current Full URL:
            </label>
            <code className="block bg-gray-100 p-3 rounded border">
              {urls.currentUrl}
            </code>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4 text-blue-900">
            📋 How to Configure Supabase
          </h2>
          <ol className="list-decimal list-inside space-y-2 text-blue-800">
            <li>Go to{" "}
              <a
                href="https://app.supabase.com"
                target="_blank"
                rel="noopener noreferrer"
                className="underline font-medium"
              >
                Supabase Dashboard
              </a>
            </li>
            <li>Select your project</li>
            <li>Navigate to: <strong>Authentication → URL Configuration</strong></li>
            <li>
              In <strong>Redirect URLs</strong>, add:
              <code className="block bg-white p-2 mt-2 rounded border">
                {urls.callbackUrl}
              </code>
            </li>
            <li>
              Set <strong>Site URL</strong> to:
              <code className="block bg-white p-2 mt-2 rounded border">
                {urls.origin}
              </code>
            </li>
            <li>Click <strong>Save</strong></li>
          </ol>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4 text-yellow-900">
            🧪 Test Callback Route
          </h2>
          <p className="text-yellow-800 mb-4">
            Click the button below to test if your callback route is working:
          </p>
          <a
            href={urls.callbackUrl}
            className="inline-block px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700"
          >
            Test Callback URL
          </a>
          <p className="text-sm text-yellow-700 mt-2">
            (This should redirect you back to the home page, or show an error if not configured correctly)
          </p>
        </div>

        <div className="mt-6 text-center">
          <a
            href="/"
            className="text-blue-600 hover:underline"
          >
            ← Back to Home
          </a>
        </div>
      </div>
    </div>
  );
}
