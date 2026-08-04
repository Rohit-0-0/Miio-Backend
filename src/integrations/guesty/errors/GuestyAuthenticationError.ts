export class GuestyAuthenticationError extends Error {
  constructor(message: string, public details?: any) {
    super(message);
    this.name = 'GuestyAuthenticationError';
    // Set the prototype explicitly for extending built-in Error in TS
    Object.setPrototypeOf(this, GuestyAuthenticationError.prototype);
  }
}
