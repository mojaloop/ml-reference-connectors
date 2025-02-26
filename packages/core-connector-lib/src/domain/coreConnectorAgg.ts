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

import { randomUUID } from 'crypto';
import {
    ICbsClient,
    TCallbackRequest,
    TCbsCollectMoneyRequest,
    TCbsCollectMoneyResponse,
    TCBSConfig,
    TCbsDisbursementRequestBody,
    TCbsDisbursementResponse,
    TCbsKycResponse,
    TCbsRefundMoneyRequest,
    TCbsSendMoneyRequest,
    TCbsSendMoneyResponse,
    TCBSUpdateSendMoneyRequest,
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
    TPayeeExtensionListEntry,
    TPayerExtensionListEntry,
    TValidationResponse,
} from './interfaces';
import {
    ISDKClient,
    SDKClientError,
    TSDKOutboundTransferRequest,
    TSDKOutboundTransferResponse,
    TtransferContinuationResponse,
} from './SDKClient';
import config from '../config';

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
        this.IdType = this.cbsConfig.SUPPORTED_ID_TYPE;
        this.logger = logger;
    }

    //Payee
    async getParties(id: string, IdType: string): Promise<Party> {
        this.logger.info(`Getting party information for ${id}`);
        if (!(IdType === this.cbsConfig.SUPPORTED_ID_TYPE)) {
            throw ValidationError.unsupportedIdTypeError();
        }
        const res = await this.cbsClient.getKyc({ msisdn: id });
        return this.getPartiesResponse(res);
    }

    private getPartiesResponse(res: TCbsKycResponse): Party {
        return {
            idType: "MSISDN",
            idValue: res.data.msisdn,
            extensionList: this.getGetPartiesExtensionList(),
            displayName: `${res.data.first_name} ${res.data.last_name}`,
            firstName: res.data.first_name,
            middleName: res.data.first_name,
            type: "CONSUMER",
            kycInformation: JSON.stringify(res.data),
            lastName: res.data.last_name,
            supportedCurrencies: this.cbsConfig.X_CURRENCY,
        };
    }

    private getGetPartiesExtensionList(): TPayeeExtensionListEntry[] {
        return [
            {
                "key": "Rpt.UpdtdPtyAndAcctId.Agt.FinInstnId.LEI",
                "value": config.get("cbs.LEI")
            },
            {
                "key": "Rpt.UpdtdPtyAndAcctId.Pty.PstlAdr.AdrTp.Cd",
                "value": "Not Provided by CBS"
            },
            {
                "key": "Rpt.UpdtdPtyAndAcctId.Pty.PstlAdr.Dept",
                "value": "Not Provided by CBS"
            },
            {
                "key": "Rpt.UpdtdPtyAndAcctId.Pty.PstlAdr.SubDept",
                "value": "Not Provided by CBS"
            },
            {
                "key": "Rpt.UpdtdPtyAndAcctId.Pty.PstlAdr.StrtNm",
                "value": "Not Provided by CBS"
            },
            {
                "key": "Rpt.UpdtdPtyAndAcctId.Pty.PstlAdr.BldgNb",
                "value": "Not Provided by CBS"
            },
            {
                "key": "Rpt.UpdtdPtyAndAcctId.Pty.PstlAdr.BldgNm",
                "value": "Not Provided by CBS"
            },
            {
                "key": "Rpt.UpdtdPtyAndAcctId.Pty.PstlAdr.Flr",
                "value": "Not Provided by CBS"
            },
            {
                "key": "Rpt.UpdtdPtyAndAcctId.Pty.PstlAdr.PstBx",
                "value": "Not Provided by CBS"
            },
            {
                "key": "Rpt.UpdtdPtyAndAcctId.Pty.PstlAdr.Room",
                "value": "Not Provided by CBS"
            },
            {
                "key": "Rpt.UpdtdPtyAndAcctId.Pty.PstlAdr.PstCd",
                "value": "Not Provided by CBS"
            },
            {
                "key": "Rpt.UpdtdPtyAndAcctId.Pty.PstlAdr.TwnNm",
                "value": "Not Provided by CBS"
            },
            {
                "key": "Rpt.UpdtdPtyAndAcctId.Pty.PstlAdr.TwnLctnNm",
                "value": "Not Provided by CBS"
            },
            {
                "key": "Rpt.UpdtdPtyAndAcctId.Pty.PstlAdr.DstrctNm",
                "value": "Not Provided by CBS"
            },
            {
                "key": "Rpt.UpdtdPtyAndAcctId.Pty.PstlAdr.CtrySubDvsn",
                "value": "Not Provided by CBS"
            },
            {
                "key": "Rpt.UpdtdPtyAndAcctId.Pty.PstlAdr.Ctry",
                "value": config.get("cbs.X_COUNTRY")
            },
            {
                "key": "Rpt.UpdtdPtyAndAcctId.Pty.PstlAdr.AdrLine",
                "value": "Not Provided by CBS"
            },
            {
                "key": "Rpt.UpdtdPtyAndAcctId.Pty.CtryOfRes",
                "value": config.get("cbs.X_COUNTRY")
            }
        ]
    }

    async quoteRequest(quoteRequest: TQuoteRequest): Promise<TQuoteResponse> {
        this.logger.info(`Calculating quote for ${quoteRequest.to.idValue} and amount ${quoteRequest.amount}`);
        if (quoteRequest.to.idType !== this.cbsConfig.SUPPORTED_ID_TYPE) {
            throw ValidationError.unsupportedIdTypeError();
        }
        if (quoteRequest.currency !== this.cbsConfig.X_CURRENCY) {
            throw ValidationError.unsupportedCurrencyError();
        }
        if (!this.checkQuoteExtensionLists(quoteRequest)) {
            this.logger.warn("Some extensionLists are undefined. Checks Failed", quoteRequest);
        }
        const res = await this.cbsClient.getKyc({ msisdn: quoteRequest.to.idValue });
        const fees = (Number(this.cbsConfig.SENDING_SERVICE_CHARGE) / 100) * Number(quoteRequest.amount);
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
            'extensionList': this.getQuoteResponseExtensionList(deps.quoteRequest),
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
        };
    }

    private checkQuoteExtensionLists(quoteRequest: TQuoteRequest): boolean {
        return !!(quoteRequest.to.extensionList && quoteRequest.from.extensionList && quoteRequest.to.extensionList.length > 0 && quoteRequest.from.extensionList.length > 0)
    }

    private getQuoteResponseExtensionList(quoteRequest: TQuoteRequest): TPayeeExtensionListEntry[] {
        let newExtensionList: TPayeeExtensionListEntry[] = [];

        if (quoteRequest.extensionList) {
            newExtensionList.push(...quoteRequest.extensionList);
        }

        if (quoteRequest.from.extensionList) {
            newExtensionList.push(...quoteRequest.from.extensionList);
        }

        if (quoteRequest.to.extensionList) {
            newExtensionList.push(...quoteRequest.to.extensionList);
        }
        return newExtensionList;
    }

    async receiveTransfer(transfer: TtransferRequest): Promise<TtransferResponse> {
        this.logger.info(`Received transfer request for ${transfer.to.idValue}`);
        if (transfer.to.idType != this.IdType) {
            throw ValidationError.unsupportedIdTypeError();
        }
        if (transfer.currency !== this.cbsConfig.X_CURRENCY) {
            throw ValidationError.unsupportedCurrencyError();
        }
        if (!this.checkPayeeTransfersExtensionLists(transfer)) {
            this.logger.warn("Some extensionLists are undefined; Checks Failed", transfer);
        }
        const validateQuoteRes = this.validateQuote(transfer);
        if (!validateQuoteRes.result) {
            throw ValidationError.invalidQuoteError(validateQuoteRes.message.toString());
        }
        await this.checkAccountBarred(transfer.to.idValue);
        return {
            completedTimestamp: new Date().toJSON(),
            homeTransactionId: transfer.transferId,
            transferState: 'RESERVED',
        };
    }

    private checkPayeeTransfersExtensionLists(transfer: TtransferRequest): boolean {
        return !!(transfer.to.extensionList && transfer.from.extensionList && transfer.to.extensionList.length > 0 && transfer.from.extensionList.length > 0);
    }


    private validateQuote(transfer: TtransferRequest): TValidationResponse {
        this.logger.info(`Validating quote for transfer with amount ${transfer.amount}`);
        let result = true;
        const message: string[] = [];
        if (transfer.amountType === 'SEND') {
            const checkSendAmountRes = this.checkSendAmounts(transfer);
            if (!checkSendAmountRes.result) {
                result = false;
                message.push(...checkSendAmountRes.message);
            }
        } else if (transfer.amountType === 'RECEIVE') {
            const checkReceiveAmounts = this.checkReceiveAmounts(transfer);
            if (!checkReceiveAmounts.result) {
                result = false;
                message.push(...checkReceiveAmounts.message);
            }
        }
        return { result, message };
    }

    private checkSendAmounts(transfer: TtransferRequest): TValidationResponse {
        this.logger.info('Validating Type Send Quote...', { transfer });
        let result = true;
        const message: string[] = []
        if (
            parseFloat(transfer.amount) !==
            parseFloat(transfer.quote.transferAmount) - parseFloat(transfer.quote.payeeFspCommissionAmount || '0')
            // POST /transfers request.amount == request.quote.transferAmount - request.quote.payeeFspCommissionAmount
        ) {
            result = false;
            message.push(`transfer.amount ${transfer.amount} did not equal transfer.quote.transferAmount ${transfer.quote.transferAmount} minus transfer.quote.payeeFspCommissionAmount ${transfer.quote.payeeFspCommissionAmount} `)
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
            message.push(`transfer.quote.payeeReceiveAmount ${transfer.quote.payeeReceiveAmount} is equal to transfer.quote.transferAmount ${transfer.quote.transferAmount} minus transfer.quote.payeeFspFeeAmount ${transfer.quote.payeeFspFeeAmount} `)
        }
        return { result, message };
    }

    private checkReceiveAmounts(transfer: TtransferRequest): TValidationResponse {
        this.logger.info('Validating Type Receive Quote...', { transfer });
        let result = true;
        const message: string[] = []
        if (!transfer.quote.payeeFspFeeAmount || !transfer.quote.payeeReceiveAmount) {
            throw ValidationError.notEnoughInformationError("transfer.quote.payeeFspFeeAmount or transfer.quote.payeeReceiveAmount not defined", "5000");
        }
        if (
            parseFloat(transfer.amount) !==
            parseFloat(transfer.quote.transferAmount) -
            parseFloat(transfer.quote.payeeFspCommissionAmount || '0') +
            parseFloat(transfer.quote.payeeFspFeeAmount)
        ) {
            result = false;
            message.push(`transfer.amount ${transfer.amount} is equal to transfer.quote.transferAmount ${transfer.quote.transferAmount} minus transfer.quote.payeeFspCommissionAmount || 0 ${transfer.quote.payeeFspCommissionAmount} plus transfer.quote.payeeFspFeeAmount ${transfer.quote.payeeFspFeeAmount}`)
        }

        if (parseFloat(transfer.quote.payeeReceiveAmount) !== parseFloat(transfer.quote.transferAmount)) {
            result = false;
            message.push(`transfer.quote.payeeReceiveAmount ${transfer.quote.payeeReceiveAmount} is equal to transfer.quote.transferAmount ${transfer.quote.transferAmount}`);
        }
        return { result, message };
    }

    private async checkAccountBarred(msisdn: string): Promise<void> {
        const res = await this.cbsClient.getKyc({ msisdn: msisdn });
        if (res.data.is_barred) {
            throw ValidationError.accountBarredError();
        }
    }

    async updateTransfer(updateTransferPayload: TtransferPatchNotificationRequest, transferId: string): Promise<void> {
        this.logger.info(`Committing transfer on patch notification for ${updateTransferPayload.quoteRequest?.body.payee.partyIdInfo.partyIdentifier} and transfer id ${transferId}`);
        if (updateTransferPayload.currentState !== 'COMPLETED') {
            throw ValidationError.transferNotCompletedError();
        }
        const makePaymentRequest: TCbsDisbursementRequestBody = this.getMakePaymentRequestBody(updateTransferPayload);
        try {
            await this.cbsClient.sendMoney(makePaymentRequest);
        } catch (error: unknown) {
            await this.initiateCompensationAction(makePaymentRequest);
        }
    }

    private async initiateCompensationAction(req: TCbsDisbursementRequestBody) {
        this.logger.error("Failed to make transfer to customer", { request: req });
        await this.cbsClient.logFailedIncomingTransfer(req);
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
        };
    }

    // Payer
    async sendMoney(transfer: TCbsSendMoneyRequest, amountType: "SEND" | "RECEIVE"): Promise<TCbsSendMoneyResponse> {
        this.logger.info(`Received send money request for payer with ID ${transfer.payer.payerId}`);
        const res = await this.sdkClient.initiateTransfer(await this.getTSDKOutboundTransferRequest(transfer, amountType));
        if (res.data.currentState === "WAITING_FOR_CONVERSION_ACCEPTANCE") {
            return this.handleSendTransferRes(res.data);
        } else if (res.data.currentState === "WAITING_FOR_QUOTE_ACCEPTANCE") {
            return this.handleReceiveTransferRes(res.data);
        } else {
            throw SDKClientError.returnedCurrentStateUnsupported(`Returned currentStateUnsupported. ${res.data.currentState}`, { httpCode: 500, mlCode: "2000" })
        }
    }

    private async handleSendTransferRes(res: TSDKOutboundTransferResponse): Promise<TCbsSendMoneyResponse> {
        /*
            check fxQuote
            respond to conversion terms
            receive response from sdk
            check return quote
            return normalQuote in required format for customer to review 
        */
        let acceptRes: THttpResponse<TtransferContinuationResponse>;
        if (!res.transferId) {
            throw ValidationError.transferIdNotDefinedError("Transfer Id not defined in transfer response", "4000", 500);
        }
        const validateFxRes = this.validateConversionTerms(res);
        if (!validateFxRes.result) {
            acceptRes = await this.sdkClient.updateTransfer({
                "acceptConversion": false
            }, res.transferId);
            throw ValidationError.invalidConversionQuoteError(validateFxRes.message.toString(), "4000", 500);
        }
        acceptRes = await this.sdkClient.updateTransfer({
            "acceptConversion": true
        }, res.transferId);
        const validateQuoteRes = this.validateReturnedQuote(acceptRes.data);
        if (!validateQuoteRes.result) {
            throw ValidationError.invalidReturnedQuoteError(validateQuoteRes.message.toString());
        }
        return this.getTCbsSendMoneyResponse(acceptRes.data);
    }

    private async handleReceiveTransferRes(res: TSDKOutboundTransferResponse): Promise<TCbsSendMoneyResponse> {
        /*
            check returned normalQuote
            respond to quote 
            receive response from sdk
            check fxQuote
            return returned quote in format specified for customer to review 
        */
        let acceptRes: THttpResponse<TtransferContinuationResponse>;
        if (!res.transferId) {
            throw ValidationError.transferIdNotDefinedError("Transfer Id not defined in transfer response", "4000", 500);
        }
        const validateQuoteRes = this.validateReturnedQuote(res);
        if (!validateQuoteRes.result) {
            acceptRes = await this.sdkClient.updateTransfer({
                "acceptQuote": false
            }, res.transferId);
            throw ValidationError.invalidReturnedQuoteError(validateQuoteRes.message.toString());
        }
        acceptRes = await this.sdkClient.updateTransfer({
            "acceptQuote": true
        }, res.transferId);
        const validateFxRes = this.validateConversionTerms(acceptRes.data);
        if (!validateFxRes.result) {
            throw ValidationError.invalidConversionQuoteError(validateFxRes.message.toString(), "4000", 500);
        }
        return this.getTCbsSendMoneyResponse(acceptRes.data);
    }

    private validateConversionTerms(transferRes: TSDKOutboundTransferResponse): TValidationResponse {
        this.logger.info(`Validating Conversion Terms with transfer response amount ${transferRes.amount}`);
        let result = true;
        const message: string[] = [];
        if (
            !(this.cbsConfig.X_CURRENCY === transferRes.fxQuoteResponse?.body.conversionTerms.sourceAmount.currency)
        ) {
            result = false;
            message.push(`cbsConfig.TNM_CURRENCY ${this.cbsConfig.X_CURRENCY} did not match currency returned in transferRes.fxQuotesResponse?.body.conversionTerms.sourceAmount.currency ${transferRes.fxQuoteResponse?.body.conversionTerms.sourceAmount.currency}`);
        }
        if (transferRes.amountType === 'SEND') {
            if (!(transferRes.amount === transferRes.fxQuoteResponse?.body.conversionTerms.sourceAmount.amount)) {
                result = false;
                message.push(`transferRes.amount ${transferRes.amount} did not equal transferRes.fxQuotesResponse?.body.conversionTerms.sourceAmount.amount ${transferRes.fxQuoteResponse?.body.conversionTerms.sourceAmount.amount}}`)
            }
            if (transferRes.to.supportedCurrencies) {
                if (!transferRes.to.supportedCurrencies.some(value => value === transferRes.quoteResponse?.body.transferAmount.currency)) {
                    result = false;
                    message.push(`transferRes.to.supportedCurrencies ${transferRes.to.supportedCurrencies.toString()} did not contain transferRes.quoteResponse?.body.transferAmount.currency ${transferRes.quoteResponse?.body.transferAmount.currency} `)
                }
            }
            if (!(transferRes.currency === transferRes.fxQuoteResponse?.body.conversionTerms.sourceAmount.currency)) {
                result = false;
                message.push(`transferRes.currency ${transferRes.currency} did not equal transferRes.fxQuotesResponse?.body.conversionTerms.sourceAmount.currency ${transferRes.fxQuoteResponse?.body.conversionTerms.sourceAmount.currency}`)
            }
        } else if (transferRes.amountType === 'RECEIVE') {
            if (!(transferRes.amount === transferRes.fxQuoteResponse?.body.conversionTerms.targetAmount.amount)) {
                result = false;
                message.push(`transferRes.amount ${transferRes.amount} did not equal transferRes.fxQuotesResponse?.body.conversionTerms.targetAmount.amount ${transferRes.fxQuoteResponse?.body.conversionTerms.targetAmount.amount}`)
            }
            if (!(transferRes.currency === transferRes.quoteResponse?.body.transferAmount.currency)) {
                result = false;
                message.push(`transferRes.currency ${transferRes.currency} did not equal transferRes.quoteResponse?.body.transferAmount.currency ${transferRes.quoteResponse?.body.transferAmount.currency}`)
            }
        }
        return { result, message };
    }

    private validateReturnedQuote(outboundTransferRes: TSDKOutboundTransferResponse): TValidationResponse {
        this.logger.info(`Validating Retunred Quote with transfer response amount${outboundTransferRes.amount}`);
        let result = true;
        const message: string[] = [];
        if (outboundTransferRes.amountType === "SEND") {
            const validateFxRes = this.validateConversionTerms(outboundTransferRes)
            if (!validateFxRes.result) {
                result = false;
                message.push(...validateFxRes.message)
            }
        }
        const quoteResponseBody = outboundTransferRes.quoteResponse?.body;
        const fxQuoteResponseBody = outboundTransferRes.fxQuoteResponse?.body;
        if (!quoteResponseBody) {
            throw SDKClientError.noQuoteReturnedError();
        }
        if (outboundTransferRes.amountType === "SEND") {
            const quoteRequestAmount: string = outboundTransferRes.fxQuoteResponse?.body?.conversionTerms?.targetAmount?.amount ? outboundTransferRes.fxQuoteResponse?.body?.conversionTerms?.targetAmount?.amount : outboundTransferRes.amount;
            if (!(parseFloat(quoteRequestAmount) === parseFloat(quoteResponseBody.transferAmount.amount) - parseFloat(quoteResponseBody.payeeFspCommission?.amount || "0"))) {
                result = false;
                message.push(`outboundTransferRes.amount ${outboundTransferRes.amount} did not equal quoteResponseBody.transferAmount.amount ${quoteResponseBody.transferAmount.amount} minus quoteResponseBody.payeeFspCommission?.amount ${quoteResponseBody.payeeFspCommission?.amount}`)
            }
            if (!quoteResponseBody.payeeReceiveAmount) {
                throw SDKClientError.genericQuoteValidationError("Payee Receive Amount not defined", { httpCode: 500, mlCode: "4000" });
            }
            if (!(parseFloat(quoteResponseBody.payeeReceiveAmount.amount) === parseFloat(quoteResponseBody.transferAmount.amount) - parseFloat(quoteResponseBody.payeeFspCommission?.amount || '0'))) {
                result = false;
                message.push(`quoteResponseBody.payeeReceiveAmount.amount ${quoteResponseBody.payeeReceiveAmount.amount} did not equal quoteResponseBody.transferAmount.amount ${quoteResponseBody.transferAmount.amount} minus quoteResponseBody.payeeFspCommission?.amount ${quoteResponseBody.payeeFspCommission?.amount}`)
            }
            if (!(fxQuoteResponseBody?.conversionTerms.targetAmount.amount === quoteResponseBody.transferAmount.amount)) {
                result = false;
                message.push(`fxQuoteResponseBody?.conversionTerms.targetAmount.amount ${fxQuoteResponseBody?.conversionTerms.targetAmount.amount} did not equal quoteResponseBody.transferAmount.amount ${quoteResponseBody.transferAmount.amount}`)
            }
        } else if (outboundTransferRes.amountType === "RECEIVE") {
            if (!outboundTransferRes.quoteResponse) {
                throw SDKClientError.noQuoteReturnedError();
            }
            if (!(parseFloat(outboundTransferRes.amount) === parseFloat(quoteResponseBody.transferAmount.amount) - parseFloat(quoteResponseBody.payeeFspCommission?.amount || "0") + parseFloat(quoteResponseBody.payeeFspFee?.amount || "0"))) {
                result = false;
                message.push(`outboundTransferRes.amount ${outboundTransferRes.amount} did not equal quoteResponseBody.transferAmount.amount ${quoteResponseBody.transferAmount.amount} minus quoteResponseBody.payeeFspCommission?.amount ${quoteResponseBody.payeeFspCommission?.amount} plus quoteResponseBody.payeeFspFee?.amount ${quoteResponseBody.payeeFspFee?.amount}`)
            }

            if (!(quoteResponseBody.payeeReceiveAmount?.amount === quoteResponseBody.transferAmount.amount)) {
                result = false;
                message.push(`quoteResponseBody.payeeReceiveAmount?.amount ${quoteResponseBody.payeeReceiveAmount?.amount} did not equal quoteResponseBody.transferAmount.amount ${quoteResponseBody.transferAmount.amount}`)
            }
            if (fxQuoteResponseBody) {
                if (!(fxQuoteResponseBody.conversionTerms.targetAmount.amount === quoteResponseBody.transferAmount.amount)) {
                    result = false;
                    message.push(`fxQuoteResponseBody.conversionTerms.targetAmount.amount ${fxQuoteResponseBody.conversionTerms.targetAmount.amount} did not equal quoteResponseBody.transferAmount.amount ${quoteResponseBody.transferAmount.amount}`)
                }
            }
        } else {
            SDKClientError.genericQuoteValidationError("Invalid amountType received", { httpCode: 500, mlCode: "4000" });
        }
        return { result, message };
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
            "receiveCurrency": transfer.fxQuoteResponse?.body.conversionTerms.targetAmount.currency !== undefined ? transfer.fxQuoteResponse?.body.conversionTerms.targetAmount.currency : "No Currency returned from Mojaloop Connector",
            "fees": transfer.quoteResponse?.body.payeeFspFee?.amount !== undefined ? transfer.quoteResponse?.body.payeeFspFee?.amount : "No fee amount returned from Mojaloop Connector",
            "feeCurrency": transfer.fxQuoteResponse?.body.conversionTerms.targetAmount.currency !== undefined ? transfer.fxQuoteResponse?.body.conversionTerms.targetAmount.currency : "No Fee currency retrned from Mojaloop Connector",
            "transactionId": transfer.transferId !== undefined ? transfer.transferId : "No transferId returned",
        };
    }

    private async getTSDKOutboundTransferRequest(transfer: TCbsSendMoneyRequest, amountType: "SEND" | "RECEIVE"): Promise<TSDKOutboundTransferRequest> {
        const res = await this.cbsClient.getKyc({
            msisdn: transfer.payer.payerId
        });
        return {
            'homeTransactionId': randomUUID(),
            'from': {
                'idType': this.cbsConfig.SUPPORTED_ID_TYPE,
                'idValue': transfer.payer.payerId,
                'fspId': this.cbsConfig.FSP_ID,
                "displayName": `${res.data.first_name} ${res.data.last_name}`,
                "firstName": res.data.first_name,
                "middleName": res.data.first_name,
                "lastName": res.data.last_name,
                "extensionList": this.getOutboundTransferExtensionList(transfer),
                "supportedCurrencies": [this.cbsConfig.X_CURRENCY]
            },
            'to': {
                'idType': transfer.payeeIdType,
                'idValue': transfer.payeeId
            },
            'amountType': amountType,
            'currency': transfer.sendCurrency,
            'amount': transfer.sendAmount,
            'transactionType': transfer.transactionType,
        };
    }

    private getOutboundTransferExtensionList(sendMoneyRequestPayload: TCbsSendMoneyRequest): TPayerExtensionListEntry[] | undefined {
        if (sendMoneyRequestPayload.payer.DateAndPlaceOfBirth) {
            return [
                {
                    "key": "CdtTrfTxInf.Dbtr.PrvtId.DtAndPlcOfBirth.BirthDt",
                    "value": sendMoneyRequestPayload.payer.DateAndPlaceOfBirth.BirthDt
                },
                {
                    "key": "CdtTrfTxInf.Dbtr.PrvtId.DtAndPlcOfBirth.PrvcOfBirth",
                    "value": sendMoneyRequestPayload.payer.DateAndPlaceOfBirth.PrvcOfBirth ? "Not defined" : sendMoneyRequestPayload.payer.DateAndPlaceOfBirth.PrvcOfBirth
                },
                {
                    "key": "CdtTrfTxInf.Dbtr.PrvtId.DtAndPlcOfBirth.CityOfBirth",
                    "value": sendMoneyRequestPayload.payer.DateAndPlaceOfBirth.CityOfBirth
                },
                {
                    "key": "CdtTrfTxInf.Dbtr.PrvtId.DtAndPlcOfBirth.CtryOfBirth",
                    "value": sendMoneyRequestPayload.payer.DateAndPlaceOfBirth.CtryOfBirth
                }
            ];
        }
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
                // perform refund or rollback if payment was successful
                if (payload.transaction.status_code === "TS") {
                    await this.handleRefund(this.getRefundRequestBody(payload));
                }
            }
        }
    }

    private async handleRefund(refund: TCbsRefundMoneyRequest): Promise<void> {
        try {
            await this.cbsClient.refundMoney(refund);
        } catch (error: unknown) {
            this.cbsClient.logFailedRefund(refund.transaction.airtel_money_id);
        }
    }

    private getRefundRequestBody(callbackPayload: TCallbackRequest): TCbsRefundMoneyRequest {
        return {
            "transaction": {
                "airtel_money_id": callbackPayload.transaction.airtel_money_id
            }
        }
    }
}
