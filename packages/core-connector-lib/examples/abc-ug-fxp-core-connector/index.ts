'use strict';

import { IHTTPClient, ILogger, ICbsClient, coreConnectorFactory, AxiosClientFactory, loggerFactory, TCBSConfig, IConnectorConfigSchema } from "@mojaloop/core-connector-lib";
import config from "./config";
import { MockCBSClient } from "./src/CBSClient";
import { ConnectorError } from "./src/errors";

export type TBlueBankConfig = {
    BLUE_BANK_URL : string;
    BLUE_BANK_CLIENT_ID: string;
    BLUE_BANK_CLIENT_SECRET: string;
}

const httpClient: IHTTPClient = AxiosClientFactory.createAxiosClientInstance();
const logger: ILogger = loggerFactory({context: config.get("server.CBS_NAME")});

const cbsConfig : TCBSConfig<TBlueBankConfig> | undefined = config.get("cbs");

if(!cbsConfig){
    throw ConnectorError.cbsConfigUndefined("CBS Config Not defined. Please fix the configuration in config.ts","0",0);
}

const getDFSPConfig = ():IConnectorConfigSchema<TBlueBankConfig,never> =>{
    return{
        server: config.get("server"),
        sdkSchemeAdapter:config.get("sdkSchemeAdapter"),
        cbs: config.get("cbs")
    }
}

const cbsClient: ICbsClient<TBlueBankConfig> = new MockCBSClient<TBlueBankConfig>(cbsConfig,httpClient,logger);
const coreConnector = coreConnectorFactory<TBlueBankConfig, never>({config: getDFSPConfig(),cbsClient: cbsClient});

await coreConnector.start()