import jwt from 'jsonwebtoken';
import { ITokenService, TokenPayload, Tokens } from '../lib/interfaces';
import { config } from '../config/env';

export class JWTTokenService implements ITokenService {
  async generateTokens(payload: TokenPayload): Promise<Tokens> {
    const secret = config.jwt.secret;
    
    if (!secret) {
      throw new Error('JWT secret no está configurado');
    }

    const secretBuffer = Buffer.from(secret);

    const accessToken = jwt.sign(
      payload, 
      secretBuffer, 
      {
        expiresIn: config.jwt.accessTokenExpiration,
      }
    );

    const refreshToken = jwt.sign(
      payload, 
      secretBuffer, 
      {
        expiresIn: config.jwt.refreshTokenExpiration,
      }
    );

    return { accessToken, refreshToken };
  }

  private verifyToken(token: string): TokenPayload {
    const secret = config.jwt.secret;
    
    if (!secret) {
      throw new Error('JWT secret no está configurado');
    }

    const secretBuffer = Buffer.from(secret);
    return jwt.verify(token, secretBuffer) as TokenPayload;
  }

  async verifyAccessToken(token: string): Promise<TokenPayload> {
    return this.verifyToken(token);
  }

  async verifyRefreshToken(token: string): Promise<TokenPayload> {
    return this.verifyToken(token);
  }

  generateResetCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }
}
