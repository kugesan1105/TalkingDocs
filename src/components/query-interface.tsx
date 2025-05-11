import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Document } from "@/types/document";
import { Loader2 } from "lucide-react";

interface QueryInterfaceProps {
  selectedDocument: Document | null;
  onQuerySubmit: (query: string) => Promise<{ answer: string; sources: { text: string; page: number }[] } | null>;
}

export function QueryInterface({ selectedDocument, onQuerySubmit }: QueryInterfaceProps) {
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<{ answer: string; sources: { text: string; page: number }[] } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim() || !selectedDocument) return;
    setIsLoading(true);
    setResult(null);
    try {
      const res = await onQuerySubmit(query);
      if (res) setResult(res);
    } finally {
      setIsLoading(false);
    }
  };

  if (!selectedDocument) {
    return (
      <Card className="h-full">
        <div className="flex h-full items-center justify-center p-6">
          <div className="text-center">
            <h3 className="text-lg font-medium">No document selected</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Select a document to start querying
            </p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle>{selectedDocument.title}</CardTitle>
        <CardDescription>
          Ask questions about this document to get AI-powered insights
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-2">
            <label htmlFor="query" className="text-sm font-medium">
              Your question
            </label>
            <input
              id="query"
              placeholder="e.g., 'What are the key findings about GPT-4?'"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>
          <Button disabled={isLoading || !query.trim()} type="submit">
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isLoading ? "Processing..." : "Query Document"}
          </Button>
        </form>

        {result && (
          <div className="mt-6 space-y-6">
            <div>
              <h3 className="font-medium mb-2">Answer</h3>
              <div className="rounded-md bg-muted p-4 text-sm">
                {result.answer}
              </div>
            </div>
            <div>
              <h3 className="font-medium mb-2">Sources</h3>
              <div className="space-y-3">
                {result.sources.map((source, index) => (
                  <div key={index} className="rounded-md border p-3 text-sm">
                    <div className="text-muted-foreground mb-1">Page {source.page}</div>
                    <p>"{source.text}"</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
