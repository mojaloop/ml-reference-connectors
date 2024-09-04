"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ZicbClient = exports.ZICB_ROUTES = void 0;
const errors_1 = require("./errors");
exports.ZICB_ROUTES = Object.freeze({
    zicbBanking: '/api/json/commercials/zicb/banking',
});
class ZicbClient {
    zicbConfig;
    httpClient;
    logger;
    constructor(zicbConfig, httpClient, logger) {
        this.zicbConfig = zicbConfig;
        this.httpClient = httpClient;
        this.logger = logger;
    }
    // Wallet to Wallet API Call
    async walletToWalletInternalFundsTransfer(deps) {
        this.logger.info("Wallet to Wallet API Call");
        const url = `${this.zicbConfig.ZICB_BASE_URL}${exports.ZICB_ROUTES.zicbBanking}`;
        this.logger.info(url);
        const res = await this.httpClient.post(url, deps, {
            headers: this.getDefaultheader()
        });
        if (res.statusCode !== 200) {
            this.logger.error(`Failed to access ZICB server: ${res.statusCode} - ${res.data}`);
            throw errors_1.ZicbError.genericConnectionError("Failed to access ZICB server due to connection error", 500, "5000");
        }
        return res.data;
    }
    // Getting KYC information API Call
    async verifyCustomerByAccountNumber(deps) {
        this.logger.info("Getting KYC Information");
        const url = `${this.zicbConfig.ZICB_BASE_URL}${exports.ZICB_ROUTES.zicbBanking}`;
        this.logger.info(url);
        const res = await this.httpClient.post(url, deps, {
            headers: this.getDefaultheader()
        });
        if (res.statusCode !== 200) {
            this.logger.error(`Failed to access ZICB server: ${res.statusCode} - ${res.data}`);
            throw errors_1.ZicbError.genericConnectionError("Failed to access ZICB server due to connection error", 500, "5000");
        }
        return res.data;
    }
    getDefaultheader() {
        return {
            'Content-Type': 'application/json',
            'authKey': this.zicbConfig.ZICB_AUTH_KEY,
        };
    }
}
exports.ZicbClient = ZicbClient;
//# sourceMappingURL=ZicbClient.js.map