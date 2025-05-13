
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { File, Trash2 } from "lucide-react";
import { Document } from "@/types/document";
import { formatDistanceToNow } from "date-fns";

interface DocumentCardProps {
  document: Document;
  onDelete: (id: string) => void;
  onSelect: (id: string) => void;
}

export function DocumentCard({ document, onDelete, onSelect }: DocumentCardProps) {
  return (
    <Card className="overflow-hidden transition-all hover:shadow-md">
      <CardHeader className="p-4 pb-2">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <File className="h-4 w-4 text-primary" />
            <CardTitle className="text-base truncate" title={document.title}>
              {document.title}
            </CardTitle>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-2 pb-2 text-sm text-muted-foreground">
        <p className="line-clamp-2">{document.description || "No description available"}</p>
      </CardContent>
      <CardFooter className="flex items-center justify-between p-4 pt-2">
        <span className="text-xs text-muted-foreground">
          {formatDistanceToNow(new Date(document.createdAt), { addSuffix: true })}
        </span>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => onDelete(document.id)}>
            <Trash2 className="h-3.5 w-3.5" />
            <span className="sr-only">Delete</span>
          </Button>
          <Button size="sm" onClick={() => onSelect(document.id)}>
            Query
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
