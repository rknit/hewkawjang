import { User } from '../service/user.service';
import jwt from 'jsonwebtoken';

const access_token_secret = process.env.ACCESS_TOKEN_SECRET;
const refresh_token_secret = process.env.REFRESH_TOKEN_SECRET;

if (!access_token_secret) {
  throw new Error('ACCESS_TOKEN_SECRET is not defined');
}

if (!refresh_token_secret) {
  throw new Error('REFRESH_TOKEN_SECRET is not defined');
}

export type JwtPayload = {
  userEmail: string;
  userId: number;
};

export type JwtTokens = {
  access_token: string;
  refresh_token: string;
};

export function genJwtTokens(user: User): JwtTokens {
  const access_token = genJwtAccessToken(user);
  const refresh_token = genJwtRefreshToken(user);
  return { access_token, refresh_token };
}

export function genJwtAccessToken(user: User): string {
  let payload: JwtPayload = { userEmail: user.email, userId: user.id };
  return jwt.sign(payload, access_token_secret!, {
    expiresIn: '1m',
    algorithm: 'HS256',
  });
}

export function genJwtRefreshToken(user: User): string {
  let payload: JwtPayload = { userEmail: user.email, userId: user.id };
  return jwt.sign(payload, refresh_token_secret!, {
    expiresIn: '1d',
    algorithm: 'HS256',
  });
}
