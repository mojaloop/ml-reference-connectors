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

import config from '../config';

import {
    IMTNClient,
    TMTNConfig,
    TMTNDisbursementRequestBody,
    PartyType,
    TMTNSendMoneyRequest,
    TMTNSendMoneyResponse,
    TMTNCollectMoneyRequest,
    TMTNUpdateSendMoneyRequest,
    TMTNKycResponse,
    TMTNCallbackPayload,
} from './CBSClient';
import {
    ILogger,
    TLookupPartyInfoResponse,
    TQuoteResponse,
    TQuoteRequest,
    TtransferResponse,
    TtransferRequest,
    TtransferPatchNotificationRequest,
    ValidationError,
    THttpResponse,
} from './interfaces';
import {
    ISDKClient,
    TSDKOutboundTransferRequest,
    TSDKOutboundTransferResponse,
    TtransferContinuationResponse,
} from './SDKClient';

export class CoreConnectorAggregate {
    public IdType: string;
    private logger: ILogger;
    DATE_FORMAT = 'dd MM yy';

    constructor(
        private readonly sdkClient: ISDKClient,
        private readonly mtnClient: IMTNClient,
        private readonly mtnConfig: TMTNConfig,
        logger: ILogger,
    ) {
        // todo: set the IdType from here 
        this.IdType = "MSISDN";
        this.logger = logger;
    }

    private async checkAccountBarred(msisdn: string): Promise<void> {
        const res = await this.mtnClient.getKyc({ msisdn: msisdn });
        if (res.status == "NOT FOUND") {
            throw ValidationError.accountBarredError();
        }
    }
    private validateQuote(transfer: TtransferRequest): boolean {
        // todo define implmentation
        this.logger.info(`Validating code for transfer with amount ${transfer.amount}`);
        return true;
    }

    private validatePatchQuote(transfer: TtransferPatchNotificationRequest): boolean {
        this.logger.info(`Validating code for transfer with state ${transfer.currentState}`);
        // todo define implmentation
        return true;
    }

    //Payee
    async getParties(id: string, idType: string): Promise<TLookupPartyInfoResponse> {
        this.logger.info(`Get Parties for ${id}`);
        if (!(idType === config.get("mtn.SUPPORTED_ID_TYPE"))) {
            throw ValidationError.unsupportedIdTypeError();
        }

        const lookupRes = await this.mtnClient.getKyc({ msisdn: id });
        const party = this.getPartyResponse(lookupRes,id);
        this.logger.info(`Party found`, { party });
        return party;
    }

    private getPartyResponse(mtnKycResponse: TMTNKycResponse, idValue: string):TLookupPartyInfoResponse{
        return {
            data: {
                displayName: `${mtnKycResponse.given_name} ${mtnKycResponse.family_name}`,
                firstName: mtnKycResponse.given_name,
                idType: config.get("mtn.SUPPORTED_ID_TYPE"),
                idValue: idValue,
                lastName: mtnKycResponse.family_name,
                middleName: " ",
                type: PartyType.CONSUMER,
                kycInformation: `${JSON.stringify(mtnKycResponse)}`,
            },
            statusCode: Number(mtnKycResponse.status),
        };
    }

    async quoteRequest(quoteRequest: TQuoteRequest): Promise<TQuoteResponse> {
        this.logger.info(`Quote requests for ${this.IdType} ${quoteRequest.to.idValue}`);
        if (quoteRequest.to.idType !== this.IdType) {
            throw ValidationError.unsupportedIdTypeError();
        }
        if (quoteRequest.currency !== config.get("mtn.X_CURRENCY")) {
            throw ValidationError.unsupportedCurrencyError();
        }
        const serviceChargePercentage = Number(config.get("mtn.SERVICE_CHARGE"));
        const fees = serviceChargePercentage / 100 * Number(quoteRequest.amount);
        await this.checkAccountBarred(quoteRequest.to.idValue);
        const quoteExpiration = config.get("mtn.EXPIRATION_DURATION");
        const expiration = new Date();
        expiration.setHours(expiration.getHours() + Number(quoteExpiration));
        const expirationJSON = expiration.toJSON();
        return this.getQuoteResponse(quoteRequest, fees.toString() ,expirationJSON);
    }


    private getQuoteResponse(quoteRequest: TQuoteRequest, fees: string, expiration: string): TQuoteResponse{
        return {
            expiration: expiration,
            payeeFspCommissionAmount: '0',
            payeeFspCommissionAmountCurrency: quoteRequest.currency,
            payeeFspFeeAmount: fees ,
            payeeFspFeeAmountCurrency: quoteRequest.currency,
            payeeReceiveAmount: quoteRequest.amount,
            payeeReceiveAmountCurrency: quoteRequest.currency,
            quoteId: quoteRequest.quoteId,
            transactionId: quoteRequest.transactionId,
            transferAmount: (Number(quoteRequest.amount) + Number(fees).toString()),
            transferAmountCurrency: quoteRequest.currency,
        };
    }


    async receiveTransfer(transfer: TtransferRequest): Promise<TtransferResponse> {
        this.logger.info(`Transfer for  ${this.IdType} ${transfer.to.idValue}`);
        if (transfer.to.idType != this.IdType) {
            throw ValidationError.unsupportedIdTypeError();
        }
        if (transfer.currency !== config.get("mtn.X_CURRENCY")) {
            throw ValidationError.unsupportedCurrencyError();
        }
        if (!this.validateQuote(transfer)) {
            throw ValidationError.invalidQuoteError();
        }

        this.checkAccountBarred(transfer.to.idValue);
        return {
            completedTimestamp: new Date().toJSON(),
            homeTransactionId: transfer.transferId,
            transferState: 'RESERVED',
        };
    }

    
    async updateTransfer(updateTransferPayload: TtransferPatchNotificationRequest, transferId: string): Promise<void> {
        this.logger.info(`Committing The Transfer with id ${transferId}`);
        if (updateTransferPayload.currentState !== 'COMPLETED') {
            throw ValidationError.transferNotCompletedError();
        }
        if (!this.validatePatchQuote(updateTransferPayload)) {
            throw ValidationError.invalidQuoteError();
        }
        const mtnDisbursementRequest: TMTNDisbursementRequestBody = this.getDisbursementRequestBody(updateTransferPayload);
        await this.mtnClient.sendMoney(mtnDisbursementRequest);
    }

    
    private getDisbursementRequestBody(requestBody: TtransferPatchNotificationRequest): TMTNDisbursementRequestBody {
        if (!requestBody.quoteRequest) {
            throw ValidationError.quoteNotDefinedError('Quote Not Defined Error', '5000', 500);
        }
        if(!requestBody.transferId){
            throw ValidationError.transferIdNotDefinedError("TransferId Not Defined",'5000', 500);
        }
        return {
           "amount": requestBody.quoteRequest.body.amount.amount,
           "currency": this.mtnConfig.X_CURRENCY,
           "externalId" : requestBody.transferId,
           "payee": {
           "partyIdType": requestBody.quoteRequest.body.payee.partyIdInfo.partyIdType,
            "partyId": requestBody.quoteRequest.body.payee.partyIdInfo.partyIdentifier
           },
           "payerMessage": "Payer Attached Note For Transactions",
           "payeeNote" : "Sending Money"

        };

    }

    private getTMTNSendMoneyResponse(transfer: TSDKOutboundTransferResponse): TMTNSendMoneyResponse {
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


    private async getTSDKOutboundTransferRequest(transfer: TMTNSendMoneyRequest): Promise<TSDKOutboundTransferRequest> {
        const res = await this.mtnClient.getKyc({
            msisdn: transfer.payerAccount
        });
        return {
            'homeTransactionId': transfer.homeTransactionId,
            'from': {
                'idType': this.mtnConfig.SUPPORTED_ID_TYPE,
                'idValue': transfer.payerAccount,
                'fspId': this.mtnConfig.FSP_ID,
                "displayName": `${res.given_name} ${res.family_name}`,
                "firstName": res.given_name,
                "middleName": res.given_name,
                "lastName": res.family_name,
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

    // Payer
    async sendTransfer(transfer: TMTNSendMoneyRequest): Promise<TMTNSendMoneyResponse> {
        this.logger.info(`Transfer from mtn account with ID ${transfer.payerAccount}`);

        const transferRequest: TSDKOutboundTransferRequest = await this.getTSDKOutboundTransferRequest(transfer);
        const res = await this.sdkClient.initiateTransfer(transferRequest);
        let acceptRes: THttpResponse<TtransferContinuationResponse>;

        if (res.data.currentState === 'WAITING_FOR_CONVERSION_ACCEPTANCE') {
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
            return this.getTMTNSendMoneyResponse(acceptRes.data);
        }
        if (!this.validateReturnedQuote(res.data)) {
            throw ValidationError.invalidReturnedQuoteError();
        }
        return this.getTMTNSendMoneyResponse(res.data);
    }

    private getTMTNCollectMoneyRequest(deps: TMTNUpdateSendMoneyRequest, transferId: string): TMTNCollectMoneyRequest {
        return {
            "amount": deps.amount,
            "currency": this.mtnConfig.X_CURRENCY,
            "externalId": transferId,
            "payer" :{
                "partyId": deps.msisdn,
                "partyIdType": this.mtnConfig.SUPPORTED_ID_TYPE,
            },
            "payerMessage": deps.payerMessage,
            "payeeNote": deps.payeeNote
        };
    }

    async updateSentTransfer(transferAccept: TMTNUpdateSendMoneyRequest, transferId: string): Promise<void> {
        this.logger.info(`Updating transfer for id ${transferAccept.msisdn} and transfer id ${transferId}`);

        if (!(transferAccept.acceptQuote)) {
            throw ValidationError.quoteNotAcceptedError();
        }
        await this.mtnClient.collectMoney(this.getTMTNCollectMoneyRequest(transferAccept, transferId));
    }

    async handleCallback(payload: TMTNCallbackPayload): Promise<void>{
        this.logger.info(`Handling callback for transaction with id ${payload.externalId}`);
        if(payload.status === "SUCCESSFUL"){
            await this.sdkClient.updateTransfer({acceptQuote: true},payload.externalId);
        }else{
            await this.sdkClient.updateTransfer({acceptQuote: false},payload.externalId);
        }
    }
    
}


