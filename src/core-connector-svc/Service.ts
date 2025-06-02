/*****
 License
--------------
 Copyright © 2020-2024 Mojaloop Foundation
 The Mojaloop files are made available by the Mojaloop Foundation under the Apache License, Version 2.0 (the "License") and you may not use these files except in compliance with the License. You may obtain a copy of the License at
 http://www.apache.org/licenses/LICENSE-2.0
 Unless required by applicable law or agreed to in writing, the Mojaloop files are distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.

Contributors
--------------
This is the official list (alphabetical ordering) of the Mojaloop project contributors for this file.
Names of the original copyright holders (individuals or organizations)
should be listed with a '*' in the first column. People who have
contributed from an organization can be listed under the organization
that actually holds the copyright for their contributions (see the
Gates Foundation organization for an example). Those individuals should have
their names indented and be marked with a '-'. Email address can be added
optionally within square brackets <email>.


- Okello Ivan Elijah <elijahokello90@gmail.com>

--------------
******/

'use strict';

import { Server } from '@hapi/hapi';
import { ICbsClient, IDFSPCoreConnectorAggregate, IHTTPClient, ILogger, IService} from '../domain';
import { DFSPCoreConnectorAggregate } from '../domain';
import { AxiosClientFactory } from '../infra/axiosHttpClient';
import { SDKCoreConnectorRoutes } from './sdkCoreConnectorRoutes';
import { logger } from '../infra';
import { createPlugins } from '../plugins';
import { ISDKClient, SDKClientFactory } from '../domain/SDKClient';
import { DFSPCoreConnectorRoutes } from './dfspCoreConnectorRoutes';
import { IConnectorConfigSchema } from '../domain';
import { IFXPClient } from '../domain/FXPClient';
import { IFxpCoreConnectorAgg } from '../domain/FXPClient';
import { ServiceError } from './errors';
import { FXPCoreConnectorAggregate } from '../domain/fxpCoreConnectorAgg';
import { FXPCoreConnectorRoutes } from './fxpCoreConnectorRoutes';
import path from 'path';

export type TCoreConnectorServiceDeps<D,F> = {
    httpClient?: IHTTPClient,
    dfspServer?: Server ,
    fxpServer?: Server ,
    config: IConnectorConfigSchema<D,F>;
    coreConnectorAggregate?: IDFSPCoreConnectorAggregate<D> ,
    sdkServer?: Server,
    sdkClient?: ISDKClient,
    logger?: ILogger,
    cbsClient?: ICbsClient,
    fxpCoreConnectorAggregate?: IFxpCoreConnectorAgg<F> ;
    fxpClient?: IFXPClient<F> ;
    sdkApiSpec?: string;
    dfspApiSpec?: string;
}

export const coreConnectorServiceFactory = <D,F>(deps: TCoreConnectorServiceDeps<D,F>) => {
    return new CoreConnectorService(deps);
};

export class CoreConnectorService<D,F> implements IService<D,F> {
    httpClient: IHTTPClient | undefined;
    dfspServer: Server | undefined;
    config: IConnectorConfigSchema<D,F>;
    dfspCoreConnectorAggregate: IDFSPCoreConnectorAggregate<D> | undefined;
    sdkServer: Server | undefined;
    fxpServer: Server | undefined;
    logger: ILogger | undefined;
    cbsClient: ICbsClient | undefined;
    fxpCoreConnectorAggregate: IFxpCoreConnectorAgg<F> | undefined;
    fxpClient: IFXPClient<F> | undefined;
    sdkClient: ISDKClient | undefined;
    sdkApiSpec: string | undefined;
    dfspApiSpec: string | undefined;

    constructor(deps: TCoreConnectorServiceDeps<D,F>) {
        this.httpClient = deps.httpClient;
        this.dfspServer = deps.dfspServer;
        this.config = deps.config;
        this.dfspCoreConnectorAggregate = deps.coreConnectorAggregate;
        this.fxpCoreConnectorAggregate = deps.fxpCoreConnectorAggregate;
        this.sdkServer = deps.sdkServer;
        this.logger = deps.logger;
        this.cbsClient = deps.cbsClient;
        this.fxpClient = deps.fxpClient;
        this.fxpServer = deps.fxpServer;
        this.sdkClient = deps.sdkClient;
        this.sdkApiSpec = deps.sdkApiSpec;
        this.dfspApiSpec = deps.dfspApiSpec;
    }

    async start() {
        if (!this.httpClient) {
            this.httpClient = AxiosClientFactory.createAxiosClientInstance();
        }
        if(!this.logger){
            this.logger = logger.child({component: this.config.server.CBS_NAME});
        }
        this.sdkApiSpec = this.sdkApiSpec || path.resolve(__dirname, "../api-spec", "core-connector-api-spec-sdk.yml");
        this.dfspApiSpec = this.dfspApiSpec || path.resolve(__dirname, "../api-spec", "core-connector-api-spec-dfsp.yml");
        
        if(this.checkAndValidateMode() === "dfsp"){
            if(!this.cbsClient){
                throw ServiceError.invalidConfigurationError("CBS Client is undefined in DFSP Mode","0",0);
            }
            await this.startInDFSPMode(this.logger,this.httpClient, this.cbsClient);
        }else{
            if(!this.fxpClient){
                throw ServiceError.invalidConfigurationError("FXP Client is undefined in FXP Mode","0",0);
            }
            await this.startInFXPMode(this.fxpClient,this.logger);
        }
        this.logger.info('Core Connector Server started');
    }

    async startInFXPMode(fxpClient: IFXPClient<F>, logger: ILogger){
        if(!this.fxpCoreConnectorAggregate && this.config.fxpConfig !== undefined){
            this.fxpCoreConnectorAggregate = new FXPCoreConnectorAggregate(fxpClient,logger,this.config.fxpConfig);
        }

        await this.setupAndStartUpServer(logger,undefined,this.fxpCoreConnectorAggregate);
    }

    async startInDFSPMode(logger: ILogger,httpClient: IHTTPClient, cbsClient: ICbsClient, sdkClient?: ISDKClient){
        if(!sdkClient){
            sdkClient = SDKClientFactory.getSDKClientInstance(
                logger,
                httpClient,
                this.config.sdkSchemeAdapter.SDK_BASE_URL,
            );
            this.sdkClient = sdkClient;
        }

        if(!this.dfspCoreConnectorAggregate && this.config.cbs !== undefined){
            this.dfspCoreConnectorAggregate = new DFSPCoreConnectorAggregate(sdkClient, cbsClient, this.config.cbs, logger);
        }

        await this.setupAndStartUpServer(logger,this.dfspCoreConnectorAggregate, undefined);
    }

    async setupAndStartUpServer(logger: ILogger, dfspAggregate: IDFSPCoreConnectorAggregate<D> | undefined, fxpAggregate: IFxpCoreConnectorAgg<F> | undefined ) {
        if(dfspAggregate !== undefined && this.sdkApiSpec && this.dfspApiSpec){
            this.sdkServer = new Server({
                host: this.config.server.SDK_SERVER_HOST,
                port: this.config.server.SDK_SERVER_PORT,
            });
    
            this.dfspServer = new Server({
                host: this.config.server.DFSP_SERVER_HOST,
                port: this.config.server.DFSP_SERVER_PORT,
            });
            await this.sdkServer.register(createPlugins({logger}));
    
            await this.dfspServer.register(createPlugins({ logger }));
            const sdkCoreConnectorRoutes = new SDKCoreConnectorRoutes<D>(dfspAggregate, logger,this.sdkApiSpec);
            await sdkCoreConnectorRoutes.initialise();
            

            const dfspCoreConnectorRoutes = new DFSPCoreConnectorRoutes<D>(dfspAggregate, logger,this.dfspApiSpec);
            await dfspCoreConnectorRoutes.initialise();
    
            this.sdkServer.route(sdkCoreConnectorRoutes.getRoutes());
            this.dfspServer.route(dfspCoreConnectorRoutes.getRoutes());
    
            await this.sdkServer.start();
            logger.info(`SDK Core Connector Server running at ${this.sdkServer.info.uri}`);
            await this.dfspServer.start();
            logger.info(`DFSP Core Connector Server running at ${this.dfspServer.info.uri}`);

        }else if(fxpAggregate !== undefined && this.sdkApiSpec){
            this.fxpServer = new Server({
                host: this.config.server.SDK_SERVER_HOST,
                port: this.config.server.SDK_SERVER_PORT
            });
            await this.fxpServer.register(createPlugins({logger}));
            const fxpCoreConnectorRoutes = new FXPCoreConnectorRoutes(fxpAggregate,logger,this.sdkApiSpec);
            await fxpCoreConnectorRoutes.initialise();

            this.fxpServer.route(fxpCoreConnectorRoutes.getRoutes());

            await this.fxpServer.start();
            logger.info(`FXP Core Connector Server running at ${this.fxpServer.info.uri}`);
        }else{
            throw ServiceError.invalidConfigurationError("Invalid Configuration. Check Mode. Library may not have API specifications","0",0);
        }
    }

    checkAndValidateMode(): 'fxp' | 'dfsp' {
        if(this.config.server.MODE === "fxp" && this.config.fxpConfig !== undefined){
            return 'fxp';
        }else if(this.config.server.MODE === 'dfsp' && this.config.cbs !== undefined){
            return 'dfsp';
        }
        throw ServiceError.invalidConfigurationError("Failed to determine connector mode. FXP or DFSP","0",0);
    }

    async stop() {
        if (this.sdkServer && this.dfspServer) {
            await this.sdkServer.stop({ timeout: 60 });
            await this.dfspServer.stop({ timeout: 60 });
        }
        if(this.logger){
            this.logger.info('Service Stopped');
        }
    }
}
