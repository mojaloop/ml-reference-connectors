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

 * Niza Tembo <mcwayzj@gmail.com>
 * Elijah Okello <elijahokello90@gmail.com>

 --------------
 ******/

'use strict';

import { CoreConnectorAggregate, ILogger } from '../domain';
import { Request, ResponseToolkit, ServerRoute } from '@hapi/hapi';
import OpenAPIBackend, { Context } from 'openapi-backend';
import { BaseRoutes } from './BaseRoutes';
import { TMTNMerchantPaymentRequest, TMTNSendMoneyRequest, TMTNUpdateMerchantPaymentRequest, TMTNUpdateSendMoneyRequest } from 'src/domain/CBSClient';
import config from '../config';

const API_SPEC_FILE = config.get('server.DFSP_API_SPEC_FILE');

export class DFSPCoreConnectorRoutes extends BaseRoutes {
    private readonly aggregate: CoreConnectorAggregate;
    private readonly routes: ServerRoute[] = [];
    private readonly logger: ILogger;

    constructor(aggregate: CoreConnectorAggregate, logger: ILogger) {
        super();
        this.aggregate = aggregate;
        this.logger = logger.child({ context: 'MCC Routes' });
    }

    async init() {
        const api = new OpenAPIBackend({
            definition: API_SPEC_FILE,
            handlers: {
                sendMoney: this.initiateTransfer.bind(this),
                sendMoneyUpdate: this.updateInitiatedTransfer.bind(this),
                initiateMerchantPayment: this.initiateMerchantPayment.bind(this),
                updateInitiatedMerchantPayment: this.updateInitiatedMerchantPayment.bind(this),
                transfersEnquiry: this.getTransfer.bind(this),
                validationFail: async (context, req, h) => h.response({ error: context.validation.errors }).code(400),
                notFound: async (context, req, h) => h.response({ error: 'Not found' }).code(404),
            },
        });

        await api.init();

        this.routes.push({
            method: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
            path: '/{path*}',
            handler: (req: Request, h: ResponseToolkit) =>
                api.handleRequest(
                    {
                        method: req.method,
                        path: req.path,
                        body: req.payload,
                        query: req.query,
                        headers: req.headers,
                    },
                    req,
                    h,
                ),
        });

        this.routes.push({
            method: ['GET'],
            path: '/health',
            handler: async (req: Request, h: ResponseToolkit) => {
                const success = true; // todo: think about better healthCheck logic
                return h.response({ success }).code(success ? 200 : 503);
            },
        });
    }

    getRoutes(): ServerRoute[] {
        return this.routes;
    }

    private async initiateTransfer(context: Context, request: Request, h: ResponseToolkit) {
        const transfer = request.payload as TMTNSendMoneyRequest;
        this.logger.info(`Transfer request ${transfer}`);
        try {
            const result = await this.aggregate.sendMoney(transfer,"SEND");
            return this.handleResponse(result, h);
        } catch (error: unknown) {
            return this.handleError(error, h);
        }
    }

    private async updateInitiatedTransfer(context: Context, request: Request, h: ResponseToolkit) {
        const { params } = context.request;
        const transferId = params["transferId"] as string;
        const transferAccept = request.payload as TMTNUpdateSendMoneyRequest;
        this.logger.info(`Transfer request ${transferAccept} with id ${params.transferId}`);
        try {
            const updateTransferRes = await this.aggregate.updateSentTransfer(transferAccept,transferId);
            return this.handleResponse(updateTransferRes, h);
        } catch (error: unknown) {
            return this.handleError(error, h);
        }
    }

    private async initiateMerchantPayment(context: Context, request: Request, h: ResponseToolkit) {
        const transfer = request.payload as TMTNMerchantPaymentRequest;
        this.logger.info(`Transfer request ${transfer}`);
        try {
            const result = await this.aggregate.sendMoney(transfer,"RECEIVE");
            return this.handleResponse(result, h);
        } catch (error: unknown) {
            return this.handleError(error, h);
        }
    }

    private async updateInitiatedMerchantPayment(context: Context, request: Request, h: ResponseToolkit) {
        const { params } = context.request;
        const transferId = params["transferId"] as string;
        const transferAccept = request.payload as TMTNUpdateMerchantPaymentRequest;
        this.logger.info(`Transfer request ${transferAccept} with id ${params.transferId}`);
        try {
            const updateTransferRes = await this.aggregate.updateSentTransfer(transferAccept,transferId);
            return this.handleResponse(updateTransferRes, h);
        } catch (error: unknown) {
            return this.handleError(error, h);
        }
    }

    private async getTransfer(context: Context, request: Request, h: ResponseToolkit){
        const transferId = context.request.params["transferId"] as string;
        this.logger.info(`Getting transfer with id ${transferId}`);
        try{
            const res = await this.aggregate.getTransfers(transferId);
            return this.handleResponse(res,h);
        }catch(error : unknown){
            return this.handleError(error,h);
        }
    }
}
