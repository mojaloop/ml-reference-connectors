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

import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';

import { CoreConnectorAggregate, TQuoteRequest, TtransferPatchNotificationRequest, TtransferRequest, } from '../../../src/domain';
import { AirtelClientFactory, IAirtelClient } from '../../../src/domain/CBSClient';
import {
    ISDKClient,
    SDKClientFactory,
} from '../../../src/domain/SDKClient';
import { AxiosClientFactory } from '../../../src/infra/axiosHttpClient';
import { loggerFactory } from '../../../src/infra/logger';
import config from '../../../src/config';
import { callbackPayloadDto, quoteRequestDto, sdkInitiateTransferResponseDto, sendMoneyMerchantPaymentDTO, transferPatchNotificationRequestDto, transferRequestDto, updateSendMoneyMerchantPaymentDTO } from '../../../test/fixtures';



const mockAxios = new MockAdapter(axios);
const logger = loggerFactory({ context: 'ccAgg tests' });
const airtelConfig = config.get('airtel');
const SDK_URL = 'http://localhost:4010';
const idType = "MSISDN";
const MSISDN_NO = "971938765";



describe('CoreConnectorAggregate Tests -->', () => {
    let ccAggregate: CoreConnectorAggregate;
    let airtelClient: IAirtelClient;
    let sdkClient: ISDKClient;

    beforeEach(() => {
        mockAxios.reset();
        const httpClient = AxiosClientFactory.createAxiosClientInstance();
        sdkClient = SDKClientFactory.getSDKClientInstance(logger, httpClient, SDK_URL);
        airtelClient = AirtelClientFactory.createClient({
            airtelConfig,
            httpClient,
            logger,
        });
        ccAggregate = new CoreConnectorAggregate(sdkClient, airtelConfig, airtelClient, logger);
        jest.resetAllMocks;
    });

    describe('Airtel Test', () => {

        // Get Parties Test

        test('Test Get Parties Happy Path', async () => {

            // mocked response from airtel kyc response

            airtelClient.getKyc = jest.fn().mockResolvedValue({
                "data": {
                    "first_name": "Chimweso Faith Mukoko",
                    "grade": "SUBS",
                    "is_barred": false,
                    "is_pin_set": false,
                    "last_name": "Test1",
                    "msisdn": "12****89",
                    "dob": "yyyy-MM-dd HH:mm:ss.S",
                    "account_status": "Y",
                    "nationatility": "CD",
                    "id_number": "125*****5522",
                    "registration": {
                        "status": "SUBS"
                    }
                },
                "status": {
                    "code": "200",
                    "message": "success",
                    "result_code": "DP02200000001",
                    "success": true
                }
            });
            try {
                const res = await ccAggregate.getParties('978980797', 'MSISDN');
                logger.info("Returned Data ==>", res.data);

                logger.info(JSON.stringify(res.data));
                expect(res.statusCode).toEqual(200);

                // Checking the Extension List Data is not Falsy
                expect(res.data.extensionList).not.toHaveLength(0);
            } catch (error) {
                console.error(error);
            }

        });


        // Quote Requests

        test('POST /quoterequests: sdk-server - Should return quote if party info exists', async () => {
            airtelClient.getKyc = jest.fn().mockResolvedValue({
                "data": {
                    "first_name": "Chimweso Faith Mukoko",
                    "grade": "SUBS",
                    "is_barred": false,
                    "is_pin_set": false,
                    "last_name": "Test1",
                    "msisdn": "12****89",
                    "dob": "yyyy-MM-dd HH:mm:ss.S",
                    "account_status": "Y",
                    "nationatility": "CD",
                    "id_number": "125*****5522",
                    "registration": {
                        "status": "SUBS"
                    }
                },
                "status": {
                    "code": "200",
                    "message": "success",
                    "result_code": "DP02200000001",
                    "success": true
                }
            });

            const quoteRequest: TQuoteRequest = quoteRequestDto();
            const res = await ccAggregate.quoteRequest(quoteRequest);

            logger.info(JSON.stringify(res));
            expect(res.extensionList?.length).toBeGreaterThan(0);
            expect(res.payeeFspFeeAmount).toBeDefined;

        });

        // Transfers
        test('POST /transfers: sdk-server - Should return receiveTransfer if party in tnm', async () => {
            airtelClient.getKyc = jest.fn().mockResolvedValue({
                "data": {
                    "first_name": "Chimweso Faith Mukoko",
                    "grade": "SUBS",
                    "is_barred": false,
                    "is_pin_set": false,
                    "last_name": "Test1",
                    "msisdn": "12****89",
                    "dob": "yyyy-MM-dd HH:mm:ss.S",
                    "account_status": "Y",
                    "nationatility": "CD",
                    "id_number": "125*****5522",
                    "registration": {
                        "status": "SUBS"
                    }
                },
                "status": {
                    "code": "200",
                    "message": "success",
                    "result_code": "DP02200000001",
                    "success": true
                }
            });
            const airtelClientGetKyc = jest.spyOn(airtelClient, "getKyc");

            const transferRequest: TtransferRequest = transferRequestDto(idType, MSISDN_NO, "103");

            const res = await ccAggregate.receiveTransfer(transferRequest);

            logger.info(JSON.stringify(res));
            expect(res.transferState).toEqual("RESERVED");
            expect(airtelClientGetKyc).toHaveBeenCalled();
            expect(transferRequest).not.toBeFalsy();
        });


        test('PUT /transfers/{id} notification: sdk server - Should return 200  ', async () => {
            jest.spyOn(airtelClient, "sendMoney");
            airtelClient.sendMoney = jest.fn().mockResolvedValueOnce({
                "payee": {
                    "msisdn": "75****26",
                    "wallet_type": "SALARY or NORMAL"
                },
                "reference": "AB***141",
                "pin": "KYJ************Rsa44",
                "transaction": {
                    "amount": 1000,
                    "id": "AB***141",
                    "type": "B2C or B2B"
                }
            });

            const patchNotificationRequest: TtransferPatchNotificationRequest = transferPatchNotificationRequestDto("COMPLETED", idType, MSISDN_NO, "500");
            const res = await ccAggregate.updateTransfer(patchNotificationRequest, "ljzowczj");

            logger.info(JSON.stringify(res));
            expect(res).toBeUndefined();
            expect(airtelClient.sendMoney).toHaveBeenCalled();
        });

    });

    // DFSP Route Tests

    describe("Airtel Payer Tests", () => {
        test("POST /send-money: should return payee details and fees with correct info provided", async () => {
            airtelClient.getKyc = jest.fn().mockResolvedValue({
                "data": {
                    "first_name": "Chimweso Faith Mukoko",
                    "grade": "SUBS",
                    "is_barred": false,
                    "is_pin_set": false,
                    "last_name": "Test1",
                    "msisdn": "12****89",
                    "dob": "yyyy-MM-dd HH:mm:ss.S",
                    "account_status": "Y",
                    "nationatility": "CD",
                    "id_number": "125*****5522",
                    "registration": {
                        "status": "SUBS"
                    }
                },
                "status": {
                    "code": "200",
                    "message": "success",
                    "result_code": "DP02200000001",
                    "success": true
                }
            });
            sdkClient.initiateTransfer = jest.fn().mockResolvedValue({
                ...sdkInitiateTransferResponseDto(MSISDN_NO, "WAITING_FOR_CONVERSION_ACCEPTANCE")
            });

            sdkClient.updateTransfer = jest.fn().mockResolvedValue({
                ...sdkInitiateTransferResponseDto(MSISDN_NO, "WAITING_FOR_QUOTE_ACCEPTANCE")
            });

            // Spying on Update Transfer
            jest.spyOn(sdkClient, "updateTransfer");


            // Spying on Initiate transfer
            const initiateTransferSpy = jest.spyOn(sdkClient, "initiateTransfer");

            const sendMoneyRequestBody = sendMoneyMerchantPaymentDTO(MSISDN_NO, "1000", "SEND");
            const res = await ccAggregate.sendMoney(sendMoneyRequestBody, "SEND");

            logger.info("Response from send money", res);

            // Expecting Update Transfer to have be called
            expect(sdkClient.updateTransfer).toHaveBeenCalled();

            // Expecting INitaite Transfer to have been called
            expect(initiateTransferSpy).toHaveBeenCalled();

            // Get the Reguest being Used to call
            const transferRequest = initiateTransferSpy.mock.calls[0][0];

            // Check the Extension List is not 0
            expect(transferRequest.quoteRequestExtensions).not.toHaveLength(0);
            if (transferRequest.quoteRequestExtensions) {
                expect(transferRequest.quoteRequestExtensions[0]["key"]).toEqual("CdtTrfTxInf.Dbtr.PrvtId.DtAndPlcOfBirth.BirthDt");
            }
            logger.info("Trasnfer REquest  being sent to Initiate Transfer", transferRequest);

        });


        test("PUT /send-money/{Id}: should initiate request to pay to customer wallet", async () => {

            airtelClient.collectMoney = jest.fn().mockResolvedValue({
                "data": {
                    "transaction": {
                        "id": false,
                        "status": "SUCCESS"
                    }
                },
                "status": {
                    "code": "200",
                    "message": "SUCCESS",
                    "result_code": "ESB000010",
                    "response_code": "DP00800001006",
                    "success": true
                }
            });
            jest.spyOn(airtelClient, "collectMoney");
            const updateSendMoneyReqBody = updateSendMoneyMerchantPaymentDTO(10, true, MSISDN_NO);
            const res = await ccAggregate.updateSentTransfer(updateSendMoneyReqBody, "ljzowczj");
            logger.info("Response ", res);
            expect(airtelClient.collectMoney).toHaveBeenCalled();
        });


        test("POST /merchant-payment: should return payee details and fees with correct info provided", async () => {
            airtelClient.getKyc = jest.fn().mockResolvedValue({
                "data": {
                    "first_name": "Chimweso Faith Mukoko",
                    "grade": "SUBS",
                    "is_barred": false,
                    "is_pin_set": false,
                    "last_name": "Test1",
                    "msisdn": "12****89",
                    "dob": "yyyy-MM-dd HH:mm:ss.S",
                    "account_status": "Y",
                    "nationatility": "CD",
                    "id_number": "125*****5522",
                    "registration": {
                        "status": "SUBS"
                    }
                },
                "status": {
                    "code": "200",
                    "message": "success",
                    "result_code": "DP02200000001",
                    "success": true
                }
            });
            sdkClient.initiateTransfer = jest.fn().mockResolvedValue({
                ...sdkInitiateTransferResponseDto(MSISDN_NO, "WAITING_FOR_CONVERSION_ACCEPTANCE")
            });

            sdkClient.updateTransfer = jest.fn().mockResolvedValue({
                ...sdkInitiateTransferResponseDto(MSISDN_NO, "WAITING_FOR_QUOTE_ACCEPTANCE")
            });

            // Spying on Update Transfer
            jest.spyOn(sdkClient, "updateTransfer");

            const initiateTransferSpy = jest.spyOn(sdkClient, "initiateTransfer");
            const merchantPaymentRequestBody = sendMoneyMerchantPaymentDTO(MSISDN_NO, "1000", "RECEIVE");
            const res = await ccAggregate.sendMoney(merchantPaymentRequestBody, "RECEIVE");

            logger.info("Response from merchant payment", res);


            expect(sdkClient.updateTransfer).toHaveBeenCalled();

            // Expecting INitaite Transfer to have been called
            expect(initiateTransferSpy).toHaveBeenCalled();

            // Get the Reguest being Used to call
            const transferRequest = initiateTransferSpy.mock.calls[0][0];

            

            // Check the Extension List is not 0
            expect(transferRequest.quoteRequestExtensions).not.toHaveLength(0);
            if (transferRequest.quoteRequestExtensions) {
                expect(transferRequest.quoteRequestExtensions[0]["key"]).toEqual("CdtTrfTxInf.Dbtr.PrvtId.DtAndPlcOfBirth.BirthDt");
            }
            logger.info("Trasnfer REquest  being sent to Initiate Transfer", transferRequest);
        });

        test("PUT /merchant-payment/{Id}: should initiate request to pay to customer wallet", async () => {

            airtelClient.collectMoney = jest.fn().mockResolvedValue({
                "data": {
                    "transaction": {
                        "id": false,
                        "status": "SUCCESS"
                    }
                },
                "status": {
                    "code": "200",
                    "message": "SUCCESS",
                    "result_code": "ESB000010",
                    "response_code": "DP00800001006",
                    "success": true
                }
            });
           
            jest.spyOn(airtelClient, "collectMoney");
            const updateMerchantPaymentReqBody = updateSendMoneyMerchantPaymentDTO(10, true, MSISDN_NO);
            const res = await ccAggregate.updateSentTransfer(updateMerchantPaymentReqBody, "ljzowczj");
            logger.info("Response ", res);
            expect(airtelClient.collectMoney).toHaveBeenCalled();
        }
    );


        test("PUT /callback: should receive a transacion status code", async () => {

            airtelClient.refundMoney = jest.fn().mockResolvedValue({
                "data": {
                    "transaction": {
                        "airtel_money_id": "CI2****29",
                        "status": "SUCCESS"
                    }
                },
                "status": {
                    "code": "200",
                    "message": "SUCCESS",
                    "result_code": "ESB000010",
                    "success": false
                }
            });
            const callBackRequest = callbackPayloadDto("1", "TS");
            const res = await ccAggregate.handleCallback(callBackRequest);
            logger.info("Response ", res);
            expect(airtelClient.refundMoney).toHaveBeenCalled();


        });




    });

});
