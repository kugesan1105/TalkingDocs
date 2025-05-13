export interface Document {
  id: string;
  title: string;
  description?: string;
  createdAt: string;
  fileSize: number;
  pages: number;
  contents: string[]; // Array of page contents
}
