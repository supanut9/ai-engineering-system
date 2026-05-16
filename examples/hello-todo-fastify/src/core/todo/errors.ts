export class ValidationError extends Error {
  readonly code = 'validation' as const;
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

export class NotFoundError extends Error {
  readonly code = 'not_found' as const;
  constructor(message: string) {
    super(message);
    this.name = 'NotFoundError';
  }
}
