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


 - Kasweka Michael Mukoko <kaswekamukoko@gmail.com>
 - Niza Tembo <mcwayzj@gmail.com>

 --------------
 ******/

import { IHTTPClient, ILogger } from "../interfaces";
import { TNMError } from "./errors";
import { ITNMClient as ITNMClient, TNMCollectMoneyRequest, TNMCollectMoneyResponse, TNMConfig, TnmValidateResponse, TNMRefundMoneyRequest, TNMRefundMoneyResponse, TNMTransactionEnquiryRequest, TNMTransactionEnquiryResponse, TGetKycArgs, TGetTokenArgs, TGetTokenResponse, TMakePaymentRequest, TMakePaymentResponse } from "./types";

export const TNM_ROUTES = Object.freeze({

    authenticate: '/authenticate',
    validate: '/payments/validate/',
    makePayments: '/payments',
    sendMoney: '/payments/',
    refundMoney: '/invoices/refund/',
    transactionEnquiry: '/payments/{{transaction_id}}/'
});


export class TNMClient implements ITNMClient {
    tnmConfig: TNMConfig;
    httpClient: IHTTPClient;
    logger: ILogger;

    constructor(airtelConfig: TNMConfig, httpClient: IHTTPClient, logger: ILogger) {
        this.tnmConfig = airtelConfig;
        this.httpClient = httpClient;
        this.logger = logger;
    }

    async refundPayment(deps: TNMRefundMoneyRequest): Promise<TNMRefundMoneyResponse> {
        this.logger.info(`Performing refund for receipt number ${deps.receipt_number}`);
        const url = `https://${this.tnmConfig.TNM_BASE_URL}${TNM_ROUTES.refundMoney}${deps.receipt_number}`;

        try {
            const res = await this.httpClient.post<{}, TNMRefundMoneyResponse>(url, {}, {
                headers: {
                    ...this.getDefaultHeader(),
                    'Authorization': `Bearer ${await this.getAuthHeader()}`,
                }
            });

            if (res.statusCode !== 200) {
                throw TNMError.refundMoneyError();
            }
            return res.data;
        } catch (error) {
            this.logger.error(`Error Refunding Money: ${error}`, { url, data: deps });
            throw error;
        }
    }


    async makepayment(deps: TMakePaymentRequest): Promise<TMakePaymentResponse> {
        this.logger.info(`Trying to collect money from customer with number ${deps.msisdn}`);
        const url = `https://${this.tnmConfig.TNM_BASE_URL}${TNM_ROUTES.makePayments}`;

        try {
            const res = await this.httpClient.post<TMakePaymentRequest, TMakePaymentResponse>(url, deps, {
                headers: {
                    ...this.getDefaultHeader(),
                    'Authorization': `Bearer ${await this.getAuthHeader()}`,
                }
            });

            if (res.statusCode !== 200) {
                throw TNMError.sendMoneyError();
            }
            return res.data;

        } catch (error) {
            this.logger.error(`Error Sending Money: ${error}`, { url, data: deps });
            throw error;
        }

    }


    async getToken(deps: TGetTokenArgs): Promise<TGetTokenResponse> {
        this.logger.info("Getting Access Token from TNM");
        const url = `https://${this.tnmConfig.TNM_BASE_URL}${TNM_ROUTES.authenticate}`;
        this.logger.info(url);
        try {
            const res = await this.httpClient.post<TGetTokenArgs, TGetTokenResponse>(url, deps, {
                headers: this.getDefaultHeader()
            });
            if (res.statusCode !== 200) {
                this.logger.error(`Failed to get token: ${res.statusCode} - ${res.data}`);
                throw TNMError.getTokenFailedError();
            }
            return res.data;
        } catch (error) {
            this.logger.error(`Error getting token: ${error}`, { url, data: deps });
            throw error;
        }
    }


    async getKyc(deps: TGetKycArgs): Promise<TnmValidateResponse> {
        this.logger.info("Getting KYC Information");
        const res = await this.httpClient.get<TnmValidateResponse>(`https://${this.tnmConfig.TNM_BASE_URL}${TNM_ROUTES.validate}${deps.msisdn}`, {
            headers: {
                ...this.getDefaultHeader(),
                'Authorization': `Bearer ${await this.getAuthHeader()}`
            }
        });
        if (res.data.message != 'Completed successfully') {
            throw TNMError.getKycError();
        }
        return res.data;
    }


    private getDefaultHeader() {
        return {
            'Content-Type': 'application/json',
        };
    }


    private async getAuthHeader(): Promise<string> {
        const res = await this.getToken({
            password: this.tnmConfig.TNM_PASSWORD,
            wallet: this.tnmConfig.TNM_WALLET,
        });
        return res.data.token;
    }
}