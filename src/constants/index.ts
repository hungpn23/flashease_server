export const IS_PUBLIC = 'isPublic';
export const IS_REFRESH_TOKEN = 'isRefreshToken';
export const NO_CACHE = 'noCache';
export const ROLE_KEY = 'role';

export enum Environment {
  DEVELOPMENT = 'development',
  PRODUCTION = 'production',
}

export enum Role {
  USER = 'user',
  ADMIN = 'admin',
}

export enum AuthError {
  V01 = 'user.validation.empty_input',
  V02 = 'user.validation.invalid_credentials',
  V03 = 'user.validation.email_already_exists',
  V04 = 'user.validation.access_token_expired',
  V05 = 'user.validation.invalid_access_token',
  V06 = 'user.validation.invalid_refresh_token',

  E01 = 'user.error.email_already_exists',
  E02 = 'user.error.user_not_found',
  E03 = 'user.error.blacklist_detected',
}

export enum ApiError {
  Unknown = 'unknown error',
}

export enum Order {
  ASC = 'ASC',
  DESC = 'DESC',
}

export const MAX_FILES_UPLOAD = 5;

export const DEFAULT_CURRENT_PAGE = 1;
export const DEFAULT_PAGE_LIMIT = 10;
