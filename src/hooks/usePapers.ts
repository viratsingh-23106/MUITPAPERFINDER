import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface Paper {
  id: string;
  course: string;
  branch: string | null;
  semester: string;
  subject: string;
  year: string;
  file_url: string;
  file_name: string;
  uploaded_by: string | null;
  uploader_name: string;
  downloads: number;
  status: string;
  created_at: string;
}

interface UsePapersOptions {
  course?: string;
  branch?: string;
  semester?: string;
  subject?: string;
  myUploads?: boolean; // Fetch current user's uploads (any status)
}

export function usePapers(filters: UsePapersOptions = {}) {
  const [papers, setPapers] = useState<Paper[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPapers = async () => {
    setLoading(true);
    setError(null);

    let query = supabase
      .from("papers")
      .select("*")
      .order("created_at", { ascending: false });

    // Only filter by approved status if not fetching user's own uploads
    if (!filters.myUploads) {
      query = query.eq("status", "approved");
    }

    if (filters.course) {
      query = query.eq("course", filters.course);
    }
    if (filters.branch) {
      query = query.eq("branch", filters.branch);
    }
    if (filters.semester) {
      query = query.eq("semester", filters.semester);
    }
    if (filters.subject) {
      query = query.ilike("subject", `%${filters.subject}%`);
    }

    const { data, error: fetchError } = await query;

    if (fetchError) {
      setError(fetchError.message);
    } else {
      setPapers(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchPapers();

    // Set up realtime subscription
    const channel = supabase
      .channel("papers-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "papers",
        },
        (payload) => {
          console.log("Realtime update:", payload);
          
          if (payload.eventType === "INSERT") {
            const newPaper = payload.new as Paper;
            if (newPaper.status === "approved") {
              setPapers((prev) => [newPaper, ...prev]);
            }
          } else if (payload.eventType === "UPDATE") {
            setPapers((prev) =>
              prev.map((p) => (p.id === payload.new.id ? (payload.new as Paper) : p))
            );
          } else if (payload.eventType === "DELETE") {
            setPapers((prev) => prev.filter((p) => p.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [filters.course, filters.branch, filters.semester, filters.subject, filters.myUploads]);

  return { papers, loading, error, refetch: fetchPapers };
}

export async function uploadPaper(
  file: File,
  paperData: {
    course: string;
    branch?: string;
    semester: string;
    subject: string;
    year: string;
    uploaderName: string;
  }
) {
  // Get current user
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new Error("You must be logged in to upload papers");
  }

  // Upload file to storage
  const fileExt = file.name.split(".").pop();
  const fileName = `${user.id}/${Date.now()}.${fileExt}`;

  const { error: uploadError } = await supabase.storage
    .from("papers")
    .upload(fileName, file);

  if (uploadError) {
    throw new Error(`Upload failed: ${uploadError.message}`);
  }

  // Get public URL
  const { data: urlData } = supabase.storage
    .from("papers")
    .getPublicUrl(fileName);

  // Get user's profile id
  const { data: profile } = await supabase
    .from("profiles")
    .select("id")
    .eq("user_id", user.id)
    .single();

  // Insert paper record
  const { error: insertError } = await supabase.from("papers").insert({
    course: paperData.course,
    branch: paperData.branch || null,
    semester: paperData.semester,
    subject: paperData.subject,
    year: paperData.year,
    file_url: urlData.publicUrl,
    file_name: file.name,
    uploaded_by: profile?.id || null,
    uploader_name: paperData.uploaderName,
    status: "approved",
  });

  if (insertError) {
    throw new Error(`Failed to save paper: ${insertError.message}`);
  }

  return { success: true };
}

export async function deletePaper(paperId: string) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new Error("You must be logged in to delete papers");
  }

  const { error } = await supabase
    .from("papers")
    .delete()
    .eq("id", paperId);

  if (error) {
    throw new Error(`Failed to delete paper: ${error.message}`);
  }

  return { success: true };
}

export async function incrementDownload(paperId: string) {
  const { error } = await supabase.rpc("increment_download", {
    paper_id: paperId,
  });

  if (error) {
    console.error("Failed to increment download:", error.message);
  }
}