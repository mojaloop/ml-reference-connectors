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

import { IHTTPClient, ILogger } from '../interfaces';
import { CBSError } from './errors';
import {
    INBMClient,
    TNBMTransferMoneyRequest,
    TNBMTransferMoneyResponse,
    TNBMConfig,
    TNBMKycResponse,
    TGetKycArgs,
    TGetTokenArgs,
    TGetTokenResponse,
} from './types';

export const CBS_ROUTES = Object.freeze({
    getToken: '/auth/token',
    getKyc: '/api/',
    transferMoney: '/api/transfer',
   
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
        const res = await this.httpClient.get<TNBMKycResponse>(`${this.cbsConfig.DFSP_BASE_URL}${CBS_ROUTES.getKyc}${deps.account_number}`, {
            headers: {
                ...this.getDefaultHeader(),
                'Authorization': `Bearer ${await this.getAuthHeader()}`
            }
        });
        if (!(res.data.message == 'Success')) {
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

    async sendMoney(deps: TNBMTransferMoneyRequest): Promise<TNBMTransferMoneyResponse> {
        this.logger.info("Sending Disbursement Body To National Bank");
        const url = `${this.cbsConfig.DFSP_BASE_URL}${CBS_ROUTES.transferMoney}`;
        try {
            const res = await this.httpClient.post<TNBMTransferMoneyRequest, TNBMTransferMoneyResponse>(url, deps,
                {
                    headers: {
                        ...this.getDefaultHeader(),
                        'Authorization': `Bearer ${await this.getAuthHeader()}`,
                    }
                }
            );

            if (res.data.message !== 'Success') {
                throw CBSError.disbursmentError();
            }
            return res.data;
        } catch (error) {
            this.logger.error(`Error Sending Money: ${error}`, { url, data: deps });
            throw error;
        }
    }
    async makeTransfer(deps: TNBMTransferMoneyRequest): Promise<TNBMTransferMoneyResponse> {
        this.logger.info("Collecting Money from National Bank", deps.description);
        const url = `${this.cbsConfig.DFSP_BASE_URL}${CBS_ROUTES.transferMoney}`;

        try {
            const res = await this.httpClient.post<TNBMTransferMoneyRequest, TNBMTransferMoneyResponse>(url, deps, {
                headers: {
                    ...this.getDefaultHeader(),
                    'Authorization': `Bearer ${await this.getAuthHeader()}`,
                }
            });
            if (res.data.message !== 'Success') {
                throw CBSError.collectMoneyError();
            }
            return res.data;

        } catch (error) {
            this.logger.error(`Error Collecting Money: ${error}`, { url, data: deps });
            throw error;
        }
    }

    async refundMoney(deps: TNBMTransferMoneyRequest): Promise<TNBMTransferMoneyResponse> {
        this.logger.info("Refunding Money to Customer in National Bank");
        const url = `${this.cbsConfig.DFSP_BASE_URL}${CBS_ROUTES.transferMoney}`;

        try {
            const res = await this.httpClient.post<TNBMTransferMoneyRequest, TNBMTransferMoneyResponse>(url, deps, {
                headers: {
                    ...this.getDefaultHeader(),
                    'Authorization': `Bearer ${await this.getAuthHeader()}`,
                }
            });
            if (res.data.message !== 'Success') {
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
        };
    }


    private async getAuthHeader(): Promise<string> {
        const res = await this.getToken({
            clientSecret: this.cbsConfig.CLIENT_SECRET,
            clientId: this.cbsConfig.CLIENT_ID,
           
        });
        return res.access_token;
    }

}
