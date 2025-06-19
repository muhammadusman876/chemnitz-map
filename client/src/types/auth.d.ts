export interface User {
  id: string;
  email: string;
  username: string;  // Changed from optional to required
  createdAt?: string;
  updatedAt?: string;
  // Add any other user properties your API returns
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  username: string;  // Changed from name to username and made required
}

export interface AuthResponse {
  user: User;
  message?: string;
}

export interface LoginResponse extends AuthResponse {
  // With HTTP-only cookies, you won't get a token in the response
  // Include any other fields your login API returns
}

export interface ErrorResponse {
  message: string;
  errors?: Record<string, string[]>;
  status?: number;
}