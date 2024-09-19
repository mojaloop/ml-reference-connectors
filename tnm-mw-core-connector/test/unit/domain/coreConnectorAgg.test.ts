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

 * Eugen Klymniuk <eugen.klymniuk@infitx.com>
 --------------
 **********/

import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';

import { CoreConnectorAggregate, TQuoteRequest, TtransferPatchNotificationRequest, TtransferRequest } from '../../../src/domain';
import {
    ISDKClient,
    SDKClientFactory,
} from '../../../src/domain/SDKClient';
import { AxiosClientFactory } from '../../../src/infra/axiosHttpClient';
import { loggerFactory } from '../../../src/infra/logger';
import config from '../../../src/config';
import { TNMClientFactory, ITNMClient } from '../../../src/domain/CBSClient';
import { Service } from '../../../src/core-connector-svc';
import { quoteRequestDto, transferPatchNotificationRequestDto, transferRequestDto } from '../../fixtures';

const mockAxios = new MockAdapter(axios);
const logger = loggerFactory({ context: 'ccAgg tests' });
const tnmConfig = config.get("tnm");
const SDK_URL = 'http://localhost:4010';
const ML_URL = 'http://0.0.0.0:3003';
const idType = "MSISDN";
const MSISDN_NO = "0881544547";

describe('CoreConnectorAggregate Tests -->', () => {
    let ccAggregate: CoreConnectorAggregate;
    let tnmClient: ITNMClient;
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
        tnmClient = TNMClientFactory.createClient({ tnmConfig: tnmConfig, httpClient, logger });
        ccAggregate = new CoreConnectorAggregate(sdkClient, tnmClient, tnmConfig, logger);
    });

    describe("TNM Payee Test", () => {
        test("Get Parties Happy Path", async () => {
            mockAxios.onGet().replyOnce(200, {

                "message": "Completed successfully",
                "errors": [],
                "trace": [],
                "data": {
                    "full_name": "Promise Mphoola"
                }

            });

            mockAxios.onPost().replyOnce(200, {
                "message": "Completed successfully",
                "errors": [],
                "trace": [],
                "data": {
                    "token": "3|i6cvlcmyDKMzpczXol6QTbwMWzIgZI25AfwdOfCG",
                    "expires_at": "2023-07-13 10:56:45"
                }
            });

            const kyc_res = await ccAggregate.getParties('0881544547', idType);
            logger.info("Returned Data ==>", kyc_res.data)

            logger.info(JSON.stringify(kyc_res.data));
            mockAxios.restore();
            expect(kyc_res.statusCode).toEqual(200);
        });

        test('POST /quoterequests: sdk-server - Should return quote if party info exists', async () => {
            mockAxios.onGet().reply(200, {

                "message": "Completed successfully",
                "errors": [],
                "trace": [],
                "data": {
                    "full_name": "Promise Mphoola"
                }

            });

            mockAxios.onPost().reply(200, {
                "message": "Completed successfully",
                "errors": [],
                "trace": [],
                "data": {
                    "token": "3|i6cvlcmyDKMzpczXol6QTbwMWzIgZI25AfwdOfCG",
                    "expires_at": "2023-07-13 10:56:45"
                }
            });

            const quoteRequest: TQuoteRequest = quoteRequestDto(undefined,undefined,"1000");

            const res = await ccAggregate.quoteRequest(quoteRequest);

            logger.info(JSON.stringify(res));
            const fees = Number(config.get('tnm.SENDING_SERVICE_CHARGE'))/100 * Number(quoteRequest.amount);
            expect(res.payeeFspFeeAmount).toEqual(fees.toString());

        });


        test('POST /transfers: sdk-server - Should return receiveTransfer if party in tnm', async () => {
            const transferRequest: TtransferRequest = transferRequestDto(idType, MSISDN_NO, "50");
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
                "message": "Completed successfully",
                "errors": [],
                "trace": [],
                "data": {
                    "transaction_id": "ljzowczj",
                    "receipt_number": "AGC00B5MCA"
                }
            });

            const patchNotificationRequest: TtransferPatchNotificationRequest = transferPatchNotificationRequestDto("COMPLETED", idType, MSISDN_NO, "500");
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
