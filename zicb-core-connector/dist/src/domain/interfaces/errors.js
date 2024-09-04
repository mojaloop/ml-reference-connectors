/*****
 License
 --------------
 Copyright © 2017 Bill & Melinda Gates Foundation
 The Mojaloop files are made available by the Bill & Melinda Gates Foundation under the Apache License, Version 2.0 (the "License") and you may not use these files except in compliance with the License. You may obtain a copy of the License at

 http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, the Mojaloop files are distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.

 Contributors
 --------------
 This is the official list (alphabetical ordering) of the Mojaloop project contributors for this file.
 Names of the original copyright holders (individuals or organizations)
 should be listed with a '*' in the first column. People who have
 contributed from an organization can be listed under the organization
 that actually holds the copyright for their contributions (see the
 Gates Foundation organization for an example). Those individuals should have
 their names indented and be marked with a '-'. Email address can be added
 optionally within square brackets <email>.


 - Okello Ivan Elijah <elijahokello90@gmail.com>

 --------------
 ******/
'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.ValidationError = exports.BasicError = void 0;
class BasicError extends Error {
    cause;
    httpCode;
    mlCode; // Mojaloop error code
    details;
    constructor(message, options) {
        super(message, options);
        Error.captureStackTrace(this, BasicError);
        this.name = this.constructor.name;
        this.httpCode = options?.httpCode;
        this.mlCode = options?.mlCode;
        this.details = options?.details;
    }
}
exports.BasicError = BasicError;
class ValidationError extends BasicError {
    static invalidAccountNumberError() {
        return new ValidationError('Account number length is too short', {
            mlCode: '3101',
            httpCode: 400,
        });
    }
    static unsupportedCurrencyError() {
        return new ValidationError("Incorrect Currency", {
            mlCode: '5106',
            httpCode: 400,
        });
    }
    static invalidQuoteError() {
        return new ValidationError("Invalid Quote Error", {
            mlCode: '5101',
            httpCode: 400,
        });
    }
    static accountVerificationError() {
        return new ValidationError('Funds Source Account is not active in Fineract', {
            mlCode: '3200',
            httpCode: 400, // todo: think, which http code should be used here
        });
    }
    static unsupportedIdTypeError() {
        return new ValidationError('Unsupported Id Type', {
            mlCode: '3100',
            httpCode: 400,
        });
    }
    // think, if it's better to move to a separate class
    static refundFailedError(details) {
        return new ValidationError('Refund Failed', {
            mlCode: '2001',
            httpCode: 500,
            details, // object returned to allow for reconciliation later
        });
    }
    static transferNotCompletedError() {
        return new ValidationError("Transfer Not Completed Error", {
            mlCode: '5000',
            httpCode: 500,
        });
    }
    static quoteNotDefinedError(message, mlCode, httpCode) {
        return new ValidationError(message, {
            mlCode: mlCode,
            httpCode: httpCode,
        });
    }
}
exports.ValidationError = ValidationError;
//# sourceMappingURL=errors.js.map