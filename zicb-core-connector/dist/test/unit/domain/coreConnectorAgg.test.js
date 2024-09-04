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
 This is the official list of the Mojaloop project contributors for this file.
 Names of the original copyright holders (individuals or organizations)
 should be listed with a '*' in the first column. People who have
 contributed from an organization can be listed under the organization
 that actually holds the copyright for their contributions (see the
 Gates Foundation organization for an example). Those individuals should have
 their names indented and be marked with a '-'. Email address can be added
 optionally within square brackets <email>.
 * Gates Foundation
 - Name Surname <name.surname@gatesfoundation.com>

 * Kasweka Michael Mukoko<kaswekamukoko@gmial.com>
 --------------
 **********/
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const domain_1 = require("../../../src/domain");
const CBSClient_1 = require("../../../src/domain/CBSClient");
const SDKClient_1 = require("../../../src/domain/SDKClient");
const axiosHttpClient_1 = require("../../../src/infra/axiosHttpClient");
const logger_1 = require("../../../src/infra/logger");
const config_1 = tslib_1.__importDefault(require("../../../src/config"));
const fixtures_1 = require("../../fixtures");
const core_connector_svc_1 = require("../../../src/core-connector-svc");
const axios_1 = tslib_1.__importDefault(require("axios"));
const axios_mock_adapter_1 = tslib_1.__importDefault(require("axios-mock-adapter"));
const logger = (0, logger_1.loggerFactory)({ context: 'ccAgg tests' });
const fineractConfig = config_1.default.get('fineract');
const zicbConfig = config_1.default.get('zicb');
const SDK_URL = 'http://localhost:4010';
const ML_URL = 'http://0.0.0.0:3003';
const DFSP_URL = 'http://0.0.0.0:3004';
const idType = "ACCOUNT_NO";
describe('CoreConnectorAgrregate Test -->', () => {
    let ccAggregate;
    let fineractClient;
    let zicbClient;
    let sdkClient;
    beforeAll(async () => {
        await core_connector_svc_1.Service.start();
    });
    afterAll(async () => {
        await core_connector_svc_1.Service.stop();
    });
    beforeEach(() => {
        // mockAxios.reset();
        const httpClient = axiosHttpClient_1.AxiosClientFactory.createAxiosClientInstance();
        sdkClient = SDKClient_1.SDKClientFactory.getSDKClientInstance(logger, httpClient, SDK_URL);
        zicbClient = CBSClient_1.ZicbClientFactory.createClient({
            zicbConfig,
            httpClient,
            logger,
        });
        fineractClient = CBSClient_1.FineractClientFactory.createClient({
            fineractConfig,
            httpClient,
            logger,
        });
        ccAggregate = new domain_1.CoreConnectorAggregate(fineractConfig, fineractClient, sdkClient, logger, zicbConfig, zicbClient);
    });
    describe('ZICB Test', () => {
        //Payee:  Get Parties with mock data
        test('Test Get Perties Happy Path', async () => {
            const mockAxios = new axios_mock_adapter_1.default(axios_1.default);
            mockAxios.onGet().reply(200, {
                "errorList": {},
                "operation_status": "SUCCESS",
                "preauthUUID": "149f58fd-f75f-493d-a2a9-7a32f690dd49",
                "request": {
                    "accountNos": "1019000001703",
                    "accountType": null,
                    "customerNos": null,
                    "getByAccType": false,
                    "getByCustNo": false
                },
                "request-reference": "2024286-ZICB-1719571053",
                "response": {
                    "accountList": [
                        {
                            "frozenStatus": "A",
                            "accDesc": "OLIVER MUNENGWA",
                            "loanStatus": null,
                            "accTypeDesc": "OLIVER MUNENGWA",
                            "accOpeningDate": null,
                            "loanMaturityDate": null,
                            "chequeBookFlag": "N",
                            "lastCreditActivity": null,
                            "loanRate": null,
                            "overdftUtilizedAmt": 0,
                            "accATMFacility": null,
                            "overdftAllowed": "N",
                            "loanLastPaidDate": null,
                            "maturityAmount": null,
                            "accPassBookFacility": null,
                            "currency": "ZMW",
                            "loanNextDueDate": null,
                            "creditAccountOnMaturity": null,
                            "loanAmountFinanced": null,
                            "loanAmountDisbursed": null,
                            "userLcRef": null,
                            "expiryDate": null,
                            "loanTotalAmountDue": null,
                            "overdftLmt": 0,
                            "loanEMI": 0,
                            "loanAmountDue": 434.8,
                            "loanAmount": 0,
                            "address2": "Salama Park 256",
                            "dealRef": "WA",
                            "loanType": null,
                            "dealType": null,
                            "actualAmount": 434.8,
                            "loanTotalAmountPaid": 0,
                            "address4": "Lusaka",
                            "accStatus": "E",
                            "accountOpenDate": 1622213596572,
                            "address3": "Lusaka",
                            "overdftAvailableAmt": null,
                            "loanStartDate": "28-MAY-2021",
                            "coreBankingDate": "28-JUN-2024",
                            "accNo": "1019000001703",
                            "lastDebitActivity": null,
                            "customerName": null,
                            "curBal": 434.8,
                            "issueDate": null,
                            "loanTenure": 0,
                            "jointAccount": "S",
                            "accType": "WA",
                            "closureDate": null,
                            "address1": "Brokoli Street",
                            "accName": null,
                            "branchCode": "101",
                            "prodCode": "WA",
                            "totalAmountAvailable": 434.8,
                            "avlBal": 434.8,
                            "idCustomer": "9000622",
                            "loanAmountOverdue": null,
                            "unclearFunds": 0
                        }
                    ],
                    "tekHeader": {
                        "errList": {},
                        "hostrefno": null,
                        "msgList": {},
                        "status": "SUCCESS",
                        "tekesbrefno": "a5b2a907-0598-7cc5-a21e-c395cb6bb431",
                        "username": "TEKESBRETAIL",
                        "warnList": {}
                    }
                },
                "status": 200,
                "timestamp": 1719571053807
            });
            const url = `${ML_URL}/parties/${idType}/1019000001703`;
            const res = await axios_1.default.get(url, {
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            logger.info(JSON.stringify(res.data));
            mockAxios.restore();
            expect(res.status).toEqual(200);
        });
        //Payee: Quote Requests with mock data
        test('POST /quoterequests: sdk-server - Should return quote if party info exists', async () => {
            const mockAxios = new axios_mock_adapter_1.default(axios_1.default);
            mockAxios.onPost().reply(200, {
                "expiration": "3945-08-30T22:03:24.190Z",
                "extensionList": [
                    {
                        "key": "string",
                        "value": "string"
                    }
                ],
                "geoCode": {
                    "latitude": "string",
                    "longitude": "string"
                },
                "payeeFspCommissionAmount": "72",
                "payeeFspCommissionAmountCurrency": "ZMW",
                "payeeFspFeeAmount": "0",
                "payeeFspFeeAmountCurrency": "ZMW",
                "payeeReceiveAmount": "0",
                "payeeReceiveAmountCurrency": "ZMW",
                "quoteId": "71cee55f-c58a-2a8e-8289-e18a2c80bf48",
                "transactionId": "2861d780-60f5-5127-a73b-ab0617c00f72",
                "transferAmount": "0.9",
                "transferAmountCurrency": "ZMW"
            });
            const quoteRequest = (0, fixtures_1.quoteRequestDto)();
            const url = `${ML_URL}/quoterequests`;
            const res = await axios_1.default.post(url, JSON.stringify(quoteRequest), {
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            logger.info(JSON.stringify(res.data));
            expect(res.status).toEqual(200);
        });
    });
});
//# sourceMappingURL=coreConnectorAgg.test.js.map