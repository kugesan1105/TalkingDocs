import { useState, useEffect } from "react";
import { Header } from "@/components/layout/header";
import { FileUploader } from "@/components/file-uploader";
import { DocumentCard } from "@/components/document-card";
import { QueryInterface } from "@/components/query-interface";
import { Document } from "@/types/document";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { ThemeProvider } from "@/components/theme-provider";
// Modern ES module import for worker in PDF.js v5+
import { GlobalWorkerOptions, getDocument } from 'pdfjs-dist';
import worker from 'pdfjs-dist/build/pdf.worker.mjs?worker';

// Attach worker
GlobalWorkerOptions.workerPort = new worker();

const STORAGE_KEY = "uploadedDocuments";


const Index = () => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const { toast } = useToast();

  // Load documents from sessionStorage on mount
  useEffect(() => {
    const stored = sessionStorage.getItem(STORAGE_KEY);
    if (stored) {
      setDocuments(JSON.parse(stored));
    } else {
      // Start with an empty array instead of mock documents
      setDocuments([]);
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify([]));
    }
  }, []);

  // Save documents to sessionStorage whenever they change
  useEffect(() => {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(documents));
  }, [documents]);

  // Helper to extract PDF contents and page count using PDF.js
  const extractPdfContents = async (file: File) => {
    console.log("Extracting PDF contents...");
    console.log("File:", file);
    const arrayBuffer = await file.arrayBuffer();
    console.log("ArrayBuffer:", arrayBuffer);
    const pdf = await getDocument({ data: new Uint8Array(arrayBuffer) }).promise;
    console.log("PDF loaded:", pdf);

    const contents: string[] = [];

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const text = textContent.items.map((item: any) => item.str).join(' ');
      contents.push(text);
    }

    return {
      contents,
      pages: pdf.numPages,
    };
  };

  const handleFileUpload = async (files: File[]) => {
    const newDocuments: Document[] = [];
    for (let index = 0; index < files.length; index++) {
      const file = files[index];
      let contents: string[] = [];
      let pages = 1;
      if (file.type === "application/pdf") {
        try {
          const result = await extractPdfContents(file);
          contents = result.contents;
          pages = result.pages;
        } catch (e) {
          console.error("Failed to parse PDF:", e);
          contents = ["Failed to extract PDF contents. Check console for details."];
          pages = 0;
        }
      } else {
        // For non-PDFs, just read as text
        const text = await file.text();
        contents = [text];
      }
      const doc: Document = {
        id: `doc-${Date.now()}-${index}`,
        title: file.name,
        createdAt: new Date().toISOString(),
        fileSize: file.size,
        pages,
        contents,
        description: undefined,
      };
      newDocuments.push(doc);
      // Print contents to console
      console.log(`Contents of "${file.name}":`, contents);
    }
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

  const handleSearch = (value: string) => {
    setSearchTerm(value.toLowerCase());
  };

  const handleQuerySubmit = async (query: string) => {
    if (!selectedDocument) {
      toast({
        title: "No document selected",
        description: "Please select a document to query.",
      });
      return null;
    }

    try {
      const response = await fetch("http://localhost:8000/query", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          document: selectedDocument,
          query,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch query results");
      }

      const data = await response.json();
      // data: { answer: string, sources: [{ text: string, page: number }] }
      return data;
    } catch (error) {
      console.error("Error during query:", error);
      toast({
        title: "Query Failed",
        description: "An error occurred while processing your query.",
      });
      return null;
    }
  };

  const filteredDocuments = documents.filter(doc =>
    doc.title.toLowerCase().includes(searchTerm) ||
    (doc.description && doc.description.toLowerCase().includes(searchTerm)),
  );

  return (
    <ThemeProvider defaultTheme="system">
      <div className="min-h-screen flex flex-col">
        <Header onSearch={handleSearch} />
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
                  {filteredDocuments.length > 0 && (
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => setSelectedDocument(null)}
                    >
                      Clear Selection
                    </Button>
                  )}
                </div>
                
                {filteredDocuments.length === 0 ? (
                  <div className="text-center py-8 border rounded-lg">
                    <p className="text-muted-foreground">
                      {searchTerm ? "No documents match your search." : "No documents uploaded yet"}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredDocuments.map((document) => (
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
              <QueryInterface 
                selectedDocument={selectedDocument} 
                onQuerySubmit={handleQuerySubmit} 
              />
            </div>
          </div>
        </main>
      </div>
    </ThemeProvider>
  );
};

export default Index;