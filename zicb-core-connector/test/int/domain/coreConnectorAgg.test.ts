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


import { CoreConnectorAggregate, TQuoteRequest, TtransferRequest } from '../../../src/domain';
import { ZicbClientFactory, ZicbError, FineractClientFactory, IZicbClient, IFineractClient, } from '../../../src/domain/CBSClient';
import {
    ISDKClient,
    SDKClientFactory,

} from '../../../src/domain/SDKClient';
import { AxiosClientFactory } from '../../../src/infra/axiosHttpClient';
import { loggerFactory } from '../../../src/infra/logger';
import config from '../../../src/config';
import { quoteRequestDto, transferRequestDto } from '../../fixtures';
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
            expect(res.status).toEqual(200);
        });

    });
}); 

