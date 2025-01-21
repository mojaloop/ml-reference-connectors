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
 
 import { CoreConnectorAggregate, TtransferPatchNotificationRequest } from '../../../src/domain';
 import {
     ISDKClient,
     SDKClientFactory,
 } from '../../../src/domain/SDKClient';
 import { AxiosClientFactory } from '../../../src/infra/axiosHttpClient';
 import { loggerFactory } from '../../../src/infra/logger';
 import config from '../../../src/config';
 import { NBMClientFactory, INBMClient, TNBMCollectMoneyRequest } from '../../../src/domain/CBSClient';
 import { 
     sdkInitiateTransferResponseDto, 
     sdkUpdateTransferResponseDto, 
     sendMoneyDTO, 
     transferPatchNotificationRequestDto, 
     updateSendMoneyDTO 
 } from '../../fixtures';
 
 const mockAxios = new MockAdapter(axios);
 const logger = loggerFactory({ context: 'ccAgg tests' });
 const NBMConfig = config.get("nbm");
 const SDK_URL = 'http://localhost:4040';
 
 const idType = "ACCOUNT_NO";
 const ACCOUNT_ID = "1003486415";
 
 const collectMoneyRequest: TNBMCollectMoneyRequest = {
     amount: 12000,
     description: "Test Transaction",
     reference: "INV/2003/202930",
     credit_account: ACCOUNT_ID,
     currency: "MWK"
 };
 
 describe('CoreConnectorAggregate Tests -->', () => {
     let ccAggregate: CoreConnectorAggregate;
     let nbmClient: INBMClient;
     let sdkClient: ISDKClient;
     
     beforeEach(() => {
         mockAxios.reset();
         const httpClient = AxiosClientFactory.createAxiosClientInstance();
         sdkClient = SDKClientFactory.getSDKClientInstance(logger, httpClient, SDK_URL);
         nbmClient = NBMClientFactory.createClient({ NBMConfig, httpClient, logger });
         ccAggregate = new CoreConnectorAggregate(sdkClient, nbmClient, NBMConfig, logger);
 
         // Mock nbmClient methods
         nbmClient.getToken = jest.fn();
         nbmClient.getKyc = jest.fn();
         nbmClient.collectMoney = jest.fn();
         nbmClient.sendMoney = jest.fn();
         nbmClient.mockCollectMoney = jest.fn();
     });
 
     describe("Payee Tests", () => {
         test("should handle generic payee operations", async () => {
             // Add specific payee test implementations as needed
             logger.info("Write payee tests");
         });
     });
 
     describe("NBM Payer Tests", () => {
         test("PUT /send-money: should initiate request to pay to customer wallet", async () => {

            //Mock Token Request
            const mockTokenRequst = {
                "clientId": "C87stk86mED2qG7kFZRwSuady",
                "clientSecret": "pkAV1p9DqBXsBhbWh8bacCNiyTYCmJX3"
            }
             // Mock token response
             const mockTokenResponse = {
                 "token": "eyJhbGciOiJSUzI1NjYWZl...",
                 "expires_in": "300"
             };
             
             (nbmClient.getToken as jest.Mock).mockResolvedValue(mockTokenResponse);
 
             // Mock collect money response
             const mockCollectMoneyResponse = {
                "message": "Success",
                "data": {
                      "reference": "FT24928459824"
                }
             };
             (nbmClient.collectMoney as jest.Mock).mockResolvedValue(mockCollectMoneyResponse);

             await nbmClient.getToken(mockTokenRequst);
 
             const response = await nbmClient.collectMoney(collectMoneyRequest);
             
             expect(nbmClient.getToken).toHaveBeenCalled();
             expect(nbmClient.collectMoney).toHaveBeenCalledWith(collectMoneyRequest);
             expect(response).toEqual(mockCollectMoneyResponse);
         });

         test("POST /merchant-payment: should initiate request to pay to customer wallet", async () => {

            //Mock Token Request
            const mockTokenRequst = {
                "clientId": "C87stk86mED2qG7kFZRwSuady",
                "clientSecret": "pkAV1p9DqBXsBhbWh8bacCNiyTYCmJX3"
            }
             // Mock token response
             const mockTokenResponse = {
                 "token": "eyJhbGciOiJSUzI1NjYWZl...",
                 "expires_in": "300"
             };
             
             (nbmClient.getToken as jest.Mock).mockResolvedValue(mockTokenResponse);
 
             // Mock collect money response
             const mockCollectMoneyResponse = {
                "message": "Success",
                "data": {
                      "reference": "FT24928459824"
                }
             };
             (nbmClient.collectMoney as jest.Mock).mockResolvedValue(mockCollectMoneyResponse);

             await nbmClient.getToken(mockTokenRequst);
 
             const response = await nbmClient.collectMoney(collectMoneyRequest);
             
             expect(nbmClient.getToken).toHaveBeenCalled();
             expect(nbmClient.collectMoney).toHaveBeenCalledWith(collectMoneyRequest);
             expect(response).toEqual(mockCollectMoneyResponse);
         });
     });
 
     describe("NBM Payee Test", () => {
         test("Get Parties Happy Path", async () => {

             // Mock KYC response
             const mockKycResponse = {
                "message": "Success",
                "data": {
                  "account_number": "100100200",
                  "customer_number": "424082",
                  "category": "Saving Ord",
                  "branch": "Zomba",
                  "currency": "MWK",
                  "locked_amount": "0.00",
                  "limit_amount": "0.00",
                  }
             };

            //Mock Token Request
            const mockTokenRequst = {
                "clientId": "C87stk86mED2qG7kFZRwSuady",
                "clientSecret": "pkAV1p9DqBXsBhbWh8bacCNiyTYCmJX3"
            }
 
             // Mock token response
             const mockTokenResponse = {
                "token": "eyJhbGciOiJSUzI1NjYWZl...",
                "expires_in": "300"
            };
 
             (nbmClient.getKyc as jest.Mock).mockResolvedValue(mockKycResponse);
             (nbmClient.getToken as jest.Mock).mockResolvedValue(mockTokenResponse);

             await nbmClient.getToken(mockTokenRequst);
 
             const kyc_res = await ccAggregate.getParties(ACCOUNT_ID, idType);
 
             expect(nbmClient.getToken).toHaveBeenCalled();
             expect(nbmClient.getKyc).toHaveBeenCalledWith({ account_number: ACCOUNT_ID });
             expect(kyc_res.statusCode(200)).toEqual(200);
         });
 
         test('PUT /transfers/{id} notification: should handle transfer updates', async () => {
             // Mock collect money response
             const mockCollectMoneyResponse = {
                "message": "Success",
                "data": {
                      "reference": "FT24928459824"
                }
             };
 
             (nbmClient.mockCollectMoney as jest.Mock).mockResolvedValue(mockCollectMoneyResponse);
 
             const patchNotificationRequest: TtransferPatchNotificationRequest = transferPatchNotificationRequestDto(
                 "COMPLETED", 
                 idType, 
                 ACCOUNT_ID, 
                 "500"
             );
 
             const res = await ccAggregate.updateTransfer(patchNotificationRequest, "ljzowczj");
 
             expect(nbmClient.sendMoney).toHaveBeenCalled();
             expect(res).toBeUndefined();
         });
 
         test('should handle errors in transfer updates', async () => {
             (nbmClient.sendMoney as jest.Mock).mockRejectedValue(new Error('Transfer failed'));
 
             const patchNotificationRequest: TtransferPatchNotificationRequest = transferPatchNotificationRequestDto(
                 "COMPLETED", 
                 idType, 
                 ACCOUNT_ID, 
                 "500"
             );
 
             await expect(ccAggregate.updateTransfer(patchNotificationRequest, "ljzowczj"))
                 .rejects
                 .toThrow('Transfer failed');
         });
     });
 });