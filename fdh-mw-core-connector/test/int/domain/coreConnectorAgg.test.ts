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

 * Elijah Okello <elijahokello90@gmail.com>
 --------------
 **********/

import axios from 'axios';
import { Service } from '../../../src/core-connector-svc';

const SDK_SERVER_URL = 'http://localhost:3003';
const DFSP_SERVER_URL = 'http://localhost:3004';

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
    });

    describe("Payee Tests", () => {
        test("GET /health for SDK Server", async ()=>{
            const res = await axios.get(`${SDK_SERVER_URL}/health`);
            expect(res.status).toEqual(200);
        });
    });
});
