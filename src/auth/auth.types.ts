export type JwtPayload = {
  sub: string;
  username: string;
  role: string;
  companyId: string;
  businessId: string;
};

export type AuthResponse = {
  access_token: string;
  payload: JwtPayload;
}