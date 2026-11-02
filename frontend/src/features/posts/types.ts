export interface Author {
  id: string;
  username: string;
}
export interface Post {
  id: string;
  title: string;
  content: string;
  author: Author;
  createdAt: string;
  updatedAt: string | null;
}
export interface PageResult<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
export interface PostValues {
  title: string;
  content: string;
}
