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

import { Request, ResponseToolkit, ServerRoute } from '@hapi/hapi';
import OpenAPIBackend, { Context } from 'openapi-backend';
import { ILogger} from '../domain';
import { BaseRoutes } from './BaseRoutes';
import { IFxpCoreConnectorAgg, TConfirmFxTransferRequest, TFxQuoteRequest, TNotifyFxTransferStateRequest } from 'src/domain/FXPClient';


export class FXPCoreConnectorRoutes<F> extends BaseRoutes {
    private readonly aggregate: IFxpCoreConnectorAgg<F>;
    private readonly logger: ILogger;

    private readonly handlers = {
        FxQuotesPost: this.fxQuote.bind(this),
        FxTransfersPost: this.confirmFxTransfer.bind(this),
        FxTransfersById: this.notifyFxTransferState.bind(this),
        validationFail: async (context: Context, req: Request, h: ResponseToolkit) => h.response({ error: context.validation.errors }).code(400),
        notFound: async (context: Context, req: Request, h: ResponseToolkit) => h.response({ error: 'Not found' }).code(404),
    };

    constructor(aggregate: IFxpCoreConnectorAgg<F>, logger: ILogger , apiSpecFile: string) {
        super();
        this.aggregate = aggregate;
        this.logger = logger.child({ context: 'MCC Routes' });
        this.apiSpecFile = apiSpecFile;
    }

    async initialise(){
        await this.init(this.handlers);
    }

    private async fxQuote(context: Context, request: Request, h: ResponseToolkit){
        const fxQuoteReq = request.payload as TFxQuoteRequest;
        try{
            this.logger.info(`fxQuote request ${fxQuoteReq}`);
            const result = this.aggregate.getFxQuote(fxQuoteReq);
            return this.handleResponse(result,h,200);
        }catch(error: unknown){
            return this.handleError(error, h);
        }
    }

    private async confirmFxTransfer(context: Context, request: Request, h: ResponseToolkit){
        const fxTransferConfirmReq = request.payload as TConfirmFxTransferRequest;
        try{
            this.logger.info(`fxTransfer request ${fxTransferConfirmReq}`);
            const result = this.aggregate.confirmFxTransfer(fxTransferConfirmReq);
            return this.handleResponse(result,h,200);
        }catch(error: unknown){
            return this.handleError(error, h);
        }
    }

    private async notifyFxTransferState(context: Context, request: Request, h: ResponseToolkit){
        const fxNotifyTransferStateReq = request.payload as TNotifyFxTransferStateRequest;
        try{
            this.logger.info(`fxTransfer Notification request ${fxNotifyTransferStateReq}`);
            const result = this.aggregate.notifyFxTransferState(fxNotifyTransferStateReq);
            return this.handleResponse(result,h,200);
        }catch(error: unknown){
            return this.handleError(error, h);
        }
    }
}
