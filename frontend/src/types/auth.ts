export type UserRole = "admin" | "engineer" | "viewer";

export interface UserResponse {
  admin_id: string;
  email: string;
  full_name: string;
  role: UserRole;
}

export interface LoginData {
  token: string;
  refreshToken: string;
  user: UserResponse;
}

export interface ApiSuccess<T> {
  success: true;
  data: T;
  pagination?: Pagination;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginatedResponse<T> {
  success: true;
  data: T[];
  pagination: Pagination;
}
