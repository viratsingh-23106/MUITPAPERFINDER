import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PaperChatbot } from "@/components/PaperChatbot";
import { supabase } from "@/integrations/supabase/client";
import { incrementDownload } from "@/hooks/usePapers";
import { getCourseName, getBranchName } from "@/lib/data";
import { ArrowLeft, Download, Calendar, User, Loader2, MessageSquare, X } from "lucide-react";
import type { Paper } from "@/hooks/usePapers";

export default function PaperViewer() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [paper, setPaper] = useState<Paper | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showChatbot, setShowChatbot] = useState(false);

  useEffect(() => {
    const fetchPaper = async () => {
      if (!id) {
        setError("Paper ID not provided");
        setLoading(false);
        return;
      }

      try {
        const { data, error: fetchError } = await supabase
          .from("papers")
          .select("*")
          .eq("id", id)
          .single();

        if (fetchError) throw fetchError;
        if (!data) throw new Error("Paper not found");

        setPaper(data as Paper);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load paper");
      } finally {
        setLoading(false);
      }
    };

    fetchPaper();
  }, [id]);

  const handleDownload = () => {
    if (!paper) return;
    incrementDownload(paper.id);
    const link = document.createElement("a");
    link.href = paper.file_url;
    link.download = paper.file_name;
    link.target = "_blank";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !paper) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 container py-8">
          <div className="text-center py-16">
            <p className="text-destructive mb-4">{error || "Paper not found"}</p>
            <Button onClick={() => navigate("/search")}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Search
            </Button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1 flex flex-col">
        {/* Paper Info Bar */}
        <div className="border-b border-border bg-card">
          <div className="container py-4">
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-4">
                <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
                <div className="h-6 w-px bg-border" />
                <div>
                  <h1 className="font-semibold text-lg">{paper.subject}</h1>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    <Badge variant="secondary" className="text-xs uppercase">
                      {getCourseName(paper.course)}
                      {paper.branch && ` - ${getBranchName(paper.course, paper.branch)}`}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      Sem {paper.semester}
                    </Badge>
                    <Badge className="text-xs gradient-primary text-primary-foreground border-0">
                      {paper.year}
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="hidden sm:flex items-center gap-4 text-xs text-muted-foreground mr-4">
                  <span className="flex items-center gap-1">
                    <User className="h-3 w-3" />
                    {paper.uploader_name}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {new Date(paper.created_at).toLocaleDateString()}
                  </span>
                </div>
                <Button variant="outline" size="sm" onClick={() => setShowChatbot(!showChatbot)}>
                  {showChatbot ? <X className="h-4 w-4 mr-2" /> : <MessageSquare className="h-4 w-4 mr-2" />}
                  {showChatbot ? "Close AI" : "AI Assistant"}
                </Button>
                <Button size="sm" onClick={handleDownload}>
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 flex">
          {/* PDF Viewer */}
          <div className={`flex-1 ${showChatbot ? 'hidden md:block md:w-1/2 lg:w-2/3' : 'w-full'}`}>
            <iframe
              src={`${paper.file_url}#toolbar=1&navpanes=0`}
              className="w-full h-full min-h-[calc(100vh-180px)]"
              title={paper.subject}
            />
          </div>

          {/* Chatbot Panel */}
          {showChatbot && (
            <div className="w-full md:w-1/2 lg:w-1/3 border-l border-border bg-card flex flex-col h-[calc(100vh-180px)]">
              <PaperChatbot paper={paper} />
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
