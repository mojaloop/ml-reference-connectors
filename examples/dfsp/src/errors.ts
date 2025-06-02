import { BasicError } from '@elijahokello/core-connector-lib';

export class ConnectorError extends BasicError {
    static cbsConfigUndefined(message: string, mlCode: string, httpCode: number) {
        return new ConnectorError(message, { mlCode, httpCode });
    }
}
