import { SDKSchemeAdapter } from '@mojaloop/api-snippets';
import { IHTTPClient, ILogger, THttpResponse } from '../interfaces';
import { components } from '@mojaloop/api-snippets/lib/sdk-scheme-adapter/v2_0_0/outbound/openapi';
export type TSDKSchemeAdapterConfig = {
    SDK_BASE_URL: string;
};
export type TFineractTransferParty = {
    fineractAccountId: number;
    payer: components['schemas']['transferParty'];
};
export type TFineractOutboundTransferRequest = {
    homeTransactionId: string;
    from: TFineractTransferParty;
    to: components['schemas']['transferParty'];
    amountType: components['schemas']['AmountType'];
    currency: components['schemas']['Currency'];
    amount: components['schemas']['Amount'];
    transactionType: components['schemas']['transferTransactionType'];
    subScenario?: components['schemas']['TransactionSubScenario'];
    note?: components['schemas']['Note'];
    quoteRequestExtensions?: components['schemas']['extensionListEmptiable'];
    transferRequestExtensions?: components['schemas']['extensionListEmptiable'];
    skipPartyLookup?: boolean;
};
export type TSDKOutboundTransferRequest = {
    /** @description Transaction ID from the DFSP backend, used to reconcile transactions between the Switch and DFSP backend systems. */
    homeTransactionId: string;
    from: components['schemas']['transferParty'];
    to: components['schemas']['transferParty'];
    amountType: components['schemas']['AmountType'];
    currency: components['schemas']['Currency'];
    amount: components['schemas']['Amount'];
    transactionType: components['schemas']['transferTransactionType'];
    subScenario?: components['schemas']['TransactionSubScenario'];
    note?: components['schemas']['Note'];
    quoteRequestExtensions?: components['schemas']['extensionListEmptiable'];
    transferRequestExtensions?: components['schemas']['extensionListEmptiable'];
    /** @description Set to true if supplying an FSPID for the payee party and no party resolution is needed. This may be useful is a previous party resolution has been performed. */
    skipPartyLookup?: boolean;
};
export type TSDKOutboundTransferResponse = SDKSchemeAdapter.V2_0_0.Outbound.Types.transferResponse;
export type TFineractOutboundTransferResponse = {
    totalAmountFromFineract: number;
    transferResponse: SDKSchemeAdapter.V2_0_0.Outbound.Types.transferResponse;
};
export type TFineractTransferContinuationRequest = {
    transferContinuationAccept: SDKSchemeAdapter.V2_0_0.Outbound.Types.transferContinuationAcceptParty | SDKSchemeAdapter.V2_0_0.Outbound.Types.transferContinuationAcceptQuote;
    fineractTransaction: {
        fineractAccountId: number;
        totalAmount: number;
        routingCode: string;
        receiptNumber: string;
        bankNumber: string;
    };
};
export type TSDKTransferContinuationRequest = SDKSchemeAdapter.V2_0_0.Outbound.Types.transferContinuationAcceptParty | SDKSchemeAdapter.V2_0_0.Outbound.Types.transferContinuationAcceptQuote;
export type TUpdateTransferDeps = {
    fineractTransaction: {
        fineractAccountId: number;
        totalAmount: number;
        routingCode: string;
        receiptNumber: string;
        bankNumber: string;
    };
    sdkTransferId: number | string;
};
export type TtransferContinuationResponse = SDKSchemeAdapter.V2_0_0.Outbound.Types.transferResponse | SDKSchemeAdapter.V2_0_0.Outbound.Types.errorTransferResponse;
export type TSDKClientDeps = {
    logger: ILogger;
    httpClient: IHTTPClient;
    schemeAdapterUrl: string;
};
export interface ISDKClient {
    initiateTransfer(transfer: TSDKOutboundTransferRequest): Promise<THttpResponse<TSDKOutboundTransferResponse>>;
    updateTransfer(transferAccept: TSDKTransferContinuationRequest, id: number): Promise<THttpResponse<TtransferContinuationResponse>>;
}
