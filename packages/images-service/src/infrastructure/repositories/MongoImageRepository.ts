import { IImageRepository } from '../../domain/repositories/IImageRepository';
import { ImageEntity } from '../../domain/entities/Image';
import { ImageModel } from './ImageModel';
import { ProcessedImageDto } from 'common/src/dtos';

export class MongoImageRepository implements IImageRepository {
  async saveImages(images: Partial<ImageEntity>[]): Promise<ProcessedImageDto> {
    const imagesCreated = await ImageModel.insertMany(images);
    return imagesCreated.map((i) => ({ resolution: i.resolution!, path: i.path! }));
  }
}
