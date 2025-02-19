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
import { ZicbError } from './errors';
import {

    IZicbClient,
    TVerifyCustomerByAccountNumberRequest,
    TVerifyCustomerByAccountNumberResponse,
    TWalletToWalletInternalFundsTransferRequest,
    TWalletToWalletInternalFundsTransferResponse,
    TZicbConfig,
} from './types';

export const ZICB_ROUTE = Object.freeze({
    request_endpoint: '/api/json/commercials/zicb/banking',
});

export class ZicbClient implements IZicbClient {
    zicbConfig: TZicbConfig;
    httpClient: IHTTPClient;
    logger: ILogger;

    constructor(zicbConfig: TZicbConfig, httpClient: IHTTPClient, logger: ILogger) {
        this.zicbConfig = zicbConfig;
        this.httpClient = httpClient;
        this.logger = logger;
    }

    // Verify Customer by Account Number

    async verifyCustomerByAccountNumber(deps: TVerifyCustomerByAccountNumberRequest): Promise<TVerifyCustomerByAccountNumberResponse> {
        this.logger.info("Getting KYC Information from ZICB ");
        const url = `${this.zicbConfig.DFSP_BASE_URL}${ZICB_ROUTE.request_endpoint}`;
        this.logger.info(url);
        try {
            const res = await this.httpClient.post<TVerifyCustomerByAccountNumberRequest, TVerifyCustomerByAccountNumberResponse>(url, deps, {
                headers: this.getDefaultHeader()
            });
            // Check status code
            if (res.statusCode !== 200) {
                this.logger.error(`Failed to Customer Information: ${res.statusCode} - ${res.data}`);
                throw ZicbError.getCustomerInformationError();
            }

            // Check if accountList is empty
            if (res.data.response.accountList.length === 0) {
                this.logger.error(`No Account found for the provided account number`);
                throw ZicbError.getCustomerInformationError();
            }

            return res.data;

        } catch (error) {
            this.logger.error(`Error getting token: ${error}`, { url, data: deps });
            throw error;
        }

    }


    async walletToWalletInternalFundsTransfer(deps: TWalletToWalletInternalFundsTransferRequest): Promise<TWalletToWalletInternalFundsTransferResponse> {
        this.logger.info("Wallet to Wallet Transfer Request");
        const url = `${this.zicbConfig.DFSP_BASE_URL}${ZICB_ROUTE.request_endpoint}`;
        this.logger.info(url);

        try {
            const res = await this.httpClient.post<TWalletToWalletInternalFundsTransferRequest, TWalletToWalletInternalFundsTransferResponse>(url, deps, {
                headers: this.getDefaultHeader()
            });

            if (res.statusCode !== 200) {
                this.logger.error(`Failed to Customer Information: ${res.statusCode} - ${res.data}`);
                throw ZicbError.walletToWalletTransferError();
            }

            if (res.data.operation_status !== 'SUCCESS') {
                this.logger.error(`Failed to transfer funds: ${res.data.operation_status}`);

                const errorList = res.data.errorList;

                // Log Error List if it exists in Error List
                
                if (errorList && Object.keys(errorList).length > 0) {
                    this.logger.error(`Error List:`);
                    Object.entries(errorList).forEach(([code, message]) => {
                        this.logger.error(`${code}: ${message}`);
                    });
                }

                throw ZicbError.walletToWalletTransferError();
            }
            return res.data
        } catch (error) {
            this.logger.error(`Error getting token: ${error}`, { url, data: deps });
            throw error;
        }
    }




    private getDefaultHeader() {
        return {
            'Content-Type': 'application/json',
            'authKey': this.zicbConfig.AUTH_KEY,
        };
    }



    logFailedRefund(zicb_transfer_id: string): Promise<void> {
        // todo: to be defined based on what DFSP recommends.
        this.logger.info("Failed refund transaction id", zicb_transfer_id);
        return Promise.resolve();
    }

    logFailedIncomingTransfer(req: TWalletToWalletInternalFundsTransferRequest): Promise<void> {
        //todo: to be defined based on what DFSP recommends.
        this.logger.info("Failed disbursement request", req);
        return Promise.resolve();
    }
}
