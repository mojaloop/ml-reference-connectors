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
    INBMClient,
    TCallbackRequest,
    TCbsCollectMoneyRequest,
    TCbsCollectMoneyResponse,
    TNBMConfig,
    TCbsDisbursementRequestBody,
    TCbsKycResponse,
    TCbsSendMoneyRequest,
    TCbsSendMoneyResponse,
    TCBSUpdateSendMoneyRequest,
    PartyType
} from './CBSClient';
import {
    ILogger,
    TQuoteResponse,
    TQuoteRequest,
    TtransferResponse,
    TtransferRequest,
    ICoreConnectorAggregate,
    TtransferPatchNotificationRequest,
    THttpResponse,
    ValidationError,
    Party,
    TGetQuotesDeps,
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
        readonly nbmClient: INBMClient,
        readonly cbsConfig: TNBMConfig,
        logger: ILogger,
    ) {
        this.IdType = this.cbsConfig.SUPPORTED_ID_TYPE;
        this.logger = logger;
    }

    //Payee
    async getParties(id: string, IdType: string): Promise<Party> {
        this.logger.info(`Getting party information for ${id}`);
        if (!(IdType === this.cbsConfig.SUPPORTED_ID_TYPE)) {
            throw ValidationError.unsupportedIdTypeError();
        }
        
        const res = await this.nbmClient.getKyc({ msisdn: id });
        const party = {
            data: {
               firstName: res.data.first_name,
               lastName: res.data.last_name,
               idType: this.nbmClient.cbsConfig.SUPPORTED_ID_TYPE,
               idValue: id,
               type: PartyType.CONSUMER
            }
        }
        return this.getPartiesResponse(res);
    }

    private getPartiesResponse(res: TCbsKycResponse): Party {
        return {
            statusCode: (statusCode: any) => 200,
            idType: "ACCOUNT_ID",
            idValue: res.data.msisdn,
            displayName: `${res.data.first_name} ${res.data.last_name}`,
            firstName: res.data.first_name,
            middleName: res.data.first_name,
            type: "CONSUMER",
            kycInformation: JSON.stringify(res.data),
            lastName: res.data.last_name
        }
    }

    async quoteRequest(quoteRequest: TQuoteRequest): Promise<TQuoteResponse> {
        this.logger.info(`Calculating quote for ${quoteRequest.to.idValue} and amount ${quoteRequest.amount}`);
        if (quoteRequest.to.idType !== this.cbsConfig.SUPPORTED_ID_TYPE) {
            throw ValidationError.unsupportedIdTypeError();
        }
        if (quoteRequest.currency !== this.cbsConfig.X_CURRENCY) {
            throw ValidationError.unsupportedCurrencyError();
        }
        const res = await this.nbmClient.getKyc({ msisdn: quoteRequest.to.idValue });
        const fees = (Number(this.cbsConfig.SENDING_SERVICE_CHARGE) / 100) * Number(quoteRequest.amount)
        // check if account is blocked if possible
        const quoteExpiration = this.cbsConfig.EXPIRATION_DURATION;
        const expiration = new Date();
        expiration.setHours(expiration.getHours() + Number(quoteExpiration));
        const expirationJSON = expiration.toJSON();
        return this.getQuoteResponse({
            res: res,
            fees: fees,
            expiration: expirationJSON,
            quoteRequest: quoteRequest
        });
    }

    private getQuoteResponse(deps: TGetQuotesDeps): TQuoteResponse {
        return {
            "expiration": deps.expiration,
            "payeeFspCommissionAmount": "0",
            "payeeFspCommissionAmountCurrency": this.cbsConfig.X_CURRENCY,
            "payeeFspFeeAmount": deps.fees.toString(),
            "payeeFspFeeAmountCurrency": this.cbsConfig.X_CURRENCY,
            "payeeReceiveAmount": deps.quoteRequest.amount,
            "payeeReceiveAmountCurrency": this.cbsConfig.X_CURRENCY,
            "quoteId": deps.quoteRequest.quoteId,
            "transferAmount": (deps.fees + Number(deps.quoteRequest.amount)).toString(),
            "transferAmountCurrency": deps.quoteRequest.currency,
            "transactionId": deps.quoteRequest.transactionId
        }
    }
    async receiveTransfer(transfer: TtransferRequest): Promise<TtransferResponse> {
        this.logger.info(`Received transfer request for ${transfer.to.idValue}`);
        if (transfer.to.idType != this.IdType) {
            throw ValidationError.unsupportedIdTypeError();
        }
        if (transfer.currency !== this.cbsConfig.X_CURRENCY) {
            throw ValidationError.unsupportedCurrencyError();
        }
        if (!this.validateQuote(transfer)) {
            throw ValidationError.invalidQuoteError();
        }
        this.checkAccountBarred(transfer.to.idValue);
        return {
            completedTimestamp: new Date().toJSON(),
            homeTransactionId: transfer.transferId,
            transferState: 'RECEIVED',
        };
    }

    private validateQuote(transfer: TtransferRequest): boolean {
        this.logger.info(`Validating quote for transfer with amount ${transfer.amount}`);
        let result = true;
        if (transfer.amountType === 'SEND') {
            if (!this.checkSendAmounts(transfer)) {
                result = false;
            }
        } else if (transfer.amountType === 'RECEIVE') {
            if (!this.checkReceiveAmounts(transfer)) {
                result = false;
            }
        }
        return result;
    }

    private checkSendAmounts(transfer: TtransferRequest): boolean {
        this.logger.info('Validating Type Send Quote...', { transfer });
        let result = true;
        if (
            parseFloat(transfer.amount) !==
            parseFloat(transfer.quote.transferAmount) - parseFloat(transfer.quote.payeeFspCommissionAmount || '0')
            // POST /transfers request.amount == request.quote.transferAmount - request.quote.payeeFspCommissionAmount
        ) {
            result = false;
        }

        if (!transfer.quote.payeeReceiveAmount || !transfer.quote.payeeFspFeeAmount) {
            throw ValidationError.notEnoughInformationError("transfer.quote.payeeReceiveAmount or !transfer.quote.payeeFspFeeAmount not defined", "5000");
        }

        if (
            parseFloat(transfer.quote.payeeReceiveAmount) !==
            parseFloat(transfer.quote.transferAmount) -
            parseFloat(transfer.quote.payeeFspFeeAmount)
        ) {
            result = false;
        }
        return result;
    }

    private checkReceiveAmounts(transfer: TtransferRequest): boolean {
        this.logger.info('Validating Type Receive Quote...', { transfer });
        let result = true;
        if (!transfer.quote.payeeFspFeeAmount || !transfer.quote.payeeReceiveAmount) {
            throw ValidationError.notEnoughInformationError("transfer.quote.payeeFspFeeAmount or transfer.quote.payeeReceiveAmount not defined", "5000")
        }
        if (
            parseFloat(transfer.amount) !==
            parseFloat(transfer.quote.transferAmount) -
            parseFloat(transfer.quote.payeeFspCommissionAmount || '0') +
            parseFloat(transfer.quote.payeeFspFeeAmount)
        ) {
            result = false;
        }

        if (parseFloat(transfer.quote.payeeReceiveAmount) !== parseFloat(transfer.quote.transferAmount)) {
            result = false;
        }
        return result;
    }

    private async checkAccountBarred(msisdn: string): Promise<void> {
        const res = await this.nbmClient.getKyc({ msisdn: msisdn });
        if (res.data.is_barred) {
            throw ValidationError.accountBarredError();
        }
    }

    async updateTransfer(updateTransferPayload: TtransferPatchNotificationRequest, transferId: string): Promise<void> {
        this.logger.info(`Committing transfer on patch notification for ${updateTransferPayload.quoteRequest?.body.payee.partyIdInfo.partyIdentifier} and transfer id ${transferId}`);
        if (updateTransferPayload.currentState !== 'COMPLETED') {
            await this.initiateCompensationAction();
            throw ValidationError.transferNotCompletedError();
        }
        const makePaymentRequest: TCbsDisbursementRequestBody = this.getMakePaymentRequestBody(updateTransferPayload);
        await this.nbmClient.sendMoney(makePaymentRequest);
    }

    private async initiateCompensationAction() {
        // todo function implementation to be defined.
    }

    private getMakePaymentRequestBody(requestBody: TtransferPatchNotificationRequest): TCbsDisbursementRequestBody {
        if (!requestBody.quoteRequest) {
            throw ValidationError.quoteNotDefinedError('Quote Not Defined Error', '5000', 500);
        }

        if (!requestBody.transferId) {
            throw ValidationError.transferIdNotDefinedError("transferId not defined on patch notification handling", "5000", 500);
        }

        return {
            "payee": {
                "msisdn": requestBody.quoteRequest.body.payee.partyIdInfo.partyIdentifier,
                "wallet_type": "NORMAL",
            },
            "reference": requestBody.quoteRequest.body.note !== undefined ? requestBody.quoteRequest.body.note : "No note returned",
            "pin": this.cbsConfig.AIRTEL_PIN,
            "transaction": {
                "amount": Number(requestBody.quoteRequest.body.amount.amount),
                "id": requestBody.transferId,
                "type": "B2B"
            }
        }
    }

    // Payer
    async sendMoney(transfer: TCbsSendMoneyRequest): Promise<TCbsSendMoneyResponse> {
        this.logger.info(`Received send money request for payer with ID ${transfer.payerAccount}`);
        console.log(`Received send money request for payer with ID ${transfer.payerAccount}`);
        const res = await this.sdkClient.initiateTransfer(await this.getTSDKOutboundTransferRequest(transfer));
        if (res.data.currentState === "WAITING_FOR_CONVERSION_ACCEPTANCE") {
            return await this.checkAndRespondToConversionTerms(res);
        }
        if (!this.validateReturnedQuote(res.data)) {
            throw ValidationError.invalidReturnedQuoteError();
        }
        return this.getTCbsSendMoneyResponse(res.data);
    }

    private async checkAndRespondToConversionTerms(res: THttpResponse<TSDKOutboundTransferResponse>): Promise<TCbsSendMoneyResponse> {
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

    private validateConversionTerms(transferRes: TSDKOutboundTransferResponse): boolean {
        this.logger.info(`Validating Conversion Terms with transfer response amount${transferRes.amount}`);
        let result = true;
        if (
            !(this.cbsConfig.X_CURRENCY === transferRes.fxQuotesResponse?.body.conversionTerms.sourceAmount.currency)
        ) {
            result = false;
        }
        if (transferRes.amountType === 'SEND') {
            if (!(transferRes.amount === transferRes.fxQuotesResponse?.body.conversionTerms.sourceAmount.amount)) {
                result = false;
            }
            if (!transferRes.to.supportedCurrencies) {
                throw SDKClientError.genericQuoteValidationError("Payee Supported Currency not defined", { httpCode: 500, mlCode: "4000" });
            }
            if (!transferRes.to.supportedCurrencies.some(value => value === transferRes.quoteResponse?.body.transferAmount.currency)) {
                result = false;
            }
            if (!(transferRes.currency === transferRes.fxQuotesResponse?.body.conversionTerms.sourceAmount.currency)) {
                result = false;
            }
        } else if (transferRes.amountType === 'RECEIVE') {
            if (!(transferRes.amount === transferRes.fxQuotesResponse?.body.conversionTerms.targetAmount.amount)) {
                result = false;
            }
            if (!(transferRes.currency === transferRes.quoteResponse?.body.transferAmount.currency)) {
                result = false;
            }
            if (transferRes.fxQuotesResponse) {
                if (!transferRes.from.supportedCurrencies) {
                    throw ValidationError.unsupportedCurrencyError();
                }
                if (!(transferRes.from.supportedCurrencies.some(value => value === transferRes.fxQuotesResponse?.body.conversionTerms.targetAmount.currency))) {
                    result = false;
                }
            }
        }
        return result;
    }

    private validateReturnedQuote(outboundTransferRes: TSDKOutboundTransferResponse): boolean {
        this.logger.info(`Validating Retunred Quote with transfer response amount${outboundTransferRes.amount}`);
        let result = true;
        if (!this.validateConversionTerms(outboundTransferRes)) {
            result = false;
        }
        const quoteResponseBody = outboundTransferRes.quoteResponse?.body;
        const fxQuoteResponseBody = outboundTransferRes.fxQuotesResponse?.body
        if (!quoteResponseBody) {
            throw SDKClientError.noQuoteReturnedError();
        }
        if (outboundTransferRes.amountType === "SEND") {
            if (!(parseFloat(outboundTransferRes.amount) === parseFloat(quoteResponseBody.transferAmount.amount) - parseFloat(quoteResponseBody.payeeFspCommission?.amount || "0"))) {
                result = false;
            }
            if (!quoteResponseBody.payeeReceiveAmount) {
                throw SDKClientError.genericQuoteValidationError("Payee Receive Amount not defined", { httpCode: 500, mlCode: "4000" });
            }
            if (!(parseFloat(quoteResponseBody.payeeReceiveAmount.amount) === parseFloat(quoteResponseBody.transferAmount.amount) - parseFloat(quoteResponseBody.payeeFspCommission?.amount || '0'))) {
                result = false;
            }
            if (!(fxQuoteResponseBody?.conversionTerms.targetAmount.amount === quoteResponseBody.transferAmount.amount)) {
                result = false;
            }
        } else if (outboundTransferRes.amountType === "RECEIVE") {
            if (!outboundTransferRes.quoteResponse) {
                throw SDKClientError.noQuoteReturnedError();
            }
            if (!(parseFloat(outboundTransferRes.amount) === parseFloat(quoteResponseBody.transferAmount.amount) - parseFloat(quoteResponseBody.payeeFspCommission?.amount || "0") + parseFloat(quoteResponseBody.payeeFspFee?.amount || "0"))) {
                result = false;
            }

            if (!(quoteResponseBody.payeeReceiveAmount?.amount === quoteResponseBody.transferAmount.amount)) {
                result = false;
            }
            if (fxQuoteResponseBody) {
                if (!(fxQuoteResponseBody.conversionTerms.targetAmount.amount === quoteResponseBody.transferAmount.amount)) {
                    result = false;
                }
            }
        } else {
            SDKClientError.genericQuoteValidationError("Invalid amountType received", { httpCode: 500, mlCode: "4000" });
        }
        return result;
    }

    private getTCbsSendMoneyResponse(transfer: TSDKOutboundTransferResponse): TCbsSendMoneyResponse {
        this.logger.info(`Getting response for transfer with Id ${transfer.transferId}`);
        return {
            "payeeDetails": {
                "idType": transfer.to.idType,
                "idValue": transfer.to.idValue,
                "fspId": transfer.to.fspId !== undefined ? transfer.to.fspId : "No FSP ID Returned",
                "firstName": transfer.to.firstName !== undefined ? transfer.to.firstName : "No First Name Returned",
                "lastName": transfer.to.lastName !== undefined ? transfer.to.lastName : "No Last Name Returned",
                "dateOfBirth": transfer.to.dateOfBirth !== undefined ? transfer.to.dateOfBirth : "No Date of Birth Returned",
            },
            "receiveAmount": transfer.quoteResponse?.body.payeeReceiveAmount?.amount !== undefined ? transfer.quoteResponse.body.payeeReceiveAmount.amount : "No payee receive amount",
            "receiveCurrency": transfer.fxQuotesResponse?.body.conversionTerms.targetAmount.currency !== undefined ? transfer.fxQuotesResponse?.body.conversionTerms.targetAmount.currency : "No Currency returned from Mojaloop Connector",
            "fees": transfer.quoteResponse?.body.payeeFspFee?.amount !== undefined ? transfer.quoteResponse?.body.payeeFspFee?.amount : "No fee amount returned from Mojaloop Connector",
            "feeCurrency": transfer.fxQuotesResponse?.body.conversionTerms.targetAmount.currency !== undefined ? transfer.fxQuotesResponse?.body.conversionTerms.targetAmount.currency : "No Fee currency retrned from Mojaloop Connector",
            "transactionId": transfer.transferId !== undefined ? transfer.transferId : "No transferId returned",
        };
    }

    private async getTSDKOutboundTransferRequest(transfer: TCbsSendMoneyRequest): Promise<TSDKOutboundTransferRequest> {
        const res = await this.nbmClient.getKyc({
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
        return await this.nbmClient.collectMoney(this.getTCbsCollectMoneyRequest(updateSendMoneyDeps, transferId));
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

    async handleCallback(payload: TCallbackRequest): Promise<void> {
        this.logger.info(`Handling callback for transaction with id ${payload.transaction.id}`);
        try {
            if (payload.transaction.status_code === "TS") {
                await this.sdkClient.updateTransfer({ acceptQuote: true }, payload.transaction.id);
            } else {
                await this.sdkClient.updateTransfer({ acceptQuote: false }, payload.transaction.id);
            }
        } catch (error: unknown) {
            if (error instanceof SDKClientError) {
                // perform refund or rollback
                // const rollbackRes = await this.cbsClient.refundMoney();
            }
        }
    }
}
