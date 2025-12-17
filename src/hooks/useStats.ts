import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface Stats {
  totalPapers: number;
  activeStudents: number;
  coursesCount: number;
  coursesPapers: { name: string; papers: number }[];
}

export function useStats() {
  const [stats, setStats] = useState<Stats>({
    totalPapers: 0,
    activeStudents: 0,
    coursesCount: 0,
    coursesPapers: [],
  });
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    setLoading(true);

    // Fetch total approved papers
    const { count: papersCount } = await supabase
      .from("papers")
      .select("*", { count: "exact", head: true })
      .eq("status", "approved");

    // Fetch active students count
    const { count: studentsCount } = await supabase
      .from("profiles")
      .select("*", { count: "exact", head: true });

    // Fetch papers grouped by course
    const { data: coursesData } = await supabase
      .from("papers")
      .select("course")
      .eq("status", "approved");

    // Count papers per course
    const courseMap = new Map<string, number>();
    coursesData?.forEach((paper) => {
      courseMap.set(paper.course, (courseMap.get(paper.course) || 0) + 1);
    });

    const coursesPapers = Array.from(courseMap.entries()).map(([name, papers]) => ({
      name: name.toUpperCase(),
      papers,
    }));

    setStats({
      totalPapers: papersCount || 0,
      activeStudents: studentsCount || 0,
      coursesCount: courseMap.size,
      coursesPapers,
    });
    setLoading(false);
  };

  useEffect(() => {
    fetchStats();

    // Real-time subscription for papers changes
    const channel = supabase
      .channel("stats-papers-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "papers",
        },
        () => {
          fetchStats();
        }
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "profiles",
        },
        () => {
          fetchStats();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return { stats, loading, refetch: fetchStats };
}
