import { Download, Eye, Calendar, User, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Paper } from "@/lib/data";

interface PaperCardProps {
  paper: Paper;
}

export function PaperCard({ paper }: PaperCardProps) {
  return (
    <div className="group bg-card rounded-xl border border-border p-5 shadow-card hover:shadow-card-hover transition-all duration-300 hover:-translate-y-1">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          {/* Subject Name */}
          <h3 className="font-semibold text-foreground truncate group-hover:text-primary transition-colors">
            {paper.subjectName}
          </h3>
          
          {/* Course & Year Badge */}
          <div className="flex items-center gap-2 mt-2">
            <Badge variant="secondary" className="text-xs uppercase">
              {paper.course}
              {paper.branch && ` - ${paper.branch}`}
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
              {paper.uploadedBy}
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {new Date(paper.uploadedAt).toLocaleDateString()}
            </span>
            <span className="flex items-center gap-1">
              <TrendingUp className="h-3 w-3" />
              {paper.downloads} downloads
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-2">
          <Button size="sm" variant="outline" className="gap-1.5">
            <Eye className="h-3.5 w-3.5" />
            View
          </Button>
          <Button size="sm" variant="default" className="gap-1.5">
            <Download className="h-3.5 w-3.5" />
            Download
          </Button>
        </div>
      </div>
    </div>
  );
}
