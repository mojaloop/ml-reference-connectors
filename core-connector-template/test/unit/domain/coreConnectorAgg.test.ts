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

import { CoreConnectorAggregate, TQuoteRequest, TtransferPatchNotificationRequest, TtransferRequest } from '../../../src/domain';
import {
    ISDKClient,
    SDKClientFactory,
} from '../../../src/domain/SDKClient';
import { AxiosClientFactory } from '../../../src/infra/axiosHttpClient';
import { loggerFactory } from '../../../src/infra/logger';
import config from '../../../src/config';
import { CBSClientFactory, ICbsClient, TCbsSendMoneyRequest } from '../../../src/domain/CBSClient';
import { callbackPayloadDto, quoteRequestDto, sdkInitiateTransferResponseDto, sendMoneyReqDTO, transferPatchNotificationRequestDto, transferRequestDto, updateSendMoneyMerchantPaymentDTO } from '../../fixtures';
import { randomUUID } from 'crypto';

const mockAxios = new MockAdapter(axios);
const logger = loggerFactory({ context: 'ccAgg tests' });
const cbsConfig = config.get("cbs");
const SDK_URL = 'http://localhost:4040';
const MSISDN = "0123456789"

describe('CoreConnectorAggregate Tests -->', () => {
    let ccAggregate: CoreConnectorAggregate;
    let cbsClient: ICbsClient;
    let sdkClient: ISDKClient;

    beforeEach(() => {
        mockAxios.reset();
        const httpClient = AxiosClientFactory.createAxiosClientInstance();
        sdkClient = SDKClientFactory.getSDKClientInstance(logger, httpClient, SDK_URL);
        cbsClient = CBSClientFactory.createClient({ cbsConfig, httpClient, logger });
        ccAggregate = new CoreConnectorAggregate(sdkClient, cbsClient, cbsConfig, logger);
    });

    describe("Payee Tests", () => {
        test(" getParties should return customer account information for id from CBS Api", async () => {
            //Arrange
            cbsClient.getKyc = jest.fn().mockResolvedValueOnce({
                // replace with body of cbs getKyc response body
                "data": {
                    "first_name": "Dealer",
                    "grade": "SUBS",
                    "is_barred": false,
                    "is_pin_set": true,
                    "last_name": "Test1",
                    "msisdn": MSISDN,
                    "dob": "2001-03-23",
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
            //Act
            const res = await ccAggregate.getParties(MSISDN, "MSISDN");
            logger.info("Get Parties Response", res);
            //Assert
            expect(res.idValue).toEqual(MSISDN);
            expect(res.extensionList).toBeDefined;
        });

        test("quoterequests should return transfer terms", async () => {
            //Arrange 
            cbsClient.getKyc = jest.fn().mockResolvedValueOnce({
                // replace with body of cbs getKyc response body
                "data": {
                    "first_name": "Dealer",
                    "grade": "SUBS",
                    "is_barred": false,
                    "is_pin_set": true,
                    "last_name": "Test1",
                    "msisdn": MSISDN,
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
            const quoteReq: TQuoteRequest = quoteRequestDto();
            //Act 
            const res = await ccAggregate.quoteRequest(quoteReq);
            logger.info("Quote response", res);
            //Assert
            expect(res.extensionList).toBeDefined;
            expect(res.payeeFspFeeAmount).toBeDefined;
        });

        test("receiveTransfers should return transfer transferState as RESERVED", async () => {
            //Arrange 
            cbsClient.getKyc = jest.fn().mockResolvedValueOnce({
                // replace with body of cbs getKyc response body
                "data": {
                    "first_name": "Dealer",
                    "grade": "SUBS",
                    "is_barred": false,
                    "is_pin_set": true,
                    "last_name": "Test1",
                    "msisdn": MSISDN,
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
            const transferReq: TtransferRequest = transferRequestDto("MSISDN", MSISDN, "1000");
            //Act
            const res = await ccAggregate.receiveTransfer(transferReq);
            //Assert
            expect(res.transferState).toEqual("RESERVED");
            expect(res.homeTransactionId).toBeDefined;
        });

        test("updateReceivedTransfer should disburse funds to customer account", async () => {
            //Arrange 
            cbsClient.sendMoney = jest.fn().mockResolvedValueOnce({
                "data": {
                    "transaction": {
                        "reference_id": "APC**4",
                        "airtel_money_id": "product-partner-**41",
                        "id": "AB***141",
                        "status": "TS",
                        "message": "Transaction Successful"
                    }
                },
                "status": {
                    "response_code": "DP00900001001",
                    "code": "200",
                    "success": true,
                    "message": "SUCCESS"
                }
            });
            const cbsClientSendMoney = jest.spyOn(cbsClient, "sendMoney");
            const patchNoficationPayload: TtransferPatchNotificationRequest = transferPatchNotificationRequestDto("COMPLETED", "MSISDN", MSISDN, "1000");
            //Act
            await ccAggregate.updateTransfer(patchNoficationPayload, randomUUID());
            //Assert
            expect(cbsClientSendMoney).toHaveBeenCalled();
        });

        test("updateReceivedTransfer should initiate compensation action when disburse funds to customer account fails", async () => {
            //Arrange 
            cbsClient.sendMoney = jest.fn().mockImplementationOnce(() => {
                throw new Error("Failed to send money");
            });
            const cbslogFailedPayment = jest.spyOn(cbsClient, "logFailedIncomingTransfer");
            const patchNoficationPayload: TtransferPatchNotificationRequest = transferPatchNotificationRequestDto("COMPLETED", "MSISDN", MSISDN, "1000");
            //Act
            await ccAggregate.updateTransfer(patchNoficationPayload, randomUUID());
            //Assert
            expect(cbslogFailedPayment).toHaveBeenCalled();
        });
    });

    describe("Payer Tests", () => {
        test("POST /send-money: should return payee details and fees with correct info provided", async () => {
            cbsClient.getKyc = jest.fn().mockResolvedValue({
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
                ...sdkInitiateTransferResponseDto(MSISDN, "WAITING_FOR_CONVERSION_ACCEPTANCE")
            });

            sdkClient.updateTransfer = jest.fn().mockResolvedValue({
                ...sdkInitiateTransferResponseDto(MSISDN, "WAITING_FOR_QUOTE_ACCEPTANCE")
            });

            // Spying on Update Transfer
            jest.spyOn(sdkClient, "updateTransfer");


            // Spying on Initiate transfer
            const initiateTransferSpy = jest.spyOn(sdkClient, "initiateTransfer");

            const sendMoneyRequestBody = sendMoneyReqDTO("1000",MSISDN);
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

            cbsClient.collectMoney = jest.fn().mockResolvedValue({
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
            jest.spyOn(cbsClient, "collectMoney");
            const updateSendMoneyReqBody = updateSendMoneyMerchantPaymentDTO(10, true, MSISDN);
            const res = await ccAggregate.updateSendMoney(updateSendMoneyReqBody, "ljzowczj");
            logger.info("Response ", res);
            expect(cbsClient.collectMoney).toHaveBeenCalled();
        });


        test("POST /merchant-payment: should return payee details and fees with correct info provided", async () => {
            cbsClient.getKyc = jest.fn().mockResolvedValue({
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
                ...sdkInitiateTransferResponseDto(MSISDN, "WAITING_FOR_CONVERSION_ACCEPTANCE")
            });

            sdkClient.updateTransfer = jest.fn().mockResolvedValue({
                ...sdkInitiateTransferResponseDto(MSISDN, "WAITING_FOR_QUOTE_ACCEPTANCE")
            });

            // Spying on Update Transfer
            jest.spyOn(sdkClient, "updateTransfer");

            const initiateTransferSpy = jest.spyOn(sdkClient, "initiateTransfer");
            const merchantPaymentRequestBody = sendMoneyReqDTO("1000",MSISDN);
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

            cbsClient.collectMoney = jest.fn().mockResolvedValue({
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

            jest.spyOn(cbsClient, "collectMoney");
            const updateMerchantPaymentReqBody = updateSendMoneyMerchantPaymentDTO(10, true, MSISDN);
            const res = await ccAggregate.updateSendMoney(updateMerchantPaymentReqBody, "ljzowczj");
            logger.info("Response ", res);
            expect(cbsClient.collectMoney).toHaveBeenCalled();
        }
        );


        test("PUT /callback: should receive a transacion status code", async () => {

            cbsClient.refundMoney = jest.fn().mockResolvedValue({
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
            const callBackRequest = callbackPayloadDto("1000", "TS");
            const res = await ccAggregate.handleCallback(callBackRequest);
            logger.info("Response ", res);
            expect(cbsClient.refundMoney).toHaveBeenCalled();


        });
    });
});
