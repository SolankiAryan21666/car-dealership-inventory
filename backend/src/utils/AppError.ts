// Lets services throw errors that already know which HTTP status they map to,
// instead of controllers guessing based on error message text.
export class AppError extends Error {
  statusCode: number;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.name = "AppError";
  }
}
