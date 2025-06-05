import { diskStorage } from 'multer';
import { extname } from 'path';
import * as fs from 'fs';

export const storage = diskStorage({
  destination: (req, file, callback) => {
    const uploadPath = './public/img';
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    callback(null, uploadPath);
  },
  filename: (req, file, callback) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    callback(null, `${uniqueSuffix}${extname(file.originalname)}`);
  },
});
