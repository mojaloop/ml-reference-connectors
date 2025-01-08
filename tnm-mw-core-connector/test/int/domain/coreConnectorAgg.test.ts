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

 * Niza Tembo <mcwayzj@gmail.com>
 * Elijah Okello <elijahokello90@gmail.com>
 --------------
 **********/


import {TQuoteRequest, TtransferPatchNotificationRequest, TtransferRequest } from '../../../src/domain';
import {TNMSendMoneyRequest, TNMUpdateSendMoneyRequest, TNMCallbackPayload } from '../../../src/domain/CBSClient';
import { loggerFactory } from '../../../src/infra/logger';
import config from '../../../src/config';
import { transferPatchNotificationRequestDto, transferRequestDto, quoteRequestDto, sendMoneyDTO, updateSendMoneyDTO, TNMCallbackPayloadDto } from '../../fixtures';
import { Service } from '../../../src/core-connector-svc';
import axios from 'axios';
import { randomUUID } from 'crypto';


jest.setTimeout(20000);
const logger = loggerFactory({ context: 'ccAgg tests' });
const ML_URL = `http://${config.get("server.SDK_SERVER_HOST")}:${config.get("server.SDK_SERVER_PORT")}`;
const DFSP_URL = `http://${config.get("server.DFSP_SERVER_HOST")}:${config.get("server.DFSP_SERVER_PORT")}`;

// Happy Path variables
const MSISDN = "0882997445";
const idType = "MSISDN";


describe('CoreConnectorAggregate Tests -->', () => {

    beforeAll(async () => {
        await Service.start();
    });


    afterAll(async () => {
        await Service.stop();
    });

    beforeEach(() => {
    });

    describe('TNM Test', () => {

        // Get Parties Test  - Payee
        test('Get /parties/MSISDN/{id}: sdk-server - Should return party info if it exists in airtel', async () => {
            const url = `${ML_URL}/parties/MSISDN/${MSISDN}`;
            const res = await axios.get(url);
            logger.info(res.data);
            expect(res.status).toEqual(200);

        });

        // Quote Requests Test  - Payee
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

        // Transfer Requests Test  - Payee
        test('POST /transfers: sdk-server - Should return receiveTransfer if party in tnm', async () => {
            const transferRequest: TtransferRequest = transferRequestDto(idType, MSISDN, "500");
            const url = `${ML_URL}/transfers`;

            const res = await axios.post(url, JSON.stringify(transferRequest), {
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            logger.info(JSON.stringify(res.data));
            expect(res.status).toEqual(201);
        });


        // Patch Transfer Requests Test - Payee
        test.skip('PUT /transfers/{id}: sdk server - Should return 200  ', async () => {
            const patchNotificationRequest: TtransferPatchNotificationRequest = transferPatchNotificationRequestDto("COMPLETED", idType, MSISDN, "100");
            const url = `${ML_URL}/transfers/a867963f-37b2-4723-9757-26bf1f28902c`;
            const res = await axios.put(url, JSON.stringify(patchNotificationRequest), {
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            logger.info(JSON.stringify(res.data));
            expect(res.status).toEqual(200);
        });

        //  Send Money - Payer

        test('Test POST/ send-money: response should be payee details ', async () => {
            const sendMoneyRequest: TNMSendMoneyRequest = sendMoneyDTO(MSISDN, "500");
            const url = `${DFSP_URL}/send-money`;

            const res = await axios.post(url, JSON.stringify(sendMoneyRequest), {
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            logger.info(JSON.stringify(res.data));

            expect(res.status).toEqual(200);
        });


        // Confirm Send Money - Payer
        test('Test Put/ send-money{id}: response should be 200', async () => {
            const updateSendMoneyRequest: TNMUpdateSendMoneyRequest = updateSendMoneyDTO(1, true, MSISDN);
            const url = `${DFSP_URL}/send-money/${randomUUID()}`;

            const res = await axios.put(url, JSON.stringify(updateSendMoneyRequest), {
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            logger.info(JSON.stringify(res.data));
            expect(res.status).toEqual(200);
        });

        // TNM Callback
        test('Test PUT /callback; response should be 200', async () => {
            const callbackRequestPayload: TNMCallbackPayload = TNMCallbackPayloadDto();
            const url = `${DFSP_URL}/callback`;

            const res = await axios.put(url, JSON.stringify(callbackRequestPayload), {
                headers: {
                    "Content-Type": 'application/json'
                }
            });
            logger.info(JSON.stringify(res.data));
            expect(res.status).toEqual(200);
        });

    });

});
