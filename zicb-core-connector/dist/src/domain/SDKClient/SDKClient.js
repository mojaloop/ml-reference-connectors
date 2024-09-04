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
Object.defineProperty(exports, "__esModule", { value: true });
exports.SDKClient = void 0;
const errors_1 = require("./errors");
class SDKClient {
    logger;
    httpClient;
    SDK_SCHEME_ADAPTER_BASE_URL;
    constructor(deps) {
        this.logger = deps.logger;
        this.httpClient = deps.httpClient;
        this.SDK_SCHEME_ADAPTER_BASE_URL = deps.schemeAdapterUrl;
    }
    async initiateTransfer(transfer) {
        this.logger.info('SDKClient initiate receiveTransfer', transfer);
        try {
            const res = await this.httpClient.post(`${this.SDK_SCHEME_ADAPTER_BASE_URL}/transfers`, transfer, {
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            if (res.statusCode != 200) {
                throw new Error(`Invalid response statusCode: ${res.statusCode}`);
            }
            return res;
        }
        catch (error) {
            const errMessage = error.message || 'Unknown Error';
            this.logger.error(`error in initiateTransfer: ${errMessage}`);
            throw errors_1.SDKClientError.initiateTransferError(errMessage);
        }
    }
    async updateTransfer(transferAccept, id) {
        this.logger.info('SDKClient initiate update receiveTransfer %s', transferAccept);
        try {
            const res = await this.httpClient.put(`${this.SDK_SCHEME_ADAPTER_BASE_URL}/transfers/${id}`, transferAccept, {
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            if (res.statusCode != 200) {
                const { statusCode, data, error } = res;
                const errMessage = 'SDKClient initiate update receiveTransfer error: failed with wrong statusCode';
                this.logger.warn(errMessage, { statusCode, data, error });
                throw errors_1.SDKClientError.continueTransferError(errMessage, { httpCode: statusCode });
            }
            return res;
        }
        catch (error) {
            if (error instanceof errors_1.SDKClientError)
                throw error;
            const errMessage = `SDKClient initiate update receiveTransfer error: ${error?.message}`;
            this.logger.error(errMessage, { error });
            throw errors_1.SDKClientError.continueTransferError(errMessage);
        }
    }
}
exports.SDKClient = SDKClient;
//# sourceMappingURL=SDKClient.js.map