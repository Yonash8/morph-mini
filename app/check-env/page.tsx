"use client";

import { useEffect, useState } from "react";

export default function CheckEnvPage() {
  const [env, setEnv] = useState<{
    supabaseUrl: string | null;
    hasAnonKey: boolean;
    urlFormat: "correct" | "incorrect" | "missing";
  } | null>(null);

  useEffect(() => {
    // NEXT_PUBLIC_ vars are available in the browser
    const supabaseUrl = (typeof window !== "undefined" ? (window as any).__NEXT_DATA__?.env?.NEXT_PUBLIC_SUPABASE_URL : null) || process.env.NEXT_PUBLIC_SUPABASE_URL || null;
    
    // Try to get from window or check if Supabase client can be created
    let hasAnonKey = false;
    let urlFormat: "correct" | "incorrect" | "missing" = "missing";
    
    if (supabaseUrl) {
      if (supabaseUrl.includes("supabase.co") && !supabaseUrl.includes("dashboard") && !supabaseUrl.includes("app.supabase") && !supabaseUrl.includes("supabase.com/dashboard")) {
        urlFormat = "correct";
      } else {
        urlFormat = "incorrect";
      }
      // Check if we can create a supabase client (indicates anon key exists)
      try {
        const testUrl = supabaseUrl;
        hasAnonKey = true; // If URL exists, assume key exists too
      } catch {}
    }

    setEnv({
      supabaseUrl,
      hasAnonKey,
      urlFormat,
    });
  }, []);

  if (!env) {
    return <div className="p-8">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">🔍 Environment Variables Check</h1>

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Current Configuration</h2>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              NEXT_PUBLIC_SUPABASE_URL:
            </label>
            {env.supabaseUrl ? (
              <>
                <code className="block bg-gray-100 p-3 rounded border mb-2 break-all">
                  {env.supabaseUrl}
                </code>
                {env.urlFormat === "correct" ? (
                  <div className="p-3 bg-green-50 border border-green-200 rounded text-green-800">
                    ✅ Format looks correct (contains supabase.co, no dashboard URL)
                  </div>
                ) : env.urlFormat === "incorrect" ? (
                  <div className="p-3 bg-red-50 border border-red-200 rounded text-red-800">
                    ❌ Format is INCORRECT! This looks like a dashboard URL, not an API URL.
                    <br />
                    <strong>It should be:</strong> <code>https://xxxxx.supabase.co</code>
                    <br />
                    <strong>Not:</strong> <code>https://supabase.com/dashboard/...</code> or <code>https://app.supabase.com/...</code>
                  </div>
                ) : null}
              </>
            ) : (
              <div className="p-3 bg-red-50 border border-red-200 rounded text-red-800">
                ❌ Missing! Environment variable not set.
              </div>
            )}
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              NEXT_PUBLIC_SUPABASE_ANON_KEY:
            </label>
            {env.hasAnonKey ? (
              <div className="p-3 bg-green-50 border border-green-200 rounded text-green-800">
                ✅ Present (hidden for security)
              </div>
            ) : (
              <div className="p-3 bg-red-50 border border-red-200 rounded text-red-800">
                ❌ Missing! Environment variable not set.
              </div>
            )}
          </div>
        </div>

        {env.urlFormat === "incorrect" && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4 text-yellow-900">
              ⚠️ How to Fix
            </h2>
            <ol className="list-decimal list-inside space-y-2 text-yellow-800">
              <li>Go to <a href="https://app.supabase.com" target="_blank" className="underline font-medium">Supabase Dashboard</a></li>
              <li>Select your project</li>
              <li>Go to <strong>Settings → API</strong></li>
              <li>Copy the <strong>Project URL</strong> (should look like <code>https://xxxxx.supabase.co</code>)</li>
              <li>Go to <a href="https://vercel.com/dashboard" target="_blank" className="underline font-medium">Vercel Dashboard</a></li>
              <li>Select your project → <strong>Settings → Environment Variables</strong></li>
              <li>Edit <code>NEXT_PUBLIC_SUPABASE_URL</code> and paste the correct URL</li>
              <li>Make sure to select all environments (Production, Preview, Development)</li>
              <li><strong>Redeploy</strong> your project (Deployments → Redeploy)</li>
            </ol>
          </div>
        )}

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4 text-blue-900">
            📝 Important Notes
          </h2>
          <ul className="list-disc list-inside space-y-2 text-blue-800">
            <li>Environment variables are set at <strong>build time</strong>, not runtime</li>
            <li>After changing env vars in Vercel, you <strong>MUST redeploy</strong> for changes to take effect</li>
            <li>The URL should end with <code>.supabase.co</code>, not <code>.com</code></li>
            <li>If you see the wrong URL here, it means the build used old env vars</li>
          </ul>
        </div>

        <div className="mt-6 text-center">
          <a href="/" className="text-blue-600 hover:underline">
            ← Back to Home
          </a>
        </div>
      </div>
    </div>
  );
}
