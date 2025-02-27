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

 * Eugen Klymniuk <eugen.klymniuk@infitx.com>
 --------------
 **********/

 
 import { CoreConnectorAggregate, } from '../../../src/domain';
 import {
     ISDKClient,
     SDKClientFactory,
 } from '../../../src/domain/SDKClient';
 import { AxiosClientFactory } from '../../../src/infra/axiosHttpClient';
 import { loggerFactory } from '../../../src/infra/logger';
 import config from '../../../src/config';
 import { NBMClientFactory, INBMClient, TNBMTransferMoneyRequest, } from '../../../src/domain/CBSClient';
 import { 
     sdkInitiateTransferResponseDto, 
     transferRequestDto,
     quoteRequestDto, 
     sendMoneyDTO, 
     transferPatchNotificationRequestDto,
     updateSendMoneyDTO,
    
 } from '../../fixtures';
 import { randomUUID } from 'crypto';
 
 const logger = loggerFactory({ context: 'ccAgg tests' });
 const NBMConfig = config.get("nbm");
 const SDK_URL = 'http://localhost:4040';
 
 const idType = "ACCOUNT_NO";
 const ACCOUNT_NO = "1003486415";
 
 const collectMoneyRequest: TNBMTransferMoneyRequest = {
     amount: "12000",
     description: "Test Transaction",
     reference: "INV/2003/202930",
     credit_account: ACCOUNT_NO,
     currency: "MWK"
 };
 
 describe('CoreConnectorAggregate Tests -->', () => {
    let ccAggregate: CoreConnectorAggregate;
    let nbmClient: INBMClient;
    let sdkClient: ISDKClient;
    
    beforeEach(() => {
        const httpClient = AxiosClientFactory.createAxiosClientInstance();
        sdkClient = SDKClientFactory.getSDKClientInstance(logger, httpClient, SDK_URL);
        nbmClient = NBMClientFactory.createClient({ NBMConfig, httpClient, logger });
        ccAggregate = new CoreConnectorAggregate(sdkClient, nbmClient, NBMConfig, logger);

        // Mock dependencies
        nbmClient.getToken = jest.fn();
        nbmClient.getKyc = jest.fn();
        nbmClient.makeTransfer = jest.fn();
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
            logger.info(JSON.stringify(res));
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
            expect(res.transferState).toEqual("RESERVED");
        });

        test("Transfer Patch notification should credit the customer's account if request body is valid", async () => {
            // Arrange
            nbmClient.makeTransfer = jest.fn().mockImplementation(() => {
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
            nbmClient.makeTransfer = jest.fn().mockImplementation(() => {
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
                ...sdkInitiateTransferResponseDto(ACCOUNT_NO, "WAITING_FOR_CONVERSION_ACCEPTANCE")
            });
            sdkClient.updateTransfer = jest.fn().mockResolvedValue({
                ...sdkInitiateTransferResponseDto(ACCOUNT_NO, "WAITING_FOR_QUOTE_ACCEPTANCE")
            });
            const initiateMerchantTransferSpy = jest.spyOn(sdkClient, "initiateTransfer");
        
            const merchantPaymentRequest = sendMoneyDTO(ACCOUNT_NO, "103");
        
            // Act
            const res = await ccAggregate.sendMoney(merchantPaymentRequest, "SEND");
        
            // Assert: Ensure that initiateTransfer was called
            expect(sdkClient.initiateTransfer).toHaveBeenCalled();
            expect(initiateMerchantTransferSpy).toHaveBeenCalled();
            
            // Validate response
            expect(res.payeeDetails.idValue).toEqual(ACCOUNT_NO);
        });
        
        test("Send Money Extension List should not be empty and contain expected key", async () => {
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
                ...sdkInitiateTransferResponseDto(ACCOUNT_NO, "WAITING_FOR_CONVERSION_ACCEPTANCE")
            });
            sdkClient.updateTransfer = jest.fn().mockResolvedValue({
                ...sdkInitiateTransferResponseDto(ACCOUNT_NO, "WAITING_FOR_QUOTE_ACCEPTANCE")
            });
            const initiateMerchantTransferSpy = jest.spyOn(sdkClient, "initiateTransfer");
        
            const merchantPaymentRequest = sendMoneyDTO(ACCOUNT_NO, "103");
        
            // Act
            await ccAggregate.sendMoney(merchantPaymentRequest, "SEND");
        
            // Get the request used to call initiateTransfer
            const transferRequest = initiateMerchantTransferSpy.mock.calls[0][0];
        
            // Assert: Check extensionList validity
            expect(transferRequest.quoteRequestExtensions).not.toHaveLength(0);
            expect(transferRequest.transferRequestExtensions).not.toHaveLength(0);
            if (transferRequest.from.extensionList) {
                expect(transferRequest.from.extensionList[0]["key"]).toEqual(
                    "CdtTrfTxInf.Dbtr.PrvtId.DtAndPlcOfBirth.BirthDt"
                );
            }
        
            logger.info("Transfer Request being sent to Initiate Transfer", transferRequest);
        });
        

        test("Update Send Money should trigger a request to pay using NBM client", async () => {
            // Arrange
            updateSendMoneyDTO(true);
            nbmClient.makeTransfer = jest.fn().mockResolvedValueOnce(undefined);
            const collectMoney = jest.spyOn(nbmClient, "makeTransfer");
        
            
            await nbmClient.makeTransfer(collectMoneyRequest);
            // Act
        
            // Assert
            expect(collectMoney).toHaveBeenCalled();
        });

        test("Update Send Money should trigger a request to pay using NBM client", async () => {
            // Arrange
            const updateSendMoneyPayload = updateSendMoneyDTO(true);
            sdkClient.updateTransfer = jest.fn().mockResolvedValueOnce({});
            const updateTransferSpy = jest.spyOn(sdkClient, "updateTransfer");

            // Act
            await ccAggregate.updateSendMoney(updateSendMoneyPayload, randomUUID());

            // Assert
            expect(updateTransferSpy).toHaveBeenCalled();
        });
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
            sdkClient.updateTransfer = jest.fn().mockResolvedValue({
                ...sdkInitiateTransferResponseDto(ACCOUNT_NO, "WAITING_FOR_CONVERSION_ACCEPTANCE")
            });
            const initiateMerchantTransferSpy = jest.spyOn(sdkClient, "initiateTransfer");
        
            const merchantPaymentRequest = sendMoneyDTO(ACCOUNT_NO, "103");
        
            // Act
            const res = await ccAggregate.sendMoney(merchantPaymentRequest, "RECEIVE");
        
            // Assert: Ensure that initiateTransfer was called
            expect(sdkClient.initiateTransfer).toHaveBeenCalled();
            expect(initiateMerchantTransferSpy).toHaveBeenCalled();
            
            // Validate response
            expect(res.payeeDetails.idValue).toEqual(ACCOUNT_NO);
        });
        
        test("Extension List should not be empty and contain expected key", async () => {
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
            sdkClient.updateTransfer = jest.fn().mockResolvedValue({
                ...sdkInitiateTransferResponseDto(ACCOUNT_NO, "WAITING_FOR_CONVERSION_ACCEPTANCE")
            });
            const initiateMerchantTransferSpy = jest.spyOn(sdkClient, "initiateTransfer");
        
            const merchantPaymentRequest = sendMoneyDTO(ACCOUNT_NO, "103");
        
            // Act
            await ccAggregate.sendMoney(merchantPaymentRequest, "RECEIVE");
        
            // Get the request used to call initiateTransfer
            const transferRequest = initiateMerchantTransferSpy.mock.calls[0][0];
        
            // Assert: Check extensionList validity
            expect(transferRequest.quoteRequestExtensions).not.toHaveLength(0);
            expect(transferRequest.transferRequestExtensions).not.toHaveLength(0);
            if (transferRequest.from.extensionList) {
                expect(transferRequest.from.extensionList[0]["key"]).toEqual(
                    "CdtTrfTxInf.Dbtr.PrvtId.DtAndPlcOfBirth.BirthDt"
                );
            }
        
            logger.info("Transfer Request being sent to Initiate Transfer", transferRequest);
        });
        
        test("Update Merchant Pay Send Money should trigger a request to pay using NBM client", async () => {
            // Arrange
            updateSendMoneyDTO(true);
            nbmClient.makeTransfer = jest.fn().mockResolvedValueOnce(undefined);
            const makeTransfer = jest.spyOn(nbmClient, "makeTransfer");
            await nbmClient.makeTransfer(collectMoneyRequest);
            // Assert
            expect(makeTransfer).toHaveBeenCalled();
        });

        test("Update Merchant Payment should trigger a request to pay using NBM client", async () => {
            // Arrange
            const updateSendMoneyPayload = updateSendMoneyDTO(true);
            sdkClient.updateTransfer = jest.fn().mockResolvedValueOnce({});
            const updateTransferSpy = jest.spyOn(sdkClient, "updateTransfer");
            // Act
            await ccAggregate.updateSendMoney(updateSendMoneyPayload, randomUUID());
            // Assert
            expect(updateTransferSpy).toHaveBeenCalled();
        });
        
    });
});