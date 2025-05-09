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
 --------------
 **********/
import { CoreConnectorAggregate } from '../../../src/domain';
import {
    ISDKClient,
    SDKClientFactory,
} from '../../../src/domain/SDKClient';
import { AxiosClientFactory } from '../../../src/infra/axiosHttpClient';
import { loggerFactory } from '../../../src/infra/logger';
import config from '../../../src/config';
import { IMTNClient } from '../../../src/domain/CBSClient';
import { MTNClientFactory } from '../../../src/domain/CBSClient/MTNClientFactory';
import {quoteRequestDto, sdkInitiateTransferResponseDto, sendMoneyDTO, sendMoneyMerchantPaymentDTO, transferPatchNotificationRequestDto, transferRequestDto, updateMerchantPaymentRequestDTO, updateSendMoneyDTO } from '../../fixtures';
import { randomUUID } from 'crypto';


const logger = loggerFactory({ context: 'ccAgg tests' });
const mtnConfig = config.get("mtn");
const SDK_URL = 'http://localhost:4040';
const idValue = "786332992";
const idType = "MSISDN";

describe('CoreConnectorAggregate Tests -->', () => {
    let ccAggregate: CoreConnectorAggregate;
    let mtnClient: IMTNClient;
    let sdkClient: ISDKClient;

    beforeEach(() => {
        const httpClient = AxiosClientFactory.createAxiosClientInstance();
        sdkClient = SDKClientFactory.getSDKClientInstance(logger, httpClient, SDK_URL);
        mtnClient = MTNClientFactory.createClient({ mtnConfig, httpClient, logger });
        ccAggregate = new CoreConnectorAggregate(sdkClient, mtnClient, mtnConfig, logger);
    });

    describe("Payee Core Connector Aggregate Tests", () => {
        test("Party Lookup in aggreggate should return party info ", async () => {
            //Arrange
            mtnClient.getKyc = jest.fn().mockResolvedValueOnce({
                "given_name": "Niza",
                "family_name": "Tembo",
                "birthdate": "27-04-1997",
                "locale": "en",
                "gender": "male",
                "status": "OK"
            });
            //Act
            const res = await ccAggregate.getParties(idValue, idType);
            //Assert
            expect(res.data.extensionList).toBeDefined();
            expect(res.data.displayName).toContain("Niza");
            expect(res.statusCode).toEqual(200);

        });

        test("Agreement phase should return quote details", async () => {
            //Arrange
            mtnClient.getKyc = jest.fn().mockResolvedValueOnce({
                "given_name": "Niza",
                "family_name": "Tembo",
                "birthdate": "27-04-1997",
                "locale": "en",
                "gender": "male",
                "status": "OK"
            });

            // Act
            const res = await ccAggregate.quoteRequest(quoteRequestDto(idType, idValue, "1000"));
            //Assert
            expect(res.extensionList).not.toHaveLength(0);
            expect(res.transferAmount).toBeDefined();

        });



        test("Transfer phase. Should return transfer state RESERVED", async () => {
            // Arrange 
            mtnClient.getKyc = jest.fn().mockResolvedValueOnce({
                "given_name": "Niza",
                "family_name": "Tembo",
                "birthdate": "27-04-1997",
                "locale": "en",
                "gender": "male",
                "status": "OK"
            });
            const transferRequestPayload = transferRequestDto(idType, idValue, "103");
            // Act
            const res = await ccAggregate.receiveTransfer(transferRequestPayload);

            // Assert
            expect(res.transferState).toEqual("RESERVED");
        });

        test("Transfer Patch notification should credit the customer's accout if request body is valid", async () => {
            // Arrange 
            mtnClient.sendMoney = jest.fn().mockImplementation(() => {
                return;
            });
            const patchNotificationPayload = transferPatchNotificationRequestDto("COMPLETED", idType, idValue, "103");
            //Act
            const res = await ccAggregate.updateTransfer(patchNotificationPayload, randomUUID());
            //Assert
            expect(res).resolves;
        });

        test("Transfer Patch notification should credit the Merchant's account if request body is valid", async () => {
            const patchNotificationPayload = transferPatchNotificationRequestDto("COMPLETED", idType, idValue, "103");
            //Act
            const res = await ccAggregate.updateTransfer(patchNotificationPayload, randomUUID());
            //Assert
            expect(res).resolves;
        });

    });

    describe("Payer Core Connector Aggregate Tests", () => {
        test("Send Money. Should trigger transfer in SDK", async () => {
            //Arrange
            mtnClient.getKyc = jest.fn().mockResolvedValue({
                "given_name": "Elijah",
                "family_name": "Okello",
                "birthdate": "19-09-1999",
                "locale": "en",
                "gender": "male",
                "status": "OK"
            });
            sdkClient.initiateTransfer = jest.fn().mockResolvedValue({
                ...sdkInitiateTransferResponseDto(idValue, "WAITING_FOR_CONVERSION_ACCEPTANCE")
            });

            sdkClient.updateTransfer = jest.fn().mockResolvedValue({
                ...sdkInitiateTransferResponseDto(idValue, "WAITING_FOR_QUOTE_ACCEPTANCE")
            });

            // Spying on Update Transfer
            jest.spyOn(sdkClient, "updateTransfer");


            // Spying on Initiate transfer
            const initiateTransferSpy = jest.spyOn(sdkClient, "initiateTransfer");

            const sendMoneyReqPayload = sendMoneyDTO(idValue, "103");
            //Act 
            const res = await ccAggregate.sendMoney(sendMoneyReqPayload, "SEND");
            //Assert

            logger.info("Response", res);

            // Expecting Update Transfer to have be called
            expect(sdkClient.updateTransfer).toHaveBeenCalled();

            // Expecting initiate Transfer to have been called
            expect(initiateTransferSpy).toHaveBeenCalled();

            // Get the Reguest being Used to call
            const transferRequest = initiateTransferSpy.mock.calls[0][0];

            // Check the Extension List is not 0
            expect(transferRequest.quoteRequestExtensions).not.toHaveLength(0);
            if (transferRequest.quoteRequestExtensions) {
                expect(transferRequest.quoteRequestExtensions[0]["key"]).toEqual("CdtTrfTxInf.Dbtr.Id.PrvtId.DtAndPlcOfBirth.BirthDt");
            }
            logger.info("Trasnfer REquest  being sent to Initiate Transfer", transferRequest);
            expect(res.payeeDetails.idValue).toEqual(idValue);
        });


        test("Update Send Money, should trigger a request to pay using mtn client", async () => {
            //Arrange 
            const updateSendMoneyPayload = updateSendMoneyDTO(true);
            sdkClient.updateTransfer = jest.fn().mockResolvedValueOnce({});
            const sdkUpdateSpy = jest.spyOn(sdkClient,"updateTransfer");

            //Act 
            const res = await ccAggregate.updateSentTransfer(updateSendMoneyPayload, randomUUID());

            // Assert 
            logger.info("Response", res);
            expect(sdkUpdateSpy).toHaveBeenCalled();
        });
    });



    describe("Merchant Core Connector Aggregate Tests", () => {
        test("POST Merchant Payment. Should trigger transfer in SDK", async ()=>{
            //Arrange
            mtnClient.getKyc = jest.fn().mockResolvedValueOnce({
                "given_name": "Elijah",
                "family_name": "Okello",
                "birthdate": "19-09-1999",
                "locale": "en",
                "gender": "male",
                "status": "OK"
            });
            sdkClient.initiateTransfer = jest.fn().mockResolvedValueOnce({
                ...sdkInitiateTransferResponseDto(idValue, "WAITING_FOR_CONVERSION_ACCEPTANCE")
            });

            sdkClient.updateTransfer = jest.fn().mockResolvedValueOnce({
                ...sdkInitiateTransferResponseDto(idValue, "WAITING_FOR_QUOTE_ACCEPTANCE")
            });

            // Spying on Update Transfer
           jest.spyOn(sdkClient, "updateTransfer");

           const initiateTransferSpy = jest.spyOn(sdkClient, "initiateTransfer");


            const sendMoneyReqPayload = sendMoneyMerchantPaymentDTO(idValue,"103");
            //Act 
            const res = await ccAggregate.sendMoney(sendMoneyReqPayload, "RECEIVE");
            //Assert

            logger.info("Response",res);
            expect(sdkClient.updateTransfer).toHaveBeenCalled();

            // Expecting INitaite Transfer to have been called
            expect(initiateTransferSpy).toHaveBeenCalled();

            // Get the Reguest being Used to call
            const transferRequest = initiateTransferSpy.mock.calls[0][0];

            // Check the Extension List is not 0
            expect(transferRequest.quoteRequestExtensions).not.toHaveLength(0);
            if (transferRequest.quoteRequestExtensions) {
                expect(transferRequest.quoteRequestExtensions[0]["key"]).toEqual("CdtTrfTxInf.Dbtr.Id.PrvtId.DtAndPlcOfBirth.BirthDt");
            }
            logger.info("Trasnfer REquest  being sent to Initiate Transfer", transferRequest);
            expect(res.payeeDetails.idValue).toEqual(idValue);
        });


        test("Update Merchant Collect Money, Should Trigger a Request to Pay Using MTN Client", async () => {
            //Arrange 
            const updateMerchantPaymentPayload = updateMerchantPaymentRequestDTO(true);
            sdkClient.updateTransfer = jest.fn().mockResolvedValueOnce({});
            const sdkUpdateSpy = jest.spyOn(sdkClient,"updateTransfer");

            //Act 
            const res = await ccAggregate.updateSentTransfer(updateMerchantPaymentPayload, randomUUID());

            // Assert 
            logger.info("Response", res);
            expect(sdkUpdateSpy).toHaveBeenCalled();
        });
    });

});
