import { AuthService } from '@/modules/auth/auth.service';
import { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request as ExpressRequest } from 'express';
import { AuthGuard } from './auth.guard';

describe('AuthGuard', () => {
  let authGuard: AuthGuard;
  let reflector: Reflector;
  let authService: AuthService;

  beforeEach(() => {
    reflector = new Reflector();
    authService = {
      verifyAccessToken: jest.fn(),
      verifyRefreshToken: jest.fn(),
    } as any;
    authGuard = new AuthGuard(reflector, authService);
  });

  it('should allow access if the route is public', async () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(true);

    const context = {
      switchToHttp: () => ({
        getRequest: () => ({}) as ExpressRequest,
      }),
      getClass: jest.fn(),
      getHandler: jest.fn(),
    } as any as ExecutionContext;

    const result = await authGuard.canActivate(context);
    expect(result).toBe(true);
  });

  it('should verify refresh token if isRefreshToken is true', async () => {
    jest
      .spyOn(reflector, 'getAllAndOverride')
      .mockReturnValueOnce(false)
      .mockReturnValueOnce(true);
    const request = {
      headers: { authorization: 'Bearer refreshToken' },
    } as ExpressRequest;
    const context = {
      switchToHttp: () => ({
        getRequest: () => request,
      }),
      getClass: jest.fn(),
      getHandler: jest.fn(),
    } as any as ExecutionContext;

    (authService.verifyRefreshToken as jest.Mock).mockReturnValue({
      userId: 1,
    });

    const result = await authGuard.canActivate(context);
    expect(result).toBe(true);
    expect(request['user']).toEqual({ userId: 1 });
    expect(authService.verifyRefreshToken).toHaveBeenCalledWith('refreshToken');
  });

  it('should verify access token if isRefreshToken is false', async () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(false);
    const request = {
      headers: { authorization: 'Bearer accessToken' },
    } as ExpressRequest;
    const context = {
      switchToHttp: () => ({
        getRequest: () => request,
      }),
      getClass: jest.fn(),
      getHandler: jest.fn(),
    } as any as ExecutionContext;

    (authService.verifyAccessToken as jest.Mock).mockResolvedValue({
      userId: 1,
    });

    const result = await authGuard.canActivate(context);
    expect(result).toBe(true);
    expect(request['user']).toEqual({ userId: 1 });
    expect(authService.verifyAccessToken).toHaveBeenCalledWith('accessToken');
  });

  it('should return undefined token if authorization header is not Bearer', () => {
    const request = {
      headers: { authorization: 'Basic token' },
    } as ExpressRequest;
    const token = authGuard['extractTokenFromHeader'](request);
    expect(token).toBe('');
  });

  it('should return undefined token if authorization header is missing', () => {
    const request = { headers: {} } as ExpressRequest;
    const token = authGuard['extractTokenFromHeader'](request);
    expect(token).toBe('');
  });
});
