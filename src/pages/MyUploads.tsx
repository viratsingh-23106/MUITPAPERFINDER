import { useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PaperCard } from "@/components/PaperCard";
import { usePapers } from "@/hooks/usePapers";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Upload, FileText, Download, Loader2 } from "lucide-react";

export default function MyUploads() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { papers, loading, error } = usePapers({ myUploads: true });

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const totalDownloads = papers.reduce((sum, paper) => sum + paper.downloads, 0);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 container py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">My Uploads</h1>
          <p className="text-muted-foreground">
            Manage all the papers you've contributed to the community
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 mb-8 max-w-md">
          <div className="p-4 rounded-xl bg-primary/10 border border-primary/20">
            <div className="flex items-center gap-3">
              <FileText className="h-5 w-5 text-primary" />
              <div>
                <p className="text-2xl font-bold">{papers.length}</p>
                <p className="text-sm text-muted-foreground">Papers Uploaded</p>
              </div>
            </div>
          </div>
          <div className="p-4 rounded-xl bg-secondary border border-border">
            <div className="flex items-center gap-3">
              <Download className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-2xl font-bold">{totalDownloads}</p>
                <p className="text-sm text-muted-foreground">Total Downloads</p>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : error ? (
          <div className="text-center py-16 text-destructive">
            <p>Error loading papers: {error}</p>
          </div>
        ) : papers.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
              <FileText className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold mb-2">No uploads yet</h3>
            <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
              Help fellow students by sharing previous year question papers
            </p>
            <Button asChild>
              <Link to="/upload">
                <Upload className="h-4 w-4 mr-2" />
                Upload Your First Paper
              </Link>
            </Button>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {papers.map((paper) => (
              <PaperCard key={paper.id} paper={paper} showDelete={true} />
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
