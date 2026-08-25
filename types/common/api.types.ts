export interface ApiError {
  message?: string;
  statusCode?: number;
  timestamp?: number;
}

export interface PageResponse<T> {
  content: T[];
  page: {
    totalElements: number;
    totalPages: number;
    size: number;
    number: number;
    first: boolean;
    last: boolean;
  };
}
