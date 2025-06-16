'use strict';

import { IHTTPClient, AxiosClientFactory, IFXPClient, logger, coreConnectorServiceFactory } from "@mojaloop/core-connector-lib";
import { fxpConfig } from "./config";
import { ConnectorError } from "./src/errors";
import { MockFXPClient } from "./src/FXPClient";

export type TBlueBankConfig = {
    BLUE_BANK_URL : string;
    BLUE_BANK_CLIENT_ID: string;
    BLUE_BANK_CLIENT_SECRET: string;
}

const httpClient: IHTTPClient = AxiosClientFactory.createAxiosClientInstance();

if(!fxpConfig.fxpConfig){
    throw ConnectorError.cbsConfigUndefined("FXP Config Not defined. Please fix the configuration in config.ts","0",0);
}

const fxpClient: IFXPClient<TBlueBankConfig> = new MockFXPClient<TBlueBankConfig>(httpClient,logger,fxpConfig.fxpConfig);
const coreConnector = coreConnectorServiceFactory({fxpClient: fxpClient, config: fxpConfig});

coreConnector.start()