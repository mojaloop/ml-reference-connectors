import { components } from '@mojaloop/api-snippets/lib/sdk-scheme-adapter/v2_1_0/backend/openapi';
import { ILogger } from '../interfaces';

export type TFxQuoteRequest = components["schemas"]["FxQuotesPostBackendRequest"];
export  type TFxQuoteResponse = components["schemas"]["FxQuotesPostBackendResponse"];
export type TConfirmFxTransferRequest = components["schemas"]["FxTransfersPostBackendRequest"]
export type TConfirmFxTransferResponse = components["schemas"]["FxTransfersPostBackendResponse"]
export type TNotifyFxTransferStateRequest = components["schemas"]["FxTransfersPutBackendRequest"]
export type TNotifyFxTransferStateResponse = void;

export type TFxpConfig<C> = {
    FXP_BASE_URL: string;
    config: C
}

export interface IFXPClient {
    logger: ILogger;
    getFxQuote(deps: TFxQuoteRequest): Promise<TFxQuoteResponse>;
    confirmFxTransfer(deps: TConfirmFxTransferRequest): Promise<TConfirmFxTransferResponse>;
    notifyFxTransferState(deps: TNotifyFxTransferStateRequest, commitRequestId: string): Promise<TNotifyFxTransferStateResponse>;
}

export interface IFxpCoreConnectorAgg<F> {
    fxpClient: IFXPClient
    logger: ILogger
    fxpConfig: TFxpConfig<F>

    getFxQuote(deps: TFxQuoteRequest): Promise<TFxQuoteResponse>;
    confirmFxTransfer(deps: TConfirmFxTransferRequest): Promise<TConfirmFxTransferResponse>;
    notifyFxTransferState(deps: TNotifyFxTransferStateRequest, commitRequestId: string): Promise<TNotifyFxTransferStateResponse>;
}