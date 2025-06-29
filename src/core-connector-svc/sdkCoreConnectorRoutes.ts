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

import { Request, ResponseToolkit } from '@hapi/hapi';
import { Context } from 'openapi-backend';
import { IDFSPCoreConnectorAggregate, ILogger, TQuoteRequest, TtransferPatchNotificationRequest, TtransferRequest } from '../domain';
import { BaseRoutes } from './BaseRoutes';

export class SDKCoreConnectorRoutes<D> extends BaseRoutes {
    protected readonly aggregate: IDFSPCoreConnectorAggregate<D>;
    protected readonly logger: ILogger;

    protected readonly handlers = {
        BackendPartiesGetByTypeAndID: this.getParties.bind(this),
        BackendQuoteRequest: this.quoteRequests.bind(this),
        BackendTransfersPost: this.transfers.bind(this),
        BackendTransfersPut: this.transferNotification.bind(this),
        validationFail: async (context: Context, req: Request, h: ResponseToolkit) => h.response({ error: context.validation.errors }).code(400),
        notFound: async (context: Context, req: Request, h: ResponseToolkit) => h.response({ error: 'Not found' }).code(404),
    };

    constructor(aggregate: IDFSPCoreConnectorAggregate<D>, logger: ILogger , apiSpecFile: string) {
        super();
        this.aggregate = aggregate;
        this.logger = logger.child({ context: 'MCC Routes' });
        this.apiSpecFile = apiSpecFile;
    }

    async initialise(){
        await this.init(this.handlers);
    }

    getHandlers(){
        return this.handlers;
    }

    protected async getParties(context: Context, request: Request, h: ResponseToolkit) {
        try {
            const { params } = context.request;
            const Id = params['idValue'] as string;
            const IdType = params['idType'] as string;
            this.logger.info(`Get party for ${IdType} ${Id}`);
            const result = await this.aggregate.getParties(Id,IdType);
            return this.handleResponse(result, h);
        } catch (error) {
            return this.handleError(error, h);
        }
    }

    protected async quoteRequests(context: Context, request: Request, h: ResponseToolkit) {
        try {
            const quoteRequest = request.payload as TQuoteRequest;
            this.logger.info(`Quote request ${quoteRequest}`);
            const quote = await this.aggregate.quoteRequest(quoteRequest);
            return this.handleResponse(quote, h);
        } catch (error: unknown) {
            return this.handleError(error, h);
        }
    }

    protected async transfers(context: Context, request: Request, h: ResponseToolkit) {
        const transfer = request.payload as TtransferRequest;
        try {
            this.logger.info(`Transfer Payload ${transfer}`);
            const result = await this.aggregate.receiveAndReserveTransfer(transfer);
            return this.handleResponse(result, h, 200);
        } catch (error: unknown) {
            return this.handleError(error, h);
        }
    }

    protected async transferNotification(context: Context, request: Request, h: ResponseToolkit){
        const transferNotificatioPayload = request.payload as TtransferPatchNotificationRequest;
        const { params } = context.request;
        const transferId = params['transferId'] as string;
        try{
            this.logger.info(`Transfers ${transferNotificatioPayload}`);
            this.logger.info(`Transfer Id ${transferId}`);
            const result = await this.aggregate.updateAndCommitTransferOnPatchNotification(transferNotificatioPayload, transferId);
            return this.handleResponse(result,h);
        }catch(error: unknown){
            return this.handleError(error,h);
        }
    }
}
