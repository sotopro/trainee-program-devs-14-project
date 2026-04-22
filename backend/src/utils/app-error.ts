export class AppError extends Error {
  public readonly statusCode: number;
  public readonly error: string;
  public readonly isOperational: boolean;

  constructor(statusCode: number, message: string, error = 'Application Error') {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.error = error;
    this.isOperational = true;
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'Token de acceso requerido') {
    super(401, message, 'Unauthorized');
    this.name = 'UnauthorizedError';
  }
}

export class ForbiddenError extends AppError {
  constructor(message = 'No tiene permisos para acceder a este recurso') {
    super(403, message, 'Forbidden');
    this.name = 'ForbiddenError';
  }
}

export class NotFoundError extends AppError {
  constructor(message = 'Recurso no encontrado') {
    super(404, message, 'Not Found');
    this.name = 'NotFoundError';
  }
}

export class ConflictError extends AppError {
  constructor(message = 'Conflicto en la solicitud') {
    super(409, message, 'Conflict');
    this.name = 'ConflictError';
  }
}
