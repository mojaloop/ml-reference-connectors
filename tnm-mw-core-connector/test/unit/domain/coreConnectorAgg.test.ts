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

import { CoreConnectorAggregate, TQuoteRequest, TtransferPatchNotificationRequest, TtransferRequest } from '../../../src/domain';
import {
    ISDKClient,
    SDKClientFactory,
} from '../../../src/domain/SDKClient';
import { AxiosClientFactory } from '../../../src/infra/axiosHttpClient';
import { loggerFactory } from '../../../src/infra/logger';
import config from '../../../src/config';
import { TNMClientFactory, ITNMClient } from '../../../src/domain/CBSClient';
import { quoteRequestDto, sdkInitiateTransferResponseDto, sdkUpdateTransferResponseDto, sendMoneyDTO, TNMCallbackPayloadDto, tnmUpdateSendMoneyRequestDto, transferPatchNotificationRequestDto, transferRequestDto } from '../../fixtures';

const logger = loggerFactory({ context: 'ccAgg tests' });
const tnmConfig = config.get("tnm");
const SDK_URL = 'http://localhost:4010';
const idType = "MSISDN";
const MSISDN_NO = "0881544547";

describe('CoreConnectorAggregate Tests -->', () => {
    let ccAggregate: CoreConnectorAggregate;
    let tnmClient: ITNMClient;
    let sdkClient: ISDKClient;

    beforeEach(() => {
        const httpClient = AxiosClientFactory.createAxiosClientInstance();
        sdkClient = SDKClientFactory.getSDKClientInstance(logger, httpClient, SDK_URL);
        tnmClient = TNMClientFactory.createClient({ tnmConfig: tnmConfig, httpClient, logger });
        ccAggregate = new CoreConnectorAggregate(sdkClient, tnmClient, tnmConfig, logger);
        jest.resetAllMocks();
    });

    describe("TNM Payee Test", () => {
        test("Get Parties Happy Path", async () => {
            tnmClient.getKyc = jest.fn().mockResolvedValue({
                "message": "Completed successfully",
                "errors": [],
                "trace": [],
                "data": {
                    "full_name": "Promise Mphoola"
                }

            });

            tnmClient.getToken = jest.fn().mockResolvedValue({
                "message": "Completed successfully",
                "errors": [],
                "trace": [],
                "data": {
                    "token": "3|i6cvlcmyDKMzpczXol6QTbwMWzIgZI25AfwdOfCG",
                    "expires_at": "2023-07-13 10:56:45"
                }
            });

            const kyc_res = await ccAggregate.getParties('0881544547', idType);
            logger.info("Returned Data ==>", kyc_res.data);

            logger.info(JSON.stringify(kyc_res.data));
            expect(kyc_res.data.extensionList).toBeDefined();
            expect(Array.isArray(kyc_res.data.extensionList)).toBeTruthy();
            expect(kyc_res.statusCode).toEqual(200);
        });

        test('POST /quoterequests: sdk-server - Should return quote if party info exists', async () => {
            tnmClient.getKyc = jest.fn().mockResolvedValue({

                "message": "Completed successfully",
                "errors": [],
                "trace": [],
                "data": {
                    "full_name": "Promise Mphoola"
                }
            });

            tnmClient.getToken = jest.fn().mockResolvedValue({
                "message": "Completed successfully",
                "errors": [],
                "trace": [],
                "data": {
                    "token": "3|i6cvlcmyDKMzpczXol6QTbwMWzIgZI25AfwdOfCG",
                    "expires_at": "2023-07-13 10:56:45"
                }
            });

            const quoteRequest: TQuoteRequest = quoteRequestDto(undefined, undefined, "1000");

            const res = await ccAggregate.quoteRequest(quoteRequest);

            logger.info("This is the response ==>", JSON.stringify(res));
            const fees = Number(config.get('tnm.SENDING_SERVICE_CHARGE')) / 100 * Number(quoteRequest.amount);
            expect(res.payeeFspFeeAmount).toEqual(fees.toString());
        });

        test('POST /transfers: sdk-server - Should return receiveTransfer if party in tnm', async () => {
            tnmClient.getKyc = jest.fn().mockResolvedValue({

                "message": "Completed successfully",
                "errors": [],
                "trace": [],
                "data": {
                    "full_name": "Promise Mphoola"
                }
            });

            tnmClient.getToken = jest.fn().mockResolvedValue({
                "message": "Completed successfully",
                "errors": [],
                "trace": [],
                "data": {
                    "token": "3|i6cvlcmyDKMzpczXol6QTbwMWzIgZI25AfwdOfCG",
                    "expires_at": "2023-07-13 10:56:45"
                }
            });
            const transferRequest: TtransferRequest = transferRequestDto(idType, MSISDN_NO, "103");

            const res = await ccAggregate.receiveTransfer(transferRequest);

            logger.info(JSON.stringify(res));
            expect(res.transferState).toEqual("RESERVED");
        });

        test('PUT /transfers/{id} notification: sdk server - Should return 200  ', async () => {
            tnmClient.sendMoney = jest.fn().mockResolvedValue({
                "message": "Completed successfully",
                "errors": [],
                "trace": [],
                "data": {
                    "transaction_id": "ljzowczj",
                    "receipt_number": "AGC00B5MCA"
                }
            });

            jest.spyOn(tnmClient, "sendMoney");

            const patchNotificationRequest: TtransferPatchNotificationRequest = transferPatchNotificationRequestDto("COMPLETED", idType, MSISDN_NO, "500");
            const res = await ccAggregate.updateTransfer(patchNotificationRequest, "ljzowczj");

            logger.info(JSON.stringify(res));
            expect(res).toBeUndefined();
            expect(tnmClient.sendMoney).toHaveBeenCalled();
        });
    });

    describe("TNM Payer Tests", () => {
        test("POST /send-money: should return payee details and fees with correct info provided", async () => {
            sdkClient.initiateTransfer = jest.fn().mockResolvedValue({
                ...sdkInitiateTransferResponseDto(MSISDN_NO, "WAITING_FOR_CONVERSION_ACCEPTANCE")
            });
            tnmClient.getKyc = jest.fn().mockResolvedValue({
                "message": "Completed successfully",
                "errors": [],
                "trace": [],
                "data": {
                    "full_name": "Promise Mphoola"
                }

            });
            sdkClient.updateTransfer = jest.fn().mockResolvedValue({
                ...sdkUpdateTransferResponseDto(MSISDN_NO, "1000")
            });
            const initiateTransferSpy = jest.spyOn(sdkClient, "initiateTransfer");
            const sendMoneyRequestBody = sendMoneyDTO(MSISDN_NO, "1000");
            const res = await ccAggregate.sendMoney(sendMoneyRequestBody, "SEND");

            // Expecting Update Transfer to have be called
            expect(sdkClient.updateTransfer).toHaveBeenCalled();

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


            logger.info("Response fromm send money", res);
            expect(sdkClient.updateTransfer).toHaveBeenCalled();

        });


        test("PUT /send-money/{Id}: should initiate request to pay to customer wallet", async () => {
            tnmClient.getToken = jest.fn().mockResolvedValue({
                "message": "Completed successfully",
                "errors": [],
                "trace": [],
                "data": {
                    "token": "3|i6cvlcmyDKMzpczXol6QTbwMWzIgZI25AfwdOfCG",
                    "expires_at": "2023-07-13 10:56:45"
                }
            });
            tnmClient.collectMoney = jest.fn().mockResolvedValue(
                {
                    "message": "Request accepted and processing",
                    "errors": [],
                    "trace": [],
                    "data": []
                  }
            );
            const updateSendMoneyReqBody = tnmUpdateSendMoneyRequestDto(MSISDN_NO, "1000");
            const res = await ccAggregate.updateSendMoney(updateSendMoneyReqBody, "ljzowczj");
            logger.info("Response ", res);
            expect(tnmClient.collectMoney).toHaveBeenCalled();
        });

        test("POST /merchant-payment: ", async () => {
            sdkClient.initiateTransfer = jest.fn().mockResolvedValue({
                ...sdkInitiateTransferResponseDto(MSISDN_NO, "WAITING_FOR_CONVERSION_ACCEPTANCE")
            });
            tnmClient.getKyc = jest.fn().mockResolvedValue({
                "message": "Completed successfully",
                "errors": [],
                "trace": [],
                "data": {
                    "full_name": "Promise Mphoola"
                }

            });
            sdkClient.updateTransfer = jest.fn().mockResolvedValue({
                ...sdkUpdateTransferResponseDto(MSISDN_NO, "1000")
            });
            const initiateMerchantTransferSpy = jest.spyOn(sdkClient, "initiateTransfer");
            const sendMoneyRequestBody = sendMoneyDTO(MSISDN_NO, "1000");
            const res = await ccAggregate.sendMoney(sendMoneyRequestBody, "RECEIVE");
            // Expecting Update Transfer to have be called
            expect(sdkClient.updateTransfer).toHaveBeenCalled();

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

            logger.info("Response fromm send money", res);
            expect(sdkClient.updateTransfer).toHaveBeenCalled();
        });

        test("PUT /merchant-payment/{Id}: should initiate request to pay to customer wallet", async () => {
            tnmClient.getToken = jest.fn().mockResolvedValue({
                "message": "Completed successfully",
                "errors": [],
                "trace": [],
                "data": {
                    "token": "3|i6cvlcmyDKMzpczXol6QTbwMWzIgZI25AfwdOfCG",
                    "expires_at": "2023-07-13 10:56:45"
                }
            });
            tnmClient.collectMoney = jest.fn().mockResolvedValue(
                {
                    "message": "Request accepted and processing",
                    "errors": [],
                    "trace": [],
                    "data": []
                }
            );
            jest.spyOn(tnmClient, "collectMoney");
            const updateSendMoneyReqBody = tnmUpdateSendMoneyRequestDto(MSISDN_NO, "1000");
            const res = await ccAggregate.updateSendMoney(updateSendMoneyReqBody, "ljzowczj");

            
            logger.info("Response ", res);
            expect(tnmClient.collectMoney).toHaveBeenCalled();
        });

        test("PUT /callback: should call mojaloop connector with acceptQuote: true if payment was successful", async () => {
            sdkClient.updateTransfer = jest.fn().mockResolvedValue(sdkUpdateTransferResponseDto(MSISDN_NO, "1000"));
            jest.spyOn(sdkClient, "updateTransfer");
            const payload = TNMCallbackPayloadDto();
            const res = await ccAggregate.handleCallback(payload);
            logger.info("Response", res);
            expect(sdkClient.updateTransfer).toHaveBeenCalledWith(
                { acceptQuote: true }, payload.transaction_id
            );
        });
    });
});
