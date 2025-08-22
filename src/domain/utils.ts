import { TtransferErrorResponse } from './SDKClient';

export function isAxiosLikeError(error: unknown): error is { response: {data: TtransferErrorResponse} } {
    return typeof error === 'object' && error !== null && 'response' in error;
}
