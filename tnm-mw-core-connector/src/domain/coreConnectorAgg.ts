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

import { randomUUID } from 'node:crypto';
import config from '../config';
import {
    ITNMClient,
    PartyType,
    TMakePaymentRequest,
    TNMCallbackPayload,
    TNMConfig,
    TNMError,
    TNMInvoiceRequest,
    TNMInvoiceResponse,
    TNMSendMoneyRequest,
    TNMSendMoneyResponse,
    TNMUpdateSendMoneyRequest,
    TnmValidateResponse,
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
    ValidationError,
    THttpResponse,
    TPayeeExtensionListEntry,
    TPayerExtensionListEntry,
    Payee,
    TValidationResponse,
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
        readonly tnmClient: ITNMClient,
        readonly tnmConfig: TNMConfig,
        logger: ILogger,
    ) {
        // todo: set the IdType from here
        this.IdType = "MSISDN";
        this.logger = logger;
    }

    //Payee
    async getParties(id: string, idType: string): Promise<TLookupPartyInfoResponse> {
        this.logger.info(`Get Parties for ${id}`);
        if (!(idType === this.tnmClient.tnmConfig.SUPPORTED_ID_TYPE)) {
            throw ValidationError.unsupportedIdTypeError();
        }

        const lookupRes = await this.tnmClient.getKyc({ msisdn: id });
        const party = {
            data: this.getPartiesResponseDTO(lookupRes, id),
            statusCode: 200,
        };
        this.logger.info(`Party found`, { party });
        return party;
    }

    private getPartiesResponseDTO(lookupRes: TnmValidateResponse, id: string): Payee {
        return {
            displayName: `${lookupRes.data.full_name}`,
            firstName: lookupRes.data.full_name,
            idType: this.tnmClient.tnmConfig.SUPPORTED_ID_TYPE,
            extensionList: this.getGetPartiesExtensionList(),
            idValue: id,
            lastName: lookupRes.data.full_name,
            middleName: lookupRes.data.full_name,
            type: PartyType.CONSUMER,
            kycInformation: `${JSON.stringify(lookupRes)}`,
            supportedCurrencies: config.get("tnm.TNM_CURRENCY")
        };
    }

    private getGetPartiesExtensionList(): TPayeeExtensionListEntry[] {
        return [
            {
                "key": "Rpt.UpdtdPtyAndAcctId.Agt.FinInstnId.LEI",
                "value": config.get("tnm.LEI")
            },
            {
                "key": "Rpt.UpdtdPtyAndAcctId.Pty.PstlAdr.Ctry",
                "value": "Malawi"
            },
            {
                "key": "Rpt.UpdtdPtyAndAcctId.Pty.CtryOfRes",
                "value": "Malawi"
            }
        ];
    }

    async quoteRequest(quoteRequest: TQuoteRequest): Promise<TQuoteResponse> {
        this.logger.info(`Quote requests for ${this.IdType} ${quoteRequest.to.idValue}`);

        if (!this.checkQuoteExtensionLists(quoteRequest)) {
            this.logger.warn("Some extensionLists are undefined. Checks Failed", quoteRequest);
        }

        if (quoteRequest.to.idType !== this.IdType) {
            throw ValidationError.unsupportedIdTypeError();
        }

        if (quoteRequest.currency !== config.get("tnm.TNM_CURRENCY")) {
            throw ValidationError.unsupportedCurrencyError();
        }

        const res = await this.tnmClient.getKyc({
            msisdn: quoteRequest.to.idValue,
        });
        //TODO: Implement bar checking
        if (res.message != "Completed successfully") {
            throw TNMError.payeeBlockedError("Account is barred ", 500, "5400");
        }

        const serviceChargePercentage = Number(config.get("tnm.SENDING_SERVICE_CHARGE"));
        const fees = serviceChargePercentage / 100 * Number(quoteRequest.amount);

        await this.checkAccountBarred(quoteRequest.to.idValue);

        const quoteExpiration = config.get("tnm.EXPIRATION_DURATION");
        const expiration = new Date();
        expiration.setHours(expiration.getHours() + Number(quoteExpiration));
        const expirationJSON = expiration.toJSON();

        return {
            expiration: expirationJSON,
            extensionList: this.getQuoteResponseExtensionList(quoteRequest),
            payeeFspCommissionAmount: '0',
            payeeFspCommissionAmountCurrency: quoteRequest.currency,
            payeeFspFeeAmount: fees.toString(),
            payeeFspFeeAmountCurrency: quoteRequest.currency,
            payeeReceiveAmount: quoteRequest.amount,
            payeeReceiveAmountCurrency: quoteRequest.currency,
            quoteId: quoteRequest.quoteId,
            transactionId: quoteRequest.transactionId,
            transferAmount: (Number(quoteRequest.amount) + fees).toString(),
            transferAmountCurrency: quoteRequest.currency,
        };
    }

    private checkQuoteExtensionLists(quoteRequest: TQuoteRequest): boolean {
        return !!(quoteRequest.extensionList && quoteRequest.extensionList.length > 0);
    }

    //TODO: Check actual response for barred accounts
    private async checkAccountBarred(msisdn: string): Promise<void> {
        const res = await this.tnmClient.getKyc({ msisdn: msisdn });
        if (res.message != "Completed successfully") {
            throw ValidationError.accountBarredError();
        }
    }

    private getQuoteResponseExtensionList(quoteRequest: TQuoteRequest): TPayeeExtensionListEntry[] {
        this.logger.info(`QuoteRequest ${quoteRequest}`);
        return [
            ...this.getGetPartiesExtensionList()
        ];
    }

    async receiveTransfer(transfer: TtransferRequest): Promise<TtransferResponse> {
        this.logger.info(`Received transfer request for ${transfer.to.idValue}`);
        if (transfer.to.idType != this.IdType) {
            throw ValidationError.unsupportedIdTypeError();
        }

        if (transfer.currency !== config.get("tnm.TNM_CURRENCY")) {
            this.logger.error("Unsupported currency ", { currency: transfer.currency });
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

    private checkPayeeKYCInformation(res: TSDKOutboundTransferResponse | TtransferContinuationResponse): boolean {
        return !!(res.quoteResponse?.body.extensionList?.extension && res.quoteResponse?.body.extensionList?.extension.length > 0);
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
        const message: string[] = [];
        if (
            parseFloat(transfer.amount) !==
            parseFloat(transfer.quote.transferAmount) - parseFloat(transfer.quote.payeeFspCommissionAmount || '0')
            // POST /transfers request.amount == request.quote.transferAmount - request.quote.payeeFspCommissionAmount
        ) {
            result = false;
            message.push(`transfer.amount ${transfer.amount} did not equal transfer.quote.transferAmount ${transfer.quote.transferAmount} minus transfer.quote.payeeFspCommissionAmount ${transfer.quote.payeeFspCommissionAmount} `);
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
            message.push(`transfer.quote.payeeReceiveAmount ${transfer.quote.payeeReceiveAmount} is equal to transfer.quote.transferAmount ${transfer.quote.transferAmount} minus transfer.quote.payeeFspFeeAmount ${transfer.quote.payeeFspFeeAmount} `);
        }
        return { result, message };
    }

    private checkReceiveAmounts(transfer: TtransferRequest): TValidationResponse {
        this.logger.info('Validating Type Receive Quote...', { transfer });
        let result = true;
        const message: string[] = [];
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
            message.push(`transfer.amount ${transfer.amount} is equal to transfer.quote.transferAmount ${transfer.quote.transferAmount} minus transfer.quote.payeeFspCommissionAmount || 0 ${transfer.quote.payeeFspCommissionAmount} plus transfer.quote.payeeFspFeeAmount ${transfer.quote.payeeFspFeeAmount}`);
        }

        if (parseFloat(transfer.quote.payeeReceiveAmount) !== parseFloat(transfer.quote.transferAmount)) {
            result = false;
            message.push(`transfer.quote.payeeReceiveAmount ${transfer.quote.payeeReceiveAmount} is equal to transfer.quote.transferAmount ${transfer.quote.transferAmount}`);
        }
        return { result, message };
    }


    async updateTransfer(updateTransferPayload: TtransferPatchNotificationRequest, transferId: string): Promise<void> {
        this.logger.info(`Committing transfer on patch notification for ${updateTransferPayload.quoteRequest?.body.payee.partyIdInfo.partyIdentifier} and transfer id ${transferId}`);
        if (updateTransferPayload.currentState !== 'COMPLETED') {
            throw ValidationError.transferNotCompletedError();
        }
        const makePaymentRequest: TMakePaymentRequest = this.getMakePaymentRequestBody(updateTransferPayload);
        try {
            await this.tnmClient.sendMoney(makePaymentRequest);
        } catch (error: unknown) {
            await this.initiateCompensationAction(makePaymentRequest);
        }
    }

    private async initiateCompensationAction(req: TMakePaymentRequest) {
        this.logger.error("Failed to make transfer to customer", { request: req });
        await this.tnmClient.logFailedIncomingTransfer(req);
    }

    private getMakePaymentRequestBody(requestBody: TtransferPatchNotificationRequest): TMakePaymentRequest {
        if (!requestBody.quoteRequest) {
            throw ValidationError.quoteNotDefinedError('Quote Not Defined Error', '5000', 500);
        }

        return {
            "msisdn": requestBody.quoteRequest.body.payee.partyIdInfo.partyIdentifier,
            "amount": requestBody.quoteRequest.body.amount.amount,
            "transaction_id": requestBody.quoteRequest.body.transactionId,
            "narration": requestBody.quoteRequest.body.note !== undefined ? requestBody.quoteRequest.body.note : "No note returned"
        };
    }

    // Payer
    async sendMoney(transfer: TNMSendMoneyRequest, amountType: "SEND" | "RECEIVE"): Promise<TNMSendMoneyResponse> {
        this.logger.info(`Received send money request for payer with ID ${transfer.payer.payerId}`);
        const res = await this.sdkClient.initiateTransfer(await this.getTSDKOutboundTransferRequest(transfer, amountType));
        if (res.data.currentState === "WAITING_FOR_CONVERSION_ACCEPTANCE") {
            return this.handleSendTransferRes(res.data);
        } else if (res.data.currentState === "WAITING_FOR_QUOTE_ACCEPTANCE") {
            return this.handleReceiveTransferRes(res.data);
        } else {
            throw SDKClientError.returnedCurrentStateUnsupported(`Returned currentStateUnsupported. ${res.data.currentState}`, { httpCode: 500, mlCode: "2000" });
        }
    }

    private async handleSendTransferRes(res: TSDKOutboundTransferResponse): Promise<TNMSendMoneyResponse> {
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

    private async handleReceiveTransferRes(res: TSDKOutboundTransferResponse): Promise<TNMSendMoneyResponse> {
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
        if (!(validateQuoteRes.result && this.checkPayeeKYCInformation(res))) {
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

    private validateConversionTerms(transferResponse: TSDKOutboundTransferResponse): TValidationResponse {
        this.logger.info(`Validating Conversion Terms with transfer response amount ${transferResponse.amount}`);
        let result = true;
        const message = ["Starting Checks"];
        if (
            !(this.tnmConfig.TNM_CURRENCY === transferResponse.fxQuoteResponse?.body.conversionTerms.sourceAmount.currency)
        ) {
            result = false;
            message.push(`tnmConfig.TNM_CURRENCY ${this.tnmConfig.TNM_CURRENCY} did not match currency returned in transferResponse.fxQuotesResponse?.body.conversionTerms.sourceAmount.currency ${transferResponse.fxQuoteResponse?.body.conversionTerms.sourceAmount.currency}`);
        }
        if (transferResponse.amountType === 'SEND') {
            if (!(transferResponse.amount === transferResponse.fxQuoteResponse?.body.conversionTerms.sourceAmount.amount)) {
                result = false;
                message.push(`transferResponse.amount ${transferResponse.amount} did not equal transferResponse.fxQuotesResponse?.body.conversionTerms.sourceAmount.amount ${transferResponse.fxQuoteResponse?.body.conversionTerms.sourceAmount.amount}`);
            }
            if (transferResponse.to.supportedCurrencies) {
                if (!transferResponse.to.supportedCurrencies.some(value => value === transferResponse.quoteResponse?.body.transferAmount.currency)) {
                    result = false;
                    message.push(`transferResponse.to.supportedCurrencies ${transferResponse.to.supportedCurrencies.toString()} does not contain transferResponse.quoteResponse?.body.transferAmount.currency ${transferResponse.quoteResponse?.body.transferAmount.currency}`);
                }
            }
            if (!(transferResponse.currency === transferResponse.fxQuoteResponse?.body.conversionTerms.sourceAmount.currency)) {
                result = false;
                message.push(`transferResponse.currency ${transferResponse.currency} does not equal transferResponse.fxQuotesResponse?.body.conversionTerms.sourceAmount.currency ${transferResponse.fxQuoteResponse?.body.conversionTerms.sourceAmount.currency}`);
            }
        } else if (transferResponse.amountType === 'RECEIVE') {
            if (!(transferResponse.amount === transferResponse.fxQuoteResponse?.body.conversionTerms.targetAmount.amount)) {
                result = false;
                message.push(`transferResponse.amount ${transferResponse.amount} did not equal transferResponse.fxQuotesResponse?.body.conversionTerms.targetAmount.amount ${transferResponse.fxQuoteResponse?.body.conversionTerms.targetAmount.amount}`);
            }
            if (!(transferResponse.currency === transferResponse.quoteResponse?.body.transferAmount.currency)) {
                result = false;
                message.push(`transferResponse.currency ${transferResponse.currency} did not match transferResponse.quoteResponse?.body.transferAmount.currency ${transferResponse.quoteResponse?.body.transferAmount.currency}`);
            }
        }
        return { result, message };
    }

    private validateReturnedQuote(transferResponse: TSDKOutboundTransferResponse): TValidationResponse {
        this.logger.info(`Validating Retunred Quote with transfer response amount ${transferResponse.amount}`);
        let result = true;
        const message = ["Starting Checks"];
        if (transferResponse.amountType === "SEND") {
            const res = this.validateConversionTerms(transferResponse);
            if (!res.result) {
                result = res.result;
                message.push(...res.message);
            }
        }
        const quoteResponseBody = transferResponse.quoteResponse?.body;
        const fxQuoteResponseBody = transferResponse.fxQuoteResponse?.body;
        if (!quoteResponseBody) {
            throw SDKClientError.noQuoteReturnedError();
        }
        if (transferResponse.amountType === "SEND") {
            const quoteRequestAmount: string = transferResponse.fxQuoteResponse?.body?.conversionTerms?.targetAmount?.amount ? transferResponse.fxQuoteResponse?.body?.conversionTerms?.targetAmount?.amount : transferResponse.amount;
            if (!(parseFloat(quoteRequestAmount) === parseFloat(quoteResponseBody.transferAmount.amount) - parseFloat(quoteResponseBody.payeeFspCommission?.amount || "0"))) {
                result = false;
                message.push(`transferResponse.amount ${transferResponse.amount} did not equal quoteResponseBody.transferAmount.amount minus quoteResponseBody.payeeFspCommission?.amount ${quoteResponseBody.payeeFspCommission?.amount}`);
            }
            if (!quoteResponseBody.payeeReceiveAmount) {
                throw SDKClientError.genericQuoteValidationError("Payee Receive Amount not defined", { httpCode: 500, mlCode: "4000" });
            }
            if (!(parseFloat(quoteResponseBody.payeeReceiveAmount.amount) === parseFloat(quoteResponseBody.transferAmount.amount) - parseFloat(quoteResponseBody.payeeFspCommission?.amount || '0'))) {
                result = false;
                message.push(`quoteResponseBody.payeeReceiveAmount.amount ${quoteResponseBody.payeeReceiveAmount.amount} did not equal quoteResponseBody.transferAmount.amount minus quoteResponseBody.payeeFspCommission?.amount ${quoteResponseBody.payeeFspCommission?.amount}`);
            }
            if (!(fxQuoteResponseBody?.conversionTerms.targetAmount.amount === quoteResponseBody.transferAmount.amount)) {
                result = false;
                message.push(`fxQuoteResponseBody?.conversionTerms.targetAmount.amount ${fxQuoteResponseBody?.conversionTerms.targetAmount.amount} did not equal quoteResponseBody.transferAmount.amount ${quoteResponseBody.transferAmount.amount}`);
            }
        } else if (transferResponse.amountType === "RECEIVE") {
            if (!transferResponse.quoteResponse) {
                throw SDKClientError.noQuoteReturnedError();
            }
            if (!(parseFloat(transferResponse.amount) === parseFloat(quoteResponseBody.transferAmount.amount) - parseFloat(quoteResponseBody.payeeFspCommission?.amount || "0") + parseFloat(quoteResponseBody.payeeFspFee?.amount || "0"))) {
                result = false;
                message.push(`transferResponse.amount ${quoteResponseBody.transferAmount.amount} did not equal quoteResponseBody.transferAmount.amount minus quoteResponseBody.payeeFspCommission?.amount plus quoteResponseBody.payeeFspFee?.amount ${quoteResponseBody.payeeFspFee?.amount}`);
            }

            if (!(quoteResponseBody.payeeReceiveAmount?.amount === quoteResponseBody.transferAmount.amount)) {
                result = false;
                message.push(`quoteResponseBody.payeeReceiveAmount?.amount ${quoteResponseBody.payeeReceiveAmount?.amount} did not equal quoteResponseBody.transferAmount.amount ${quoteResponseBody.transferAmount.amount} `);
            }
            if (fxQuoteResponseBody) {
                if (!(fxQuoteResponseBody.conversionTerms.targetAmount.amount === quoteResponseBody.transferAmount.amount)) {
                    result = false;
                    message.push(`fxQuoteResponseBody.conversionTerms.targetAmount.amount ${fxQuoteResponseBody.conversionTerms.targetAmount.amount} did not equal quoteResponseBody.transferAmount.amount ${quoteResponseBody.transferAmount.amount}`);
                }
            }
        } else {
            SDKClientError.genericQuoteValidationError("Invalid amountType received", { httpCode: 500, mlCode: "4000" });
        }
        return { result, message };
    }

    private getTCbsSendMoneyResponse(transfer: TSDKOutboundTransferResponse): TNMSendMoneyResponse {
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

    private async getTSDKOutboundTransferRequest(transfer: TNMSendMoneyRequest, amountType: "SEND" | "RECEIVE"): Promise<TSDKOutboundTransferRequest> {
        const res = await this.tnmClient.getKyc({
            msisdn: transfer.payer.payerId
        });
        return {
            'homeTransactionId': randomUUID(),
            'from': {
                'idType': this.tnmConfig.SUPPORTED_ID_TYPE,
                'idValue': transfer.payer.payerId,
                'fspId': this.tnmConfig.FSP_ID,
                "displayName": res.data.full_name,
                "firstName": res.data.full_name,
                "middleName": res.data.full_name,
                "lastName": res.data.full_name,
                "extensionList": this.getOutboundTransferExtensionList(transfer),
                "supportedCurrencies": [this.tnmConfig.TNM_CURRENCY]
            },
            'to': {
                'idType': transfer.payeeIdType,
                'idValue': transfer.payeeId
            },
            'amountType': amountType,
            'currency': amountType === "SEND" ? transfer.sendCurrency : transfer.receiveCurrency,
            'amount': transfer.sendAmount,
            'transactionType': transfer.transactionType,
            'quoteRequestExtensions': this.getOutboundTransferExtensionList(transfer),
            'transferRequestExtensions': this.getOutboundTransferExtensionList(transfer)
        };
    }

    private getOutboundTransferExtensionList(sendMoneyRequestPayload: TNMSendMoneyRequest): TPayerExtensionListEntry[] | undefined {
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

    async updateSendMoney(updateSendMoneyDeps: TNMUpdateSendMoneyRequest, transferId: string): Promise<TNMInvoiceResponse> {
        this.logger.info(`Updating transfer for id ${updateSendMoneyDeps.msisdn} and transfer id ${transferId}`);

        if (!(updateSendMoneyDeps.acceptQuote)) {
            throw ValidationError.quoteNotAcceptedError();
        }
        return await this.tnmClient.collectMoney(this.getTCbsCollectMoneyRequest(updateSendMoneyDeps, transferId));
    }

    private getTCbsCollectMoneyRequest(collection: TNMUpdateSendMoneyRequest, transferId: string): TNMInvoiceRequest {
        return {
            invoice_number: transferId,
            amount: Number(collection.amount),
            msisdn: collection.msisdn,
            description: collection.narration,
        };
    }

    async handleCallback(payload: TNMCallbackPayload): Promise<void> {
        this.logger.info(`Handling callback for transaction with id ${payload.transaction_id}`);
        try {
            if (payload.success) {
                await this.sdkClient.updateTransfer({ acceptQuote: true }, payload.transaction_id);
            } else {
                await this.sdkClient.updateTransfer({ acceptQuote: false }, payload.transaction_id);
            }
        } catch (error: unknown) {
            if (error instanceof SDKClientError) {
                await this.handleRefund(payload);
            }
        }
    }

    private async handleRefund(payload: TNMCallbackPayload) {
        try {
            if (payload.success) {
                await this.tnmClient.refundPayment({ receipt_number: payload.receipt_number });
            }
        } catch (error: unknown) {
            this.logger.error("Refund failed. Initiating manual process...");
            this.tnmClient.logFailedRefund(payload.receipt_number);
        }
    }
}
