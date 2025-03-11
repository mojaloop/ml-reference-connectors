/*****
 License
 --------------
 Copyright © 2017 Mojaloop Foundation
 The Mojaloop files are made available by the Mojaloop Foundation under the Apache License, Version 2.0 (the "License") and you may not use these files except in compliance with the License. You may obtain a copy of the License at
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

 * Elijah Okello <elijahokello90@gmail.com>
 --------------
 **********/

import axios from 'axios';
import { Service } from '../../../src/core-connector-svc';
import { loggerFactory } from '../../../src/infra/logger';
import { TQuoteRequest, TtransferPatchNotificationRequest, TtransferRequest } from '../../../src/domain';
import { quoteRequestDto, transferPatchNotificationRequestDto, transferRequestDto } from '../../fixtures';
import { randomUUID } from 'crypto';


const logger = loggerFactory({ context: 'ccAgg tests' });
const ML_URL = 'http://localhost:3003';
const DFSP_SERVER_URL = 'http://localhost:3004';

const ACCOUNT_NO = "1019000003353";
const idType = "ACCOUNT_NO";

describe('CoreConnectorAggregate Tests -->', () => {

    beforeAll(async () => {
        await Service.start();
    });

    afterAll(async () => {
        await Service.stop();
    });

    describe("Payer Tests", () => {
        test("GET /health for DFSP server ", async () => {
            const res = await axios.get(`${DFSP_SERVER_URL}/health`);
            expect(res.status).toEqual(200);
        });


        
        test('Get /parties/ACCOUNT_NO/{id}: sdk-server - Should return party info if it exists in Zicb', async () => {
            const url = `${ML_URL}/parties/ACCOUNT_NO/${ACCOUNT_NO}`;
            const res = await axios.get(url);
            logger.info(res.data);

            expect(res.status).toEqual(200);

        });


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


        
        test('POST /transfers: sdk-server - Should return receiveTransfer if party in ZICB', async () => {
            const transferRequest: TtransferRequest = transferRequestDto(idType, ACCOUNT_NO, "5");
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
            const patchNotificationRequest: TtransferPatchNotificationRequest = transferPatchNotificationRequestDto("COMPLETED", idType, ACCOUNT_NO, "5");
            const url = `${ML_URL}/transfers/${randomUUID()}`;
            const res = await axios.put(url, JSON.stringify(patchNotificationRequest), {
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            logger.info(JSON.stringify(res.data));
            expect(res.status).toEqual(200);
        });


    });

    describe("Payee Tests", () => {
        test("GET /health for SDK Server", async ()=>{
            const res = await axios.get(`${ML_URL}/health`);
            expect(res.status).toEqual(200);
        });
    });
});
