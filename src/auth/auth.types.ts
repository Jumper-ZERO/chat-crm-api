export type JwtPayload = {
  sub: number;
  username: string;
  role: string;
};

export interface AuthUser {
  id?: number;
  username?: string;
  role?: string;
}

export interface AuthRequest {
  user?: AuthUser;
}