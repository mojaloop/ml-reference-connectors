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

 * Elijah Okello <elijahokello90@gmail.com>
 --------------
 **********/

'use strict';

import { randomUUID } from "crypto";
import { coreConnectorServiceFactory, ICbsClient, IHTTPClient} from "../../src";
import { AxiosClientFactory, logger } from "../../src/infra";
import { confirmSendMoneyDTO, dfspConfig, quoteRequestDTO, reserveTransferDTO, sdkInitiateTransferResponseDto, sendMoneyReqDTO, transferNotificationDTO } from "../fixtures";
import { MockCBSClient } from "../mocks";

export type TBlueBankConfig = {
    BLUE_BANK_URL : string;
    BLUE_BANK_CLIENT_ID: string;
    BLUE_BANK_CLIENT_SECRET: string;
}

const httpClient: IHTTPClient = AxiosClientFactory.createAxiosClientInstance();

if(!dfspConfig.cbs){
    throw new Error("CBS Config must be defined");
}

const cbsClient: ICbsClient = new MockCBSClient<TBlueBankConfig>(dfspConfig.cbs,httpClient,logger);
const coreConnector = coreConnectorServiceFactory({
    cbsClient: cbsClient,
    config: dfspConfig
});

const MSISDN = "883999934";
const IDTYPE = "MSISDN";

describe("DFSP Core Connector Tests", () => {
    beforeAll(async ()=>{
        // Start the Core Connector in DFSP Mode
        await coreConnector.start();
    });

    afterAll(async ()=> {
        await coreConnector.stop();
    });

    describe("Incoming Payments Tests",()=>{
        test("Test Get Parties",async ()=>{
            // Act 
            const res = await coreConnector.dfspCoreConnectorAggregate?.getParties(MSISDN,IDTYPE);
            // Assert
            expect(res?.extensionList).toBeDefined();
            expect(res?.firstName).toEqual("John");
        });
    
        test("Test Quote Requests", async ()=> {
            // Arrange 
            const quoteRequest = quoteRequestDTO(MSISDN);
            // Act
            const res = await coreConnector.dfspCoreConnectorAggregate?.quoteRequest(quoteRequest);
            // Assert
            expect(res?.extensionList).toBeDefined();
            expect(res?.payeeFspFeeAmount).toEqual("2.50");
        });
    
        test("Test Transfers Reserve", async ()=>{
            // Arrange 
            const reserveTransfer = reserveTransferDTO("103");
            // Act
            const res = await coreConnector.dfspCoreConnectorAggregate?.receiveAndReserveTransfer(reserveTransfer);
            //Assert
            expect(res?.transferState).toEqual("RESERVED");
        });
    
        test("Test Transfers Commit", async ()=>{
            // Arrange
            const transferNotification = transferNotificationDTO();
            // Act
            const res = coreConnector.dfspCoreConnectorAggregate?.updateAndCommitTransferOnPatchNotification(transferNotification,randomUUID());
            // Assert
            expect(await res).resolves;
        });
    });

    describe("Outgoing Payments Tests", ()=>{
        test("Test Send Money P2P", async ()=>{
            if(!coreConnector.sdkClient){
                throw Error("SDK Client undefined in core connector");
            }
            // Arrange 
            const sendMoneyReq = sendMoneyReqDTO();
            coreConnector.sdkClient.initiateTransfer = jest.fn().mockResolvedValueOnce({
                ...sdkInitiateTransferResponseDto(MSISDN, "WAITING_FOR_CONVERSION_ACCEPTANCE")
            });

            coreConnector.sdkClient.updateTransfer =jest.fn().mockResolvedValueOnce({
                ...sdkInitiateTransferResponseDto(MSISDN, "WAITING_FOR_QUOTE_ACCEPTANCE")
            });
            const sdkSpyInitiate = jest.spyOn(coreConnector.sdkClient,"initiateTransfer");
            const sdkSpyUpdate = jest.spyOn(coreConnector.sdkClient,"updateTransfer");
            // Act 
            const res = await coreConnector.dfspCoreConnectorAggregate?.sendMoney(sendMoneyReq,"SEND");
            // Assert
            expect(res).toBeTruthy();
            expect(res?.receiveAmount).toBeDefined();
            expect(sdkSpyInitiate).toHaveBeenCalled();
            expect(sdkSpyUpdate).toHaveBeenCalled();
        }); 

        test("Test Merchant Payment", async ()=>{
            if(!coreConnector.sdkClient){
                throw Error("SDK Client undefined in core connector");
            }
            // Arrange 
            const sendMoneyReq = sendMoneyReqDTO();
            coreConnector.sdkClient.initiateTransfer = jest.fn().mockResolvedValueOnce({
                ...sdkInitiateTransferResponseDto(MSISDN, "WAITING_FOR_QUOTE_ACCEPTANCE")
            });

            coreConnector.sdkClient.updateTransfer =jest.fn().mockResolvedValueOnce({
                ...sdkInitiateTransferResponseDto(MSISDN, "WAITING_FOR_CONVERSION_ACCEPTANCE")
            });
            const sdkSpyInitiate = jest.spyOn(coreConnector.sdkClient,"initiateTransfer");
            const sdkSpyUpdate = jest.spyOn(coreConnector.sdkClient,"updateTransfer");
            // Act 
            const res = await coreConnector.dfspCoreConnectorAggregate?.sendMoney(sendMoneyReq,"RECEIVE");
            // Assert
            expect(res).toBeTruthy();
            expect(res?.receiveAmount).toBeDefined();
            expect(sdkSpyInitiate).toHaveBeenCalled();
            expect(sdkSpyUpdate).toHaveBeenCalled();
        });

        test("Test Confirm Send Money", async ()=>{
            if(!coreConnector.sdkClient){
                throw Error("SDK Client undefined in core connector");
            }
            // Arrange
            const confirmSendMoneyReq = confirmSendMoneyDTO();
            coreConnector.sdkClient.updateTransfer = jest.fn().mockResolvedValueOnce({
                ...sdkInitiateTransferResponseDto(MSISDN, "COMPLETED")
            });
            const sdkSpyUpdate = jest.spyOn(coreConnector.sdkClient,"updateTransfer");
            // Act
            const res = await coreConnector.dfspCoreConnectorAggregate?.updateSendMoney(confirmSendMoneyReq,randomUUID());
            //Assert
            expect(res?.transferId).toBeDefined();
            expect(sdkSpyUpdate).toHaveBeenCalled();
        });
    });
    
});

