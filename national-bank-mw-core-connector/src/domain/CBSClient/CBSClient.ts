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

'use strict';

import { IHTTPClient, ILogger } from '../interfaces';
import { CBSError } from './errors';
import {
    INBMClient,
    TNBMCollectMoneyRequest,
    TNBMCollectMoneyResponse,
    TNBMConfig,
    TNBMDisbursementRequestBody,
    TNBMDisbursementResponse,
    TNBMKycResponse,
    TNBMRefundMoneyRequest,
    TNBMRefundMoneyResponse,
    TGetKycArgs,
    TGetTokenArgs,
    TGetTokenResponse,
    TNBMTransactionResponse
} from './types';

export const CBS_ROUTES = Object.freeze({
    getToken: '/auth/token',
    getKyc: '/api/',
    // sendMoney: '/standard/v3/disbursements',
    collectMoney: '/api/transfer',
    refundMoney: '/standard/v2/payments/refund',
    transactionEnquiry: '/standard/v1/payments/'
});

export class NBMClient implements INBMClient {
    cbsConfig: TNBMConfig;
    httpClient: IHTTPClient;
    logger: ILogger;

    constructor(cbsConfig: TNBMConfig, httpClient: IHTTPClient, logger: ILogger) {
        this.cbsConfig = cbsConfig;
        this.httpClient = httpClient;
        this.logger = logger;
    }
    NBMConfig!: TNBMConfig;

    async getKyc(deps: TGetKycArgs): Promise<TNBMKycResponse> {
        this.logger.info("Getting KYC Information");
        const res = await this.httpClient.get<TNBMKycResponse>(`https://${this.cbsConfig.DFSP_BASE_URL}${CBS_ROUTES.getKyc}${deps.account_number}`, {
            headers: {
                ...this.getDefaultHeader(),
                'Authorization': `Bearer ${await this.getAuthHeader()}`
            }
        });
        if (res.data.message== '200') {
            throw CBSError.getKycError();
        }
        return res.data;
    }

    async getToken(deps: TGetTokenArgs): Promise<TGetTokenResponse> {
        this.logger.info("Getting Access Token from National Bank");
        const url = `${this.cbsConfig.DFSP_BASE_URL}${CBS_ROUTES.getToken}`;
        this.logger.info(url);
        try {
            const res = await this.httpClient.post<TGetTokenArgs, TGetTokenResponse>(url, deps, {
                headers: this.getDefaultHeader()
            });
            if (res.statusCode !== 200) {
                this.logger.error(`Failed to get token: ${res.statusCode} - ${res.data}`);
                throw CBSError.getTokenFailedError();
            }
            return res.data;
        } catch (error) {
            this.logger.error(`Error getting token: ${error}`, { url, data: deps });
            throw error;
        }
    }

    async sendMoney(deps: TNBMDisbursementRequestBody): Promise<TNBMDisbursementResponse> {
        this.logger.info("Sending Disbursement Body To National Bank");
        const url = `${this.cbsConfig.DFSP_BASE_URL}${CBS_ROUTES.collectMoney}`;
        try {
            const res = await this.httpClient.post<TNBMDisbursementRequestBody, TNBMDisbursementResponse>(url, deps,
                {
                    headers: {
                        ...this.getDefaultHeader(),
                        'Authorization': `Bearer ${await this.getAuthHeader()}`,
                    }
                }
            );

            if (res.data.status.code !== '200') {
                throw CBSError.disbursmentError();
            }
            return res.data;
        } catch (error) {
            this.logger.error(`Error Sending Money: ${error}`, { url, data: deps });
            throw error;
        }
    }
    async collectMoney(deps: TNBMCollectMoneyRequest): Promise<TNBMCollectMoneyResponse> {
        this.logger.info("Collecting Money from National Bank");
        const url = `${this.cbsConfig.DFSP_BASE_URL}${CBS_ROUTES.collectMoney}`;

        try {
            const res = await this.httpClient.post<TNBMCollectMoneyRequest, TNBMCollectMoneyResponse>(url, deps, {
                headers: {
                    ...this.getDefaultHeader(),
                    'Authorization': `Bearer ${await this.getAuthHeader()}`,
                }
            });
            if (res.data.message !== '200') {
                throw CBSError.collectMoneyError();
            }
            return res.data;

        } catch (error) {
            this.logger.error(`Error Collecting Money: ${error}`, { url, data: deps });
            throw error;
        }
    }

    async refundMoney(deps: TNBMRefundMoneyRequest): Promise<TNBMRefundMoneyResponse> {
        this.logger.info("Refunding Money to Customer in National Bank");
        const url = `${this.cbsConfig.DFSP_BASE_URL}${CBS_ROUTES.refundMoney}`;

        try {
            const res = await this.httpClient.post<TNBMRefundMoneyRequest, TNBMRefundMoneyResponse>(url, deps, {
                headers: {
                    ...this.getDefaultHeader(),
                    'Authorization': `Bearer ${await this.getAuthHeader()}`,
                }
            });
            if (res.data.status.code !== '200') {
                throw CBSError.refundMoneyError();
            }
            return res.data;
        } catch (error) {
            this.logger.error(`Error Refunding Money: ${error}`, { url, data: deps });
            throw error;
        }
    }

    private getDefaultHeader() {
        return {
            'Content-Type': 'application/json',
            'X-Country': this.cbsConfig.X_COUNTRY,
            'X-Currency': this.cbsConfig.X_CURRENCY,
        };
    }


    private async getAuthHeader(): Promise<string> {
        const res = await this.getToken({
            client_secret: this.cbsConfig.CLIENT_SECRET,
            client_id: this.cbsConfig.CLIENT_ID,
           
        });
        return res.access_token;
    }

    //Mock Function for NBM to simulate debiting the customer
    async mockCollectMoney(debitAccountId: string, creditAccountId: string, amount: number): Promise<TNBMTransactionResponse> {
        return new Promise((resolve) => {
            setTimeout(() => {
                const response: TNBMTransactionResponse = {
                    success: true,
                    message: `Account ${debitAccountId} debited and account ${creditAccountId} credited successfully.`,
                    transactionId: `txn_${Math.floor(Math.random() * 100000)}`,
                    debitAccountId,
                    creditAccountId,
                    amount,
                    status: "credited",
                    timestamp: new Date().toISOString(),
                };
                resolve(response);
            }, 1000);
        });
    }
}
