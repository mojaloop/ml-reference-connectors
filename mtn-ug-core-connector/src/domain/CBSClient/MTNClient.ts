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


 * Niza Tembo <mcwayzj@gmail.com>
 * Elijah Okello <elijahokello90@gmail.com>
 --------------
 ******/

'use strict';

import config from '../../config';
import { IHTTPClient, ILogger } from '../interfaces';
import { MTNError } from './errors';
import {
    IMTNClient,
    TMTNConfig,
    TGetTokenResponse,
    TMTNKycResponse,
    TGetKycArgs,
    TMTNDisbursementRequestBody,
    TMTNTransactionEnquiryResponse,
    TMTNTransactionEnquiryRequest,
    TMTNCollectMoneyRequest,
    TAuthParameters,
} from './types';


export const MTN_ROUTES = Object.freeze({
    getToken: '/collection/token/',
    getDisbursementToken: '/disbursement/token/',
    sendMoney: '/disbursement/v1_0/transfer',
    collectMoney: '/collection/v1_0/requesttopay',
    getKyc: `/collection/v1_0/accountholder/${config.get("mtn.SUPPORTED_ID_TYPE")}/`,
    transactionCollectionEnquiry: '/collection/v2_0/payment/',
    transactionDisbursementEnquiry: '/disbursement/v1_0/transfer/'
});

export class MTNClient implements IMTNClient {
    mtnConfig: TMTNConfig;
    httpClient: IHTTPClient;
    logger: ILogger;

    constructor(mtnConfig: TMTNConfig, httpClient: IHTTPClient, logger: ILogger) {
        this.mtnConfig = mtnConfig;
        this.httpClient = httpClient;
        this.logger = logger;
    }

    // Get Default Header

    private getDefaultHeader(subscriptionKey: string) {
        return {
            'Content-Type': 'application/json',
            'Accept': '*/*',
            'Ocp-Apim-Subscription-Key': subscriptionKey,
            'X-Target-Environment': this.mtnConfig.MTN_TARGET_ENVIRONMENT,
        };
    }

    // Authentication Header

    async getAuthHeader(deps: TAuthParameters): Promise<string> {
        this.logger.info("Getting Authorization Header");
        try {
            const tokenResponse = await this.getToken(deps);
            return `Bearer ${tokenResponse.access_token}`;
        } catch (error) {
            this.logger.error(`Error Retrieving Auth Header: ${error}`);
            throw error;
        }
    }


    // Getting Access Token

    async getToken(deps: TAuthParameters): Promise<TGetTokenResponse> {
        this.logger.info("Getting Access Token from MTN");
        // const url = `https://${this.mtnConfig.MTN_BASE_URL}${MTN_ROUTES.getToken}`;
        this.logger.info(`Request URL: ${deps.tokenUrl}`);
        try {
            // Send the POST request with an empty body (since no request payload is required)
            const res = await this.httpClient.post<unknown, TGetTokenResponse>(deps.tokenUrl, undefined, {
                headers: {
                    ...this.getDefaultHeader(deps.subscriptionKey),
                    'Authorization': `Basic ${Buffer.from(`${deps.apiClient}:${deps.apiKey}`).toString("base64")}`
                }
            });

            // Check if the status code is not 200 (OK)
            if (res.statusCode !== 200) {
                this.logger.error(`Failed To Get Token: ${res.statusCode} - ${res.data}`);
                throw MTNError.getTokenFailedError();
            }
            this.logger.info('Token Retrieved Successfully');
            return res.data;  // Return the token response
        } catch (error) {
            this.logger.error(`Error Getting Token: ${error}`, deps.tokenUrl);
            throw error;
        }
    }

    // Get KYC Information


    async getKyc(deps: TGetKycArgs): Promise<TMTNKycResponse> {
        this.logger.info("Getting KYC Information");
        try {
            const authHeader = await this.getAuthHeader({
                subscriptionKey: this.mtnConfig.MTN_COLLECTION_SUBSCRIPTION_KEY,
                tokenUrl: `https://${this.mtnConfig.MTN_BASE_URL}${MTN_ROUTES.getToken}`,
                apiClient: this.mtnConfig.MTN_COLLECTION_CLIENT_ID,
                apiKey: this.mtnConfig.MTN_COLLECTION_API_KEY
            });
            const res = await this.httpClient.get<TMTNKycResponse>(`https://${this.mtnConfig.MTN_BASE_URL}${MTN_ROUTES.getKyc}${deps.msisdn}/basicuserinfo`, {
                headers: {
                    ...this.getDefaultHeader(
                        this.mtnConfig.MTN_COLLECTION_SUBSCRIPTION_KEY,
                    ),
                    'Authorization': `${authHeader}`
                }
            });
            if (res.statusCode !== 200) {
                this.logger.error(`Failed to get KYC Information: ${res.data}`);
                throw MTNError.getKycError();
            }
            return res.data;
        } catch (error) {
            this.logger.error(`Error getting KYC Information: ${error}`);
            throw error;
        }
    }


    // Send Money


    async sendMoney(deps: TMTNDisbursementRequestBody): Promise<void> {
        this.logger.info("Sending Disbursement Body To MTN");
        const url = `https://${this.mtnConfig.MTN_BASE_URL}${MTN_ROUTES.sendMoney}`;

        try {
            const res = await this.httpClient.post<TMTNDisbursementRequestBody, unknown>(url, deps, {
                headers: {
                    ...this.getDefaultHeader(
                        this.mtnConfig.MTN_DISBURSEMENT_SUBSCRIPTION_KEY,
                    ),
                    'Authorization': `${await this.getAuthHeader({
                        subscriptionKey: this.mtnConfig.MTN_DISBURSEMENT_SUBSCRIPTION_KEY,
                        tokenUrl: `https://${this.mtnConfig.MTN_BASE_URL}${MTN_ROUTES.getDisbursementToken}`,
                        apiClient: this.mtnConfig.MTN_DISBURSEMENT_CLIENT_ID,
                        apiKey: this.mtnConfig.MTN_DISBURSEMENT_API_KEY
                    })}`,
                    'X-Reference-Id': deps.externalId
                }
            });
            if (res.statusCode !== 202) {
                this.logger.error(`Failed to Send Money: ${res.statusCode}`, { url, data: deps });
                throw MTNError.disbursmentError();
            }
            this.logger.info("Money disbursement request accepted.");
        } catch (error) {
            this.logger.error(`Error Sending Money: ${error}`, { url, data: deps });
            throw error;
        }
    }


    //  Transaction Enquiry (Disbursement) 


    async getDisbursementTransactionEnquiry(deps: TMTNTransactionEnquiryRequest): Promise<TMTNTransactionEnquiryResponse> {
        this.logger.info("Getting Transaction Status Enquiry from MTN");
        const url = `https://${this.mtnConfig.MTN_BASE_URL}${MTN_ROUTES.transactionDisbursementEnquiry}${deps.transactionId}`;
        this.logger.info(url);
        try {
            const res = await this.httpClient.get<TMTNTransactionEnquiryResponse>(url, {
                headers: {
                    ...this.getDefaultHeader(
                        this.mtnConfig.MTN_DISBURSEMENT_SUBSCRIPTION_KEY,
                    ),
                    'Authorization': `${await this.getAuthHeader({
                        subscriptionKey: this.mtnConfig.MTN_DISBURSEMENT_SUBSCRIPTION_KEY,
                        tokenUrl: `https://${this.mtnConfig.MTN_BASE_URL}${MTN_ROUTES.getToken}`,
                        apiClient: this.mtnConfig.MTN_DISBURSEMENT_CLIENT_ID,
                        apiKey: this.mtnConfig.MTN_DISBURSEMENT_API_KEY
                    })}`
                }
            });
            if (res.data.status !== 'SUCCESSFUL' && res.data.status !== 'PENDING') {
                this.logger.error(`Failed To Get Token: ${res.statusCode} - ${res.data}`);
                throw MTNError.getTokenFailedError();
            }
            return res.data;
        } catch (error) {
            this.logger.error(`Error Getting Token: ${error}`, { url, data: deps });
            throw error;
        }
    }


    // Request To Pay

    async collectMoney(deps: TMTNCollectMoneyRequest): Promise<void> {
        this.logger.info("Collecting Money from MTN");
        const url = `https://${this.mtnConfig.MTN_BASE_URL}${MTN_ROUTES.collectMoney}`;
        try {
            const res = await this.httpClient.post<TMTNCollectMoneyRequest, unknown>(url, deps, {
                headers: {
                    ...this.getDefaultHeader(
                        this.mtnConfig.MTN_COLLECTION_SUBSCRIPTION_KEY,
                    ),
                    'Authorization': `${await this.getAuthHeader({
                        subscriptionKey: this.mtnConfig.MTN_COLLECTION_SUBSCRIPTION_KEY,
                        tokenUrl: `https://${this.mtnConfig.MTN_BASE_URL}${MTN_ROUTES.getToken}`,
                        apiClient: this.mtnConfig.MTN_COLLECTION_CLIENT_ID,
                        apiKey: this.mtnConfig.MTN_COLLECTION_API_KEY
                    })}`,
                    'X-Reference-Id': deps.externalId
                }
            });
            if (res.statusCode !== 202) {
                this.logger.error(`Failed to Collect Money: ${res.statusCode}`, { url, data: deps });
                throw MTNError.collectMoneyError();
            }
            this.logger.info("Money collection request accepted.");
        } catch (error) {
            this.logger.error(`Error Collecting Money: ${error}`, { url, data: deps });
            throw error;
        }
    }


    //  Transaction Enquiry (Collection) 


    async getCollectionTransactionEnquiry(deps: TMTNTransactionEnquiryRequest): Promise<TMTNTransactionEnquiryResponse> {
        this.logger.info("Getting Transaction Status Enquiry from MTN");
        const url = `https://${this.mtnConfig.MTN_BASE_URL}${MTN_ROUTES.transactionCollectionEnquiry}${deps.transactionId}`;
        this.logger.info(url);
        try {
            const res = await this.httpClient.get<TMTNTransactionEnquiryResponse>(url, {
                headers: {
                    ...this.getDefaultHeader(
                        this.mtnConfig.MTN_COLLECTION_SUBSCRIPTION_KEY,
                    ),
                    'Authorization': `${await this.getAuthHeader({
                        subscriptionKey: this.mtnConfig.MTN_COLLECTION_SUBSCRIPTION_KEY,
                        tokenUrl: `https://${this.mtnConfig.MTN_BASE_URL}${MTN_ROUTES.getToken}`,
                        apiClient: this.mtnConfig.MTN_COLLECTION_CLIENT_ID,
                        apiKey: this.mtnConfig.MTN_COLLECTION_API_KEY
                    })}`
                }
            });
            if (res.data.status !== 'SUCCESSFUL' && res.data.status !== 'PENDING') {
                this.logger.error(`Failed To Collect Money: ${res.statusCode} - ${res.data}`);
                throw MTNError.collectMoneyError();
            }
            return res.data;
        } catch (error) {
            this.logger.error(`Error Getting Token: ${error}`, { url, data: deps });
            throw error;
        }
    }

    async logFailedIncomingTransfer(req: TMTNDisbursementRequestBody): Promise<void> {
        //todo: to be defined based on what DFSP recommends.
        this.logger.info("Failed disbursement request", req);
        return Promise.resolve();
    }

    async logFailedRefund(transaction_id: string): Promise<void> {
        // todo: to be defined based on what DFSP recommends.
        this.logger.info("Failed refund transaction id", transaction_id);
        return Promise.resolve();
    }


}
