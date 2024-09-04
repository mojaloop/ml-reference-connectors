/*****
 License
 --------------
 Copyright © 2017 Bill & Melinda Gates Foundation
 The Mojaloop files are made available by the Bill & Melinda Gates Foundation under the Apache License, Version 2.0 (the "License") and you may not use these files except in compliance with the License. You may obtain a copy of the License at

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
import { IHTTPClient, ILogger, THttpResponse } from '../interfaces';
import { TLookupResponseInfo, TFineractConfig, TFineractGetAccountResponse, IFineractClient, TCalculateQuoteDeps, TCalculateQuoteResponse, TFineractTransferDeps, TFineractTransactionResponse, TFineractGetChargeResponse } from './types';
export declare const ROUTES: Readonly<{
    search: "search";
    savingsAccount: "savingsaccounts";
    clients: "clients";
    charges: "charges";
}>;
export declare class FineractClient implements IFineractClient {
    fineractConfig: TFineractConfig;
    httpClient: IHTTPClient;
    logger: ILogger;
    constructor(fineractConfig: TFineractConfig, httpClient: IHTTPClient, logger: ILogger);
    lookupPartyInfo(accountNo: string): Promise<TLookupResponseInfo>;
    calculateWithdrawQuote(quoteDeps: TCalculateQuoteDeps): Promise<TCalculateQuoteResponse>;
    verifyBeneficiary(accountNo: string): Promise<TLookupResponseInfo>;
    receiveTransfer(transferDeps: TFineractTransferDeps): Promise<THttpResponse<TFineractTransactionResponse>>;
    getAccountId(accountNo: string): Promise<TLookupResponseInfo>;
    private searchAccount;
    getSavingsAccount(accountId: number): Promise<THttpResponse<TFineractGetAccountResponse>>;
    private getDefaultHeaders;
    private getAuthHeader;
    private getClient;
    sendTransfer(transactionPayload: TFineractTransferDeps): Promise<THttpResponse<TFineractTransactionResponse>>;
    getCharges(): Promise<THttpResponse<TFineractGetChargeResponse>>;
}
