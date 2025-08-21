import { TtransferErrorResponse } from './SDKClient';

export function isAxiosLikeError(error: unknown): error is { response: TtransferErrorResponse } {
    return typeof error === 'object' && error !== null && 'response' in error;
}
