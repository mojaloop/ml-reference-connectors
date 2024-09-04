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
exports.AxiosClientFactory = exports.defaultHttpOptions = void 0;
const axiosClient_1 = require("./axiosClient");
const logger_1 = require("../logger");
exports.defaultHttpOptions = Object.freeze({
    timeout: 3000,
    headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
    },
    transitional: {
        clarifyTimeoutError: true, // to throw ETIMEDOUT error instead of generic ECONNABORTED on request timeouts
    },
});
class AxiosClientFactory {
    static createAxiosClientInstance() {
        return new axiosClient_1.AxiosHTTPClient({
            options: exports.defaultHttpOptions,
            logger: (0, logger_1.loggerFactory)({ context: 'http' }),
        });
    }
}
exports.AxiosClientFactory = AxiosClientFactory;
//# sourceMappingURL=axiosClientFactory.js.map