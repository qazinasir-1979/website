export interface Post {
  id?: string;
  title: string;
  slug: string;
  category: string;
  dateStr: string;
  author: string;
  excerpt: string;
  content: string;
  createdAt?: any;
  updatedAt?: any;
}
