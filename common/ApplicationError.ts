export class ApplicationError extends Error {

  private _errorCode = 'XXYYY20000';
  private _errorMessage = '';
  private _httpStatusCode = 500;
  private _params: string[] = [];

  constructor(errorCode: string, errorMessage: string, httpStatusCode: number, params?: string[]) {
    super(errorMessage);
    this._errorCode = errorCode;
    this._errorMessage = errorMessage;
    this._httpStatusCode = httpStatusCode;
    this._params = params;
    Object.setPrototypeOf(this, ApplicationError.prototype);
  }

  get errorCode(): string {
    return this._errorCode;
  }

  set errorCode(errorCode: string) {
    this._errorCode = errorCode;
  }

  get errorMessage(): string {
    return this._errorMessage;
  }

  set errorMessage(errorMessage: string) {
    this._errorMessage = errorMessage;
  }

  get httpStatusCode(): number {
    return this._httpStatusCode;
  }

  set httpStatusCode(httpStatusCode: number) {
    this._httpStatusCode = httpStatusCode;
  }

  get params(): string[] {
    return this._params;
  }

  set params(params: string[]) {
    this._params = params;
  }
}
