import crypto from 'crypto';

export const generateFileName = (bytes: number = 32) => {
  return crypto.randomBytes(bytes).toString('hex');
};
