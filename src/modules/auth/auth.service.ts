import { AppEnvVariables } from '@/configs/app.config';
import { AuthEnvVariables } from '@/configs/auth.config';
import { GoogleEnvVariables } from '@/configs/google.config';
import { JwtPayload, RefreshPayload } from '@/types/auth.type';
import { Milliseconds, Seconds, UUID } from '@/types/branded.type';
import { GoogleJwtPayload, GoogleTokenResponse } from '@/types/google.type';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import {
  BadRequestException,
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
import { Response } from 'express';
import ms from 'ms';
import { nanoid } from 'nanoid';
import { SessionEntity } from '../user/entities/session.entity';
import { UserEntity } from '../user/entities/user.entity';
import { ChangePasswordDto, LoginDto, RegisterDto } from './auth.dto';

@Injectable()
export class AuthService {
  private logger = new Logger(AuthService.name);

  constructor(
    private appConfig: ConfigService<AppEnvVariables>,
    private configService: ConfigService<AuthEnvVariables>,
    private googleConfig: ConfigService<GoogleEnvVariables>,
    private jwtService: JwtService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  googleRedirect(res: Response) {
    const options = {
      redirect_uri: this.googleConfig.get('GOOGLE_REDIRECT_URI', {
        infer: true,
      }),
      client_id: this.googleConfig.get('GOOGLE_CLIENT_ID', { infer: true }),
      response_type: 'code',
      scope: 'profile email',
      prompt: 'select_account',
    };

    const searchParams = new URLSearchParams(options);

    res.redirect(
      'https://accounts.google.com/o/oauth2/v2/auth?' + searchParams.toString(),
    );
  }

  async googleLogin(code: string, res: Response) {
    const searchParams = new URLSearchParams({
      code,
      client_id: this.googleConfig.get('GOOGLE_CLIENT_ID'),
      client_secret: this.googleConfig.get('GOOGLE_CLIENT_SECRET'),
      redirect_uri: this.googleConfig.get('GOOGLE_REDIRECT_URI'),
      grant_type: 'authorization_code',
    });

    const response = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: searchParams.toString(),
    });

    const data = (await response.json()) as GoogleTokenResponse;

    const { given_name, family_name, email, email_verified, picture } =
      this.jwtService.decode(data.id_token) as GoogleJwtPayload;

    const found = await UserEntity.findOneBy({ email });
    if (found) {
      const returnSearchParams = new URLSearchParams(
        await this.createTokenPair(found),
      );

      return res.redirect(
        `${this.appConfig.get('APP_HOST', { infer: true })}/login?${returnSearchParams.toString()}`,
      );
    }

    const user = await UserEntity.save(
      new UserEntity({
        username: this.getUniqueUsername(given_name, family_name),
        email,
        isEmailVerified: email_verified,
        avatar: picture,
        password: null,
        bio: null,
      }),
    );

    const returnSearchParams = new URLSearchParams(
      await this.createTokenPair(user),
    );

    return res.redirect(
      `${this.appConfig.get('APP_HOST', { infer: true })}/login?${returnSearchParams.toString()}`,
    );
  }

  async register(dto: RegisterDto) {
    const { username, email, password, confirmPassword } = dto;
    const user = await UserEntity.findOne({
      where: [{ username }, { email }],
    });
    if (user) throw new BadRequestException('username or email already exists');
    if (password !== confirmPassword)
      throw new BadRequestException('passwords do not match');

    await UserEntity.save(
      new UserEntity({
        username,
        email,
        password: await argon2.hash(password),
      }),
    );
  }

  async login(dto: LoginDto) {
    const { email, password } = dto;
    const user = await UserEntity.findOne({
      where: { email },
    });

    const isValid =
      user && (await this.verifyPassword(user.password, password));
    if (!isValid) throw new BadRequestException('invalid credentials');

    return await this.createTokenPair(user);
  }

  async logout(payload: JwtPayload) {
    const { sessionId, exp, userId } = payload;
    const ttl = (exp * 1000 - Date.now()) as Milliseconds;
    await this.cacheManager.set<boolean>(
      `SESSION_BLACKLIST:${userId}:${sessionId}`,
      true,
      ttl,
    );

    const found = await SessionEntity.findOneByOrFail({ id: sessionId });
    await SessionEntity.remove(found);
  }

  async refreshToken({ sessionId, signature, userId }: RefreshPayload) {
    const session = await SessionEntity.findOne({
      where: { id: sessionId },
      relations: { user: true },
    });

    if (!session) throw new UnauthorizedException();
    if (session.signature !== signature) {
      const sessions = await SessionEntity.findBy({
        user: { id: userId },
      });
      await SessionEntity.remove(sessions);
      throw new UnauthorizedException();
    }

    const newSignature = this.createSignature();

    const payload: JwtPayload = {
      userId: session.user.id,
      sessionId,
      role: session.user.role,
    };

    await SessionEntity.update(session.id, { signature: newSignature });

    const refreshTokenExpiresIn = Math.floor(
      (session.expiresAt.getTime() - Date.now()) / 1000,
    ) as Seconds;

    const [accessToken, refreshToken] = await Promise.all([
      this.createAccessToken(payload),
      this.createRefreshToken(
        {
          ...payload,
          signature: newSignature,
        } satisfies RefreshPayload,
        refreshTokenExpiresIn,
      ),
    ]);

    return { accessToken, refreshToken };
  }

  async changePassword(userId: UUID, dto: ChangePasswordDto) {
    const { oldPassword, newPassword, confirmPassword } = dto;
    if (newPassword !== confirmPassword)
      throw new BadRequestException('passwords do not match');

    const user = await UserEntity.findOneByOrFail({ id: userId });
    const isValid = await this.verifyPassword(user.password, oldPassword);
    if (!isValid) throw new UnauthorizedException();

    await UserEntity.update(user.id, {
      password: await argon2.hash(newPassword),
    });
  }

  async verifyAccessToken(accessToken: string): Promise<JwtPayload> {
    let payload: JwtPayload;
    try {
      payload = await this.jwtService.verifyAsync(accessToken, {
        secret: this.configService.get('AUTH_JWT_SECRET', { infer: true }),
      });
    } catch (error) {
      this.logger.error(error);
      throw new UnauthorizedException('invalid token');
    }

    const { userId, sessionId } = payload;
    const isInBlacklist = await this.cacheManager.get<boolean>(
      `SESSION_BLACKLIST:${userId}:${sessionId}`,
    );

    if (isInBlacklist) {
      const sessions = await SessionEntity.findBy({
        user: { id: userId },
      });
      await SessionEntity.remove(sessions);
      throw new UnauthorizedException();
    }

    return payload;
  }

  async verifyRefreshToken(refreshToken: string): Promise<RefreshPayload> {
    let payload: RefreshPayload;
    try {
      payload = await this.jwtService.verifyAsync(refreshToken, {
        secret: this.configService.get('AUTH_REFRESH_SECRET', { infer: true }),
      });
    } catch (error) {
      this.logger.error(error);
      throw new UnauthorizedException('session expired');
    }

    return payload;
  }

  private async createAccessToken(payload: JwtPayload): Promise<string> {
    const expiresIn = this.configService.get('AUTH_JWT_TOKEN_EXPIRES_IN', {
      infer: true,
    });

    return await this.jwtService.signAsync(payload, {
      secret: this.configService.get('AUTH_JWT_SECRET', { infer: true }),
      expiresIn: (ms(expiresIn) / 1000) as Seconds,
    });
  }

  private async createRefreshToken(
    payload: RefreshPayload,
    expiresIn: Seconds,
  ): Promise<string> {
    return await this.jwtService.signAsync(payload, {
      secret: this.configService.get('AUTH_REFRESH_SECRET', { infer: true }),
      expiresIn,
    });
  }

  private async createTokenPair(user: UserEntity) {
    const sessionExpiresIn = this.configService.get(
      'AUTH_REFRESH_TOKEN_EXPIRES_IN',
      { infer: true },
    );

    const signature = this.createSignature();
    const session = await SessionEntity.save(
      new SessionEntity({
        signature,
        user,
        expiresAt: new Date(Date.now() + ms(sessionExpiresIn)),
        createdBy: user.id,
      }),
    );

    const payload: JwtPayload = {
      userId: user.id,
      sessionId: session.id,
      role: user.role,
    };

    const refreshTokenExpiresIn = (ms(sessionExpiresIn) / 1000) as Seconds;

    const [accessToken, refreshToken] = await Promise.all([
      this.createAccessToken(payload),
      this.createRefreshToken(
        {
          ...payload,
          signature,
        } satisfies RefreshPayload,
        refreshTokenExpiresIn,
      ),
    ]);

    return { accessToken, refreshToken };
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

  private getUniqueUsername(givenName: string, familyName: string) {
    const rawGoogleUsername = givenName + familyName;
    const baseUsername = rawGoogleUsername
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/\s+/g, '');
    const randomSuffix = nanoid(6);
    return `${baseUsername}${randomSuffix}`;
  }
}
