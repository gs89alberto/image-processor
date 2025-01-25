import mongoose, { Schema, Document } from 'mongoose';
import { TASK_STATUS } from 'common/src/constants';
import { ResizedImage } from 'common/src/types/Images';

interface ITask extends Document {
  status: TASK_STATUS;
  price: number;
  originalPath: string;
  images: ResizedImage[];
  errorReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

const TaskSchema = new Schema<ITask>(
  {
    status: {
      type: String,
      enum: TASK_STATUS,
      default: TASK_STATUS.PENDING,
    },
    price: { type: Number, required: true },
    originalPath: { type: String, required: true },
    images: [{ resolution: Number, path: String, _id: false }],
    errorReason: { type: String },
  },
  {
    timestamps: true,
  }
);

TaskSchema.index({ status: 1 });

export const TaskModel = mongoose.model<ITask>('Task', TaskSchema);
