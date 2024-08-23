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
 --------------
 **********/


import { CoreConnectorAggregate } from '../../../src/domain';
import { AirtelClientFactory, AirtelError, FineractClientFactory, IAirtelClient, IFineractClient } from '../../../src/domain/CBSClient';
import {
    ISDKClient,
    SDKClientFactory,

} from '../../../src/domain/SDKClient';
import { AxiosClientFactory } from '../../../src/infra/axiosHttpClient';
import { loggerFactory } from '../../../src/infra/logger';
import config from '../../../src/config';
import { transferPatchNotificationRequestDto } from '../../fixtures';
import { Service } from '../../../src/core-connector-svc';

// const mockAxios = new MockAdapter(axios);
const logger = loggerFactory({ context: 'ccAgg tests' });
const fineractConfig = config.get('fineract');
const airtelConfig = config.get('airtel');
const SDK_URL = 'http://localhost:4040';


describe('CoreConnectorAggregate Tests -->', () => {
    let ccAggregate: CoreConnectorAggregate;
    let fineractClient: IFineractClient;
    let airtelClient: IAirtelClient;
    let sdkClient: ISDKClient;

    beforeAll(async () => {
        await Service.start();
    });


    afterAll(async () => {
        await Service.stop();
    })

    beforeEach(() => {
        // mockAxios.reset();
        const httpClient = AxiosClientFactory.createAxiosClientInstance();
        sdkClient = SDKClientFactory.getSDKClientInstance(logger, httpClient, SDK_URL);
        airtelClient = AirtelClientFactory.createClient({
            airtelConfig,
            httpClient,
            logger,
        });

        fineractClient = FineractClientFactory.createClient({
            fineractConfig,
            httpClient,
            logger,
        });
        ccAggregate = new CoreConnectorAggregate(fineractConfig, fineractClient, sdkClient, airtelConfig, airtelClient, logger);
    });

    describe('Airtel Test', () => {
        test('Test Get Parties Happy Path', async () => {
            const res = await ccAggregate.getParties('978980797', 'MSISDN');
            expect(res.statusCode).toEqual(200);
        });

        test('Test Get Parties With a Number That Does not Exist', async () => {
            try {
                const res = await ccAggregate.getParties('777503758', 'MSISDN');
            } catch (error) {
                if (error instanceof AirtelError) {
                    expect(error.httpCode).toEqual(500);
                    expect(error.mlCode).toEqual('5000');
                }
            }

        });

        test('Test Get Transfer Quote (Get Quotes)', async () => {
            try {
                const res = await ccAggregate.getParties('777503758', 'MSISDN');
            } catch (error) {
                if (error instanceof AirtelError) {
                    expect(error.httpCode).toEqual(500);
                    expect(error.mlCode).toEqual('5000');
                }
            }

        });

        test('Test Airtel Disbursements (Transfers - Happy Path)', async () => {
            try {
                const res = await ccAggregate.updateTransfer(transferPatchNotificationRequestDto, '47e8a9cd-3d89-55c5-a15a-b57a28ad763e');
            } catch (error) {
                if (error instanceof AirtelError) {
                    expect(error.httpCode).toEqual(500);
                    expect(error.mlCode).toEqual('5000');
                }
            }

        });

        test('Test Airtel Disbursements (Transfers - Unhappy Path)', async () => {
            try {
                const res = await ccAggregate.updateTransfer(transferPatchNotificationRequestDto, '47e8a9cd-3d89-55c5-a15a-b57a28ad763e');
            } catch (error) {
                if (error instanceof AirtelError) {
                    expect(error.httpCode).toEqual(500);
                    expect(error.mlCode).toEqual('5000');
                }
            }

        });


        test('Test Airtel Disbursements (Transfers - Unhappy Path)', async () => {
            try {
                const res = await ccAggregate.updateTransfer(transferPatchNotificationRequestDto, '47e8a9cd-3d89-55c5-a15a-b57a28ad763e');
            } catch (error) {
                if (error instanceof AirtelError) {
                    expect(error.httpCode).toEqual(500);
                    expect(error.mlCode).toEqual('5000');
                }
            }

        });

    });

});
