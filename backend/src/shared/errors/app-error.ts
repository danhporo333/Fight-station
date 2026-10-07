import { ErrorCode } from './error-codes';

export interface ErrorDetail {
  field: string;
  message: string;
}

export class AppError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly statusCode: number = 500,
    public readonly details?: ErrorDetail[],
  ) {
    super(message);
    this.name = new.target.name;
  }
}

export class ValidationError extends AppError {
  constructor(
    details: ErrorDetail[],
    message = 'Dữ liệu không hợp lệ',
    code: string = ErrorCode.VALIDATION_FAILED,
  ) {
    super(code, message, 400, details);
  }
}

export class BadRequestError extends AppError {
  constructor(code: string, message: string) {
    super(code, message, 400);
  }
}

export class UnauthorizedError extends AppError {
  constructor(code: string, message: string) {
    super(code, message, 401);
  }
}

export class ForbiddenError extends AppError {
  constructor(code: string, message: string) {
    super(code, message, 403);
  }
}

export class NotFoundError extends AppError {
  constructor(code: string, message: string) {
    super(code, message, 404);
  }
}

export class ConflictError extends AppError {
  constructor(code: string, message: string) {
    super(code, message, 409);
  }
}
