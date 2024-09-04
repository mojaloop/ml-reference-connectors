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
exports.DFSPCoreConnectorRoutes = void 0;
const tslib_1 = require("tslib");
const openapi_backend_1 = tslib_1.__importDefault(require("openapi-backend"));
const BaseRoutes_1 = require("./BaseRoutes");
const API_SPEC_FILE = './src/api-spec/core-connector-api-spec-dfsp.yml';
class DFSPCoreConnectorRoutes extends BaseRoutes_1.BaseRoutes {
    aggregate;
    routes = [];
    logger;
    constructor(aggregate, logger) {
        super();
        this.aggregate = aggregate;
        this.logger = logger.child({ context: 'MCC Routes' });
    }
    async init() {
        const api = new openapi_backend_1.default({
            definition: API_SPEC_FILE,
            handlers: {
                transfers: this.initiateTransfer.bind(this),
                updateTransfer: this.updateInitiatedTransfer.bind(this),
                validationFail: async (context, req, h) => h.response({ error: context.validation.errors }).code(412),
                notFound: async (context, req, h) => h.response({ error: 'Not found' }).code(404),
            },
        });
        await api.init();
        this.routes.push({
            method: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
            path: '/{path*}',
            handler: (req, h) => api.handleRequest({
                method: req.method,
                path: req.path,
                body: req.payload,
                query: req.query,
                headers: req.headers,
            }, req, h),
        });
        this.routes.push({
            method: ['GET'],
            path: '/health',
            handler: async (req, h) => {
                const success = true; // todo: think about better healthCheck logic
                return h.response({ success }).code(success ? 200 : 503);
            },
        });
    }
    getRoutes() {
        return this.routes;
    }
    async initiateTransfer(context, request, h) {
        const transfer = request.payload;
        try {
            const result = await this.aggregate.sendTransfer(transfer);
            return this.handleResponse(result, h);
        }
        catch (error) {
            return this.handleError(error, h);
        }
    }
    async updateInitiatedTransfer(context, request, h) {
        const { params } = context.request;
        const transferAccept = request.payload;
        try {
            const updateTransferRes = await this.aggregate.updateSentTransfer({
                fineractTransaction: transferAccept.fineractTransaction,
                sdkTransferId: params.transferId,
            });
            return this.handleResponse(updateTransferRes, h);
        }
        catch (error) {
            return this.handleError(error, h);
        }
    }
}
exports.DFSPCoreConnectorRoutes = DFSPCoreConnectorRoutes;
//# sourceMappingURL=dfspCoreConnectorRoutes.js.map