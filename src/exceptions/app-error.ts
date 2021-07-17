export class AppError extends Error {
  public constructor(message?: string) {
    super(message);
  }

  public get code(): string {
    return Reflect.getPrototypeOf(this)?.constructor.name ?? Error.name;
  }

  public toString(): string {
    return `${this.code} - ${this.message}`;
  }
}
