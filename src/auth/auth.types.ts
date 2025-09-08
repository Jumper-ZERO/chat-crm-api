export type JwtPayload = {
  sub: string;
  username: string;
  role: string;
};

export interface AuthUser {
  id: string;
  username: string;
  role: string;
  businessId?: string
}

export interface AuthRequest {
  user?: AuthUser;
}