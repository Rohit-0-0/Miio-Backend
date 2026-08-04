export class GuestyApiError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public responseData?: any
  ) {
    super(message);
    this.name = 'GuestyApiError';
    Object.setPrototypeOf(this, GuestyApiError.prototype);
  }
}
