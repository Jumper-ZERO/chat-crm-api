export type JwtPayload = {
  sub: string;
  username: string;
  role: string;
  avatar: string | undefined;
  email: string;
  companyId: string;
  businessId: string;
};

export type AuthResponse = {
  access_token: string;
  payload: JwtPayload;
}