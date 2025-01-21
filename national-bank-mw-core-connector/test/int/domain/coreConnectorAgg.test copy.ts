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
 * Horace Lwanda <lwandahorace@gmail.com>
 --------------
 **********/

 import config from 'src/config';
import { CoreConnectorAggregate, TQuoteRequest, TtransferPatchNotificationRequest, TtransferRequest } from '../../../src/domain';
 import { INBMClient, NBMClientFactory, TNBMSendMoneyRequest, TNBMUpdateSendMoneyRequest } from '../../../src/domain/CBSClient';
 import { ISDKClient, SDKClientFactory } from '../../../src/domain/SDKClient';
 import { loggerFactory } from '../../../src/infra/logger';
 import { 
     transferPatchNotificationRequestDto, 
     transferRequestDto, 
     quoteRequestDto, 
     sendMoneyDTO, 
     updateSendMoneyDTO 
 } from '../../fixtures';
import { AxiosClientFactory } from 'src/infra/axiosHttpClient';
 
 // Mock implementations
 let mockNBMClient: INBMClient;
 let mockSDKClient: ISDKClient;  
 const mockNBMConfig = config.get('nbm');
 const mockLogger = loggerFactory({ context: 'ccAgg tests' });
 describe('CoreConnectorAggregate Unit Tests', () => {
     let ccAggregate: CoreConnectorAggregate;
     
     beforeEach(() => {
         jest.clearAllMocks();
         const httpClient = AxiosClientFactory.createAxiosClientInstance();
         mockSDKClient = SDKClientFactory.getSDKClientInstance(mockLogger, httpClient, SDK_URL);
         mockNBMClient = NBMClientFactory.createClient({ mockNBMConfig, httpClient, mockLogger });
         ccAggregate = new CoreConnectorAggregate(
             mockSDKClient,
             mockNBMClient,
             mockNBMConfig,
             mockLogger
         );
     });
 
     describe('Payee Flow Tests', () => {
         const ACCOUNT_NO = "100100200";
         const idType = "ACCOUNT_NO";
 
         test('getParties should return party information when successful', async () => {
             const mockPartyResponse = {
                 partyId: ACCOUNT_NO,
                 name: 'Test User',
                 // Add other party details
             };
 
             mockSDKClient.getParties.mockResolvedValueOnce(mockPartyResponse);
 
             const result = await ccAggregate.getParties(idType, ACCOUNT_NO);
 
             expect(mockSDKClient.getParties).toHaveBeenCalledWith(idType, ACCOUNT_NO);
             expect(result).toEqual(mockPartyResponse);
         });
 
         test('quoteRequest should process quote when party exists', async () => {
             const quoteRequest: TQuoteRequest = quoteRequestDto();
             const mockQuoteResponse = {
                 quoteId: 'mock-quote-id',
                 // Add other quote response details
             };
 
             mockSDKClient.sendQuoteRequest.mockResolvedValueOnce(mockQuoteResponse);
 
             const result = await ccAggregate.processQuoteRequest(quoteRequest);
 
             expect(mockSDKClient.sendQuoteRequest).toHaveBeenCalledWith(quoteRequest);
             expect(result).toEqual(mockQuoteResponse);
         });
 
         test('transferRequest should process transfer when party exists', async () => {
             const transferRequest: TtransferRequest = transferRequestDto(idType, ACCOUNT_NO, "103");
             const mockTransferResponse = {
                 transferId: 'mock-transfer-id',
                 // Add other transfer response details
             };
 
             mockSDKClient.sendTransferRequest.mockResolvedValueOnce(mockTransferResponse);
 
             const result = await ccAggregate.processTransferRequest(transferRequest);
 
             expect(mockSDKClient.sendTransferRequest).toHaveBeenCalledWith(transferRequest);
             expect(result).toEqual(mockTransferResponse);
         });
 
         test('transferPatchNotification should update transfer status successfully', async () => {
             const transferId = 'mock-transfer-id';
             const patchNotification: TtransferPatchNotificationRequest = transferPatchNotificationRequestDto(
                 "COMPLETED",
                 idType,
                 ACCOUNT_NO,
                 "500"
             );
             const mockPatchResponse = {
                 status: 'COMPLETED',
                 // Add other patch response details
             };
 
             mockSDKClient.sendTransferPatchNotification.mockResolvedValueOnce(mockPatchResponse);
 
             const result = await ccAggregate.processTransferPatchNotification(transferId, patchNotification);
 
             expect(mockSDKClient.sendTransferPatchNotification).toHaveBeenCalledWith(transferId, patchNotification);
             expect(result).toEqual(mockPatchResponse);
         });
     });
 
     describe('Payer Flow Tests', () => {
         const ACCOUNT_NO = "100100200";
 
         test('sendMoney should process payer request successfully', async () => {
             const sendMoneyRequest: TNBMSendMoneyRequest = sendMoneyDTO(ACCOUNT_NO, "103");
             const mockSendMoneyResponse = {
                 transactionId: 'mock-transaction-id',
                 // Add other response details
             };
 
             mockNBMClient.sendMoney.mockResolvedValueOnce(mockSendMoneyResponse);
 
             const result = await ccAggregate.processSendMoneyRequest(sendMoneyRequest);
 
             expect(mockNBMClient.sendMoney).toHaveBeenCalledWith(sendMoneyRequest);
             expect(result).toEqual(mockSendMoneyResponse);
         });
 
         test('updateSendMoney should update transaction status successfully', async () => {
             const transactionId = 'mock-transaction-id';
             const updateRequest: TNBMUpdateSendMoneyRequest = updateSendMoneyDTO(true);
             const mockUpdateResponse = {
                 status: 'SUCCESS',
                 
             };
 
             mockNBMClient.updateSendMoney.mockResolvedValueOnce(mockUpdateResponse);
 
             const result = await ccAggregate.processUpdateSendMoneyRequest(transactionId, updateRequest);
 
             expect(mockNBMClient.updateSendMoney).toHaveBeenCalledWith(transactionId, updateRequest);
             expect(result).toEqual(mockUpdateResponse);
         });
     });
 
     describe('Error Handling', () => {
         test('should handle SDK client errors appropriately', async () => {
             const error = new Error('SDK Client Error');
             mockSDKClient.getParties.mockRejectedValueOnce(error);
 
             await expect(ccAggregate.getParties('ACCOUNT_NO', '12345'))
                 .rejects
                 .toThrow('SDK Client Error');
             
             expect(mockLogger.error).toHaveBeenCalled();
         });
 
         test('should handle NBM client errors appropriately', async () => {
             const error = new Error('NBM Client Error');
             mockNBMClient.sendMoney.mockRejectedValueOnce(error);
 
             const sendMoneyRequest = sendMoneyDTO('12345', '100');
             await expect(ccAggregate.processSendMoneyRequest(sendMoneyRequest))
                 .rejects
                 .toThrow('NBM Client Error');
 
             expect(mockLogger.error).toHaveBeenCalled();
         });
     });
 });