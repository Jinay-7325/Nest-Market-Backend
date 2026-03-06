import { diskStorage } from 'multer';
import { extname } from 'path';
import { BadRequestException } from '@nestjs/common';

export const multerConfig = {
  storage: diskStorage({
    destination: './uploads/products',
    filename: (req, file, callback) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      callback(null, `product-${uniqueSuffix}${extname(file.originalname)}`);
    },
  }),
  fileFilter: (
    req: Express.Request,
    file: Express.Multer.File,
    callback: (error: Error | null, acceptFile: boolean) => void,
  ) => {
    const allowedTypes = /jpeg|jpg|png/;
    const isValid = allowedTypes.test(extname(file.originalname).toLowerCase());
    if (isValid) {
      callback(null, true);
    } else {
      callback(
        new BadRequestException('Only JPG and PNG files are allowed'),
        false,
      );
    }
  },
  limits: { fileSize: 2 * 1024 * 1024 }, // ✅ 2MB
};
