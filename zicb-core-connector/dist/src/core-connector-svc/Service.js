/*****
 License
--------------
Copyright © 2017 Bill & Melinda Gates Foundation
The Mojaloop files are made available by the Bill & Melinda Gates Foundation under the Apache License, Version 2.0 (the "License") and you may not use these files except in compliance with the License. You may obtain a copy of the License at

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
Object.defineProperty(exports, "__esModule", { value: true });
exports.Service = exports.logger = void 0;
const tslib_1 = require("tslib");
const hapi_1 = require("@hapi/hapi");
const domain_1 = require("../domain");
const axiosHttpClient_1 = require("../infra/axiosHttpClient");
const config_1 = tslib_1.__importDefault(require("../config"));
const SDKcoreConnectorRoutes_1 = require("./SDKcoreConnectorRoutes");
const logger_1 = require("../infra/logger");
const plugins_1 = require("../plugins");
const CBSClient_1 = require("../domain/CBSClient");
const SDKClient_1 = require("../domain/SDKClient");
const dfspCoreConnectorRoutes_1 = require("./dfspCoreConnectorRoutes");
const ZicbClientFactory_1 = require("../domain/CBSClient/ZicbClientFactory");
// logger 
exports.logger = (0, logger_1.loggerFactory)({ context: 'ZicbCC' });
class Service {
    static coreConnectorAggregate;
    static httpClient;
    static sdkServer;
    static dfspServer;
    static async start(httpClient = axiosHttpClient_1.AxiosClientFactory.createAxiosClientInstance()) {
        this.httpClient = httpClient;
        const fineractConfig = config_1.default.get('fineract');
        const fineractClient = CBSClient_1.FineractClientFactory.createClient({
            fineractConfig: fineractConfig,
            httpClient: this.httpClient,
            logger: exports.logger,
        });
        const zicbConfig = config_1.default.get('zicb');
        const zicbClient = ZicbClientFactory_1.ZicbClientFactory.createClient({
            zicbConfig: zicbConfig,
            httpClient: this.httpClient,
            logger: exports.logger,
        });
        const sdkClient = SDKClient_1.SDKClientFactory.getSDKClientInstance(exports.logger, httpClient, config_1.default.get('sdkSchemeAdapter.SDK_BASE_URL'));
        this.coreConnectorAggregate = new domain_1.CoreConnectorAggregate(fineractConfig, fineractClient, sdkClient, exports.logger, zicbConfig, zicbClient);
        await this.setupAndStartUpServer();
        exports.logger.info('Core Connector Server started');
    }
    static async setupAndStartUpServer() {
        this.sdkServer = new hapi_1.Server({
            host: config_1.default.get('server.SDK_SERVER_HOST'),
            port: config_1.default.get('server.SDK_SERVER_PORT'),
        });
        this.dfspServer = new hapi_1.Server({
            host: config_1.default.get('server.DFSP_SERVER_HOST'),
            port: config_1.default.get('server.DFSP_SERVER_PORT'),
        });
        await this.sdkServer.register((0, plugins_1.createPlugins)({ logger: exports.logger }));
        await this.dfspServer.register((0, plugins_1.createPlugins)({ logger: exports.logger }));
        const coreConnectorRoutes = new SDKcoreConnectorRoutes_1.CoreConnectorRoutes(this.coreConnectorAggregate, exports.logger);
        await coreConnectorRoutes.init();
        const dfspCoreConnectorRoutes = new dfspCoreConnectorRoutes_1.DFSPCoreConnectorRoutes(this.coreConnectorAggregate, exports.logger);
        await dfspCoreConnectorRoutes.init();
        this.sdkServer.route(coreConnectorRoutes.getRoutes());
        this.dfspServer.route(dfspCoreConnectorRoutes.getRoutes());
        await this.sdkServer.start();
        exports.logger.info(`SDK Core Connector Server running at ${this.sdkServer.info.uri}`);
        await this.dfspServer.start();
        exports.logger.info(`DFSP Core Connector Server running at ${this.dfspServer.info.uri}`);
    }
    static async stop() {
        await this.sdkServer.stop({ timeout: 60 });
        await this.dfspServer.stop({ timeout: 60 });
        exports.logger.info('Service Stopped');
    }
}
exports.Service = Service;
//# sourceMappingURL=Service.js.map