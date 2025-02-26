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
import { AxiosRequestConfig, CreateAxiosDefaults } from 'axios';
import { ILogger } from './infrastructure';
import { components } from '@mojaloop/api-snippets/lib/sdk-scheme-adapter/v2_1_0/backend/openapi';
import { components as OutboundComponents } from "@mojaloop/api-snippets/lib/sdk-scheme-adapter/v2_1_0/outbound/openapi";
import { components as fspiopComponents } from '@mojaloop/api-snippets/lib/fspiop/v2_0/openapi';
import { TAirtelCollectMoneyResponse, TAirtelTransactionEnquiryResponse, TAirtelUpdateSendMoneyRequest } from '../CBSClient';
export type TJson = string | number | boolean | { [x: string]: TJson } | Array<TJson>;

export type THttpRequestOptions = Omit<AxiosRequestConfig, 'url' | 'method'>;

export type THttpClientDeps = {
    options: CreateAxiosDefaults;
    logger: ILogger;
};

export type TQuoteRequest = SDKSchemeAdapter.V2_0_0.Backend.Types.quoteRequest;

export type TtransferRequest = SDKSchemeAdapter.V2_0_0.Backend.Types.transferRequest;

export type THttpResponse<R> = {
    data: R;
    statusCode: number;
    error?: Error;
};

export type TRequestOptions = {
    payload?: unknown | undefined;
    timeout_ms?: number;
    method?: string;
    headers?: unknown | undefined;
};

export type TQuoteResponse = SDKSchemeAdapter.V2_0_0.Backend.Types.quoteResponse;

export type TtransferResponse = SDKSchemeAdapter.V2_0_0.Backend.Types.transferResponse;


// Extension List to be used in Payee type
export type TPayeeExtensionListEntry = {
    key?: string;
    value?: string;
}

export type TPayerExtensionListEntry = {
    key: string;
    value: string;
}


export type Payee = {
    dateOfBirth?: string;
    displayName: string;
    extensionList?: TPayeeExtensionListEntry[];
    firstName: string;
    fspId?: string;
    idSubValue?: string;
    idType: string;
    idValue: string;
    lastName: string;
    merchantClassificationCode?: string;
    middleName: string;
    type: string;
    supportedCurrencies?: string;
    kycInformation: string;
};

export type Transfer = {
    completedTimestamp: string;
    fulfilment: string;
    homeTransactionId: string;
    transferState: string;
};

export type TLookupPartyInfoResponse = THttpResponse<Payee>;


export type TtransferPatchNotificationRequest = {
    currentState?: OutboundComponents['schemas']['transferStatus'];
    /** @enum {string} */
    direction?: 'INBOUND';
    finalNotification?: {
        completedTimestamp: components['schemas']['timestamp'];
        extensionList?: components['schemas']['extensionList'];
        transferState: components['schemas']['transferState'];
    };
    fulfil?: {
        body?: Record<string, never>;
        headers?: Record<string, never>;
    };
    initiatedTimestamp?: components['schemas']['timestamp'];
    lastError?: components['schemas']['transferError'];
    prepare?: {
        body?: Record<string, never>;
        headers?: Record<string, never>;
    };
    quote?: {
        fulfilment?: string;
        internalRequest?: Record<string, never>;
        mojaloopResponse?: Record<string, never>;
        request?: Record<string, never>;
        response?: Record<string, never>;
    };
    quoteRequest?: {
        body: fspiopComponents['schemas']['QuotesPostRequest'];
        headers?: Record<string, never>;
    };
    quoteResponse?: {
        body?: Record<string, never>;
        headers?: Record<string, never>;
    };
    transferId?: components['schemas']['transferId'];
};

export type TValidationResponse = {
    result: boolean;
    message: string[];
}

export type TtransactionEnquiryDeps = {
    transactionEnquiry: TAirtelTransactionEnquiryResponse,
    transferId: string,
    airtelRes: TAirtelCollectMoneyResponse,
    transferAccept: TAirtelUpdateSendMoneyRequest
}

