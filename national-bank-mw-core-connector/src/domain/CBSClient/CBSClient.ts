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
    TCbsCollectMoneyRequest,
    TCbsCollectMoneyResponse,
    TNBMConfig,
    TCbsDisbursementRequestBody,
    TCbsDisbursementResponse,
    TCbsKycResponse,
    TCbsRefundMoneyRequest,
    TCbsRefundMoneyResponse,
    TGetKycArgs,
    TGetTokenArgs,
    TGetTokenResponse,
    TNBMTransactionResponse
} from './types';

export const CBS_ROUTES = Object.freeze({
    getToken: '/auth/oauth2/token',
    getKyc: '/standard/v1/users/',
    sendMoney: '/standard/v3/disbursements',
    collectMoney: '/merchant/v2/payments/',
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

    async getKyc(deps: TGetKycArgs): Promise<TCbsKycResponse> {
        this.logger.info("Getting KYC Information");
        const res = await this.httpClient.get<TCbsKycResponse>(`https://${this.cbsConfig.DFSP_BASE_URL}${CBS_ROUTES.getKyc}${deps.msisdn}`, {
            headers: {
                ...this.getDefaultHeader(),
                'Authorization': `Bearer ${await this.getAuthHeader()}`
            }
        });
        if (res.data.status.code !== '200') {
            throw CBSError.getKycError();
        }
        return res.data;
    }

    async getToken(deps: TGetTokenArgs): Promise<TGetTokenResponse> {
        this.logger.info("Getting Access Token from Airtel");
        const url = `https://${this.cbsConfig.DFSP_BASE_URL}${CBS_ROUTES.getToken}`;
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

    async sendMoney(deps: TCbsDisbursementRequestBody): Promise<TCbsDisbursementResponse> {
        this.logger.info("Sending Disbursement Body To Airtel");
        const url = `https://${this.cbsConfig.DFSP_BASE_URL}${CBS_ROUTES.sendMoney}`;
        try {
            const res = await this.httpClient.post<TCbsDisbursementRequestBody, TCbsDisbursementResponse>(url, deps,
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
    async collectMoney(deps: TCbsCollectMoneyRequest): Promise<TCbsCollectMoneyResponse> {
        this.logger.info("Collecting Money from National Bank");
        const url = `https://${this.cbsConfig.DFSP_BASE_URL}${CBS_ROUTES.collectMoney}`;

        try {
            const res = await this.httpClient.post<TCbsCollectMoneyRequest, TCbsCollectMoneyResponse>(url, deps, {
                headers: {
                    ...this.getDefaultHeader(),
                    'Authorization': `Bearer ${await this.getAuthHeader()}`,
                }
            });
            if (res.data.status.code !== '200') {
                throw CBSError.collectMoneyError();
            }
            return res.data;

        } catch (error) {
            this.logger.error(`Error Collecting Money: ${error}`, { url, data: deps });
            throw error;
        }
    }

    async refundMoney(deps: TCbsRefundMoneyRequest): Promise<TCbsRefundMoneyResponse> {
        this.logger.info("Refunding Money to Customer in Airtel");
        const url = `https://${this.cbsConfig.DFSP_BASE_URL}${CBS_ROUTES.refundMoney}`;

        try {
            const res = await this.httpClient.post<TCbsRefundMoneyRequest, TCbsRefundMoneyResponse>(url, deps, {
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
            grant_type: this.cbsConfig.GRANT_TYPE
        });
        return res.access_token;
    }

    //Mock Function for NBM to simulate debiting the customer
    async mockSendMoney(debitAccountId: string, creditAccountId: string, amount: number): Promise<TNBMTransactionResponse> {
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
