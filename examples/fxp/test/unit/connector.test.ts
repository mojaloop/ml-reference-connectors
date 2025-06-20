import { IHTTPClient, AxiosClientFactory, IFXPClient, logger, coreConnectorServiceFactory } from "@mojaloop/core-connector-lib";
import { fxpConfig } from "../../src/config";
import { TBlueBankConfig } from "../../src";
import { ConnectorError } from "../../src/errors";
import { MockFXPClient } from "../../src/FXPClient";


const httpClient: IHTTPClient = AxiosClientFactory.createAxiosClientInstance();
if (!fxpConfig.fxpConfig) {
    throw ConnectorError.cbsConfigUndefined("FXP Config Not defined. Please fix the configuration in config.ts", "0", 0);
}
const fxpClient: IFXPClient = new MockFXPClient<TBlueBankConfig>(httpClient, logger, fxpConfig.fxpConfig);
const coreConnector = coreConnectorServiceFactory({ fxpClient: fxpClient, config: fxpConfig });


describe("Core Connector Tests", () => {
    beforeAll(async () => {
        await coreConnector.start();
    });

    afterAll(async () => {
        await coreConnector.stop();
    });

    test("getFxQuote Test", async () => {
        logger.error("Write fxQuote test");
    });

    test("confirm fxTransfers Test", async () => {
        logger.error("Write fxTransfers test");
    });

    test("notify fxTransfers Test", async () => {
        logger.error("Write PUT fxTransfers test");
    });
});