import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  Request,
  UseGuards,
  UseInterceptors,
  UploadedFiles,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { UnitsService } from './units.service.js';
import {
  DeleteUploadsOnError,
  MAX_PHOTOS_PER_REQUEST,
  photoUploadOptions,
} from './photo-upload.js';
import { CreateUnitDto } from './dto/create-unit.dto.js';
import { UpdateUnitDto } from './dto/update-unit.dto.js';
import { Public } from '../auth/decorators/index.js';
import { Roles } from '../auth/decorators/index.js';
import { RolesGuard } from '../auth/guards/index.js';

@Controller('units')
export class UnitsController {
  constructor(private unitsService: UnitsService) {}

  @Public()
  @Get()
  async findAll(@Query('status') status?: string) {
    return this.unitsService.findAll(status);
  }

  @Get('my-unit')
  async findMyUnit(@Request() req: any) {
    return this.unitsService.getMyUnit(req.user.id);
  }

  @Public()
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.unitsService.findOne(id);
  }

  // Accepts JSON, or multipart with optional `photos`, so a unit and its
  // photos are created together or not at all.
  @Post()
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  @UseInterceptors(
    FilesInterceptor('photos', MAX_PHOTOS_PER_REQUEST, photoUploadOptions),
    DeleteUploadsOnError,
  )
  async create(
    @Body() createUnitDto: CreateUnitDto,
    @UploadedFiles() files: Express.Multer.File[] = [],
  ) {
    return this.unitsService.create(createUnitDto, files);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  async update(@Param('id') id: string, @Body() updateUnitDto: UpdateUnitDto) {
    return this.unitsService.update(id, updateUnitDto);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  async remove(@Param('id') id: string) {
    return this.unitsService.remove(id);
  }

  @Post(':id/photos')
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  @UseInterceptors(
    FilesInterceptor('photos', MAX_PHOTOS_PER_REQUEST, photoUploadOptions),
    DeleteUploadsOnError,
  )
  async uploadPhotos(
    @Param('id') id: string,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    return this.unitsService.addPhotos(id, files);
  }

  @Delete(':id/photos/:photoId')
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  async removePhoto(
    @Param('id') id: string,
    @Param('photoId') photoId: string,
  ) {
    return this.unitsService.removePhoto(id, photoId);
  }
}
