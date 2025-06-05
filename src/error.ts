export class VerificationNotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "VerificationNotFoundError";
  }
}
