export type GoogleJwtPayload = {
  /**
   * Issuer Identifier: Định danh của nhà phát hành token (Google).
   */
  iss: string;

  /**
   * Authorized Party: Client ID của ứng dụng yêu cầu token.
   */
  azp: string;

  /**
   * Audience: Client ID của ứng dụng mà token hướng tới.
   */
  aud: string;

  /**
   * Subject: ID duy nhất của người dùng trong hệ thống Google.
   */
  sub: string;

  /**
   * Địa chỉ email của người dùng.
   */
  email: string;

  /**
   * Xác minh email: true nếu email đã được xác minh bởi Google.
   */
  email_verified: boolean;

  /**
   * Access Token Hash: Giá trị băm của access_token (dùng để kiểm tra tính toàn vẹn).
   */
  at_hash: string;

  /**
   * Tên đầy đủ của người dùng.
   */
  name: string;

  /**
   * URL của ảnh đại diện người dùng.
   */
  picture: string;

  /**
   * Tên (given name) của người dùng.
   */
  given_name: string;

  /**
   * Họ (family name) của người dùng.
   */
  family_name: string;

  /**
   * Issued At: Thời gian phát hành token (Unix timestamp).
   */
  iat: number;

  /**
   * Expiration: Thời gian hết hạn của token (Unix timestamp).
   */
  exp: number;
};

export type GoogleTokenResponse = {
  /**
   * Access token dùng để gọi các API của Google.
   */
  access_token: string;

  /**
   * Thời gian sống của access_token (tính bằng giây).
   */
  expires_in: number;

  /**
   * Phạm vi quyền truy cập được cấp cho token.
   */
  scope: string;

  /**
   * Loại token, thường là "Bearer".
   */
  token_type: string;

  /**
   * ID token chứa thông tin người dùng (JWT).
   */
  id_token: string;
};
