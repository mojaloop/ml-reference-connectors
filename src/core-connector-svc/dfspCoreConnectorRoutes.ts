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

import { IDFSPCoreConnectorAggregate, ILogger, TAccountCreationRequest } from '../domain';
import { Request, ResponseToolkit } from '@hapi/hapi';
import { Context } from 'openapi-backend';
import { BaseRoutes } from './BaseRoutes';
import { TCbsSendMoneyRequest, TCBSUpdateSendMoneyRequest } from 'src/domain/CBSClient';

export class DFSPCoreConnectorRoutes<D> extends BaseRoutes {
    protected readonly aggregate: IDFSPCoreConnectorAggregate<D>;
    protected readonly logger: ILogger;

    // Register openapi spec operationIds and route handler functions here
    protected readonly handlers = {
        sendMoney: this.initiateTransfer.bind(this),
        sendMoneyUpdate: this.updateInitiatedTransfer.bind(this),
        initiateMerchantPayment: this.initiateMerchantPayment.bind(this),
        updateInitiatedMerchantPayment: this.updateInitiatedMerchantPayment.bind(this),
        PostAccounts: this.postAccounts.bind(this),
        DeleteAccounts: this.deleteAccounts.bind(this),
        OutoundTransfersGet: this.getTransfers.bind(this),
        validationFail: async (context: Context, req: Request, h: ResponseToolkit) => h.response({ error: context.validation.errors }).code(400),
        notFound: async (context: Context, req: Request, h: ResponseToolkit) => h.response({ error: 'Not found' }).code(404),
    };

    constructor(aggregate: IDFSPCoreConnectorAggregate<D>, logger: ILogger, apiSpecFile: string) {
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

    protected async initiateTransfer(context: Context, request: Request, h: ResponseToolkit) {
        const transfer = request.payload as TCbsSendMoneyRequest ;
        this.logger.debug(`Transfer request ${transfer}`);
        try {
            const result = await this.aggregate.sendMoney(transfer,"SEND");
            return this.handleResponse(result, h);
        } catch (error: unknown) {
            return this.handleError(error, h);
        }
    }

    protected async updateInitiatedTransfer(context: Context, request: Request, h: ResponseToolkit) {
        const { params } = context.request;
        const transferAccept = request.payload as TCBSUpdateSendMoneyRequest ;
        this.logger.debug(`Transfer request ${transferAccept} with id ${params.transferId}`);
        try {
            const updateTransferRes = await this.aggregate.updateSendMoney(
                transferAccept,
                params.transferId as string,
            );
            return this.handleResponse(updateTransferRes, h);
        } catch (error: unknown) {
            return this.handleError(error, h);
        }
    }

    protected async initiateMerchantPayment(context: Context, request: Request, h: ResponseToolkit) {
        const transfer = request.payload as TCbsSendMoneyRequest;
        this.logger.debug(`Transfer request ${transfer}`);
        try {
            const result = await this.aggregate.sendMoney(transfer,"RECEIVE");
            return this.handleResponse(result, h);
        } catch (error: unknown) {
            return this.handleError(error, h);
        }
    }

    protected async updateInitiatedMerchantPayment(context: Context, request: Request, h: ResponseToolkit) {
        const { params } = context.request;
        const transferAccept = request.payload as TCBSUpdateSendMoneyRequest;
        this.logger.debug(`Transfer request ${transferAccept} with id ${params.transferId}`);
        try {
            const updateTransferRes = await this.aggregate.updateSendMoney(
                transferAccept,
                params.transferId as string,
            );
            return this.handleResponse(updateTransferRes, h);
        } catch (error: unknown) {
            return this.handleError(error, h);
        }
    }

    protected async getTransfers(context: Context, request: Request, h: ResponseToolkit){
        const { params } = context.request;
        this.logger.debug(`Get transfer request with id ${params.transferId}`);
        try{
            const transfer = await this.aggregate.getTransfers(params.transferId as string);
            return this.handleResponse(transfer,h);
        }catch(error: unknown){
            return this.handleError(error,h);
        }
    }

    protected async postAccounts(context: Context, request: Request, h: ResponseToolkit ){
        const account = request.payload as TAccountCreationRequest;
        this.logger.debug(`Creation account ...`,account);
        try{
            const accountRes = await this.aggregate.postAccounts(account);
            return this.handleResponse(accountRes,h);
        }catch(error: unknown){
            return this.handleError(error,h);
        }
    }

    protected async deleteAccounts(context: Context, request: Request, h: ResponseToolkit ){
        const { params } = context.request;
        const type: string = params["Type"] as string;
        const id: string = params["ID"] as string;
        this.logger.debug(`Deleting account ...`, {"Type": type , "Id": id});
        try{
            const deleteAccountRes = await this.aggregate.deleteAccounts(id,type);
            return this.handleResponse(deleteAccountRes,h);
        }catch(error: unknown){
            return this.handleError(error,h);
        } 
    }
}
7;