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

import { IFXPClient } from "../../src/domain/FXPClient";
import { IHTTPClient, coreConnectorServiceFactory } from "../../src";
import { AxiosClientFactory, logger } from "../../src/infra";
import { fxpConfig, fxQuotesReqDTO, fxTransferDTO, fxTransferNotificationDTO } from "../fixtures";
import { MockFXPClient } from "../mocks";


export type TBlueBankFXPConfig = {
    BLUE_BANK_URL: string;
    BLUE_BANK_CLIENT_ID: string;
    BLUE_BANK_CLIENT_SECRET: string;
}
const httpClient: IHTTPClient = AxiosClientFactory.createAxiosClientInstance();

if (!fxpConfig.fxpConfig) {
    throw new Error("FXP Config must be defined");
}

const fxpClient: IFXPClient<TBlueBankFXPConfig> = new MockFXPClient<TBlueBankFXPConfig>(httpClient, logger, fxpConfig.fxpConfig);

const coreconnector = coreConnectorServiceFactory({
    fxpClient: fxpClient,
    config: fxpConfig
});

describe("FXP Core Connector Tests", () => {
    beforeAll(async () => {
        await coreconnector.start();
    });

    afterAll(async () => {
        await coreconnector.stop();
    });

    test("Test Get fxQuotes", async () => {
        // Arrange 
        const fxQuotes = fxQuotesReqDTO();
        // Act
        const res = await coreconnector.fxpCoreConnectorAggregate?.getFxQuote(fxQuotes);
        // Assert
        expect(res?.conversionTerms).toBeDefined();
    });

    test("Test fxTransfer confirm terms", async () => {
        // Arrange
        const fxTransfer = fxTransferDTO();
        //Act 
        const res = await coreconnector.fxpCoreConnectorAggregate?.confirmFxTransfer(fxTransfer);
        //Assert
        expect(res?.conversionState).toEqual("RESERVED");
    });

    test("Test Notify fxTransfer State", async () => {
        // Arrange 
        const fxTransferNotification = fxTransferNotificationDTO();
        // Act
        const res = coreconnector.fxpCoreConnectorAggregate?.notifyFxTransferState(fxTransferNotification);
        // Assert
        expect(await res).resolves;
    });
});