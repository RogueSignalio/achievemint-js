export class AuthenticationError extends Error {
  constructor(message, { status, code, cause } = {}) {
    super(message, { cause });
    this.name = 'AuthenticationError';
    this.status = status;
    this.code = code;
  }
}

export class ApiError extends Error {
  constructor(message, { status, code, cause } = {}) {
    super(message, { cause });
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
  }
}
