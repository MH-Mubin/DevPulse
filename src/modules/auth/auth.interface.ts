export type UserRole = "contributor" | "maintainer";

export interface SignupPayload {
  name: string;
  email: string;
  password: string;
  role?: UserRole;
}

export interface AuthUser {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: AuthUser;
}
