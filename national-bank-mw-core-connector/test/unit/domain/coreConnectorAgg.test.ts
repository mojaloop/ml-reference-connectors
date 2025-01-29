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
 
 import { CoreConnectorAggregate, } from '../../../src/domain';
 import {
     ISDKClient,
     SDKClientFactory,
 } from '../../../src/domain/SDKClient';
 import { AxiosClientFactory } from '../../../src/infra/axiosHttpClient';
 import { loggerFactory } from '../../../src/infra/logger';
 import config from '../../../src/config';
 import { NBMClientFactory, INBMClient, } from '../../../src/domain/CBSClient';
 import { 
     sdkInitiateTransferResponseDto, 
     transferRequestDto,
     quoteRequestDto, 
     sendMoneyDTO, 
     transferPatchNotificationRequestDto, 
    
 } from '../../fixtures';
 import { randomUUID } from 'crypto';
 
 const mockAxios = new MockAdapter(axios);
 const logger = loggerFactory({ context: 'ccAgg tests' });
 const NBMConfig = config.get("nbm");
 const SDK_URL = 'http://localhost:4040';
 
 const idType = "ACCOUNT_NO";
 const ACCOUNT_NO = "1003486415";
 
//  const collectMoneyRequest: TNBMCollectMoneyRequest = {
//      amount: 12000,
//      description: "Test Transaction",
//      reference: "INV/2003/202930",
//      credit_account: ACCOUNT_NO,
//      currency: "MWK"
//  };
 
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

        // Mock dependencies
        nbmClient.getToken = jest.fn();
        nbmClient.getKyc = jest.fn();
        nbmClient.collectMoney = jest.fn();
        nbmClient.sendMoney = jest.fn();
    });

    describe("Payee Core Connector Aggregate Tests", () => {
        test("Party Lookup in aggregate should return party info", async () => {
            // Arrange
            const mockKycResponse = {
                message: "Success",
                data: {
                    account_number: ACCOUNT_NO,
                    customer_number: "424082",
                    category: "Saving Ord",
                    branch: "Zomba",
                    currency: "MWK"
                }
            };
            nbmClient.getKyc = jest.fn().mockResolvedValueOnce(mockKycResponse);

            // Act
            const res = await ccAggregate.getParties(ACCOUNT_NO, idType);

            // Assert
            expect(res.statusCode(200)).toEqual(200);
            expect(res.extensionList).toBeDefined();
            expect(res.idValue).toEqual(ACCOUNT_NO);
        });

        test("Agreement phase should return quote details", async () => {
            // Arrange
            const mockKycResponse = {
                message: "Success",
                data: {
                    account_number: ACCOUNT_NO,
                    customer_number: "424082"
                }
            };
            nbmClient.getKyc = jest.fn().mockResolvedValueOnce(mockKycResponse);

            // Act
            const res = await ccAggregate.quoteRequest(quoteRequestDto(idType, ACCOUNT_NO, "1000"));

            // Assert
            expect(res.transferAmount).toBeDefined();
            
        });

        test("Transfer phase should return transfer state RESERVED", async () => {
            // Arrange
            const mockKycResponse = {
                message: "Success",
                data: {
                    account_number: ACCOUNT_NO,
                    status: "ACTIVE"
                }
            };
            nbmClient.getKyc = jest.fn().mockResolvedValueOnce(mockKycResponse);
            const transferRequestPayload = transferRequestDto(idType, ACCOUNT_NO, "103");

            // Act
            const res = await ccAggregate.receiveTransfer(transferRequestPayload);

            // Assert
            expect(res.transferState).toEqual("RECEIVED");
        });

        test("Transfer Patch notification should credit the customer's account if request body is valid", async () => {
            // Arrange
            nbmClient.sendMoney = jest.fn().mockImplementation(() => {
                return;
            });
            const patchNotificationPayload = transferPatchNotificationRequestDto(
                "COMPLETED",
                idType,
                ACCOUNT_NO,
                "103"
            );

            // Act
            const res = await ccAggregate.updateTransfer(patchNotificationPayload, randomUUID());

            // Assert
            expect(res).resolves;
        });

        test("Transfer Patch notification should credit the Merchant's account if request body is valid", async () => {
            // Arrange
            nbmClient.collectMoney = jest.fn().mockImplementation(() => {
                return;
            });
            const patchNotificationPayload = transferPatchNotificationRequestDto(
                "COMPLETED",
                idType,
                ACCOUNT_NO,
                "103"
            );

            // Act
            const res = await ccAggregate.updateTransfer(patchNotificationPayload, randomUUID());

            // Assert
            expect(res).resolves;
        });
    });

    describe("Payer Core Connector Aggregate Tests", () => {
        test("Send Money should trigger transfer in SDK", async () => {
            // Arrange
            const mockKycResponse = {
                message: "Success",
                data: {
                    account_number: ACCOUNT_NO,
                    status: "ACTIVE"
                }
            };
            nbmClient.getKyc = jest.fn().mockResolvedValueOnce(mockKycResponse);
            sdkClient.initiateTransfer = jest.fn().mockResolvedValueOnce({
                ...sdkInitiateTransferResponseDto(ACCOUNT_NO, "WAITING_FOR_QUOTE_ACCEPTANCE")
            });
            const initiateTransferSpy = jest.spyOn(sdkClient, "initiateTransfer");
            const sendMoneyReqPayload = sendMoneyDTO(ACCOUNT_NO, "103",);

            // Act
            const res = await ccAggregate.sendMoney(sendMoneyReqPayload, "SEND");

            // Expecting Update Transfer to have be called
            expect(sdkClient.initiateTransfer).toHaveBeenCalled();

            // Expecting INitaite Transfer to have been called
            expect(initiateTransferSpy).toHaveBeenCalled();

            // Get the Reguest being Used to call
            const transferRequest = initiateTransferSpy.mock.calls[0][0];

            // Check the Extension List is not 0
            expect(transferRequest.from.extensionList).not.toHaveLength(0);
            if (transferRequest.from.extensionList) {
                expect(transferRequest.from.extensionList[0]["key"]).toEqual("CdtTrfTxInf.Dbtr.PrvtId.DtAndPlcOfBirth.BirthDt");
            }
            logger.info("Trasnfer Request  being sent to Initiate Transfer", transferRequest);

            // Assert
            expect(res.payeeDetails.idValue).toEqual(ACCOUNT_NO);
        });

        // test("Update Send Money should trigger a request to pay using NBM client", async () => {
        //     // Arrange
        //     const updateSendMoneyPayload = updateSendMoneyDTO(true);
        //     nbmClient.collectMoney = jest.fn().mockResolvedValueOnce(undefined);
        //     const collectMoney = jest.spyOn(nbmClient, "collectMoney");

        //     // Act
        //     const res = await ccAggregate.updateSendMoney(updateSendMoneyPayload, randomUUID());

        //     // Assert
        //     expect(collectMoney).toHaveBeenCalled();
        // });
    });

    describe("Merchant Core Connector Aggregate Tests", () => {
        test("Merchant Pay should trigger transfer in SDK", async () => {
            // Arrange
            const mockKycResponse = {
                message: "Success",
                data: {
                    account_number: ACCOUNT_NO,
                    status: "ACTIVE"
                }
            };
            nbmClient.getKyc = jest.fn().mockResolvedValueOnce(mockKycResponse);
            sdkClient.initiateTransfer = jest.fn().mockResolvedValueOnce({
                ...sdkInitiateTransferResponseDto(ACCOUNT_NO, "WAITING_FOR_QUOTE_ACCEPTANCE")
            });
            const initiateMerchantTransferSpy = jest.spyOn(sdkClient, "initiateTransfer");

            const merchantPaymentRequest = sendMoneyDTO(ACCOUNT_NO, "103");

            // Act
            const res = await ccAggregate.sendMoney(merchantPaymentRequest, "RECEIVE");

            // Expecting Update Transfer to have be called
            expect(sdkClient.initiateTransfer).toHaveBeenCalled();
            // Expecting INitaite Transfer to have been called
            expect(initiateMerchantTransferSpy).toHaveBeenCalled();
            // Get the Reguest being Used to call
            const transferRequest = initiateMerchantTransferSpy.mock.calls[0][0];
            // Check the Extension List is not 0
            expect(transferRequest.from.extensionList).not.toHaveLength(0);
            if (transferRequest.from.extensionList) {
                expect(transferRequest.from.extensionList[0]["key"]).toEqual("CdtTrfTxInf.Dbtr.PrvtId.DtAndPlcOfBirth.BirthDt");
            }
            logger.info("Trasnfer Request  being sent to Initiate Transfer", transferRequest);

            // Assert
            expect(res.payeeDetails.idValue).toEqual(ACCOUNT_NO);
        });

        // test("Update Merchant Payment should trigger a request to pay using NBM client", async () => {
        //     // Arrange
        //     const updateMerchantPaymentPayload = updateMerchantPaymentRequestDTO(1000, true,);
        //     nbmClient.collectMoney = jest.fn().mockResolvedValueOnce(undefined);
        //     const collectMoney = jest.spyOn(nbmClient, "collectMoney");

        //     // Act
        //     const res = await ccAggregate.updateSendMoney(updateMerchantPaymentPayload, randomUUID());

        //     // Assert
        //     expect(collectMoney).toHaveBeenCalled();
        // });

        
    });
});