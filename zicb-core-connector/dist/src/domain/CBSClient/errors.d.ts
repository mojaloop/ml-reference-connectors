import { BasicError } from '../interfaces';
export declare class FineractError extends BasicError {
    static withdrawFailedError(message: string): FineractError;
    static searchAccountError(message: string): FineractError;
    static noAccountFoundError(): FineractError;
    static accountNotActiveError(): FineractError;
    static getClientWithIdError(): FineractError;
    static depositFailedError(): FineractError;
    static getChargesError(): FineractError;
    static accountInsufficientBalanceError(): FineractError;
    static accountDebitOrCreditBlockedError(message: string): FineractError;
}
export declare class ZicbError extends BasicError {
    static genericConnectionError(message: string, httpCode: number, mlCode: string): ZicbError;
    static payeeBlockedError(message: string, httpCode: number, mlCode: string): ZicbError;
}
