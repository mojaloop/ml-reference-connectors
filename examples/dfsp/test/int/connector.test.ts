import { IHTTPClient, AxiosClientFactory, ICbsClient, logger, coreConnectorServiceFactory, Party } from "@mojaloop/core-connector-lib";
import { dfspConfig } from "../../config";
import { MockCBSClient } from "../../src/CBSClient";
import { ConnectorError } from "../../src/errors";

export type TBlueBankConfig = {
    BLUE_BANK_URL: string;
    BLUE_BANK_CLIENT_ID: string;
    BLUE_BANK_CLIENT_SECRET: string;
}

const httpClient: IHTTPClient = AxiosClientFactory.createAxiosClientInstance();


if (!dfspConfig.cbs) {
    throw ConnectorError.cbsConfigUndefined("CBS Config Not defined. Please fix the configuration in config.ts", "0", 0);
}

const cbsClient: ICbsClient = new MockCBSClient<TBlueBankConfig>(dfspConfig.cbs, httpClient, logger);
const coreConnector = coreConnectorServiceFactory({ cbsClient: cbsClient, config: dfspConfig });

const SDK_URL = 'http://localhost:3003';
const IDVALUE = 'http://localhost:3004';

describe("Core Connector Tests", () => {
    beforeAll(async () => {
        await coreConnector.start();
    });

    afterAll(async () => {
        await coreConnector.stop();
    });

    describe("Incoming Payments", () => {
        test("Get Parties", async () => {
            logger.error("Write Get Parties Test");
        });

        test("Quote Requests", async () => {
            logger.error("Write Quote Requests Test");
        });

        test("Transfers Reserve", async () => {
            logger.error("Write Transfers Reserve Test");
        });

        test("Transfers Commit", async () => {
            logger.error("Write Transfers Commit Test");
        });

    });
});