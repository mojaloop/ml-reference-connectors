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
const tslib_1 = require("tslib");
const axios_1 = tslib_1.__importDefault(require("axios"));
const axios_mock_adapter_1 = tslib_1.__importDefault(require("axios-mock-adapter"));
const SDKClient_1 = require("../../src/domain/SDKClient");
const axiosHttpClient_1 = require("../../src/infra/axiosHttpClient");
const logger_1 = require("../../src/infra/logger");
const mockAxios = new axios_mock_adapter_1.default(axios_1.default);
const SDK_URL = 'http://localhost:4040';
const logger = (0, logger_1.loggerFactory)({ context: 'sdk client tests' });
describe('SDK Scheme Adapter Unit Tests', () => {
    let sdkClient;
    beforeEach(() => {
        mockAxios.reset();
        const httpClient = axiosHttpClient_1.AxiosClientFactory.createAxiosClientInstance();
        sdkClient = SDKClient_1.SDKClientFactory.getSDKClientInstance(logger, httpClient, SDK_URL);
    });
    test('SDK-Scheme Adapter initiate receiveTransfer - should pass when given a receiveTransfer', async () => {
        // arrange
        const transfer = {
            homeTransactionId: 'string',
            amount: '0.347',
            amountType: 'SEND',
            currency: 'AED',
            from: {
                dateOfBirth: '8477-05-21',
                displayName: 'string',
                extensionList: [
                    {
                        key: 'string',
                        value: 'string',
                    },
                ],
                firstName: 'string',
                fspId: 'string',
                idSubValue: 'string',
                idType: 'MSISDN',
                idValue: 'string',
                lastName: 'string',
                merchantClassificationCode: 'string',
                middleName: 'string',
                type: 'CONSUMER',
            },
            to: {
                dateOfBirth: '8477-05-21',
                displayName: 'string',
                extensionList: [
                    {
                        key: 'string',
                        value: 'string',
                    },
                ],
                firstName: 'string',
                fspId: 'string',
                idSubValue: 'string',
                idType: 'MSISDN',
                idValue: 'string',
                lastName: 'string',
                merchantClassificationCode: 'string',
                middleName: 'string',
                type: 'CONSUMER',
            },
            note: 'string',
            quoteRequestExtensions: [
                {
                    key: 'string',
                    value: 'string',
                },
            ],
            subScenario: 'string',
            transactionType: 'TRANSFER',
        };
        // act
        mockAxios.onAny().reply(200, {});
        const res = await sdkClient.initiateTransfer(transfer);
        //assert
        expect(res.statusCode).toEqual(200);
    });
    test('SDK Scheme Adapter update receiveTransfer - should pass when given an Id and continuation object', async () => {
        // arrange
        const continueTransfer = {
            acceptQuote: true,
        };
        //act
        mockAxios.onAny().reply(200, {});
        const res = await sdkClient.updateTransfer(continueTransfer, 1);
        // assert
        expect(res.statusCode).toEqual(200);
    });
    // todo add tests for all failure scenarios
});
//# sourceMappingURL=sdk_scheme_adapater.test.js.map