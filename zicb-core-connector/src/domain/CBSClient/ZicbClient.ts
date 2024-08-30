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

 --------------
 ******/


import { IHTTPClient, ILogger } from "../interfaces";
import { ZicbError } from "./errors";
// import { ZicbError } from "./errors";

import { IZicbClient, TGetCustomerRequest, TGetCustomerResponse, TInternalFundsTransferRequest, TInternalFundsTransferResponse, TZicbConfig } from "./types";

export const ZICB_ROUTES = Object.freeze({
    zicbBanking: '/api/json/commercials/zicb/banking',
})

export class ZicbClient implements IZicbClient {
    zicbConfig: TZicbConfig;
    httpClient: IHTTPClient;
    logger: ILogger;

    constructor(zicbConfig: TZicbConfig, httpClient: IHTTPClient, logger: ILogger) {
        this.zicbConfig = zicbConfig;
        this.httpClient = httpClient;
        this.logger = logger;
    }

    // Wallet to Wallet API Call
    async walletToWalletInternalFundsTransfer(deps: TInternalFundsTransferRequest): Promise<TInternalFundsTransferResponse> {
        this.logger.info("Wallet to Wallet API Call");
        const url =  `${this.zicbConfig.ZICB_BASE_URL}${ZICB_ROUTES.zicbBanking}`;
        this.logger.info(url);

        const res = await this.httpClient.post<TInternalFundsTransferRequest,TInternalFundsTransferResponse>(url, deps, {
            headers: this.getDefaultheader()
        });

        

        if (res.statusCode !== 200) {
            this.logger.error(`Failed to access ZICB server: ${res.statusCode} - ${res.data}`);
            throw ZicbError.genericConnectionError("Failed to access ZICB server due to connection error", 500, "5000");
        }
        return res.data

    }


    // Getting KYC information API Call
    async verifyCustomerByAccountNumber(deps: TGetCustomerRequest): Promise<TGetCustomerResponse> {
        this.logger.info("Getting KYC Information");
        const url = `${this.zicbConfig.ZICB_BASE_URL}${ZICB_ROUTES.zicbBanking}`;
        this.logger.info(url);

        const res = await this.httpClient.post<TGetCustomerRequest, TGetCustomerResponse>(url, deps, {
            headers: this.getDefaultheader()
        });

        if (res.statusCode !== 200) {
            this.logger.error(`Failed to access ZICB server: ${res.statusCode} - ${res.data}`);
            throw ZicbError.genericConnectionError("Failed to access ZICB server due to connection error", 500, "5000");
        }
        return res.data

    }

    private getDefaultheader() {
        return {
            'Content-Type': 'application/json',
            'authKey': this.zicbConfig.ZICB_AUTH_KEY,
        };
    }

}
