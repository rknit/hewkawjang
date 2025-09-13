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

export type JwtTokens = {
  accessToken: string;
  refreshToken: string;
};

export function genJwtTokens(payload: any): JwtTokens {
  const accessToken = genJwtAccessToken(payload);
  const refreshToken = genJwtRefreshToken(payload);
  return { accessToken, refreshToken };
}

function genJwtAccessToken(payload: any): string {
  return jwt.sign(payload, ACCESS_TOKEN_SECRET, {
    expiresIn: '1d', //temporary
    algorithm: 'HS512',
  });
}

function genJwtRefreshToken(payload: any): string {
  return jwt.sign(payload, REFRESH_TOKEN_SECRET, {
    expiresIn: '1d',
    algorithm: 'HS512',
  });
}
