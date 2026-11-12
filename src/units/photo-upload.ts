import {
  BadRequestException,
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, catchError, throwError } from 'rxjs';
import { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface.js';
import { diskStorage } from 'multer';
import { randomUUID } from 'crypto';
import * as fs from 'fs';
import { join } from 'path';

export const UPLOADS_DIR = join(process.cwd(), 'uploads');
export const MAX_PHOTO_BYTES = 5 * 1024 * 1024;
export const MAX_PHOTOS_PER_REQUEST = 10;

// The stored extension comes from this map, never from the client's filename,
// so /uploads can only ever serve these three content types.
const EXTENSION_BY_MIME: Record<string, string> = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
};

export const photoUploadOptions: MulterOptions = {
  storage: diskStorage({
    destination: UPLOADS_DIR,
    filename: (_req, file, cb) => {
      cb(null, `${randomUUID()}${EXTENSION_BY_MIME[file.mimetype]}`);
    },
  }),
  limits: {
    fileSize: MAX_PHOTO_BYTES,
    files: MAX_PHOTOS_PER_REQUEST,
  },
  fileFilter: (_req, file, cb) => {
    if (!EXTENSION_BY_MIME[file.mimetype]) {
      cb(
        new BadRequestException(
          `"${file.originalname}" is not a JPEG, PNG or WebP image`,
        ),
        false,
      );
      return;
    }
    cb(null, true);
  },
};

// The MIME type above is whatever the client claimed, so check the file's
// actual first bytes once it's on disk.
function hasImageSignature(filePath: string): boolean {
  const header = Buffer.alloc(12);
  const fd = fs.openSync(filePath, 'r');
  try {
    fs.readSync(fd, header, 0, header.length, 0);
  } finally {
    fs.closeSync(fd);
  }

  const isJpeg = header[0] === 0xff && header[1] === 0xd8 && header[2] === 0xff;
  const isPng = header
    .subarray(0, 8)
    .equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]));
  const isWebp =
    header.toString('ascii', 0, 4) === 'RIFF' &&
    header.toString('ascii', 8, 12) === 'WEBP';
  return isJpeg || isPng || isWebp;
}

export function assertImageFiles(files: Express.Multer.File[]) {
  const invalid = files.find((file) => !hasImageSignature(file.path));
  if (invalid) {
    throw new BadRequestException(
      `"${invalid.originalname}" is not a valid image file`,
    );
  }
}

export function deleteUploadedFiles(files: Express.Multer.File[]) {
  for (const file of files) {
    fs.rmSync(file.path, { force: true });
  }
}

// Multer writes files to disk before validation and the handler run, so any
// later failure (a 400 from the ValidationPipe, a 404, a database error)
// would leave orphans in /uploads. List this after FilesInterceptor.
@Injectable()
export class DeleteUploadsOnError implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    return next.handle().pipe(
      catchError((error: unknown) => {
        const { files } = context
          .switchToHttp()
          .getRequest<{ files?: Express.Multer.File[] }>();
        if (Array.isArray(files)) {
          deleteUploadedFiles(files);
        }
        return throwError(() => error);
      }),
    );
  }
}
