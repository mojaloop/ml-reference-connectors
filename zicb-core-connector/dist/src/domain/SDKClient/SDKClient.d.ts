import { ISDKClient, TSDKClientDeps, TtransferContinuationResponse, TSDKOutboundTransferRequest, TSDKTransferContinuationRequest, TSDKOutboundTransferResponse } from './types';
import { THttpResponse } from '../interfaces';
export declare class SDKClient implements ISDKClient {
    private readonly logger;
    private readonly httpClient;
    private readonly SDK_SCHEME_ADAPTER_BASE_URL;
    constructor(deps: TSDKClientDeps);
    initiateTransfer(transfer: TSDKOutboundTransferRequest): Promise<THttpResponse<TSDKOutboundTransferResponse>>;
    updateTransfer(transferAccept: TSDKTransferContinuationRequest, id: number): Promise<THttpResponse<TtransferContinuationResponse>>;
}
