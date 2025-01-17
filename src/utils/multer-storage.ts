import { diskStorage } from 'multer';
import { randomBytes } from 'node:crypto';
import { extname } from 'node:path';

export const multerStorage = (folder: string) =>
  diskStorage({
    destination: `./uploads/${folder}`,
    filename(_req, file, callback) {
      callback(
        null,
        `${Date.now().toString()}-${randomBytes(4).toString('hex')}${extname(file.originalname)}`,
      );
    },
  });
