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
import { ZicbClientFactory, IZicbClient } from '../../../src/domain/CBSClient';
import { quoteRequestDto, sdkInitiateTransferResponseDto, sendMoneyReqDTO, transferPatchNotificationRequestDto, transferRequestDto, updateSendMoneyMerchantPaymentDTO } from '../../fixtures';
import { randomUUID } from 'crypto';

const mockAxios = new MockAdapter(axios);
const logger = loggerFactory({ context: 'ccAgg tests' });
const zicbConfig = config.get("zicb");
const SDK_URL = 'http://localhost:4010';
const ACCOUNT_NO = "1019000002881";

describe('CoreConnectorAggregate Tests -->', () => {
    let ccAggregate: CoreConnectorAggregate;
    let zicbClient: IZicbClient;
    let sdkClient: ISDKClient;

    beforeEach(() => {
        mockAxios.reset();
        const httpClient = AxiosClientFactory.createAxiosClientInstance();
        sdkClient = SDKClientFactory.getSDKClientInstance(logger, httpClient, SDK_URL);
        zicbClient = ZicbClientFactory.createClient({zicbConfig, httpClient, logger });
        ccAggregate = new CoreConnectorAggregate(sdkClient, zicbClient, zicbConfig, logger);
    });

    describe("Payee Tests", () => {
        test(" getParties should return customer account information for id from ZICB Api", async () => {
            //Arrange
            zicbClient.verifyCustomerByAccountNumber = jest.fn().mockResolvedValueOnce({
                "errorList": {},
                "operation_status": "SUCCESS",
                "preauthUUID": "2f0b5c58-c830-4630-8a3b-0b82b854656c",
                "request": {
                    "accountNos": "1019000001703",
                    "accountType": null,
                    "customerNos": null,
                    "getByAccType": false,
                    "getByCustNo": false
                },
                "request-reference": "2025182-ZICB-1739871967",
                "response": {
                    "accountList": [
                        {
                            "frozenStatus": "A",
                            "accDesc": "CHIMWESO FAITH MUKOKO",
                            "loanStatus": null,
                            "accTypeDesc": "CHIMWESO FAITH MUKOKO",
                            "accOpeningDate": null,
                            "loanMaturityDate": null,
                            "chequeBookFlag": "N",
                            "lastCreditActivity": null,
                            "loanRate": null,
                            "overdftUtilizedAmt": 0,
                            "accATMFacility": null,
                            "overdftAllowed": "N",
                            "loanLastPaidDate": null,
                            "maturityAmount": null,
                            "accPassBookFacility": null,
                            "currency": "ZMW",
                            "loanNextDueDate": null,
                            "creditAccountOnMaturity": null,
                            "loanAmountFinanced": null,
                            "loanAmountDisbursed": null,
                            "userLcRef": null,
                            "expiryDate": null,
                            "loanTotalAmountDue": null,
                            "overdftLmt": 0,
                            "loanEMI": 0,
                            "loanAmountDue": 453.8,
                            "loanAmount": 0,
                            "address2": "Salama Park 256",
                            "dealRef": "MOJAFIN",
                            "loanType": null,
                            "dealType": null,
                            "actualAmount": 453.8,
                            "loanTotalAmountPaid": 0,
                            "address4": "Lusaka",
                            "accStatus": "E",
                            "accountOpenDate": 1622213596572,
                            "address3": "Lusaka",
                            "overdftAvailableAmt": null,
                            "loanStartDate": "28-MAY-2021",
                            "coreBankingDate": "18-FEB-2025",
                            "accNo": "1019000001703",
                            "lastDebitActivity": null,
                            "customerName": null,
                            "curBal": 453.8,
                            "issueDate": null,
                            "loanTenure": 0,
                            "jointAccount": "S",
                            "accType": "MOJAFIN",
                            "closureDate": null,
                            "address1": "Brokoli Street",
                            "accName": null,
                            "branchCode": "101",
                            "prodCode": "MOJAFIN",
                            "totalAmountAvailable": 453.8,
                            "avlBal": 453.8,
                            "idCustomer": "9000622",
                            "loanAmountOverdue": null,
                            "unclearFunds": 0
                        }
                    ],
                    "tekHeader": {
                        "errList": {},
                        "hostrefno": null,
                        "msgList": {},
                        "status": "SUCCESS",
                        "tekesbrefno": "cfeaf630-dabd-e646-0a9d-e7ee3e527897",
                        "username": "TEKESBRETAIL",
                        "warnList": {}
                    }
                },
                "status": 200,
                "timestamp": 1739871967939
            });
            //Act
            const res = await ccAggregate.getParties(ACCOUNT_NO, "ACCOUNT_NO");
            logger.info("Get Parties Response", res);

            logger.info(JSON.stringify(res.data));
            expect(res.statusCode).toEqual(200);

            //Assert
            expect(res.data.idValue).toEqual(ACCOUNT_NO);
            expect(res.data.extensionList).toBeDefined;
        });

        test("quoterequests should return transfer terms", async () => {
            //Arrange 
            zicbClient.verifyCustomerByAccountNumber = jest.fn().mockResolvedValue({
                "errorList": {},
                "operation_status": "SUCCESS",
                "preauthUUID": "2f0b5c58-c830-4630-8a3b-0b82b854656c",
                "request": {
                    "accountNos": "1019000001703",
                    "accountType": null,
                    "customerNos": null,
                    "getByAccType": false,
                    "getByCustNo": false
                },
                "request-reference": "2025182-ZICB-1739871967",
                "response": {
                    "accountList": [
                        {
                            "frozenStatus": "A",
                            "accDesc": "CHIMWESO FAITH MUKOKO",
                            "loanStatus": null,
                            "accTypeDesc": "CHIMWESO FAITH MUKOKO",
                            "accOpeningDate": null,
                            "loanMaturityDate": null,
                            "chequeBookFlag": "N",
                            "lastCreditActivity": null,
                            "loanRate": null,
                            "overdftUtilizedAmt": 0,
                            "accATMFacility": null,
                            "overdftAllowed": "N",
                            "loanLastPaidDate": null,
                            "maturityAmount": null,
                            "accPassBookFacility": null,
                            "currency": "ZMW",
                            "loanNextDueDate": null,
                            "creditAccountOnMaturity": null,
                            "loanAmountFinanced": null,
                            "loanAmountDisbursed": null,
                            "userLcRef": null,
                            "expiryDate": null,
                            "loanTotalAmountDue": null,
                            "overdftLmt": 0,
                            "loanEMI": 0,
                            "loanAmountDue": 453.8,
                            "loanAmount": 0,
                            "address2": "Salama Park 256",
                            "dealRef": "MOJAFIN",
                            "loanType": null,
                            "dealType": null,
                            "actualAmount": 453.8,
                            "loanTotalAmountPaid": 0,
                            "address4": "Lusaka",
                            "accStatus": "E",
                            "accountOpenDate": 1622213596572,
                            "address3": "Lusaka",
                            "overdftAvailableAmt": null,
                            "loanStartDate": "28-MAY-2021",
                            "coreBankingDate": "18-FEB-2025",
                            "accNo": "1019000001703",
                            "lastDebitActivity": null,
                            "customerName": null,
                            "curBal": 453.8,
                            "issueDate": null,
                            "loanTenure": 0,
                            "jointAccount": "S",
                            "accType": "MOJAFIN",
                            "closureDate": null,
                            "address1": "Brokoli Street",
                            "accName": null,
                            "branchCode": "101",
                            "prodCode": "MOJAFIN",
                            "totalAmountAvailable": 453.8,
                            "avlBal": 453.8,
                            "idCustomer": "9000622",
                            "loanAmountOverdue": null,
                            "unclearFunds": 0
                        }
                    ],
                    "tekHeader": {
                        "errList": {},
                        "hostrefno": null,
                        "msgList": {},
                        "status": "SUCCESS",
                        "tekesbrefno": "cfeaf630-dabd-e646-0a9d-e7ee3e527897",
                        "username": "TEKESBRETAIL",
                        "warnList": {}
                    }
                },
                "status": 200,
                "timestamp": 1739871967939
            });

            const quoteReq: TQuoteRequest = quoteRequestDto();
            //Act 
            const res = await ccAggregate.quoteRequest(quoteReq);
            logger.info("Quote response", res);


            //Assert
            expect(res.extensionList).not.toHaveLength(0);
            expect(res.payeeFspFeeAmount).toBeDefined;
        });

        test("receiveTransfers should return transfer transferState as RESERVED", async () => {
            //Arrange 
            zicbClient.verifyCustomerByAccountNumber = jest.fn().mockResolvedValueOnce({
                "errorList": {},
                "operation_status": "SUCCESS",
                "preauthUUID": "2f0b5c58-c830-4630-8a3b-0b82b854656c",
                "request": {
                    "accountNos": "1019000001703",
                    "accountType": null,
                    "customerNos": null,
                    "getByAccType": false,
                    "getByCustNo": false
                },
                "request-reference": "2025182-ZICB-1739871967",
                "response": {
                    "accountList": [
                        {
                            "frozenStatus": "A",
                            "accDesc": "CHIMWESO FAITH MUKOKO",
                            "loanStatus": null,
                            "accTypeDesc": "CHIMWESO FAITH MUKOKO",
                            "accOpeningDate": null,
                            "loanMaturityDate": null,
                            "chequeBookFlag": "N",
                            "lastCreditActivity": null,
                            "loanRate": null,
                            "overdftUtilizedAmt": 0,
                            "accATMFacility": null,
                            "overdftAllowed": "N",
                            "loanLastPaidDate": null,
                            "maturityAmount": null,
                            "accPassBookFacility": null,
                            "currency": "ZMW",
                            "loanNextDueDate": null,
                            "creditAccountOnMaturity": null,
                            "loanAmountFinanced": null,
                            "loanAmountDisbursed": null,
                            "userLcRef": null,
                            "expiryDate": null,
                            "loanTotalAmountDue": null,
                            "overdftLmt": 0,
                            "loanEMI": 0,
                            "loanAmountDue": 453.8,
                            "loanAmount": 0,
                            "address2": "Salama Park 256",
                            "dealRef": "MOJAFIN",
                            "loanType": null,
                            "dealType": null,
                            "actualAmount": 453.8,
                            "loanTotalAmountPaid": 0,
                            "address4": "Lusaka",
                            "accStatus": "E",
                            "accountOpenDate": 1622213596572,
                            "address3": "Lusaka",
                            "overdftAvailableAmt": null,
                            "loanStartDate": "28-MAY-2021",
                            "coreBankingDate": "18-FEB-2025",
                            "accNo": "1019000001703",
                            "lastDebitActivity": null,
                            "customerName": null,
                            "curBal": 453.8,
                            "issueDate": null,
                            "loanTenure": 0,
                            "jointAccount": "S",
                            "accType": "MOJAFIN",
                            "closureDate": null,
                            "address1": "Brokoli Street",
                            "accName": null,
                            "branchCode": "101",
                            "prodCode": "MOJAFIN",
                            "totalAmountAvailable": 453.8,
                            "avlBal": 453.8,
                            "idCustomer": "9000622",
                            "loanAmountOverdue": null,
                            "unclearFunds": 0
                        }
                    ],
                    "tekHeader": {
                        "errList": {},
                        "hostrefno": null,
                        "msgList": {},
                        "status": "SUCCESS",
                        "tekesbrefno": "cfeaf630-dabd-e646-0a9d-e7ee3e527897",
                        "username": "TEKESBRETAIL",
                        "warnList": {}
                    }
                },
                "status": 200,
                "timestamp": 1739871967939
            });
            const transferReq: TtransferRequest = transferRequestDto("ACCOUNT_NO", ACCOUNT_NO, "5");
            //Act
            const res = await ccAggregate.receiveTransfer(transferReq);
            //Assert
            expect(res.transferState).toEqual("RESERVED");
            expect(res.homeTransactionId).toBeDefined;
            expect(transferReq).not.toBeFalsy();
        });

        test("updateReceivedTransfer should disburse funds to customer account", async () => {
            //Arrange 
            zicbClient.walletToWalletInternalFundsTransfer = jest.fn().mockResolvedValueOnce({
                "errorList": {
                    "AC-VAC05": "Account 1010035376132 Dormant",
                    "ST-SAVE-054": "Failed to Save",
                    "UP-PMT-90": "Insufficient account balance"
                },
                "operation_status": "FAIL",
                "preauthUUID": "80626448-d8e5-48fe-a40c-8446495e4be3",
                "request": {
                    "amount": "2000",
                    "destAcc": "1010035376132",
                    "destBranch": "001",
                    "payCurrency": "ZMW",
                    "payDate": "2024-07-03",
                    "referenceNo": "1720015165",
                    "remarks": "Being payment for zxy invoice numner 12345 refred 12345",
                    "srcAcc": "1019000002881",
                    "srcBranch": "101",
                    "srcCurrency": "ZMW",
                    "transferTyp": "INTERNAL"
                },
                "request-reference": "202437-ZICB-1720015166",
                "response": {
                    "amountCredit": null,
                    "amountDebit": null,
                    "destAcc": null,
                    "destBranch": null,
                    "exchangeRate": null,
                    "payCurrency": null,
                    "payDate": null,
                    "srcAcc": null,
                    "srcBranch": null,
                    "srcCurrency": null,
                    "tekHeader": {
                        "errList": {
                            "AC-VAC05": "Account 1010035376132 Dormant",
                            "ST-SAVE-054": "Failed to Save",
                            "UP-PMT-90": "Insufficient account balance"
                        },
                        "hostrefno": null,
                        "msgList": {},
                        "status": "FAIL",
                        "tekesbrefno": "d64fa5dd-2eb7-c284-c4d1-9fe7f183ab49",
                        "username": "TEKESBRETAIL",
                        "warnList": {}
                    }
                },
                "status": 200,
                "timestamp": 1720015166319
            });
            const zicbClientSendMoney = jest.spyOn(zicbClient, "walletToWalletInternalFundsTransfer");
            const patchNoficationPayload: TtransferPatchNotificationRequest = transferPatchNotificationRequestDto("COMPLETED", "ACCOUNT_NO", ACCOUNT_NO, "1000");
            //Act
            await ccAggregate.updateTransfer(patchNoficationPayload, randomUUID());
            //Assert
            expect(zicbClientSendMoney).toHaveBeenCalled();
        });

        // test("updateReceivedTransfer should initiate compensation action when disburse funds to customer account fails", async () => {
        //     //Arrange 
        //     cbsClient.sendMoney = jest.fn().mockImplementationOnce(() => {
        //         throw new Error("Failed to send money");
        //     });
        //     const cbslogFailedPayment = jest.spyOn(cbsClient, "logFailedIncomingTransfer");
        //     const patchNoficationPayload: TtransferPatchNotificationRequest = transferPatchNotificationRequestDto("COMPLETED", "MSISDN", MSISDN, "1000");
        //     //Act
        //     await ccAggregate.updateTransfer(patchNoficationPayload, randomUUID());
        //     //Assert
        //     expect(cbslogFailedPayment).toHaveBeenCalled();
        // });
    });

    describe("Payer Tests", () => {
        test("POST /send-money: should return payee details and fees with correct info provided", async () => {
            zicbClient.verifyCustomerByAccountNumber = jest.fn().mockResolvedValue({
                "errorList": {},
                "operation_status": "SUCCESS",
                "preauthUUID": "2f0b5c58-c830-4630-8a3b-0b82b854656c",
                "request": {
                    "accountNos": "1019000001703",
                    "accountType": null,
                    "customerNos": null,
                    "getByAccType": false,
                    "getByCustNo": false
                },
                "request-reference": "2025182-ZICB-1739871967",
                "response": {
                    "accountList": [
                        {
                            "frozenStatus": "A",
                            "accDesc": "CHIMWESO FAITH MUKOKO",
                            "loanStatus": null,
                            "accTypeDesc": "CHIMWESO FAITH MUKOKO",
                            "accOpeningDate": null,
                            "loanMaturityDate": null,
                            "chequeBookFlag": "N",
                            "lastCreditActivity": null,
                            "loanRate": null,
                            "overdftUtilizedAmt": 0,
                            "accATMFacility": null,
                            "overdftAllowed": "N",
                            "loanLastPaidDate": null,
                            "maturityAmount": null,
                            "accPassBookFacility": null,
                            "currency": "ZMW",
                            "loanNextDueDate": null,
                            "creditAccountOnMaturity": null,
                            "loanAmountFinanced": null,
                            "loanAmountDisbursed": null,
                            "userLcRef": null,
                            "expiryDate": null,
                            "loanTotalAmountDue": null,
                            "overdftLmt": 0,
                            "loanEMI": 0,
                            "loanAmountDue": 453.8,
                            "loanAmount": 0,
                            "address2": "Salama Park 256",
                            "dealRef": "MOJAFIN",
                            "loanType": null,
                            "dealType": null,
                            "actualAmount": 453.8,
                            "loanTotalAmountPaid": 0,
                            "address4": "Lusaka",
                            "accStatus": "E",
                            "accountOpenDate": 1622213596572,
                            "address3": "Lusaka",
                            "overdftAvailableAmt": null,
                            "loanStartDate": "28-MAY-2021",
                            "coreBankingDate": "18-FEB-2025",
                            "accNo": "1019000001703",
                            "lastDebitActivity": null,
                            "customerName": null,
                            "curBal": 453.8,
                            "issueDate": null,
                            "loanTenure": 0,
                            "jointAccount": "S",
                            "accType": "MOJAFIN",
                            "closureDate": null,
                            "address1": "Brokoli Street",
                            "accName": null,
                            "branchCode": "101",
                            "prodCode": "MOJAFIN",
                            "totalAmountAvailable": 453.8,
                            "avlBal": 453.8,
                            "idCustomer": "9000622",
                            "loanAmountOverdue": null,
                            "unclearFunds": 0
                        }
                    ],
                    "tekHeader": {
                        "errList": {},
                        "hostrefno": null,
                        "msgList": {},
                        "status": "SUCCESS",
                        "tekesbrefno": "cfeaf630-dabd-e646-0a9d-e7ee3e527897",
                        "username": "TEKESBRETAIL",
                        "warnList": {}
                    }
                },
                "status": 200,
                "timestamp": 1739871967939
            });
            sdkClient.initiateTransfer = jest.fn().mockResolvedValue({
                ...sdkInitiateTransferResponseDto(ACCOUNT_NO, "WAITING_FOR_CONVERSION_ACCEPTANCE")
            });

            sdkClient.updateTransfer = jest.fn().mockResolvedValue({
                ...sdkInitiateTransferResponseDto(ACCOUNT_NO, "WAITING_FOR_QUOTE_ACCEPTANCE")
            });

            // Spying on Update Transfer
            jest.spyOn(sdkClient, "updateTransfer");


            // Spying on Initiate transfer
            const initiateTransferSpy = jest.spyOn(sdkClient, "initiateTransfer");

            const sendMoneyRequestBody = sendMoneyReqDTO("5",ACCOUNT_NO);
            const res = await ccAggregate.sendMoney(sendMoneyRequestBody, "SEND");

            logger.info("Response from send money", res);

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
            logger.info("Trasnfer REquest  being sent to Initiate Transfer", transferRequest);

        });


        test("PUT /send-money/{Id}: should initiate request to pay to customer wallet", async () => {

            zicbClient.walletToWalletInternalFundsTransfer = jest.fn().mockResolvedValue({
                "errorList": {
                    "AC-VAC05": "Account 1010035376132 Dormant",
                    "ST-SAVE-054": "Failed to Save",
                    "UP-PMT-90": "Insufficient account balance"
                },
                "operation_status": "FAIL",
                "preauthUUID": "80626448-d8e5-48fe-a40c-8446495e4be3",
                "request": {
                    "amount": "2000",
                    "destAcc": "1010035376132",
                    "destBranch": "001",
                    "payCurrency": "ZMW",
                    "payDate": "2024-07-03",
                    "referenceNo": "1720015165",
                    "remarks": "Being payment for zxy invoice numner 12345 refred 12345",
                    "srcAcc": "1019000002881",
                    "srcBranch": "101",
                    "srcCurrency": "ZMW",
                    "transferTyp": "INTERNAL"
                },
                "request-reference": "202437-ZICB-1720015166",
                "response": {
                    "amountCredit": null,
                    "amountDebit": null,
                    "destAcc": null,
                    "destBranch": null,
                    "exchangeRate": null,
                    "payCurrency": null,
                    "payDate": null,
                    "srcAcc": null,
                    "srcBranch": null,
                    "srcCurrency": null,
                    "tekHeader": {
                        "errList": {
                            "AC-VAC05": "Account 1010035376132 Dormant",
                            "ST-SAVE-054": "Failed to Save",
                            "UP-PMT-90": "Insufficient account balance"
                        },
                        "hostrefno": null,
                        "msgList": {},
                        "status": "FAIL",
                        "tekesbrefno": "d64fa5dd-2eb7-c284-c4d1-9fe7f183ab49",
                        "username": "TEKESBRETAIL",
                        "warnList": {}
                    }
                },
                "status": 200,
                "timestamp": 1720015166319
            });

            sdkClient.updateTransfer = jest.fn().mockResolvedValue({
                ...sdkInitiateTransferResponseDto(ACCOUNT_NO, "COMPLETED")
            });

            jest.spyOn(zicbClient, "walletToWalletInternalFundsTransfer");
            const updateSendMoneyReqBody = updateSendMoneyMerchantPaymentDTO(10, true, ACCOUNT_NO);
            const res = await ccAggregate.updateSendMoney(updateSendMoneyReqBody, "ljzowczj");
            logger.info("Response ", res);

            // Assertion to check if the response has a current state of 'Completed'
            expect(res.data.currentState).toEqual("COMPLETED");
            
            
        });


        test("POST /merchant-payment: should return payee details and fees with correct info provided", async () => {
            zicbClient.verifyCustomerByAccountNumber = jest.fn().mockResolvedValue({
                "errorList": {},
                "operation_status": "SUCCESS",
                "preauthUUID": "2f0b5c58-c830-4630-8a3b-0b82b854656c",
                "request": {
                    "accountNos": "1019000001703",
                    "accountType": null,
                    "customerNos": null,
                    "getByAccType": false,
                    "getByCustNo": false
                },
                "request-reference": "2025182-ZICB-1739871967",
                "response": {
                    "accountList": [
                        {
                            "frozenStatus": "A",
                            "accDesc": "CHIMWESO FAITH MUKOKO",
                            "loanStatus": null,
                            "accTypeDesc": "CHIMWESO FAITH MUKOKO",
                            "accOpeningDate": null,
                            "loanMaturityDate": null,
                            "chequeBookFlag": "N",
                            "lastCreditActivity": null,
                            "loanRate": null,
                            "overdftUtilizedAmt": 0,
                            "accATMFacility": null,
                            "overdftAllowed": "N",
                            "loanLastPaidDate": null,
                            "maturityAmount": null,
                            "accPassBookFacility": null,
                            "currency": "ZMW",
                            "loanNextDueDate": null,
                            "creditAccountOnMaturity": null,
                            "loanAmountFinanced": null,
                            "loanAmountDisbursed": null,
                            "userLcRef": null,
                            "expiryDate": null,
                            "loanTotalAmountDue": null,
                            "overdftLmt": 0,
                            "loanEMI": 0,
                            "loanAmountDue": 453.8,
                            "loanAmount": 0,
                            "address2": "Salama Park 256",
                            "dealRef": "MOJAFIN",
                            "loanType": null,
                            "dealType": null,
                            "actualAmount": 453.8,
                            "loanTotalAmountPaid": 0,
                            "address4": "Lusaka",
                            "accStatus": "E",
                            "accountOpenDate": 1622213596572,
                            "address3": "Lusaka",
                            "overdftAvailableAmt": null,
                            "loanStartDate": "28-MAY-2021",
                            "coreBankingDate": "18-FEB-2025",
                            "accNo": "1019000001703",
                            "lastDebitActivity": null,
                            "customerName": null,
                            "curBal": 453.8,
                            "issueDate": null,
                            "loanTenure": 0,
                            "jointAccount": "S",
                            "accType": "MOJAFIN",
                            "closureDate": null,
                            "address1": "Brokoli Street",
                            "accName": null,
                            "branchCode": "101",
                            "prodCode": "MOJAFIN",
                            "totalAmountAvailable": 453.8,
                            "avlBal": 453.8,
                            "idCustomer": "9000622",
                            "loanAmountOverdue": null,
                            "unclearFunds": 0
                        }
                    ],
                    "tekHeader": {
                        "errList": {},
                        "hostrefno": null,
                        "msgList": {},
                        "status": "SUCCESS",
                        "tekesbrefno": "cfeaf630-dabd-e646-0a9d-e7ee3e527897",
                        "username": "TEKESBRETAIL",
                        "warnList": {}
                    }
                },
                "status": 200,
                "timestamp": 1739871967939
            });
            sdkClient.initiateTransfer = jest.fn().mockResolvedValue({
                ...sdkInitiateTransferResponseDto(ACCOUNT_NO, "WAITING_FOR_CONVERSION_ACCEPTANCE")
            });

            sdkClient.updateTransfer = jest.fn().mockResolvedValue({
                ...sdkInitiateTransferResponseDto(ACCOUNT_NO, "WAITING_FOR_QUOTE_ACCEPTANCE")
            });

            // Spying on Update Transfer
            jest.spyOn(sdkClient, "updateTransfer");

            const initiateTransferSpy = jest.spyOn(sdkClient, "initiateTransfer");
            const merchantPaymentRequestBody = sendMoneyReqDTO("5",ACCOUNT_NO);
            const res = await ccAggregate.sendMoney(merchantPaymentRequestBody, "RECEIVE");

            logger.info("Response from merchant payment", res);


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
            logger.info("Transfer Request  being sent to Initiate Transfer", transferRequest);
        });

        test("PUT /merchant-payment/{Id}: should initiate request to pay to customer wallet", async () => {

            zicbClient.walletToWalletInternalFundsTransfer = jest.fn().mockResolvedValue({
                "errorList": {
                    "AC-VAC05": "Account 1010035376132 Dormant",
                    "ST-SAVE-054": "Failed to Save",
                    "UP-PMT-90": "Insufficient account balance"
                },
                "operation_status": "FAIL",
                "preauthUUID": "80626448-d8e5-48fe-a40c-8446495e4be3",
                "request": {
                    "amount": "2000",
                    "destAcc": "1010035376132",
                    "destBranch": "001",
                    "payCurrency": "ZMW",
                    "payDate": "2024-07-03",
                    "referenceNo": "1720015165",
                    "remarks": "Being payment for zxy invoice numner 12345 refred 12345",
                    "srcAcc": "1019000002881",
                    "srcBranch": "101",
                    "srcCurrency": "ZMW",
                    "transferTyp": "INTERNAL"
                },
                "request-reference": "202437-ZICB-1720015166",
                "response": {
                    "amountCredit": null,
                    "amountDebit": null,
                    "destAcc": null,
                    "destBranch": null,
                    "exchangeRate": null,
                    "payCurrency": null,
                    "payDate": null,
                    "srcAcc": null,
                    "srcBranch": null,
                    "srcCurrency": null,
                    "tekHeader": {
                        "errList": {
                            "AC-VAC05": "Account 1010035376132 Dormant",
                            "ST-SAVE-054": "Failed to Save",
                            "UP-PMT-90": "Insufficient account balance"
                        },
                        "hostrefno": null,
                        "msgList": {},
                        "status": "FAIL",
                        "tekesbrefno": "d64fa5dd-2eb7-c284-c4d1-9fe7f183ab49",
                        "username": "TEKESBRETAIL",
                        "warnList": {}
                    }
                },
                "status": 200,
                "timestamp": 1720015166319
            });

            sdkClient.updateTransfer = jest.fn().mockResolvedValue({
                ...sdkInitiateTransferResponseDto(ACCOUNT_NO, "COMPLETED")
            });

            jest.spyOn(zicbClient, "walletToWalletInternalFundsTransfer");
            const updateMerchantPaymentReqBody = updateSendMoneyMerchantPaymentDTO(10, true, ACCOUNT_NO);
            const res = await ccAggregate.updateSendMoney(updateMerchantPaymentReqBody, "ljzowczj");
            logger.info("Response ", res);

             // Assertion to check if the response has a current state of 'Completed'
             expect(res.data.currentState).toEqual("COMPLETED");
        }
        );


      
    });
});
