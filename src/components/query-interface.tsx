
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Document } from "@/types/document";
import { Loader2 } from "lucide-react";

interface QueryInterfaceProps {
  selectedDocument: Document | null;
}

interface QueryResult {
  answer: string;
  sources: {
    text: string;
    page: number;
  }[];
}

export function QueryInterface({ selectedDocument }: QueryInterfaceProps) {
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<QueryResult | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!query.trim() || !selectedDocument) return;
    
    setIsLoading(true);
    
    // Simulate API call delay
    setTimeout(() => {
      // Mock response data
      const mockResult: QueryResult = {
        answer: "Based on the document, GPT-4 represents a significant advancement in AI language models. It demonstrates improved capabilities in reasoning, following instructions, and reducing hallucinations compared to previous models. The document highlights that GPT-4 shows enhanced performance across various benchmarks and real-world scenarios, particularly in complex reasoning tasks and creative applications. However, it still has limitations regarding factual accuracy and needs careful human oversight when deployed in critical applications.",
        sources: [
          { 
            text: "GPT-4 shows significant improvements in reasoning capabilities and reduced hallucinations compared to GPT-3.5.", 
            page: 12 
          },
          { 
            text: "The model performs exceptionally well on standardized tests and demonstrates improved instruction following.", 
            page: 14 
          },
          { 
            text: "Despite improvements, GPT-4 still requires careful human supervision for critical applications to ensure factual accuracy.", 
            page: 23 
          }
        ]
      };
      
      setResult(mockResult);
      setIsLoading(false);
    }, 2000);
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
