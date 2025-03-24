import { RefreshToken } from '@/decorators/auth/refresh-token.decorator';
import { ApiEndpoint } from '@/decorators/endpoint.decorator';
import { Payload } from '@/decorators/jwt-payload.decorator';
import { JwtPayload, RefreshPayload } from '@/types/auth.type';
import { Body, Controller, Get, Post, Query, Res } from '@nestjs/common';
import { ApiExcludeEndpoint } from '@nestjs/swagger';
import { Response } from 'express';
import {
  ChangePasswordDto,
  LoginDto,
  LoginResDto,
  RefreshResDto,
  RegisterDto,
} from './auth.dto';
import { AuthService } from './auth.service';

@Controller({ path: 'auth', version: '1' })
export class AuthController {
  constructor(private authService: AuthService) {}

  @ApiEndpoint({
    isPublic: true,
    summary: 'register a new account using Google',
  })
  @Get('google')
  googleRedirect(@Res() res: Response) {
    return this.authService.googleRedirect(res);
  }

  @ApiEndpoint({
    isPublic: true,
  })
  @Get('google/callback')
  async googleLogin(@Query('code') code: string, @Res() res: Response) {
    return await this.authService.googleLogin(code, res);
  }

  @ApiEndpoint({
    isPublic: true,
    summary: 'register a new account',
  })
  @Post('register')
  async register(@Body() dto: RegisterDto): Promise<void> {
    await this.authService.register(dto);
  }

  @ApiEndpoint({
    isPublic: true,
    summary: 'login',
    type: LoginResDto,
  })
  @Post('login')
  async login(@Body() dto: LoginDto): Promise<LoginResDto> {
    return await this.authService.login(dto);
  }

  @ApiEndpoint({ summary: 'logout' })
  @Post('logout')
  async logout(@Payload() payload: JwtPayload) {
    return await this.authService.logout(payload);
  }

  @RefreshToken()
  @ApiEndpoint({ summary: 'get new access token', type: RefreshResDto })
  @Post('refresh-token')
  async refreshToken(
    @Payload() payload: RefreshPayload,
  ): Promise<RefreshResDto> {
    return await this.authService.refreshToken(payload);
  }

  @ApiEndpoint()
  @Post('change-password')
  async changePassword(
    @Payload() { userId }: JwtPayload,
    @Body() dto: ChangePasswordDto,
  ) {
    return await this.authService.changePassword(userId, dto);
  }

  // TODO: auth api
  @ApiExcludeEndpoint()
  @Post('forgot-password')
  async forgotPassword() {
    return 'forgot-password';
  }

  @ApiExcludeEndpoint()
  @Post('verify/forgot-password')
  async verifyForgotPassword() {
    return 'verify-forgot-password';
  }

  @ApiExcludeEndpoint()
  @Get('verify/email')
  async verifyEmail() {
    return 'verify-email';
  }

  @ApiExcludeEndpoint()
  @Post('verify/email/resend')
  async resendVerifyEmail() {
    return 'resend-verify-email';
  }
}
