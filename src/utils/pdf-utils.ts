import * as pdfjsLib from 'pdfjs-dist';

// Set the PDF.js worker source
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

export async function extractPdfText(file: File): Promise<{ contents: string[], pages: number }> {
  const arrayBuffer = await file.arrayBuffer();
  const pdfData = new Uint8Array(arrayBuffer);
  
  // Load the PDF document using PDF.js
  const loadingTask = pdfjsLib.getDocument({ data: pdfData });
  const pdf = await loadingTask.promise;
  
  const numPages = pdf.numPages;
  const contents: string[] = [];
  
  // Extract text from each page
  for (let i = 1; i <= numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    const pageText = textContent.items
      .map((item: any) => item.str)
      .join(' ');
    
    contents.push(pageText);
  }
  
  return { contents, pages: numPages };
}
