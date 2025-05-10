
import { useState, useEffect } from "react";
import { Header } from "@/components/layout/header";
import { FileUploader } from "@/components/file-uploader";
import { DocumentCard } from "@/components/document-card";
import { QueryInterface } from "@/components/query-interface";
import { Document } from "@/types/document";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { ThemeProvider } from "@/components/theme-provider";

const Index = () => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const { toast } = useToast();
  
  // Mock data for initial documents
  useEffect(() => {
    // Simulating document fetch
    const mockDocuments: Document[] = [
      {
        id: "1",
        title: "GPT-4 Technical Report.pdf",
        description: "Technical specifications and capabilities of OpenAI's GPT-4 model",
        createdAt: new Date(2023, 2, 15).toISOString(),
        fileSize: 2400000,
        pages: 32
      }
    ];
    
    setDocuments(mockDocuments);
  }, []);

  const handleFileUpload = (files: File[]) => {
    const newDocuments: Document[] = files.map((file, index) => ({
      id: `doc-${Date.now()}-${index}`,
      title: file.name,
      createdAt: new Date().toISOString(),
      fileSize: file.size,
      pages: Math.floor(Math.random() * 20) + 5, // Mock page count
    }));

    setDocuments([...newDocuments, ...documents]);
  };

  const handleDocumentDelete = (id: string) => {
    setDocuments(documents.filter((doc) => doc.id !== id));
    
    if (selectedDocument?.id === id) {
      setSelectedDocument(null);
    }
    
    toast({
      title: "Document deleted",
      description: "The document has been removed successfully",
    });
  };

  const handleDocumentSelect = (id: string) => {
    const document = documents.find((doc) => doc.id === id);
    if (document) {
      setSelectedDocument(document);
    }
  };

  return (
    <ThemeProvider defaultTheme="system">
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 container py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-1 space-y-6">
              <div>
                <h2 className="text-2xl font-bold mb-4">Upload Documents</h2>
                <FileUploader onUpload={handleFileUpload} />
              </div>
              
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-bold">Your Documents</h2>
                  {documents.length > 0 && (
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => setSelectedDocument(null)}
                    >
                      Clear Selection
                    </Button>
                  )}
                </div>
                
                {documents.length === 0 ? (
                  <div className="text-center py-8 border rounded-lg">
                    <p className="text-muted-foreground">No documents uploaded yet</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {documents.map((document) => (
                      <DocumentCard
                        key={document.id}
                        document={document}
                        onDelete={handleDocumentDelete}
                        onSelect={handleDocumentSelect}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
            
            <div className="md:col-span-2">
              <h2 className="text-2xl font-bold mb-4">AI Query Interface</h2>
              <QueryInterface selectedDocument={selectedDocument} />
            </div>
          </div>
        </main>
      </div>
    </ThemeProvider>
  );
};

export default Index;
