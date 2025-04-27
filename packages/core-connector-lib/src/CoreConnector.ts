import { IConnectorConfigSchema } from "./config";
import { serviceFactory, TServiceDeps } from "./core-connector-svc";
import { ServiceError } from "./core-connector-svc/errors";
import { ICbsClient, ICoreConnector, ISDKClient, IService } from "./domain";
import { IFXPClient } from "./domain/FXPClient";
import { loggerFactory } from "./infra";

export type TConnectorDeps<D,F> = {
    config: IConnectorConfigSchema<D,F>;
    cbsClient?: ICbsClient<D>;
    fxpClient?: IFXPClient<F>;
    sdkClient?: ISDKClient;
}

export const coreConnectorFactory = <D,F>(deps: TConnectorDeps<D,F>): CoreConnector<D,F> => {
    return new CoreConnector<D,F>(deps);
};

export const logger = loggerFactory({ context: "CC" });

export class CoreConnector<D,F> implements ICoreConnector<D,F> {
    service: IService<D,F> | undefined;

    constructor(
        deps: TConnectorDeps<D,F>
    ) {
        this.service = serviceFactory(this.getServiceDeps(deps.config,deps.cbsClient,deps.fxpClient,deps.sdkClient));
    }

    getServiceDeps(
        config: IConnectorConfigSchema<D,F>, 
        cbsClient: ICbsClient<D> | undefined, 
        fxpClient: IFXPClient<F> | undefined,
        sdkClient: ISDKClient | undefined
    ): TServiceDeps<D,F>{
        if(config.server.MODE === "dfsp" && cbsClient !== undefined){
            return {
                config: config,
                cbsClient: cbsClient,
                sdkClient: sdkClient
            };
        }else if(config.server.MODE === "fxp" && fxpClient !== undefined){
            return {
                config: config,
                fxpClient: fxpClient,
                sdkClient: sdkClient
            };
        }else{
            throw ServiceError.invalidConfigurationError("Invalid mode or clients undefined","0",0);
        }
    }

    async stop(): Promise<void> {
        if (this.service) {
            await this.service.stop();
        }
    }
    async start(): Promise<void> {
        if (this.service) {
            await this.service.start();
        }
    }

}