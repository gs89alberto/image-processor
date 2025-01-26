import mongoose, { Schema, Document } from 'mongoose';

export interface IImage extends Document {
  resolution: string;
  path: string;
  md5: string;
  createdAt?: Date;
}

const ImageSchema = new Schema<IImage>(
  {
    resolution: { type: String, required: true },
    path: { type: String, required: true },
    md5: { type: String },
  },
  {
    timestamps: true,
  }
);

export const ImageModel = mongoose.model<IImage>('Image', ImageSchema);
