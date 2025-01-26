import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import logger from 'common/src/utils/logger';
import { IImageRepository } from '../../domain/repositories/IImageRepository';
import { downloadImage, md5Hash } from 'common/src/utils';
import { DEFAULT_RESOLUTIONS } from 'common/src/constants';
import { ProcessedImageDto } from 'common/src/dtos';
import { ImageEntity } from '../../domain/entities/Image';

export class ImageService {
  constructor(private imageRepo: IImageRepository) {}

  /**
   * Process an image (local or remote), generate variants (1024,800),
   * store them in ../output/... and persist in DB.
   */
  async processTask(originalPath: string): Promise<ProcessedImageDto> {
    const isRemote = this.isRemotePath(originalPath);
    const localPath = await this.getLocalPath(originalPath, isRemote);

    const buffer = fs.readFileSync(localPath);
    const originalName = path.parse(originalPath).name;

    const imagesToSave = await this.generateVariants(buffer, originalName, originalPath);

    if (isRemote) {
      this.cleanupLocalFile(localPath);
    }

    await this.imageRepo.saveImages(imagesToSave);
    return this.mapToDto(imagesToSave);
  }

  private isRemotePath(path: string): boolean {
    return path.startsWith('http://') || path.startsWith('https://');
  }

  private async getLocalPath(originalPath: string, isRemote: boolean): Promise<string> {
    if (isRemote) {
      const localPath = path.join(__dirname, `temp-${Date.now()}.img`);
      await downloadImage(originalPath, localPath);
      return localPath;
    } else {
      if (!fs.existsSync(originalPath)) {
        const errorMessage = `Local file not found: ${originalPath}`;
        logger.error(errorMessage);
        throw new Error(errorMessage);
      }
      return originalPath;
    }
  }

  private async generateVariants(buffer: Buffer, originalName: string, originalPath: string): Promise<Partial<ImageEntity>[]> {
    const imagesToSave: Partial<ImageEntity>[] = [];

    for (const resolution of DEFAULT_RESOLUTIONS) {
      const outputDir = path.join(__dirname, `../../../../../assets/output/${originalName}/${resolution}`);
      fs.mkdirSync(outputDir, { recursive: true });

      const resizedBuffer = await sharp(buffer).resize({ width: resolution }).toBuffer();

      const hash = md5Hash(resizedBuffer);
      const extension = path.extname(originalPath) || '.jpg';
      const outputPath = path.join(outputDir, `${hash}${extension}`);

      fs.writeFileSync(outputPath, resizedBuffer);

      imagesToSave.push({
        md5: hash,
        resolution,
        path: outputPath,
      });
    }

    return imagesToSave;
  }

  private cleanupLocalFile(localPath: string): void {
    if (fs.existsSync(localPath)) {
      fs.unlinkSync(localPath);
    }
  }

  private mapToDto(images: Partial<ImageEntity>[]): ProcessedImageDto {
    return images.map((image) => ({
      resolution: image.resolution!,
      path: image.path!,
    }));
  }
}
