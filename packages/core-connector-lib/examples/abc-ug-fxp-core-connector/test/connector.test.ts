import { IHTTPClient, AxiosClientFactory, ILogger, loggerFactory, IFXPClient, coreConnectorFactory } from "@elijahokello/core-connector-lib";
import { fxpConfig } from "../config";
import { TBlueBankConfig } from "../";
import { ConnectorError } from "../src/errors";
import { MockFXPClient } from "../src/FXPClient";


const httpClient: IHTTPClient = AxiosClientFactory.createAxiosClientInstance();
const logger: ILogger = loggerFactory({context: fxpConfig.server.CBS_NAME});
if(!fxpConfig.fxpConfig){
    throw ConnectorError.cbsConfigUndefined("FXP Config Not defined. Please fix the configuration in config.ts","0",0);
}
const fxpClient: IFXPClient<TBlueBankConfig> = new MockFXPClient<TBlueBankConfig>(httpClient,logger,fxpConfig.fxpConfig);
const coreConnector = coreConnectorFactory<never, TBlueBankConfig>({config: fxpConfig,fxpClient: fxpClient});


describe("Core Connector Tests", ()=>{
    beforeAll(async ()=>{
        await coreConnector.start();
    });

    afterAll(async ()=>{
        await coreConnector.stop();
    });

    test("Test fxQuote", async ()=> {
        const res = httpClient.get("http://0.0.0.0:4000/fxQuotes") ;
        expect(await res).rejects;
    });
});