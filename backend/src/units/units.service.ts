import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service.js';
import { assertImageFiles, UPLOADS_DIR } from './photo-upload.js';
import { CreateUnitDto } from './dto/create-unit.dto.js';
import { UpdateUnitDto } from './dto/update-unit.dto.js';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class UnitsService {
  constructor(private prisma: PrismaService) {}

  async findAll(status?: string) {
    const where = status ? { status } : {};
    return this.prisma.unit.findMany({
      where,
      include: {
        photos: true,
        _count: {
          select: { tenants: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getMyUnit(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });
    if (!user || !user.unitId) {
      throw new NotFoundException('No unit assigned');
    }
    return this.findOne(user.unitId);
  }

  async findOne(id: string) {
    const unit = await this.prisma.unit.findUnique({
      where: { id },
      // Served by the public GET /units/:id, so never include tenant details here.
      include: {
        photos: true,
      },
    });

    if (!unit) {
      throw new NotFoundException('Unit not found');
    }

    return unit;
  }

  async create(
    createUnitDto: CreateUnitDto,
    files: Express.Multer.File[] = [],
  ) {
    assertImageFiles(files);

    // One nested write: the unit and its photo rows exist together or not at all.
    return this.prisma.unit.create({
      data: {
        ...createUnitDto,
        photos: {
          create: files.map((file, index) => ({
            filename: file.filename,
            path: `uploads/${file.filename}`,
            isPrimary: index === 0,
          })),
        },
      },
      include: {
        photos: true,
      },
    });
  }

  async update(id: string, updateUnitDto: UpdateUnitDto) {
    const unit = await this.prisma.unit.findUnique({ where: { id } });
    if (!unit) {
      throw new NotFoundException('Unit not found');
    }

    return this.prisma.unit.update({
      where: { id },
      data: updateUnitDto,
      include: {
        photos: true,
      },
    });
  }

  async remove(id: string) {
    const unit = await this.prisma.unit.findUnique({
      where: { id },
      include: {
        photos: true,
        _count: { select: { tenants: true, payments: true } },
      },
    });
    if (!unit) {
      throw new NotFoundException('Unit not found');
    }

    // Tenants and payment history must never disappear as a side effect.
    if (unit._count.tenants > 0) {
      throw new ConflictException(
        `${unit.name} has ${unit._count.tenants} assigned tenant(s). Unassign them before deleting it.`,
      );
    }
    if (unit._count.payments > 0) {
      throw new ConflictException(
        `${unit.name} has ${unit._count.payments} payment record(s) and can't be deleted. Set its status to Maintenance to take it off the market instead.`,
      );
    }

    try {
      // Viewing requests mean nothing without the unit; photos cascade in the schema.
      await this.prisma.$transaction([
        this.prisma.booking.deleteMany({ where: { unitId: id } }),
        this.prisma.unit.delete({ where: { id } }),
      ]);
    } catch (error) {
      // A tenant or payment was added between the check above and the delete.
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2003'
      ) {
        throw new ConflictException(
          `${unit.name} gained a tenant or payment while deleting. Refresh and try again.`,
        );
      }
      throw error;
    }

    // Only touch the disk once the database no longer references the files.
    this.deletePhotoFiles(unit.photos);

    return { message: 'Unit deleted successfully' };
  }

  private deletePhotoFiles(photos: { path: string }[]) {
    for (const photo of photos) {
      // photo.path is "uploads/<file>" (the public URL path); the file itself
      // lives in UPLOADS_DIR, which may be outside the project in production.
      fs.rmSync(path.join(UPLOADS_DIR, path.basename(photo.path)), {
        force: true,
      });
    }
  }

  async addPhotos(unitId: string, files: Express.Multer.File[]) {
    if (!files?.length) {
      throw new BadRequestException('No photos were uploaded');
    }

    // If anything below throws, DeleteUploadsOnError removes the files.
    assertImageFiles(files);

    const unit = await this.prisma.unit.findUnique({
      where: { id: unitId },
    });
    if (!unit) {
      throw new NotFoundException('Unit not found');
    }

    const existingPhotos = await this.prisma.unitPhoto.count({
      where: { unitId },
    });

    return this.prisma.$transaction(
      files.map((file, index) =>
        this.prisma.unitPhoto.create({
          data: {
            unitId,
            filename: file.filename,
            path: `uploads/${file.filename}`,
            isPrimary: existingPhotos === 0 && index === 0,
          },
        }),
      ),
    );
  }

  async removePhoto(unitId: string, photoId: string) {
    const photo = await this.prisma.unitPhoto.findFirst({
      where: { id: photoId, unitId },
    });

    if (!photo) {
      throw new NotFoundException('Photo not found');
    }

    await this.prisma.unitPhoto.delete({ where: { id: photoId } });
    this.deletePhotoFiles([photo]);

    return { message: 'Photo deleted successfully' };
  }
}
