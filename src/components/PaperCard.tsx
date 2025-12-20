import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Download, Eye, Calendar, User, TrendingUp, Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Paper } from "@/hooks/usePapers";
import { deletePaper, incrementDownload } from "@/hooks/usePapers";
import { getCourseName, getBranchName } from "@/lib/data";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface PaperCardProps {
  paper: Paper;
  onDownload?: (paper: Paper) => void;
  showDelete?: boolean;
}

export function PaperCard({ paper, onDownload, showDelete = false }: PaperCardProps) {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Check if current user is the uploader
  const isUploader = profile?.id === paper.uploaded_by;

  const handleView = () => {
    // Navigate to paper viewer page (no download increment on view)
    navigate(`/paper/${paper.id}`);
  };

  const handleDownload = () => {
    incrementDownload(paper.id);
    const link = document.createElement("a");
    link.href = paper.file_url;
    link.download = paper.file_name;
    link.target = "_blank";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    onDownload?.(paper);
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deletePaper(paper.id);
      toast.success("Paper deleted successfully");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to delete paper");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="group bg-card rounded-xl border border-border p-5 shadow-card hover:shadow-card-hover transition-all duration-300 hover:-translate-y-1">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          {/* Subject Name */}
          <h3 className="font-semibold text-foreground truncate group-hover:text-primary transition-colors">
            {paper.subject}
          </h3>
          
          {/* Course & Year Badge */}
          <div className="flex items-center gap-2 mt-2 flex-wrap">
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

          {/* Meta Info */}
          <div className="flex flex-wrap items-center gap-4 mt-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <User className="h-3 w-3" />
              {paper.uploader_name}
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {new Date(paper.created_at).toLocaleDateString()}
            </span>
            <span className="flex items-center gap-1">
              <TrendingUp className="h-3 w-3" />
              {paper.downloads} downloads
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-2">
          <Button size="sm" variant="outline" className="gap-1.5" onClick={handleView}>
            <Eye className="h-3.5 w-3.5" />
            View
          </Button>
          <Button size="sm" variant="default" className="gap-1.5" onClick={handleDownload}>
            <Download className="h-3.5 w-3.5" />
            Download
          </Button>
          {showDelete && isUploader && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button size="sm" variant="destructive" className="gap-1.5" disabled={isDeleting}>
                  {isDeleting ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Trash2 className="h-3.5 w-3.5" />
                  )}
                  Delete
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Paper?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete "{paper.subject}"? This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      </div>
    </div>
  );
}