import { ResizedImage } from '../types/Images';

export interface TaskResultDto {
  taskId: string;
  status: string;
  price: number;
  images?: ResizedImage[];
  errorReason?: string;
}
