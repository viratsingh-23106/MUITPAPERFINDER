import { Download, Eye, Calendar, User, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Paper } from "@/hooks/usePapers";
import { getCourseName, getBranchName } from "@/lib/data";

interface PaperCardProps {
  paper: Paper;
  onDownload?: (paper: Paper) => void;
}

export function PaperCard({ paper, onDownload }: PaperCardProps) {
  const handleView = () => {
    window.open(paper.file_url, "_blank");
  };

  const handleDownload = () => {
    // Trigger download
    const link = document.createElement("a");
    link.href = paper.file_url;
    link.download = paper.file_name;
    link.target = "_blank";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    onDownload?.(paper);
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
        </div>
      </div>
    </div>
  );
}
