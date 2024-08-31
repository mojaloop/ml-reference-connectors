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


import { CoreConnectorAggregate, TQuoteRequest, TtransferPatchNotificationRequest, TtransferRequest } from '../../../src/domain';
import { ZicbClientFactory, ZicbError, FineractClientFactory, IZicbClient, IFineractClient, } from '../../../src/domain/CBSClient';
import {
    ISDKClient,
    SDKClientFactory,

} from '../../../src/domain/SDKClient';
import { AxiosClientFactory } from '../../../src/infra/axiosHttpClient';
import { loggerFactory } from '../../../src/infra/logger';
import config from '../../../src/config';
import { quoteRequestDto, transferPatchNotificationRequestDto, transferRequestDto } from '../../fixtures';
import { Service } from '../../../src/core-connector-svc';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import { randomUUID } from 'crypto';


const logger = loggerFactory({ context: 'ccAgg tests' });
const fineractConfig = config.get('fineract');
const zicbConfig = config.get('zicb');
const SDK_URL = 'http://localhost:4010';
const ML_URL = 'http://0.0.0.0:3003';
const DFSP_URL = 'http://0.0.0.0:3004';

const idType = "ACCOUNT_NO";
const ACCOUNT_NO = "1010035376132"

describe('CoreConnectorAgrregate Test -->', () => {
    let ccAggregate: CoreConnectorAggregate;
    let fineractClient: IFineractClient;
    let zicbClient: IZicbClient;
    let sdkClient: ISDKClient;

    beforeAll(async () => {
        await Service.start();
    });


    afterAll(async () => {
        await Service.stop();
    });

    beforeEach(() => {
        // mockAxios.reset();
        const httpClient = AxiosClientFactory.createAxiosClientInstance();
        sdkClient = SDKClientFactory.getSDKClientInstance(logger, httpClient, SDK_URL);
        zicbClient = ZicbClientFactory.createClient({
            zicbConfig,
            httpClient,
            logger,
        });

        fineractClient = FineractClientFactory.createClient({
            fineractConfig,
            httpClient,
            logger,
        });
        ccAggregate = new CoreConnectorAggregate(fineractConfig, fineractClient, sdkClient, logger, zicbConfig, zicbClient);
    });
    describe('ZICB Test', ()=> {
        //Payee:  Get Parties 
        test('Test Get Perties Happy Path', async() =>{

            const url = `${ML_URL}/parties/${idType}/1019000001703`;
            const res = await axios.get(url, {
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            logger.info(JSON.stringify(res.data));
            expect(res.status).toEqual(200);
           
        });

        //Payee: Quote Requests
        test('POST /quoterequests: sdk-server - Should return quote if party info exists', async () => {
            const quoteRequest: TQuoteRequest = quoteRequestDto();
            const url = `${ML_URL}/quoterequests`;

            const res = await axios.post(url, JSON.stringify(quoteRequest), {
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            logger.info(JSON.stringify(res.data));

            expect(res.status).toEqual(200);
        });


        test('POST /transfers: sdk-server - Should return receiveTransfer if party in zicb', async () => {
            const transferRequest: TtransferRequest = transferRequestDto(idType, ACCOUNT_NO , "500");
            const url = `${ML_URL}/transfers`;

            const res = await axios.post(url, JSON.stringify(transferRequest), {
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            logger.info(JSON.stringify(res.data));
            expect(res.status).toEqual(201);
          

        });


        
        test('PUT /transfers/{id}: sdk server - Should return 200  ', async () => {
            const mockAxios = new MockAdapter(axios);
            mockAxios.onPut().reply(200, {
                "errorList": {
                    "AC-VAC05": "Account 1010035376132 Dormant",
                    "ST-SAVE-054": "Failed to Save",
                    "UP-PMT-90": "Insufficient account balance"
                },
                "operation_status": "FAIL",
                "preauthUUID": "80626448-d8e5-48fe-a40c-8446495e4be3",
                "request": {
                    "amount": "2000",
                    "destAcc": "1010035376132",
                    "destBranch": "001",
                    "payCurrency": "ZMW",
                    "payDate": "2024-07-03",
                    "referenceNo": "1720015165",
                    "remarks": "Being payment for zxy invoice numner 12345 refred 12345",
                    "srcAcc": "1019000002881",
                    "srcBranch": "101",
                    "srcCurrency": "ZMW",
                    "transferTyp": "INTERNAL"
                },
                "request-reference": "202437-ZICB-1720015166",
                "response": {
                    "amountCredit": null,
                    "amountDebit": null,
                    "destAcc": null,
                    "destBranch": null,
                    "exchangeRate": null,
                    "payCurrency": null,
                    "payDate": null,
                    "srcAcc": null,
                    "srcBranch": null,
                    "srcCurrency": null,
                    "tekHeader": {
                        "errList": {
                            "AC-VAC05": "Account 1010035376132 Dormant",
                            "ST-SAVE-054": "Failed to Save",
                            "UP-PMT-90": "Insufficient account balance"
                        },
                        "hostrefno": null,
                        "msgList": {},
                        "status": "FAIL",
                        "tekesbrefno": "d64fa5dd-2eb7-c284-c4d1-9fe7f183ab49",
                        "username": "TEKESBRETAIL",
                        "warnList": {}
                    }
                },
                "status": 200,
                "timestamp": 1720015166319
            });

            const patchNotificationRequest: TtransferPatchNotificationRequest = transferPatchNotificationRequestDto("COMPLETED", idType, ACCOUNT_NO, "500");
            const url = `${ML_URL}/transfers/a867963f-37b2-4723-9757-26bf1f28902c`;
            const res = await axios.put(url, JSON.stringify(patchNotificationRequest), {
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            logger.info(JSON.stringify(res.data));
            mockAxios.restore();
            expect(res.status).toEqual(200);
        });


    });
}); 

