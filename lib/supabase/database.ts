import { createClient } from "@/lib/supabase/client";

export interface ResumeVersion {
  id: string;
  user_id: string;
  metadata: any; // ResumeData JSON
  created_at: string;
  updated_at: string;
}

export interface User {
  id: string;
  email: string | null;
  created_at: string;
  updated_at: string;
}

export async function createResumeVersion(metadata: any): Promise<{ data: ResumeVersion | null; error: any }> {
  const supabase = createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { data: null, error: { message: "User not authenticated" } };
  }

  const { data, error } = await supabase
    .from("resume_versions")
    .insert({
      user_id: user.id,
      metadata: metadata,
    })
    .select()
    .single();

  return { data, error };
}

export async function updateResumeVersion(
  id: string,
  metadata: any
): Promise<{ data: ResumeVersion | null; error: any }> {
  const supabase = createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { data: null, error: { message: "User not authenticated" } };
  }

  const { data, error } = await supabase
    .from("resume_versions")
    .update({
      metadata: metadata,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .eq("user_id", user.id) // Ensure user can only update their own resumes
    .select()
    .single();

  return { data, error };
}

export async function getResumeVersions(): Promise<{ data: ResumeVersion[] | null; error: any }> {
  const supabase = createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { data: null, error: { message: "User not authenticated" } };
  }

  const { data, error } = await supabase
    .from("resume_versions")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return { data, error };
}

export async function getResumeVersion(id: string): Promise<{ data: ResumeVersion | null; error: any }> {
  const supabase = createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { data: null, error: { message: "User not authenticated" } };
  }

  const { data, error } = await supabase
    .from("resume_versions")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  return { data, error };
}

export async function deleteResumeVersion(id: string): Promise<{ error: any }> {
  const supabase = createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { error: { message: "User not authenticated" } };
  }

  const { error } = await supabase
    .from("resume_versions")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  return { error };
}

export async function getOrCreateUser(): Promise<{ data: User | null; error: any }> {
  const supabase = createClient();

  const { data: { user: authUser } } = await supabase.auth.getUser();
  if (!authUser) {
    return { data: null, error: { message: "User not authenticated" } };
  }

  // Try to get existing user
  let { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("id", authUser.id)
    .single();

  // If user doesn't exist, create it
  if (error && error.code === "PGRST116") {
    const { data: newUser, error: createError } = await supabase
      .from("users")
      .insert({
        id: authUser.id,
        email: authUser.email,
      })
      .select()
      .single();

    return { data: newUser, error: createError };
  }

  return { data, error };
}
