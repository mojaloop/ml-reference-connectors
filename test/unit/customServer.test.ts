import { Server } from '@hapi/hapi';
import { createPlugins } from '../../src/plugins';
import { AxiosClientFactory, logger } from '../../src/infra';
import {
    CoreConnectorService,
    coreConnectorServiceFactory,
    DFSPCoreConnectorAggregate,
    DFSPCoreConnectorRoutes,
    ICbsClient,
    SDKClientFactory,
} from '../../src';
import { dfspConfig } from '../fixtures';
import { MockCBSClient } from '../mocks';
import { TBlueBankConfig } from './dfspCoreConnectorAgg.test';

if (!dfspConfig.cbs) {
    throw new Error('CBS Config must be defined');
}

const httpClient = AxiosClientFactory.createAxiosClientInstance();
const sdkClient = SDKClientFactory.getSDKClientInstance(logger, httpClient, 'http://localhost:4001');
const cbsClient: ICbsClient = new MockCBSClient<TBlueBankConfig>(dfspConfig.cbs, httpClient, logger);
const dfspAggregate = new DFSPCoreConnectorAggregate(sdkClient, cbsClient, dfspConfig.cbs, logger);

async function getServer(): Promise<Server> {
    const dfspServer = new Server({
        host: '0.0.0.0',
        port: 3006,
    });

    await dfspServer.register(createPlugins({ logger }));
    const dfspCoreConnectorRoutes = new DFSPCoreConnectorRoutes(
        dfspAggregate,
        logger,
        './src/api-spec/core-connector-api-spec-dfsp.yml',
    );
    await dfspCoreConnectorRoutes.initialise();
    dfspServer.route(dfspCoreConnectorRoutes.getRoutes());
    return dfspServer;
}
let coreConnector: CoreConnectorService<TBlueBankConfig, never> | undefined = undefined;

describe('Test passing in a custom server', () => {
    beforeAll(async () => {
        coreConnector = coreConnectorServiceFactory({
            cbsClient: cbsClient,
            config: dfspConfig,
            dfspServer: await getServer(),
        });
    });

    afterAll(async () => {
        await coreConnector?.stop();
    });
    test('Start a custom dfsp server', async () => {
        await coreConnector?.start();
    });
});
