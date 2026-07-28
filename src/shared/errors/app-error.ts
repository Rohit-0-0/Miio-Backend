import { HTTP_STATUS } from '../constants/http-status.js';
import type { ErrorCode } from './error-codes.js';

export class AppError extends Error {
    constructor(
        public readonly message: string,
        public readonly statusCode: number = HTTP_STATUS.INTERNAL_SERVER_ERROR,
        public readonly code: ErrorCode = 'INTERNAL_SERVER_ERROR',
        public readonly details?: unknown
    ) {
        super(message);

        this.name = 'AppError';

        Error.captureStackTrace(this, this.constructor);
    }
}