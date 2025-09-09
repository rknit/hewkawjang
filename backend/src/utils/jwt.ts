import jwt from 'jsonwebtoken';

if (
  process.env.NODE_ENV !== 'test' &&
  (!process.env.ACCESS_TOKEN_SECRET || !process.env.REFRESH_TOKEN_SECRET)
) {
  throw new Error('JWT secrets must be defined in environment variables');
}

export const ACCESS_TOKEN_SECRET =
  process.env.ACCESS_TOKEN_SECRET ?? 'access_secret';
export const REFRESH_TOKEN_SECRET =
  process.env.REFRESH_TOKEN_SECRET ?? 'refresh_secret';

// Extend Express Request interface to include authPayload and authRefreshToken
declare global {
  namespace Express {
    interface Request {
      authPayload?: any;
      authRefreshToken?: string;
    }
  }
}

export type JwtTokens = {
  access_token: string;
  refresh_token: string;
};

export function genJwtTokens(payload: any): JwtTokens {
  const access_token = genJwtAccessToken(payload);
  const refresh_token = genJwtRefreshToken(payload);
  return { access_token, refresh_token };
}

function genJwtAccessToken(payload: any): string {
  return jwt.sign(payload, ACCESS_TOKEN_SECRET, {
    expiresIn: '15m',
    algorithm: 'HS512',
  });
}

function genJwtRefreshToken(payload: any): string {
  return jwt.sign(payload, REFRESH_TOKEN_SECRET, {
    expiresIn: '1d',
    algorithm: 'HS512',
  });
}
