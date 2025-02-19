import { AuthEnvVariables } from '@/configs/auth.config';
import { AuthError, Role, SYSTEM } from '@/constants/index';
import { AuthException } from '@/exceptions/auth.exception';
import { JwtPayloadType, JwtRefreshPayloadType } from '@/types/auth.type';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import {
  Inject,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import argon2 from 'argon2';
import { Cache } from 'cache-manager';
import crypto from 'crypto';
import ms from 'ms';
import { SessionEntity } from '../user/entities/session.entity';
import { UserEntity } from '../user/entities/user.entity';
import { AuthReqDto } from './auth.dto';

@Injectable()
export class AuthService {
  private logger = new Logger(AuthService.name);
  constructor(
    private configService: ConfigService<AuthEnvVariables>,
    private jwtService: JwtService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  // *** START ROUTE ***
  async register(dto: AuthReqDto) {
    const { email } = dto;
    const found = await UserEntity.existsBy({ email });
    if (found) throw new AuthException(AuthError.E01);

    dto.password = await argon2.hash(dto.password);

    await UserEntity.save(
      new UserEntity({ ...dto, role: Role.USER, createdBy: SYSTEM }),
    );
  }

  async login(dto: AuthReqDto) {
    const { email, password } = dto;
    const user = await UserEntity.findOne({
      where: { email },
    });

    const isValid =
      user && (await this.verifyPassword(user.password, password));
    if (!isValid) throw new AuthException(AuthError.V02);

    const refreshTokenTtl = this.configService.get(
      'AUTH_REFRESH_TOKEN_EXPIRES_IN',
      { infer: true },
    );

    const signature = this.createSignature();
    const session = await SessionEntity.save(
      new SessionEntity({
        signature,
        user,
        expiresAt: new Date(Date.now() + ms(refreshTokenTtl)),
        createdBy: SYSTEM,
      }),
    );

    const payload: JwtPayloadType = {
      userId: user.id,
      sessionId: session.id,
      role: user.role,
    };

    const [accessToken, refreshToken] = await Promise.all([
      this.createAccessToken(payload),
      this.createRefreshToken({ ...payload, signature }),
    ]);

    return { accessToken, refreshToken };
  }

  async logout(payload: JwtPayloadType) {
    const { sessionId, exp, userId } = payload;
    const key = `SESSION_BLACKLIST:${userId}:${sessionId}`;
    await this.addToBlacklist(key, exp);

    const found = await SessionEntity.findOneByOrFail({ id: sessionId });
    await SessionEntity.remove(found);
  }

  async refreshToken({ sessionId, signature, userId }: JwtRefreshPayloadType) {
    const session = await SessionEntity.findOne({
      where: { id: sessionId },
      relations: { user: true },
    });

    if (!session) throw new UnauthorizedException();
    if (session.signature !== signature) {
      // ** remove all sessions
      const sessions = await SessionEntity.findBy({
        user: { id: userId },
      });
      await SessionEntity.remove(sessions);
      throw new UnauthorizedException(AuthError.E03);
    }

    const newSignature = this.createSignature();

    const payload: JwtPayloadType = {
      userId: session.user.id,
      sessionId,
      role: session.user.role,
    };

    await SessionEntity.update(session.id, { signature: newSignature });

    const [accessToken, refreshToken] = await Promise.all([
      this.createAccessToken(payload),
      this.createRefreshToken({
        ...payload,
        signature: newSignature,
      } satisfies JwtRefreshPayloadType),
    ]);

    return { accessToken, refreshToken };
  }
  // *** END ROUTE ***

  // ======================================================= //

  // *** START GUARD ***
  async verifyAccessToken(accessToken: string): Promise<JwtPayloadType> {
    let payload: JwtPayloadType;
    try {
      payload = await this.jwtService.verifyAsync(accessToken, {
        secret: this.configService.get('AUTH_JWT_SECRET', { infer: true }),
      });
    } catch (error) {
      this.logger.error(error);
      throw new UnauthorizedException('invalid token');
    }

    const { userId, sessionId } = payload;
    const key = `SESSION_BLACKLIST:${userId}:${sessionId}`;
    await this.checkBlacklist(userId, key);

    return payload;
  }

  async verifyRefreshToken(
    refreshToken: string,
  ): Promise<JwtRefreshPayloadType> {
    let payload: JwtRefreshPayloadType;
    try {
      payload = await this.jwtService.verifyAsync(refreshToken, {
        secret: this.configService.get('AUTH_REFRESH_SECRET', { infer: true }),
      });
    } catch (error) {
      this.logger.error(error);
      throw new UnauthorizedException('session expired');
    }

    const { userId, sessionId, signature, exp } = payload;
    const key = `REFRESH_TOKEN_BLACKLIST:${userId}:${sessionId}:${signature}`;
    await this.checkBlacklist(userId, key);
    await this.addToBlacklist(key, exp);

    return payload;
  }
  // *** END GUARD ***

  // ======================================================= //

  // *** START PRIVATE ***
  private async createAccessToken(payload: JwtPayloadType): Promise<string> {
    return await this.jwtService.signAsync(payload, {
      secret: this.configService.get('AUTH_JWT_SECRET', { infer: true }),
      expiresIn: this.configService.get('AUTH_JWT_TOKEN_EXPIRES_IN', {
        infer: true,
      }),
    });
  }

  private async createRefreshToken(
    payload: JwtRefreshPayloadType,
  ): Promise<string> {
    return await this.jwtService.signAsync(payload, {
      secret: this.configService.get('AUTH_REFRESH_SECRET', { infer: true }),
      expiresIn: this.configService.get('AUTH_REFRESH_TOKEN_EXPIRES_IN', {
        infer: true,
      }),
    });
  }

  private async verifyPassword(
    hashed: string,
    plain: string,
  ): Promise<boolean> {
    try {
      return await argon2.verify(hashed, plain);
    } catch (error) {
      console.error(error);
      return false;
    }
  }

  private createSignature() {
    return crypto.randomBytes(16).toString('hex');
  }

  private async checkBlacklist(userId: number, key: string) {
    const isInBlacklist = await this.cacheManager.store.get<boolean>(key);

    if (isInBlacklist) {
      const sessions = await SessionEntity.findBy({
        user: { id: userId },
      });
      await SessionEntity.remove(sessions); // delete all user's sessions
      throw new UnauthorizedException(AuthError.E03);
    }
  }

  private async addToBlacklist(key: string, exp: number) {
    const ttl = exp * 1000 - Date.now(); // remaining time in milliseconds
    await this.cacheManager.store.set<boolean>(key, true, ttl);
  }
  // *** END PRIVATE ***
}
