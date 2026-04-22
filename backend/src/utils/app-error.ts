export class AppError extends Error {
  public readonly statusCode: number;
  public readonly error: string;

  constructor(statusCode: number, message: string, error = 'Application Error') {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.error = error;
  }
}
