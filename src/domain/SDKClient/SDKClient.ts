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

import {
    ISDKClient,
    TSDKClientDeps,
    TtransferContinuationResponse,
    TSDKOutboundTransferRequest,
    TSDKTransferContinuationRequest,
    TSDKOutboundTransferResponse,
    TGetTransfersResponse,
    TAccountCreationRequest,
    TAccountCreationResponse,
} from './types';
import { IHTTPClient, ILogger, THttpResponse, TJson } from '../interfaces';
import { SDKClientError } from './errors';
import { AxiosError } from 'axios';

export const SDK_ROUTES = Object.freeze({
    transfers: 'transfers',
});

export class SDKClient implements ISDKClient {
    private readonly logger: ILogger;
    private readonly httpClient: IHTTPClient;
    private readonly SDK_SCHEME_ADAPTER_BASE_URL: string;
    private readonly waitTime: number;
    private readonly retries: number;
    private readonly httpTimeout: number;

    constructor(deps: TSDKClientDeps) {
        this.logger = deps.logger;
        this.httpClient = deps.httpClient;
        this.SDK_SCHEME_ADAPTER_BASE_URL = deps.schemeAdapterUrl;
        this.waitTime = !deps.waitTime ? 2000 : deps.waitTime;
        this.retries = !deps.retries ? 3 : deps.retries;
        this.httpTimeout = !deps.httpTimeout ? 5000 : deps.httpTimeout;
    }

    async initiateTransfer(
        transfer: TSDKOutboundTransferRequest,
    ): Promise<THttpResponse<TSDKOutboundTransferResponse>> {
        this.logger.info('SDKClient initiate receiveTransfer', transfer);

        const res = await this.makeRequestWithRetries<TSDKOutboundTransferRequest, TSDKOutboundTransferResponse>(
            `${this.SDK_SCHEME_ADAPTER_BASE_URL}/${SDK_ROUTES.transfers}`,
            transfer,
            "POST"
        );
        return res;
    }

    async updateTransfer(
        transferAccept: TSDKTransferContinuationRequest,
        id: string,
    ): Promise<THttpResponse<TtransferContinuationResponse>> {
        this.logger.info('SDKClient initiate update receiveTransfer %s', transferAccept);

        const res = await this.makeRequestWithRetries<TSDKTransferContinuationRequest, TtransferContinuationResponse>(
            `${this.SDK_SCHEME_ADAPTER_BASE_URL}/${SDK_ROUTES.transfers}/${id}`,
            transferAccept,
            "PUT"
        );
        return res;
    }

    private async makeRequestWithRetries<Req extends TJson, Res extends TJson>(
        url: string,
        data: Req,
        method: "POST" | "PUT" | "GET" | "PATCH" | "DELETE",
    ): Promise<THttpResponse<Res>> {
        let continue_loop: boolean = false;
        let attempts: number = 0;
        let tranRes: THttpResponse<Res> | undefined = undefined;
        const errorsOccured: string[] = [];
        let success: boolean = false;

        do {
            try {
                const res = await this.httpClient.send<Res>({
                    url: url,
                    data: data,
                    method: method,
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    timeout: this.httpTimeout,
                });
                if (res.statusCode === 200) {
                    tranRes = res;
                    success = true;
                    continue_loop = false;
                }
            } catch (error: unknown) {
                let errMessage = (error as Error).message || 'Unknown Error';
                this.logger.error(`error in executing Transfer: ${errMessage}`);
                if (error instanceof AxiosError) {
                    if (error.response?.status === 504) {
                        continue_loop = true;
                        errorsOccured.push('Gateway timedout 504');
                    }

                    if(error.code === "ECONNABORTED"){
                        continue_loop = true;
                        errorsOccured.push("Http Timeout waiting for response");
                    }

                    if(error.response?.status !==200 ){
                        continue_loop = false;
                        errorsOccured.push(JSON.stringify(error.response ? error.response.data : error.message));
                    }

                    this.logger.error('Error from SDK', error.response?.data);
                    errMessage = JSON.stringify(error.response?.data);
                }
            }
            attempts++;
            if (attempts > this.retries) {
                continue_loop = false;
            }

            const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
            await sleep(this.waitTime);
        } while (continue_loop);

        if (!tranRes) {
            throw SDKClientError.genericTransferError(
                `Performing transaction failed after ${this.retries} retries. Errors ==> ${errorsOccured.toString()}`,
            );
        }
        if (!success) {
            throw SDKClientError.genericTransferError(
                `Performing transaction failed after ${this.retries} retries. Errors ==> ${errorsOccured.toString()}`,
            );
        }
        return tranRes;
    }

    async getTransfers(transferId: string): Promise<TGetTransfersResponse> {
        this.logger.debug(`SDK Client get transfers with id ${transferId}`);
        try {
            const res = await this.httpClient.get<TGetTransfersResponse>(
                `${this.SDK_SCHEME_ADAPTER_BASE_URL}/transfers/${transferId}`,
            );
            if (res.statusCode !== 200) {
                const { statusCode, data, error } = res;
                const errMessage = 'SDKClient get transfer failed';
                this.logger.warn(errMessage, { statusCode, data, error });
                throw SDKClientError.getTransfersError(errMessage, { httpCode: statusCode });
            }
            return res.data;
        } catch (error: unknown) {
            if (error instanceof SDKClientError) throw error;
            let errMessage = `SDKClient get transfers error: ${(error as Error)?.message}`;
            this.logger.error(errMessage, { error });
            if (error instanceof AxiosError) {
                this.logger.error('Error from SDK', error.response?.data);
                errMessage = JSON.stringify(error.response?.data);
            }
            throw SDKClientError.getTransfersError(errMessage, { httpCode: 500, mlCode: '2000' });
        }
    }

    async postAccounts(accounts: TAccountCreationRequest): Promise<TAccountCreationResponse> {
        this.logger.debug(`SDK Client post accounts`, accounts);
        try {
            const res = await this.httpClient.post<TAccountCreationRequest, TAccountCreationResponse>(
                `${this.SDK_SCHEME_ADAPTER_BASE_URL}/accounts`,
                accounts,
            );
            if (res.statusCode !== 200) {
                const { statusCode, data, error } = res;
                const errMessage = 'SDKClient create accounts failed';
                this.logger.warn(errMessage, { statusCode, data, error });
                throw SDKClientError.postAccountsError(errMessage, { httpCode: statusCode });
            }
            return res.data;
        } catch (error: unknown) {
            if (error instanceof SDKClientError) throw error;
            let errMessage = `SDKClient create accounts error: ${(error as Error)?.message}`;
            this.logger.error(errMessage, { error });
            if (error instanceof AxiosError) {
                this.logger.error('Error from SDK', error.response?.data);
                errMessage = JSON.stringify(error.response?.data);
            }
            throw SDKClientError.postAccountsError(errMessage, { httpCode: 500, mlCode: '2000' });
        }
    }

    async deleteAccounts(id: string, idType: string): Promise<void> {
        this.logger.debug(`SDK Client delete accounts`, { Type: idType, Id: id });
        try {
            const res = await this.httpClient.send<unknown>({
                url: `${this.SDK_SCHEME_ADAPTER_BASE_URL}/accounts/${idType}/${id}`,
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            if (res.statusCode !== 200) {
                const { statusCode, data, error } = res;
                const errMessage = 'SDKClient delete account failed';
                this.logger.warn(errMessage, { statusCode, data, error });
                throw SDKClientError.deleteAccountsError(errMessage, { httpCode: statusCode });
            }
        } catch (error: unknown) {
            if (error instanceof SDKClientError) throw error;
            let errMessage = `SDKClient delete account error: ${(error as Error)?.message}`;
            this.logger.error(errMessage, { error });
            if (error instanceof AxiosError) {
                this.logger.error('Error from SDK', error.response?.data);
                errMessage = JSON.stringify(error.response?.data);
            }
            throw SDKClientError.deleteAccountsError(errMessage, { httpCode: 500, mlCode: '2000' });
        }
    }
}
