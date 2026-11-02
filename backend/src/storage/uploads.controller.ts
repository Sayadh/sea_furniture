import { BadRequestException, Controller, Post, Query, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBody, ApiConsumes, ApiQuery } from '@nestjs/swagger';
import { memoryStorage } from 'multer';
import { AdminOnly } from '../common/decorators/admin.decorator';
import { imageFileFilter, MAX_IMAGE_BYTES } from './image-processing';
import { StorageService, UPLOAD_FOLDERS, UploadFolder } from './storage.service';

@AdminOnly('uploads')
@Controller('admin/uploads')
export class UploadsController {
  constructor(private readonly storage: StorageService) {}

  @Post()
  @ApiConsumes('multipart/form-data')
  @ApiQuery({ name: 'folder', enum: UPLOAD_FOLDERS })
  @ApiBody({ schema: { type: 'object', properties: { file: { type: 'string', format: 'binary' } } } })
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: { fileSize: MAX_IMAGE_BYTES, files: 1 },
      fileFilter: imageFileFilter,
    }),
  )
  async upload(@UploadedFile() file: Express.Multer.File | undefined, @Query('folder') folder: string) {
    if (!file) throw new BadRequestException('Ընտրեք նկար');
    if (!UPLOAD_FOLDERS.includes(folder as UploadFolder)) throw new BadRequestException('Անթույլատրելի թղթապանակ');
    return this.storage.uploadImage(file, folder as UploadFolder);
  }
}
