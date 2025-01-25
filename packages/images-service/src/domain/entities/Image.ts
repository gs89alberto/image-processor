/**
 * Represents a processed image entity.
 */
export class ImageEntity {
  constructor(public id: string, public md5: string, public resolution: number, public path: string) {}
}
