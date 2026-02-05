import { IRefreshTokenRepository, RefreshTokenData } from '../lib/interfaces';
import RefreshToken from '../models/RefreshToken';
import { Op } from 'sequelize';

export class PostgresRefreshTokenRepository implements IRefreshTokenRepository {
  constructor(private readonly _sequelize?: any) {}

  async save(token: RefreshTokenData): Promise<void> {
    await RefreshToken.create({
      id: token.id,
      token: token.token,
      userId: token.userId,
      expiresAt: token.expiresAt,
      createdAt: token.createdAt,
    });
  }

  async findByToken(token: string): Promise<RefreshTokenData | null> {
    const row = await RefreshToken.findOne({ where: { token } }) as any;
    if (!row) return null;
    return {
      id: row.id,
      token: row.token,
      userId: row.userId,
      expiresAt: row.expiresAt,
      createdAt: row.createdAt,
    };
  }

  async deleteByUserId(userId: string): Promise<void> {
    await RefreshToken.destroy({ where: { userId } });
  }

  async deleteByToken(token: string): Promise<void> {
    await RefreshToken.destroy({ where: { token } });
  }

  async deleteExpired(): Promise<void> {
    await RefreshToken.destroy({
      where: {
        expiresAt: { [Op.lt]: new Date() },
      },
    });
  }
}
