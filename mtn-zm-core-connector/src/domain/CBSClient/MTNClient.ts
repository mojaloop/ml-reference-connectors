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
    TGetCustomerInfoDeps,
    TGetCustomerResponse,
    TGetTokenResponse,
    TMTNKycResponse,
    TGetKycArgs,
} from './types';


export const MTN_ROUTES = Object.freeze({
    getToken: '/collection/token/',
    getKyc: '/collection/v1_0/accountholder/msisdn/',
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
    async getCustomer(deps: TGetCustomerInfoDeps): Promise<THttpResponse<TGetCustomerResponse>> {
        this.logger.info(`Getting customer information ${deps}`);
        return {
            data:{
                property: ''
            },
            statusCode: 200
        };
    }

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

    async getAuthHeader(): Promise<string> {
        this.logger.info("Getting Authorization Header");
        try {
            const tokenResponse = await this.getToken();
            return `Bearer ${tokenResponse.access_token}`;
        } catch (error) {
            this.logger.error(`Error retrieving auth header: ${error}`);
            throw error;
        }
    }

    async getToken(): Promise<TGetTokenResponse> {
        this.logger.info("Getting Access Token from MTN");
        const url = `https://${this.mtnConfig.MTN_BASE_URL}${MTN_ROUTES.getToken}`;
        this.logger.info(url);
        try {
            const res = await this.httpClient.post<TGetTokenResponse>(url, undefined, {
                headers: this.getDefaultHeader()
            });

            if (res.statusCode !== 200) {
                this.logger.error(`Failed to get token: ${res.statusCode} - ${res.data}`);
                throw MTNError.getTokenFailedError();
            }

            return res.data as TGetTokenResponse;
        } catch (error) {
            this.logger.error(`Error getting token: ${error}`, { url });
            throw error;
        }
    }
    
    

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
                this.logger.error(`Failed to get KYC information: ${res.data}`);
                throw MTNError.getKycError();
            }
            return res.data;
        } catch (error) {
            this.logger.error(`Error getting KYC information: ${error}`);
            throw error;
        }
    }
    
}
