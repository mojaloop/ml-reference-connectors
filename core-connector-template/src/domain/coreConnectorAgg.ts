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

import { randomUUID } from 'crypto';
import {
    ICbsClient,
    TCallbackRequest,
    TCbsCollectMoneyRequest,
    TCbsCollectMoneyResponse,
    TCBSConfig,
    TCbsSendMoneyRequest,
    TCbsSendMoneyResponse,
    TCBSUpdateSendMoneyRequest,
} from './CBSClient';
import {
    ILogger,
    TLookupPartyInfoResponse,
    TQuoteResponse,
    TQuoteRequest,
    TtransferResponse,
    TtransferRequest,
    ICoreConnectorAggregate,
    TtransferPatchNotificationRequest,
    THttpResponse,
    ValidationError,
} from './interfaces';
import {
    ISDKClient,
    SDKClientError,
    TSDKOutboundTransferRequest,
    TSDKOutboundTransferResponse,
    TtransferContinuationResponse,
} from './SDKClient';

export class CoreConnectorAggregate implements ICoreConnectorAggregate {
    IdType: string;
    logger: ILogger;
    DATE_FORMAT = 'dd MM yy';

    constructor(
        readonly sdkClient: ISDKClient,
        readonly cbsClient: ICbsClient,
        readonly cbsConfig: TCBSConfig,
        logger: ILogger,
    ) {
        // todo: set the IdType from here 
        this.IdType = "MSISDN";
        this.logger = logger;
    }

    //Payee
    async getParties(id: string, IdType: string): Promise<TLookupPartyInfoResponse> {
        this.logger.info(`Getting party info ${id} ${IdType}`);
        throw new Error('Method not implemented.');
    }
    async quoteRequest(quoteRequest: TQuoteRequest): Promise<TQuoteResponse> {
        this.logger.info(`Calculating quote for ${quoteRequest.to.idValue}`);
        throw new Error('Method not implemented.');
    }
    async receiveTransfer(transfer: TtransferRequest): Promise<TtransferResponse> {
        this.logger.info(`Received transfer request for ${transfer.to.idValue}`);
        throw new Error('Method not implemented.');
    }
    updateTransfer(updateTransferPayload: TtransferPatchNotificationRequest, transferId: string): Promise<void> {
        this.logger.info(`Committing transfer on patch notification for ${updateTransferPayload.quoteRequest?.body.payee.partyIdInfo.partyIdentifier} and transfer id ${transferId}`);
        throw new Error('Method not implemented.');
    }

    // Payer
    async sendMoney(transfer: TCbsSendMoneyRequest): Promise<TCbsSendMoneyResponse> {
        this.logger.info(`Received send money request for payer with ID ${transfer.payerAccount}`);
        const res = await this.sdkClient.initiateTransfer(await this.getTSDKOutboundTransferRequest(transfer));
        if(res.data.currentState === "WAITING_FOR_CONVERSION_ACCEPTANCE"){
            return await this.checkAndRespondToConversionTerms(res);
        }
        if (!this.validateReturnedQuote(res.data)) {
            throw ValidationError.invalidReturnedQuoteError();
        }
        return this.getTCbsSendMoneyResponse(res.data);
    }

    private async checkAndRespondToConversionTerms(res: THttpResponse<TSDKOutboundTransferResponse>): Promise<TCbsSendMoneyResponse>{
        let acceptRes: THttpResponse<TtransferContinuationResponse>;
        if (!this.validateConversionTerms(res.data)) {
            if (!res.data.transferId) {
                throw ValidationError.transferIdNotDefinedError("Transfer Id not defined in transfer response", "4000", 500);
            }
            acceptRes = await this.sdkClient.updateTransfer({
                "acceptConversion": false
            }, res.data.transferId);
            throw ValidationError.invalidConversionQuoteError("Recieved Conversion Terms are invalid", "4000", 500);
        }
        else {
            if (!res.data.transferId) {
                throw ValidationError.transferIdNotDefinedError("Transfer Id not defined in transfer response", "4000", 500);
            }
            acceptRes = await this.sdkClient.updateTransfer({
                "acceptConversion": true
            }, res.data.transferId);
        }
        if (!this.validateReturnedQuote(acceptRes.data)) {
            throw ValidationError.invalidReturnedQuoteError();
        }
        return this.getTCbsSendMoneyResponse(acceptRes.data);
    }

    private validateConversionTerms(transferResponse: TSDKOutboundTransferResponse): boolean {
        this.logger.info(`Validating Conversion Terms with transfer response amount${transferResponse.amount}`);
        // todo: Define Implementations
        return true;
    }

    private validateReturnedQuote(transferResponse: TSDKOutboundTransferResponse): boolean {
        this.logger.info(`Validating Retunred Quote with transfer response amount${transferResponse.amount}`);
        // todo: Define Implementations
        return true;
    }

    private getTCbsSendMoneyResponse(transfer: TSDKOutboundTransferResponse): TCbsSendMoneyResponse {
        this.logger.info(`Getting response for transfer with Id ${transfer.transferId}`);
        return {
            "payeeDetails": {
                "idType": transfer.to.idType,
                "idValue":transfer.to.idValue,
                "fspId": transfer.to.fspId !== undefined ? transfer.to.fspId : "No FSP ID Returned",
                "firstName": transfer.to.firstName !== undefined ? transfer.to.firstName : "No First Name Returned",
                "lastName":transfer.to.lastName !== undefined ? transfer.to.lastName : "No Last Name Returned",
                "dateOfBirth":transfer.to.dateOfBirth !== undefined ? transfer.to.dateOfBirth : "No Date of Birth Returned",
            },
            "receiveAmount": transfer.quoteResponse?.body.payeeReceiveAmount?.amount !== undefined ? transfer.quoteResponse.body.payeeReceiveAmount.amount : "No payee receive amount",
            "receiveCurrency": transfer.fxQuotesResponse?.body.conversionTerms.targetAmount.currency !== undefined ? transfer.fxQuotesResponse?.body.conversionTerms.targetAmount.currency : "No Currency returned from Mojaloop Connector" ,
            "fees": transfer.quoteResponse?.body.payeeFspFee?.amount !== undefined ? transfer.quoteResponse?.body.payeeFspFee?.amount : "No fee amount returned from Mojaloop Connector",
            "feeCurrency": transfer.fxQuotesResponse?.body.conversionTerms.targetAmount.currency !== undefined ? transfer.fxQuotesResponse?.body.conversionTerms.targetAmount.currency : "No Fee currency retrned from Mojaloop Connector",
            "transactionId": transfer.transferId !== undefined ? transfer.transferId : "No transferId returned",
        };
    }

    private async getTSDKOutboundTransferRequest(transfer: TCbsSendMoneyRequest):Promise<TSDKOutboundTransferRequest> {
        const res = await this.cbsClient.getKyc({
            msisdn: transfer.payerAccount
        });
        return {
            'homeTransactionId': randomUUID(),
            'from': {
                'idType': this.cbsConfig.SUPPORTED_ID_TYPE,
                'idValue': transfer.payerAccount,
                'fspId': this.cbsConfig.FSP_ID,
                "displayName": `${res.data.first_name} ${res.data.last_name}`,
                "firstName": res.data.first_name,
                "middleName": res.data.first_name,
                "lastName": res.data.last_name,
                "merchantClassificationCode": "123",
            },
            'to': {
                'idType': transfer.payeeIdType,
                'idValue': transfer.payeeId
            },
            'amountType': 'SEND',
            'currency': transfer.sendCurrency,
            'amount': transfer.sendAmount,
            'transactionType': transfer.transactionType,
        };
    }
    async updateSendMoney(updateSendMoneyDeps: TCBSUpdateSendMoneyRequest, transferId: string): Promise<TCbsCollectMoneyResponse> {
        this.logger.info(`Updating transfer for id ${updateSendMoneyDeps.msisdn} and transfer id ${transferId}`);

        if (!(updateSendMoneyDeps.acceptQuote)) {
            throw ValidationError.quoteNotAcceptedError();
        }
        return await this.cbsClient.collectMoney(this.getTCbsCollectMoneyRequest(updateSendMoneyDeps, transferId));
    }

    private getTCbsCollectMoneyRequest(collection: TCBSUpdateSendMoneyRequest, transferId: string): TCbsCollectMoneyRequest {
        return {
            "reference": "string",
            "subscriber": {
                "country": this.cbsConfig.X_COUNTRY,
                "currency": this.cbsConfig.X_CURRENCY,
                "msisdn": collection.msisdn,
            },
            "transaction": {
                "amount": Number(collection.amount),
                "country": this.cbsConfig.X_COUNTRY,
                "currency": this.cbsConfig.X_CURRENCY,
                "id": transferId,
            }
        };
    }

    async handleCallback(payload: TCallbackRequest): Promise<void>{
        this.logger.info(`Handling callback for transaction with id ${payload.transaction.id}`);
        let sdkRes;
        try{
            if(payload.transaction.status_code === "TS"){
                sdkRes = await this.sdkClient.updateTransfer({acceptQuote: true},payload.transaction.id);
            }else{
                sdkRes = await this.sdkClient.updateTransfer({acceptQuote: false},payload.transaction.id);
            }
        }catch (error: unknown){
            if(error instanceof SDKClientError){
                // perform refund or rollback
                // const rollbackRes = await this.cbsClient.refundMoney();
            }
        }
    }
}
