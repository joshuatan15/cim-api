"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class ApplicationError extends Error {
    constructor(errorCode, errorMessage, httpStatusCode, params) {
        super(errorMessage);
        this._errorCode = 'XXYYY20000';
        this._errorMessage = '';
        this._httpStatusCode = 500;
        this._params = [];
        this._errorCode = errorCode;
        this._errorMessage = errorMessage;
        this._httpStatusCode = httpStatusCode;
        this._params = params;
        Object.setPrototypeOf(this, ApplicationError.prototype);
    }
    get errorCode() {
        return this._errorCode;
    }
    set errorCode(errorCode) {
        this._errorCode = errorCode;
    }
    get errorMessage() {
        return this._errorMessage;
    }
    set errorMessage(errorMessage) {
        this._errorMessage = errorMessage;
    }
    get httpStatusCode() {
        return this._httpStatusCode;
    }
    set httpStatusCode(httpStatusCode) {
        this._httpStatusCode = httpStatusCode;
    }
    get params() {
        return this._params;
    }
    set params(params) {
        this._params = params;
    }
}
exports.ApplicationError = ApplicationError;
//# sourceMappingURL=ApplicationError.js.map