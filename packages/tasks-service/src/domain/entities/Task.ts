import { TASK_STATUS } from 'common/src/constants';

/**
 * Domain entity representing a Task.
 */
export class Task {
  constructor(
    public id: string,
    public status: string,
    public price: number,
    public originalPath: string,
    public images: { resolution: number; path: string }[],
    public errorReason?: string
  ) {
    this.status = status || TASK_STATUS.PENDING;
    this.images = images || [];
    this.errorReason = errorReason || '';
  }
}
