/*****
 License
 --------------
 Copyright © 2020-2024 Mojaloop Foundation
 The Mojaloop files are made available by the Mojaloop Foundation under the Apache License, Version 2.0 (the "License") and you may not use these files except in compliance with the License. You may obtain a copy of the License at
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

import { SDKSchemeAdapter } from '@mojaloop/api-snippets';
import { IHTTPClient, ILogger, THttpResponse } from '../interfaces';
import { components } from '@mojaloop/api-snippets/lib/sdk-scheme-adapter/v2_1_0/outbound/openapi';

export type TSDKSchemeAdapterConfig = {
    SDK_BASE_URL: string;
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

export type TSDKOutboundTransferResponse = {
    transferId?: components["schemas"]["CorrelationId"];
    /** @description Transaction ID from the DFSP backend, used to reconcile transactions between the Switch and DFSP backend systems. */
    homeTransactionId: string;
    from: components["schemas"]["transferParty"];
    to: components["schemas"]["transferParty"];
    amountType: components["schemas"]["AmountType"];
    currency: components["schemas"]["Currency"];
    amount: components["schemas"]["Amount"];
    transactionType: components["schemas"]["transferTransactionType"];
    subScenario?: components["schemas"]["TransactionSubScenario"];
    note?: components["schemas"]["Note"];
    currentState?: components["schemas"]["transferStatus"];
    quoteId?: components["schemas"]["CorrelationId"];
    getPartiesResponse?: {
        body: {
            party: {
                partyIdInfo: {
                    partyIdType: string,
                    partyIdentifier: string,
                    fspId: string
                },
                name: string,
                supportedCurrencies: string[],
            }
        };
        headers?: Record<string, never>;
    };
    quoteResponse?: {
        body: components["schemas"]["QuotesIDPutResponse"];
        headers?: Record<string, never>;
    };
    /** @description FSPID of the entity that supplied the quote response. This may not be the same as the FSPID of the entity which owns the end user account in the case of a FOREX transfer. i.e. it may be a FOREX gateway. */
    quoteResponseSource?: string;
    conversionRequestId?: components["schemas"]["CorrelationId"];
    fxQuoteResponse?: {
        body: components["schemas"]["FxQuotesPostOutboundResponse"];
        headers?: Record<string, never>;
    };
    /** @description FXPID of the entity that supplied the fxQuotes response. */
    fxQuoteResponseSource?: string;
    fulfil?: {
        body: components["schemas"]["TransfersIDPutResponse"];
        headers?: Record<string, never>;
    };
    lastError?: components["schemas"]["transferError"];
    /** @description Set to true if supplying an FSPID for the payee party and no party resolution is needed. This may be useful is a previous party resolution has been performed. */
    skipPartyLookup?: boolean;
};

export type TSDKTransferContinuationRequest =
    | SDKSchemeAdapter.V2_0_0.Outbound.Types.transferContinuationAcceptParty
    | SDKSchemeAdapter.V2_0_0.Outbound.Types.transferContinuationAcceptQuote
    | components['schemas']['transferContinuationAcceptConversion']
    | components['schemas']['transferContinuationAcceptQuoteOrConversion'];

export type TtransferContinuationResponse = {
    transferId?: components["schemas"]["CorrelationId"];
    /** @description Transaction ID from the DFSP backend, used to reconcile transactions between the Switch and DFSP backend systems. */
    homeTransactionId: string;
    from: components["schemas"]["transferParty"];
    to: components["schemas"]["transferParty"];
    amountType: components["schemas"]["AmountType"];
    currency: components["schemas"]["Currency"];
    amount: components["schemas"]["Amount"];
    transactionType: components["schemas"]["transferTransactionType"];
    subScenario?: components["schemas"]["TransactionSubScenario"];
    note?: components["schemas"]["Note"];
    currentState?: components["schemas"]["transferStatus"];
    quoteId?: components["schemas"]["CorrelationId"];
    getPartiesResponse?: {
        body: {
            party: {
                partyIdInfo: {
                    partyIdType: string,
                    partyIdentifier: string,
                    fspId: string
                },
                name: string,
                supportedCurrencies: string[],
            }
        };
        headers?: Record<string, never>;
    };
    quoteResponse?: {
        body: components["schemas"]["QuotesIDPutResponse"];
        headers?: Record<string, never>;
    };
    /** @description FSPID of the entity that supplied the quote response. This may not be the same as the FSPID of the entity which owns the end user account in the case of a FOREX transfer. i.e. it may be a FOREX gateway. */
    quoteResponseSource?: string;
    fulfil?: {
        body: components["schemas"]["TransfersIDPutResponse"];
        headers?: Record<string, never>;
    };
    lastError?: components["schemas"]["transferError"];
    /** @description Set to true if supplying an FSPID for the payee party and no party resolution is needed. This may be useful is a previous party resolution has been performed. */
    skipPartyLookup?: boolean;
};

export type TSDKClientDeps = {
    logger: ILogger;
    httpClient: IHTTPClient;
    schemeAdapterUrl: string;
};

export interface ISDKClient {
    initiateTransfer(transfer: TSDKOutboundTransferRequest): Promise<THttpResponse<TSDKOutboundTransferResponse>>;
    updateTransfer(
        transferAccept: TSDKTransferContinuationRequest,
        id: string,
    ): Promise<THttpResponse<TtransferContinuationResponse>>;
}


