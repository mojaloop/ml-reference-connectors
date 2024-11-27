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
import { NBMClientFactory, INBMClient } from '../../../src/domain/CBSClient';
import { nbmUpdateSendMoneyRequestDto, sdkInitiateTransferResponseDto, sdkUpdateTransferResponseDto, sendMoneyDTO, transferPatchNotificationRequestDto, updateSendMoneyDTO } from '../../fixtures';


const mockAxios = new MockAdapter(axios);
const logger = loggerFactory({ context: 'ccAgg tests' });
const NBMConfig = config.get("nbm");
const SDK_URL = 'http://localhost:4040';

const idType = "ACCOUNT_ID";
const ACCOUNT_ID = "1003486415";

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
    });

    describe("Payee Tests", () => {
        test("test", async () => {
            logger.info("Write payee tests");
        });
    });

    describe("NBM Payer Tests", () => {
        // test("POST /send-money: should return payee details and fees with correct info provided", async () => {

        //     //TODO: Implement NBM Mock function before send money and update send money. First we call KYC

        //     nbmClient.getKyc = jest.fn().mockResolvedValue({
        //         "message": "Completed successfully",
        //         "errors": [],
        //         "trace": [],
        //         "data": {
        //             "full_name": "John Doe"
        //         }

        //     });

        //     const sendMoneyResponse = nbmClient.mockCollectMoney(ACCOUNT_ID, ACCOUNT_ID, 100000)
        //     logger.info(`Send Money Response ${(await sendMoneyResponse).message}`)


        //     // sdkClient.initiateTransfer = jest.fn().mockResolvedValue({
        //     //     ...sdkInitiateTransferResponseDto(ACCOUNT_ID, "WAITING_FOR_CONVERSION_ACCEPTANCE")
        //     // });

        //     // sdkClient.updateTransfer = jest.fn().mockResolvedValue({
        //     //     ...sdkUpdateTransferResponseDto(ACCOUNT_ID, "1000")
        //     // });
        //     // jest.spyOn(sdkClient, "updateTransfer");
        //     logger.info("Update Send Money tests request");
        //     const updateMoneyRequestBody = updateSendMoneyDTO((await sendMoneyResponse).amount, true, ACCOUNT_ID);
        //     logger.info(`Update Send Money request body ${updateMoneyRequestBody}`)
        //     const res = await ccAggregate.updateSendMoney(updateMoneyRequestBody, (await sendMoneyResponse).transactionId);
           
        //     // logger.info("Response fromm send money", res);
        //     // expect(sdkClient.updateTransfer).toHaveBeenCalled();

        // });

        test("PUT /send-money/{Id}: should initiate request to pay to customer wallet", async () => {
            nbmClient.getToken = jest.fn().mockResolvedValue({
                "message": "Completed successfully",
                "status": 201,
                "errors": [],
                "trace": [],
                "data": {
                    "token": "3|i6cvlcmyDKMzpczXol6QTbwMWzIgZI25AfwdOfCG",
                    "expires_at": "2023-07-13 10:56:45"
                }
            });

            const sendMoneyResponse = nbmClient.mockCollectMoney(ACCOUNT_ID, ACCOUNT_ID, 100000)
            logger.info(`Send Money Response ${(await sendMoneyResponse).message}`)
           
            jest.spyOn(nbmClient, "mockCollectMoney");
            const updateSendMoneyReqBody = nbmUpdateSendMoneyRequestDto(ACCOUNT_ID, "1000", "test");
            logger.info(`Update Send Money request body ${updateSendMoneyReqBody}`)
            // expect(nbmClient.mockCollectMoney).toHaveBeenCalled();
        });
    });

    describe("NBM Payee Test", () => {
        test("Get Parties Happy Path", async () => {
            nbmClient.getKyc = jest.fn().mockResolvedValue({
                "message": "Completed successfully",
                "errors": [],
                "trace": [],
                "data": {
                    "full_name": "Promise Mphoola"
                }

            });

            nbmClient.getToken = jest.fn().mockResolvedValue({
                "message": "Completed successfully",
                "errors": [],
                "trace": [],
                "data": {
                    "token": "3|i6cvlcmyDKMzpczXol6QTbwMWzIgZI25AfwdOfCG",
                    "expires_at": "2023-07-13 10:56:45"
                }
            });

            const kyc_res = await ccAggregate.getParties(ACCOUNT_ID, idType);
            logger.info("Returned Data ==>", kyc_res);

            logger.info(JSON.stringify(kyc_res));
            expect(kyc_res.statusCode).toEqual(200);
        });


        test('PUT /transfers/{id} notification: sdk server - Should return 200  ', async () => {
            nbmClient.mockCollectMoney = jest.fn().mockResolvedValue({
                "message": "Completed successfully",
                "errors": [],
                "trace": [],
                "data": {
                    "transaction_id": "ljzowczj",
                    "receipt_number": "AGC00B5MCA"
                }
            });

            jest.spyOn(nbmClient, "sendMoney");

            const patchNotificationRequest: TtransferPatchNotificationRequest = transferPatchNotificationRequestDto("COMPLETED", idType, ACCOUNT_ID, "500");
            const res = await ccAggregate.updateTransfer(patchNotificationRequest, "ljzowczj");

            logger.info(JSON.stringify(res));
            expect(res).toBeUndefined();
            expect(nbmClient.sendMoney).toHaveBeenCalled();
        });
    });
});
