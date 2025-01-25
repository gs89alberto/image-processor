import { body, param } from 'express-validator';
import { validationMiddleware } from 'common/src/middleware/validation.middleware';
import mongoose from 'mongoose';

/**
 * Validate input for creating a new task.
 * - originalPath must be provided.
 * - If it starts with 'http://' or 'https://', treat it as remote URL
 *   (verify it's a valid URL).
 * - Otherwise, assume it's a local path (not empty).
 */
export const createTaskValidation = [
  body('originalPath')
    .notEmpty()
    .withMessage('originalPath is required')
    .bail()
    .custom((value) => {
      const isRemote = value.startsWith('http://') || value.startsWith('https://');
      if (isRemote) {
        try {
          new URL(value);
        } catch (err) {
          throw new Error('Invalid remote URL');
        }
      } else {
        if (!value.trim()) {
          throw new Error('Invalid local path');
        }
      }
      return true;
    }),
  validationMiddleware,
];

/**
 * Validate input for getting a task.
 * - taskId must be provided.
 * - Verify that taskId is a valid MongoDB ObjectId.
 */
export const getTaskValidation = [
  param('taskId')
    .notEmpty()
    .withMessage('taskId is required')
    .bail()
    .custom((value) => mongoose.Types.ObjectId.isValid(value))
    .withMessage('Invalid taskId format'),
  validationMiddleware,
];
