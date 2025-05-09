'use strict';

import { IHTTPClient, ILogger, coreConnectorFactory, AxiosClientFactory, loggerFactory, TCBSConfig, IConnectorConfigSchema, IFXPClient } from "@elijahokello/core-connector-lib";
import config, { fxpConfig } from "./config";
import { ConnectorError } from "./src/errors";
import { MockFXPClient } from "./src/FXPClient";

export type TBlueBankConfig = {
    BLUE_BANK_URL : string;
    BLUE_BANK_CLIENT_ID: string;
    BLUE_BANK_CLIENT_SECRET: string;
}

const httpClient: IHTTPClient = AxiosClientFactory.createAxiosClientInstance();
const logger: ILogger = loggerFactory({context: config.get("server.CBS_NAME")});

if(!fxpConfig.fxpConfig){
    throw ConnectorError.cbsConfigUndefined("FXP Config Not defined. Please fix the configuration in config.ts","0",0);
}

const fxpClient: IFXPClient<TBlueBankConfig> = new MockFXPClient<TBlueBankConfig>(httpClient,logger,fxpConfig.fxpConfig);
const coreConnector = coreConnectorFactory<never, TBlueBankConfig>({config: fxpConfig,fxpClient: fxpClient});

coreConnector.start()