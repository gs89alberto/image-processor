import { ProcessedImageDto } from 'common/src/dtos';
import { ImageEntity } from '../entities/Image';

export interface IImageRepository {
  saveImages(images: Partial<ImageEntity>[]): Promise<ProcessedImageDto>;
}
