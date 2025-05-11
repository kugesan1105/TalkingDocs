import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Document } from "@/types/document";
import { Loader2, RefreshCw } from "lucide-react";

// Define a type for a single chat entry
interface ChatEntry {
  query: string;
  answer: string;
  sources: { text: string; page: number }[];
  timestamp: string;
}

// Define a type for the chat history map
interface ChatHistoryMap {
  [documentId: string]: ChatEntry[];
}

interface QueryInterfaceProps {
  selectedDocument: Document | null;
  onQuerySubmit: (query: string) => Promise<{ answer: string; sources: { text: string; page: number }[] } | null>;
}

export function QueryInterface({ selectedDocument, onQuerySubmit }: QueryInterfaceProps) {
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  // Chat history for all documents, keyed by document ID
  const [chatHistoryMap, setChatHistoryMap] = useState<ChatHistoryMap>({});

  // Get the chat history for the currently selected document
  const currentChatHistory = selectedDocument 
    ? chatHistoryMap[selectedDocument.id] || [] 
    : [];

  // Reset query when document changes
  useEffect(() => {
    setQuery("");
  }, [selectedDocument?.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim() || !selectedDocument) return;
    setIsLoading(true);
    
    try {
      const res = await onQuerySubmit(query);
      
      if (res) {
        // Create a new chat entry
        const newEntry: ChatEntry = {
          query,
          answer: res.answer,
          sources: res.sources,
          timestamp: new Date().toISOString()
        };
        
        // Update the chat history for the current document
        setChatHistoryMap(prev => {
          const docId = selectedDocument.id;
          const docHistory = prev[docId] || [];
          
          return {
            ...prev,
            [docId]: [...docHistory, newEntry]
          };
        });
        
        // Clear the query input
        setQuery("");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const clearChatHistory = () => {
    if (!selectedDocument) return;
    
    setChatHistoryMap(prev => ({
      ...prev,
      [selectedDocument.id]: []
    }));
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
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>{selectedDocument.title}</CardTitle>
          <CardDescription>
            Ask questions about this document to get AI-powered insights
          </CardDescription>
        </div>
        {currentChatHistory.length > 0 && (
          <Button variant="outline" size="sm" onClick={clearChatHistory}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Clear Chat
          </Button>
        )}
      </CardHeader>
      <CardContent className="flex-1 overflow-y-auto">
        {/* Query form moved to top */}
        <form onSubmit={handleSubmit} className="mb-6 space-y-4 border-b pb-6">
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

        {currentChatHistory.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No queries yet. Ask a question to get started.
          </div>
        ) : (
          <div className="space-y-8">
            {/* Show newest chats first */}
            {[...currentChatHistory].reverse().map((entry, index) => (
              <div key={index} className="space-y-6">
                <div>
                  <h3 className="font-medium mb-2 text-primary">Question</h3>
                  <div className="rounded-md bg-muted p-4 text-sm">
                    {entry.query}
                  </div>
                </div>
                <div>
                  <h3 className="font-medium mb-2">Answer</h3>
                  <div className="rounded-md bg-muted p-4 text-sm">
                    {entry.answer}
                  </div>
                </div>
                <div>
                  <h3 className="font-medium mb-2">Sources</h3>
                  <div className="space-y-3">
                    {entry.sources.map((source, sourceIdx) => (
                      <div key={sourceIdx} className="rounded-md border p-3 text-sm">
                        <div className="text-muted-foreground mb-1">Page {source.page}</div>
                        <p>"{source.text}"</p>
                      </div>
                    ))}
                  </div>
                </div>
                {index < currentChatHistory.length - 1 && (
                  <hr className="my-6 border-t border-dashed" />
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
