'use strict';

import { TJson } from './types';

export type ErrorOptions = {
    cause?: Error;
    httpCode: number;
    mlCode?: string;
    details?: TJson;
};

type RefundDetails = {
    amount: number;
    fineractAccountId: number;
};

export class BasicError extends Error {
    cause?: Error;
    httpCode?: number;
    mlCode?: string; // Mojaloop error code
    details?: TJson;
    constructor(message: string, options?: ErrorOptions) {
        super(message, options);
        Error.captureStackTrace(this, BasicError);
        this.name = this.constructor.name;
        this.httpCode = options?.httpCode;
        this.mlCode = options?.mlCode;
        this.details = options?.details;
    }
}

export class ValidationError extends BasicError {
    static invalidExtensionListsError(message: string, mlCode: string, httpCode: number) {
        return new ValidationError(message, {
            mlCode: mlCode,
            httpCode: httpCode
        });
    }
    static invalidAccountNumberError() {
        return new ValidationError('Account number length is too short', {
            mlCode: '3101',
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
    static refundFailedError(details: RefundDetails) {
        return new ValidationError('Refund Failed', {
            mlCode: '2001',
            httpCode: 500,
            details, // object returned to allow for reconciliation later
        });
    }
    static unsupportedCurrencyError() {
        return new ValidationError("Incorrect Currency", {
            mlCode: '5106',
            httpCode: 400,
        });
    }
    static accountBarredError() {
        return new ValidationError("Account is Barred", {
            mlCode: '5400',
            httpCode: 400,
        });
    }
    static invalidQuoteError() {
        return new ValidationError("Invalid Quote Error", {
            mlCode: '5101',
            httpCode: 400,
        });
    }
    static invalidReturnedQuoteError(message: string) {
        return new ValidationError(message, {
            mlCode: '5101',
            httpCode: 500,
        });
    }
    static transferNotCompletedError() {
        return new ValidationError("Transfer Not Completed Error", {
            mlCode: '5000',
            httpCode: 500,
        });
    }
    static quoteNotDefinedError(message: string, mlCode: string, httpCode: number) {
        return new ValidationError(message, {
            mlCode: mlCode,
            httpCode: httpCode,
        });
    }
    static invalidConversionQuoteError(message: string, mlCode: string, httpCode: number) {
        return new ValidationError(message, {
            mlCode: mlCode,
            httpCode: httpCode,
        });
    }
    static transferIdNotDefinedError(message: string, mlCode: string, httpCode: number) {
        return new ValidationError(message, {
            mlCode: mlCode,
            httpCode: httpCode,
        });
    }
    static notEnoughInformationError(message: string, mlCode: string) {
        return new ValidationError(message, {
            mlCode: mlCode,
            httpCode: 500,
        });
    }
    static quoteNotAcceptedError() {
        return new ValidationError("Payer rejected transaction request", {
            mlCode: '4101',
            httpCode: 500,
        });
    }
}