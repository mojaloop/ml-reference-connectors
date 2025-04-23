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

 * Niza Tembo <mcwayzj@gmail.com>
 * Elijah Okello <elijahokello90@gmail.com>
 * Kasweka Michael Mukoko <kaswekamukoko@gmail.com>
 --------------
 **********/


 import { CoreConnectorAggregate, TQuoteRequest, TtransferPatchNotificationRequest, TtransferRequest } from '../../../src/domain';
 import { AirtelClientFactory, AirtelError,  IAirtelClient, TAirtelMerchantPaymentRequest, TAirtelSendMoneyRequest, TAirtelUpdateMerchantPaymentRequest, TAirtelUpdateSendMoneyRequest, TCallbackRequest} from '../../../src/domain/CBSClient';
 import {
     ISDKClient,
     SDKClientFactory,
 
 } from '../../../src/domain/SDKClient';
 import { AxiosClientFactory } from '../../../src/infra/axiosHttpClient';
 import { loggerFactory } from '../../../src/infra/logger';
 import config from '../../../src/config';
 import { transferPatchNotificationRequestDto, transferRequestDto, quoteRequestDto, sendMoneyMerchantPaymentDTO, updateSendMoneyMerchantPaymentDTO, callbackPayloadDto } from '../../fixtures';
 import { Service } from '../../../src/core-connector-svc';
 import axios from 'axios';
 import MockAdapter from 'axios-mock-adapter';
 import { randomUUID } from 'crypto';
 
 
 jest.setTimeout(20000);
 const logger = loggerFactory({ context: 'ccAgg tests' });
 const airtelConfig = config.get('airtel');
 const SDK_URL = 'http://localhost:4010';
 const ML_URL = 'http://0.0.0.0:3003';
 const DFSP_URL = 'http://0.0.0.0:3004';
 
 // Happy Path variables
 const MSISDN = "971938765";
 const idType = "MSISDN";
 
 
 describe('CoreConnectorAggregate Tests -->', () => {
     let ccAggregate: CoreConnectorAggregate;
     let airtelClient: IAirtelClient;
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
         airtelClient = AirtelClientFactory.createClient({
             airtelConfig,
             httpClient,
             logger,
         });
         ccAggregate = new CoreConnectorAggregate(sdkClient, airtelConfig, airtelClient, logger);
     });
 
     describe('Airtel Test', () => {
 
         test('Test Get Parties Happy Path', async () => {
             const res = await ccAggregate.getParties('978980797', 'MSISDN');
             expect(res.statusCode).toEqual(200);
         });
 
         test('Test Get Parties With a Number That Does not Exist', async () => {
             try {
                 await ccAggregate.getParties('777503758', 'MSISDN');
             } catch (error) {
                 if (error instanceof AirtelError) {
                     expect(error.httpCode).toEqual(500);
                     expect(error.mlCode).toEqual('5000');
                 }
             }
 
         });
 
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
         test('POST /transfers: sdk-server - Should return receiveTransfer if party in airtel', async () => {
             const transferRequest: TtransferRequest = transferRequestDto(idType, MSISDN, "103");
             const url = `${ML_URL}/transfers`;
             const res = await axios.post(url, JSON.stringify(transferRequest), {
                 headers: {
                     'Content-Type': 'application/json',
                 },
             });
 
             logger.info(JSON.stringify(res.data));
             expect(res.status).toEqual(200);
         });
 
 
         // Patch Transfer Requests Test - Payee
 
         test('PUT /transfers/{id}: sdk server - Should return 200  ', async () => {
             const mockAxios = new MockAdapter(axios);
             mockAxios.onPut().reply(200, {
                 "data": {
                     "transaction": {
                         "reference_id": "a867963f-37b2-4723-9757-26bf1f28902c",
                         "airtel_money_id": "01101110011",
                         "id": MSISDN,
                         "status": "Completed Transaction",
                         "message": "Working Transaction",
                     }
                 },
                 "status": {
                     "response_code": "200",
                     "code": "200",
                     "success": true,
                     "message": "Successful",
                 }
             });
 
             const patchNotificationRequest: TtransferPatchNotificationRequest = transferPatchNotificationRequestDto("COMPLETED", idType, MSISDN, "500");
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
        

        //   Payer

         //  Send Money - Payer
 
         test('Test POST/ send-money: response should be payee details ', async ()=>{
             const sendMoneyRequest: TAirtelSendMoneyRequest= sendMoneyMerchantPaymentDTO(MSISDN, "500");
             const url = `${DFSP_URL}/send-money`;

             const res = await axios.post(url, JSON.stringify(sendMoneyRequest), {
                 headers: {
                     'Content-Type': 'application/json',
                 },
             });

 
             logger.info(JSON.stringify(res.data));
 
             expect(res.status).toEqual(200);
         });

         //  Merchant Payment
 
         test('Test POST /merchant-payment: response should be merchant details', async()=>{
             const merchantPaymentRequest : TAirtelMerchantPaymentRequest =  sendMoneyMerchantPaymentDTO(MSISDN, "500");
             const url = `${DFSP_URL}/merchant-payment`;

             const res = await axios.post(url, JSON.stringify(merchantPaymentRequest), {
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            logger.info(JSON.stringify(res.data));

            expect(res.status).toEqual(200);

         });
 
 
         // Confirm Send Money - Payer
         test('Test Put/ send-money{id}: response should be 200', async()=>{
             const updateSendMoneyRequest: TAirtelUpdateSendMoneyRequest = updateSendMoneyMerchantPaymentDTO(1, true, MSISDN);
             const url = `${DFSP_URL}/send-money/${randomUUID()}`;
 
             const res = await axios.put(url, JSON.stringify(updateSendMoneyRequest), {
                 headers: {
                     'Content-Type': 'application/json',
                 },
             });
 
             logger.info(JSON.stringify(res.data));
             expect(res.data.status.success).toEqual(true);
         });


        //  Confirm Merchant Payment - Payer
        test('Test Put /merchant-payment{id}: response should be 200', async()=>{
            const updateMerchantPayment: TAirtelUpdateMerchantPaymentRequest = updateSendMoneyMerchantPaymentDTO(1, true, MSISDN);
            const url = `${DFSP_URL}/merchant-payment/${randomUUID()}`;
 
            const res = await axios.put(url, JSON.stringify(updateMerchantPayment), {
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            logger.info(JSON.stringify(res.data));
            expect(res.data.status.success).toEqual(true);
        });

        //  Callback
 
         test("PUT /callback should update mojaloop connector", async ()=>{
             const callbackPayload: TCallbackRequest = callbackPayloadDto("100","TS");
             const url = `${DFSP_URL}/callback`;
 
             const res = await axios.put(url, JSON.stringify(callbackPayload),{
                 headers:{
                     'Content-Type': 'application/json'
                 },
             });
 
             expect(res.status).toEqual(200);
         });




 
         test('Test Get Transfer Quote (Get Quotes)', async () => {
             try {
                  await ccAggregate.quoteRequest(quoteRequestDto());
             } catch (error) {
                 if (error instanceof AirtelError) {
                     expect(error.httpCode).toEqual(500);
                     expect(error.mlCode).toEqual('5000');
                 }
             }
 
         });
 
         test('Test Airtel Disbursements (Transfers - Happy Path)', async () => {
             try {
                 await ccAggregate.updateTransfer(transferPatchNotificationRequestDto("COMPLETED", idType, MSISDN, "500"), '47e8a9cd-3d89-55c5-a15a-b57a28ad763e');
             } catch (error) {
                 if (error instanceof AirtelError) {
                     expect(error.httpCode).toEqual(500);
                     expect(error.mlCode).toEqual('5000');
                 }
             }
 
         });
 
         test('Test Airtel Disbursements (Transfers - Unhappy Path)', async () => {
             try {
                 await ccAggregate.updateTransfer(transferPatchNotificationRequestDto("COMPLETED", idType, MSISDN, "500"), '47e8a9cd-3d89-55c5-a15a-b57a28ad763e');
             } catch (error) {
                 if (error instanceof AirtelError) {
                     expect(error.httpCode).toEqual(500);
                     expect(error.mlCode).toEqual('5000');
                 }
             }
 
         });
 
 
         test('Test Airtel Disbursements (Transfers - Unhappy Path)', async () => {
             try {
                await ccAggregate.updateTransfer(transferPatchNotificationRequestDto("COMPLETED", idType, MSISDN, "500"), '47e8a9cd-3d89-55c5-a15a-b57a28ad763e');
             } catch (error) {
                 if (error instanceof AirtelError) {
                     expect(error.httpCode).toEqual(500);
                     expect(error.mlCode).toEqual('5000');
                 }
             }
 
         });
 
     });
 
 });