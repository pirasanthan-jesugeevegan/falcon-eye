// API response and error types
export interface ApiResponse {
  message?: string;
  [key: string]: unknown;
}

export interface ApiError extends Error {
  status?: number;
  code?: string;
  githubApiResponse?: {
    error?: {
      message?: string;
    };
  };
}
