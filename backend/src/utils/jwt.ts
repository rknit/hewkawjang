import jwt from 'jsonwebtoken';

if (!process.env.ACCESS_TOKEN_SECRET || !process.env.REFRESH_TOKEN_SECRET) {
  throw new Error('JWT secrets must be defined in environment variables');
}

export const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET;
export const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET;

// Extend Express Request interface to include authPayload and authRefreshToken
declare global {
  namespace Express {
    interface Request {
      authPayload?: JwtPayload;
      authRefreshToken?: string;
    }
  }
}

export type JwtPayload = {
  userEmail: string;
  userId: number;
};

export type JwtTokens = {
  access_token: string;
  refresh_token: string;
};

export function genJwtTokens(payload: JwtPayload): JwtTokens {
  const access_token = genJwtAccessToken(payload);
  const refresh_token = genJwtRefreshToken(payload);
  return { access_token, refresh_token };
}

export function genJwtAccessToken(payload: JwtPayload): string {
  return jwt.sign(payload, ACCESS_TOKEN_SECRET, {
    expiresIn: '1m',
    algorithm: 'HS256',
  });
}

export function genJwtRefreshToken(payload: JwtPayload): string {
  return jwt.sign(payload, REFRESH_TOKEN_SECRET, {
    expiresIn: '1d',
    algorithm: 'HS256',
  });
}
