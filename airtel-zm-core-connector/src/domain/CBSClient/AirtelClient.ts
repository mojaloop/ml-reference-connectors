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


 - Kasweka Michael Mukoko <kaswekamukoko@gmail.com>
 - Niza Tembo <mcwayzj@gmail.com>

 --------------
 ******/

import { IHTTPClient, ILogger } from "../interfaces";
import { AirtelError } from "./errors";
import {IAirtelClient, TAirtelCollectMoneyRequest, TAirtelCollectMoneyResponse, TAirtelConfig, TAirtelDisbursementRequestBody, TAirtelDisbursementResponse, TAirtelKycResponse, TAirtelRefundMoneyRequest, TAirtelRefundMoneyResponse, TAirtelTransactionEnquiryRequest, TAirtelTransactionEnquiryResponse, TGetKycArgs, TGetTokenArgs, TGetTokenResponse } from "./types";

export const AIRTEL_ROUTES = Object.freeze({
    getToken: '/auth/oauth2/token',
    getKyc: '/standard/v1/users/',
    sendMoney: '/standard/v3/disbursements',
    collectMoney: '/merchant/v1/payments/',
    refundMoney: '/standard/v2/payments/refund',
    transactionEnquiry: '/standard/v1/payments/'
});


export class AirtelClient implements IAirtelClient {
    airtelConfig: TAirtelConfig;
    httpClient: IHTTPClient;
    logger: ILogger;

    constructor(airtelConfig: TAirtelConfig, httpClient: IHTTPClient, logger: ILogger) {
        this.airtelConfig = airtelConfig;
        this.httpClient = httpClient;
        this.logger = logger;
    }


    async refundMoney(deps: TAirtelRefundMoneyRequest): Promise<TAirtelRefundMoneyResponse> {
        this.logger.info("Refunding Money to Customer in Airtel");
        const url = `https://${this.airtelConfig.AIRTEL_BASE_URL}${AIRTEL_ROUTES.refundMoney}`;

        try{
            const res = await this.httpClient.post<TAirtelRefundMoneyRequest,TAirtelRefundMoneyResponse>(url, deps,{
                headers: {
                    ...this.getDefaultHeader(),
                    'Authorization': `Bearer ${await this.getAuthHeader()}`,
                }
            });
            if (res.data.status.code !== '200') {
                throw AirtelError.refundMoneyError();
            }
            return res.data;
        }catch(error){
            this.logger.error(`Error Refunding Money: ${error}`, { url, data: deps });
            throw error;
        }
    }


    async collectMoney(deps: TAirtelCollectMoneyRequest): Promise<TAirtelCollectMoneyResponse> {
        this.logger.info("Collecting Money from Airtel");
        const url = `https://${this.airtelConfig.AIRTEL_BASE_URL}${AIRTEL_ROUTES.collectMoney}`;

        try {
            const res = await this.httpClient.post<TAirtelCollectMoneyRequest, TAirtelCollectMoneyResponse>(url, deps, {
                headers: {
                    ...this.getDefaultHeader(),
                    'Authorization': `Bearer ${await this.getAuthHeader()}`,
                }
            });
            if (res.data.status.code !== '200') {
                throw AirtelError.collectMoneyError();
            }
            return res.data;
            
        }catch(error){
            this.logger.error(`Error Collecting Money: ${error}`, { url, data: deps });
            throw error;
        }
    }

    


    async sendMoney(deps: TAirtelDisbursementRequestBody): Promise<TAirtelDisbursementResponse> {
        this.logger.info("Sending Disbursement Body To Airtel");
        const url = `https://${this.airtelConfig.AIRTEL_BASE_URL}${AIRTEL_ROUTES.sendMoney}`;
        try {
            const res = await this.httpClient.post<TAirtelDisbursementRequestBody, TAirtelDisbursementResponse>(url, deps,
                {
                    headers: {
                        ...this.getDefaultHeader(),
                        'Authorization': `Bearer ${await this.getAuthHeader()}`,
                    }
                }
            );

            if (res.data.status.code !== '200') {
                throw AirtelError.disbursmentError();
            }
            return res.data;
        } catch (error) {
            this.logger.error(`Error Sending Money: ${error}`, { url, data: deps });
            throw error;
        }
    }

    //  Get transaction Enquiry 
    
    async getTransactionEnquiry(deps: TAirtelTransactionEnquiryRequest): Promise<TAirtelTransactionEnquiryResponse> {
        this.logger.info("Getting Transaction Status Enquiry from Airtel");
        const url = `https://${this.airtelConfig.AIRTEL_BASE_URL}${AIRTEL_ROUTES.transactionEnquiry}${deps.transactionId}`;
        this.logger.info(url);
        try {
            const res = await this.httpClient.get<TAirtelTransactionEnquiryResponse>(url, {
                headers: {
                    ...this.getDefaultHeader(),
                    'Authorization': `Bearer ${await this.getAuthHeader()}`
                }
            });
            
            if (res.data.status.code !== '200') {
                this.logger.error(`Failed to get token: ${res.statusCode} - ${res.data}`);
                throw AirtelError.getTokenFailedError();
            }
            return res.data;
        } catch (error) {
            this.logger.error(`Error getting token: ${error}`, { url, data: deps });
            throw error;
        }

    }

    async getToken(deps: TGetTokenArgs): Promise<TGetTokenResponse> {
        this.logger.info("Getting Access Token from Airtel");
        const url = `https://${this.airtelConfig.AIRTEL_BASE_URL}${AIRTEL_ROUTES.getToken}`;
        this.logger.info(url);
        try {
            const res = await this.httpClient.post<TGetTokenArgs, TGetTokenResponse>(url, deps, {
                headers: this.getDefaultHeader()
            });
            if (res.statusCode !== 200) {
                this.logger.error(`Failed to get token: ${res.statusCode} - ${res.data}`);
                throw AirtelError.getTokenFailedError();
            }
            return res.data;
        } catch (error) {
            this.logger.error(`Error getting token: ${error}`, { url, data: deps });
            throw error;
        }
    }


    async getKyc(deps: TGetKycArgs): Promise<TAirtelKycResponse> {
        this.logger.info("Getting KYC Information");
        const res = await this.httpClient.get<TAirtelKycResponse>(`https://${this.airtelConfig.AIRTEL_BASE_URL}${AIRTEL_ROUTES.getKyc}${deps.msisdn}`, {
            headers: {
                ...this.getDefaultHeader(),
                'Authorization': `Bearer ${await this.getAuthHeader()}`
            }
        });
        if (res.data.status.code !== '200') {
            throw AirtelError.getKycError();
        }
        return res.data;
    }


    private getDefaultHeader() {
        return {
            'Content-Type': 'application/json',
            'X-Country': this.airtelConfig.X_COUNTRY,
            'X-Currency': this.airtelConfig.X_CURRENCY,
        };
    }


    private async getAuthHeader(): Promise<string> {
        const res = await this.getToken({
            client_secret: this.airtelConfig.CLIENT_SECRET,
            client_id: this.airtelConfig.CLIENT_ID,
            grant_type: this.airtelConfig.GRANT_TYPE
        });
        return res.access_token;
    }

    logFailedRefund(airtel_money_id: string): Promise<void> {
        // todo: to be defined based on what DFSP recommends.
        this.logger.info("Failed refund transaction id", airtel_money_id);
        return Promise.resolve();
    }

    logFailedIncomingTransfer(req: TAirtelDisbursementRequestBody): Promise<void> {
        //todo: to be defined based on what DFSP recommends.
        this.logger.info("Failed disbursement request",req);
        return Promise.resolve();
    }

}