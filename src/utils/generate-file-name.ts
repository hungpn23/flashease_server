import crypto from 'crypto';

export const createUniqueFileName = (bytes: number = 32) => {
  return crypto.randomBytes(bytes).toString('hex');
};
