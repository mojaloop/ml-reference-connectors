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
 - Niza Tembo <mcwayzj@gmail.com>
 --------------
 ******/

'use strict';

import { IHTTPClient, ILogger, THttpResponse } from '../interfaces';
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
    TMTNCollectMoneyResponse,

} from './types';


export const MTN_ROUTES = Object.freeze({
    getToken: '/collection/token/',
    sendMoney: '/disbursement/v1_0/transfer',
    collectMoney: '/collection/v1_0/requesttopay',
    getKyc: '/collection/v1_0/accountholder/msisdn/',
    transactionCollectionEnquiry: '/collection/v2_0/payment/',
    transactionDisbursementEnquiry: '/disbursement/v1_0/transfer/'
});

export class MTNClient implements IMTNClient{
    mtnConfig: TMTNConfig;
    httpClient: IHTTPClient;
    logger: ILogger;

    constructor(mtnConfig: TMTNConfig, httpClient: IHTTPClient, logger: ILogger) {
        this.mtnConfig = mtnConfig;
        this.httpClient = httpClient;
        this.logger = logger;
    }


    // Get Default Header


    private getDefaultHeader() {
        return {
            'Content-Type': 'application/json',
            'Accept': '*/*',
            'Ocp-Apim-Subscription-Key': this.mtnConfig.MTN_SUBSCRIPTION_KEY,
            'Authorization': `Basic ${this.mtnConfig.MTN_ENCODED_CREDENTIALS}`
        };
    }
    private getDefaultHeaders() {
        return {
            'Content-Type': 'application/json',
            'Accept': '*/*',
            'Ocp-Apim-Subscription-Key': this.mtnConfig.MTN_SUBSCRIPTION_KEY
        };
    }

    // Authentication Header
    
    async getAuthHeader(): Promise<string> {
        this.logger.info("Getting Authorization Header");
        try {
            const tokenResponse = await this.getToken();
            return `Bearer ${tokenResponse.access_token}`;
        } catch (error) {
            this.logger.error(`Error Retrieving Auth Header: ${error}`);
            throw error;
        }
    }


    // Getting Access Token

    async getToken(): Promise<TGetTokenResponse> {
        this.logger.info("Getting Access Token From MTN");
        const url = `https://${this.mtnConfig.MTN_BASE_URL}${MTN_ROUTES.getToken}`;
        this.logger.info(url);
        try {
            const res = await this.httpClient.post<TGetTokenResponse>(url, undefined, {
                headers: this.getDefaultHeader()
            });
            if (res.statusCode !== 200) {
                this.logger.error(`Failed To Get Token: ${res.statusCode} - ${res.data}`);
                throw MTNError.getTokenFailedError();
            }
            return res.data as TGetTokenResponse;
        } catch (error) {
            this.logger.error(`Error Getting Token: ${error}`, { url });
            throw error;
        }
    }
    

    // Get KYC Information


    async getKyc(deps: TGetKycArgs): Promise<TMTNKycResponse> {
        this.logger.info("Getting KYC Information");
        try {
            const authHeader = await this.getAuthHeader();
            const res = await this.httpClient.get<TMTNKycResponse>(`https://${this.mtnConfig.MTN_BASE_URL}${MTN_ROUTES.getKyc}${deps.msisdn}/basicuserinfo`, {
                headers: {
                    ...this.getDefaultHeaders(),
                    'Authorization': authHeader
                }
            });
            if (res.data.status !== '200') {
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
            const res = await this.httpClient.post<TMTNDisbursementRequestBody, any>(url, deps, {
                headers: {
                    ...this.getDefaultHeader(),
                    'Authorization': `Bearer ${await this.getAuthHeader()}`,
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
                    ...this.getDefaultHeader(),
                    'Authorization': `Bearer ${await this.getAuthHeader()}`
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

    async collectMoney(deps: TMTNCollectMoneyRequest): Promise<TMTNCollectMoneyResponse> {
        this.logger.info("Collecting Money from MTN");
        const url = `https://${this.mtnConfig.MTN_BASE_URL}${MTN_ROUTES.collectMoney}`;
        
        try {
            const res = await this.httpClient.post<TMTNCollectMoneyRequest, any>(url, deps, {
                headers: {
                    ...this.getDefaultHeader(),
                    'Authorization': `Bearer ${await this.getAuthHeader()}`,
                }
            });
            if (res.statusCode !== 202) {
                this.logger.error(`Failed to Collect Money: ${res.statusCode}`, { url, data: deps });
                throw MTNError.collectMoneyError();
            }
            this.logger.info("Money collection request accepted.");
            return res.data;
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
                    ...this.getDefaultHeader(),
                    'Authorization': `Bearer ${await this.getAuthHeader()}`
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
    
    
}
