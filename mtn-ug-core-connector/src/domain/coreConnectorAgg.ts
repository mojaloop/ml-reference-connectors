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
    TMTNRefundRequestBody,
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
        this.IdType = config.get("mtn.SUPPORTED_ID_TYPE");
        this.logger = logger;
    }

    //Payee
    async getParties(id: string, idType: string): Promise<TLookupPartyInfoResponse> {
        this.logger.info(`Get Parties for ${id}`);
        if (!(idType === config.get("mtn.SUPPORTED_ID_TYPE"))) {
            throw ValidationError.unsupportedIdTypeError();
        }

        const lookupRes = await this.mtnClient.getKyc({ msisdn: id });
        const party = this.getPartyResponse(lookupRes, id);
        this.logger.info(`Party found`, { party });
        return party;
    }

    private getPartyResponse(mtnKycResponse: TMTNKycResponse, idValue: string): TLookupPartyInfoResponse {
        return {
            data: {
                displayName: `${mtnKycResponse.given_name} ${mtnKycResponse.family_name}`,
                firstName: mtnKycResponse.given_name,
                idType: config.get("mtn.SUPPORTED_ID_TYPE"),

                idValue: idValue,
                lastName: mtnKycResponse.family_name,
                middleName: mtnKycResponse.given_name,
                type: PartyType.CONSUMER,
                kycInformation: `${JSON.stringify(mtnKycResponse)}`,
                extensionList: this.getGetPartiesExtensionList(),
                supportedCurrencies: config.get("mtn.DFSP_CURRENCY")
            },
            statusCode: 200,
        };
    }

    private getGetPartiesExtensionList(): TPayeeExtensionListEntry[] {
        return [
            {
                "key": "Rpt.UpdtdPtyAndAcctId.Agt.FinInstnId.LEI",
                "value": config.get("mtn.LEI")
            },
            {
                "key": "Rpt.UpdtdPtyAndAcctId.Pty.PstlAdr.Ctry",
                "value": config.get("mtn.X_COUNTRY")
            },
            {
                "key": "Rpt.UpdtdPtyAndAcctId.Pty.CtryOfRes",
                "value": config.get("mtn.X_COUNTRY")
            }
        ];
    }

    private async checkAccountBarred(msisdn: string): Promise<void> {
        const res = await this.mtnClient.getKyc({ msisdn: msisdn });
        if (res.status == "NOT FOUND") {
            throw ValidationError.accountBarredError();
        }
    }

    async quoteRequest(quoteRequest: TQuoteRequest): Promise<TQuoteResponse> {
        this.logger.info(`Quote requests for ${this.IdType} ${quoteRequest.to.idValue}`);
        if (quoteRequest.to.idType !== this.IdType) {
            throw ValidationError.unsupportedIdTypeError();
        }
        if (this.mtnConfig.MTN_ENV === 'production' && quoteRequest.currency !== config.get("mtn.X_CURRENCY")) {
            throw ValidationError.unsupportedCurrencyError();
        }

        if (!this.checkQuoteExtensionLists(quoteRequest)) {
            this.logger.warn("Some extensionLists are undefined. Checks Failed", quoteRequest);
        }

        const serviceChargePercentage = Number(config.get("mtn.SERVICE_CHARGE"));
        const fees = serviceChargePercentage / 100 * Number(quoteRequest.amount);
        await this.checkAccountBarred(quoteRequest.to.idValue);
        const quoteExpiration = config.get("mtn.EXPIRATION_DURATION");
        const expiration = new Date();
        expiration.setHours(expiration.getHours() + Number(quoteExpiration));
        const expirationJSON = expiration.toJSON();
        return this.getQuoteResponse(quoteRequest, fees.toString(), expirationJSON);
    }

    private checkQuoteExtensionLists(quoteRequest: TQuoteRequest): boolean {
        return !!(quoteRequest.to.extensionList && quoteRequest.from.extensionList && quoteRequest.to.extensionList.length > 0 && quoteRequest.from.extensionList.length > 0);
    }

    private getQuoteResponse(quoteRequest: TQuoteRequest, fees: string, expiration: string): TQuoteResponse {
        return {
            expiration: expiration,
            'extensionList': this.getQuoteResponseExtensionList(quoteRequest),
            payeeFspCommissionAmount: '0',
            payeeFspCommissionAmountCurrency: quoteRequest.currency,
            payeeFspFeeAmount: fees,
            payeeFspFeeAmountCurrency: quoteRequest.currency,
            payeeReceiveAmount: quoteRequest.amount,
            payeeReceiveAmountCurrency: quoteRequest.currency,
            quoteId: quoteRequest.quoteId,
            transactionId: quoteRequest.transactionId,
            transferAmount: (Number(quoteRequest.amount) + Number(fees)).toString(),
            transferAmountCurrency: quoteRequest.currency,
        };
    }


    private getQuoteResponseExtensionList(quoteRequest: TQuoteRequest): TPayeeExtensionListEntry[] {
        const newExtensionList: TPayeeExtensionListEntry[] = [];

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
        this.logger.info(`Transfer for  ${this.IdType} ${transfer.to.idValue}`);
        if (transfer.to.idType != this.IdType) {
            throw ValidationError.unsupportedIdTypeError();
        }
        if (this.mtnConfig.MTN_ENV === 'production' && transfer.currency !== config.get("mtn.X_CURRENCY")) {
            throw ValidationError.unsupportedCurrencyError();
        }

        const validateQuoteRes = this.validateQuote(transfer);
        if (!validateQuoteRes.result) {
            throw ValidationError.invalidQuoteError(validateQuoteRes.message.toString());
        }

        if (!this.checkPayeeTransfersExtensionLists(transfer)) {
            this.logger.warn("Some extensionLists are undefined; Checks Failed", transfer);
        }

        await this.checkAccountBarred(transfer.to.idValue);
        return {
            completedTimestamp: new Date().toJSON(),
            homeTransactionId: transfer.transferId,
            transferState: 'RESERVED',
        };
    }

    private checkPayeeTransfersExtensionLists(transfer: TtransferRequest): boolean {
        this.logger.info(`checking Payee Transfer Extension List ${transfer}`);
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
        this.logger.info(`Committing The Transfer with id ${transferId}`);
        if (updateTransferPayload.currentState !== 'COMPLETED') {
            throw ValidationError.transferNotCompletedError();
        }
        const mtnDisbursementRequest: TMTNDisbursementRequestBody = this.getDisbursementRequestBody(updateTransferPayload);
        try {
            await this.mtnClient.sendMoney(mtnDisbursementRequest);
        } catch (error: unknown) {
            await this.initiateCompensationAction(mtnDisbursementRequest);
        }
    }

    private async initiateCompensationAction(req: TMTNDisbursementRequestBody) {
        this.logger.error("Failed to make transfer to customer", { request: req });
        await this.mtnClient.logFailedIncomingTransfer(req);
    }

    private getDisbursementRequestBody(requestBody: TtransferPatchNotificationRequest): TMTNDisbursementRequestBody {
        if (!requestBody.quoteRequest) {
            throw ValidationError.quoteNotDefinedError('Quote Not Defined Error', '5000', 500);
        }
        if (!requestBody.transferId) {
            throw ValidationError.transferIdNotDefinedError("TransferId Not Defined", '5000', 500);
        }
        return {
            "amount": requestBody.quoteRequest.body.amount.amount,
            "currency": this.mtnConfig.X_CURRENCY,
            "externalId": requestBody.transferId,
            "payee": {
                "partyIdType": requestBody.quoteRequest.body.payee.partyIdInfo.partyIdType,
                "partyId": requestBody.quoteRequest.body.payee.partyIdInfo.partyIdentifier
            },
            "payerMessage": "Payer Attached Note For Transactions",
            "payeeNote": "Sending Money"

        };

    }

    private getTMTNSendMoneyResponse(transfer: TSDKOutboundTransferResponse, homeTransactionId: string): TMTNSendMoneyResponse {
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
            "homeTransactionId": homeTransactionId
        };
    }

    private validateConversionTerms(transferResponse: TSDKOutboundTransferResponse): TValidationResponse {
        this.logger.info(`Validating Conversion Terms with transfer response amount ${transferResponse.amount}`);
        let result = true;
        const message: string[] = [];
        if (
            this.mtnConfig.MTN_ENV === 'production' && !(this.mtnConfig.X_CURRENCY === transferResponse.fxQuoteResponse?.body.conversionTerms.sourceAmount.currency)
        ) {
            result = false;
            message.push(`this.mtnConfig.MTN_ENV ${this.mtnConfig.MTN_ENV} did not equal transferResponse.fxQuotesResponse?.body.conversionTerms.sourceAmount.currency ${transferResponse.fxQuoteResponse?.body.conversionTerms.sourceAmount.currency}`);
        }
        if (transferResponse.amountType === 'SEND') {
            if (!(transferResponse.amount === transferResponse.fxQuoteResponse?.body.conversionTerms.sourceAmount.amount)) {
                result = false;
                message.push(`transferResponse.amount ${transferResponse.amount} did not equal transferResponse.fxQuotesResponse?.body.conversionTerms.sourceAmount.amount ${transferResponse.fxQuoteResponse?.body.conversionTerms.sourceAmount.amount}`);
            }
            if (transferResponse.to.supportedCurrencies) {
                if (!transferResponse.to.supportedCurrencies.some(value => value === transferResponse.quoteResponse?.body.transferAmount.currency)) {
                    result = false;
                    message.push(`transferResponse.to.supportedCurrencies ${transferResponse.to.supportedCurrencies} did not contain transferResponse.quoteResponse?.body.transferAmount.currency ${transferResponse.quoteResponse?.body.transferAmount.currency}`);
                }
            }
            if (!(transferResponse.currency === transferResponse.fxQuoteResponse?.body.conversionTerms.sourceAmount.currency)) {
                result = false;
                message.push(`transferResponse.currency ${transferResponse.currency} did not equal transferResponse.fxQuotesResponse?.body.conversionTerms.sourceAmount.currency ${transferResponse.fxQuoteResponse?.body.conversionTerms.sourceAmount.currency} `);
            }
        } else if (transferResponse.amountType === 'RECEIVE') {
            if (!(transferResponse.amount === transferResponse.fxQuoteResponse?.body.conversionTerms.targetAmount.amount)) {
                result = false;
                message.push(`transferResponse.amount ${transferResponse.amount} did not equal transferResponse.fxQuotesResponse?.body.conversionTerms.targetAmount.amount ${transferResponse.fxQuoteResponse?.body.conversionTerms.targetAmount.amount}`);
            }
            if (!(transferResponse.currency === transferResponse.quoteResponse?.body.transferAmount.currency)) {
                result = false;
                message.push(`transferResponse.currency ${transferResponse.currency} did not equal transferResponse.quoteResponse?.body.transferAmount.currency ${transferResponse.quoteResponse?.body.transferAmount.currency}`);
            }
        }
        return { result, message };
    }

    private validateReturnedQuote(transferResponse: TSDKOutboundTransferResponse): TValidationResponse {
        this.logger.info(`Validating Retunred Quote with transfer response amount${transferResponse.amount}`);
        let result = true;
        const message: string[] = [];
        if (transferResponse.amountType === "SEND") {
            const validateFxRes = this.validateConversionTerms(transferResponse);
            if (!validateFxRes.result) {
                result = false;
                message.push(...validateFxRes.message);
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
                message.push(`transferResponse.amount ${transferResponse.amount} or transferResponse.fxQuoteResponse?.body?.conversionTerms?.targetAmount?.amount ${transferResponse.fxQuoteResponse?.body?.conversionTerms?.targetAmount?.amount} did not equal quoteResponseBody.transferAmount.amount ${quoteResponseBody.transferAmount.amount} minus quoteResponseBody.payeeFspCommission?.amount ${quoteResponseBody.payeeFspCommission?.amount}`);
            }
            if (!quoteResponseBody.payeeReceiveAmount) {
                throw SDKClientError.genericQuoteValidationError("Payee Receive Amount not defined", { httpCode: 500, mlCode: "4000" });
            }
            if (!(parseFloat(quoteResponseBody.payeeReceiveAmount.amount) === parseFloat(quoteResponseBody.transferAmount.amount) - parseFloat(quoteResponseBody.payeeFspCommission?.amount || '0'))) {
                result = false;
                message.push(`quoteResponseBody.payeeReceiveAmount.amount ${quoteResponseBody.payeeReceiveAmount.amount} did not equal quoteResponseBody.transferAmount.amount ${quoteResponseBody.transferAmount.amount} minus quoteResponseBody.payeeFspCommission?.amount || '0' ${quoteResponseBody.payeeFspCommission?.amount || '0'}  `);
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
                message.push(`transferResponse.amount ${transferResponse.amount} did not equal quoteResponseBody.transferAmount.amount ${quoteResponseBody.transferAmount.amount} minus quoteResponseBody.payeeFspCommission?.amount || "0" ${quoteResponseBody.payeeFspCommission?.amount || "0"} plus quoteResponseBody.payeeFspFee?.amount || "0" ${quoteResponseBody.payeeFspFee?.amount || "0"}  `);
            }

            if (!(quoteResponseBody.payeeReceiveAmount?.amount === quoteResponseBody.transferAmount.amount)) {
                result = false;
                message.push(`quoteResponseBody.payeeReceiveAmount?.amount ${quoteResponseBody.payeeReceiveAmount?.amount} did not equal quoteResponseBody.transferAmount.amount ${quoteResponseBody.transferAmount.amount}`);
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



    private async getTSDKOutboundTransferRequest(transfer: TMTNSendMoneyRequest, amountType: "SEND" | "RECEIVE"): Promise<TSDKOutboundTransferRequest> {
        const res = await this.mtnClient.getKyc({
            msisdn: transfer.payer.payerId
        });
        return {
            'homeTransactionId': transfer.homeTransactionId,
            'from': {
                'idType': this.mtnConfig.SUPPORTED_ID_TYPE,
                'idValue': transfer.payer.payerId,
                'fspId': this.mtnConfig.FSP_ID,
                "displayName": `${res.given_name} ${res.family_name}`,
                "firstName": res.given_name,
                "middleName": res.given_name,
                "lastName": res.family_name,
                "merchantClassificationCode": "123",
                "extensionList": this.getOutboundTransferExtensionList(transfer),
                "supportedCurrencies": [this.mtnConfig.DFSP_CURRENCY]
            },
            'to': {
                'idType': transfer.payeeIdType,
                'idValue': transfer.payeeId,
            },
            'amountType': amountType,
            'currency': amountType === "SEND" ? transfer.sendCurrency : transfer.receiveCurrency,
            'amount': transfer.sendAmount,
            'transactionType': transfer.transactionType,
        };
    }


    private getOutboundTransferExtensionList(sendMoneyRequestPayload: TMTNSendMoneyRequest): TPayerExtensionListEntry[] | undefined {
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


    // Payer
    async sendMoney(transfer: TMTNSendMoneyRequest, amountType: "SEND" | "RECEIVE"): Promise<TMTNSendMoneyResponse> {
        this.logger.info(`Transfer from mtn account with ID ${transfer.payer.payerId}`);

        const transferRequest: TSDKOutboundTransferRequest = await this.getTSDKOutboundTransferRequest(transfer, amountType);
        const res = await this.sdkClient.initiateTransfer(transferRequest);
        if (res.data.currentState === "WAITING_FOR_CONVERSION_ACCEPTANCE") {
            return this.handleSendTransferRes(res.data, transfer.homeTransactionId);
        } else if (res.data.currentState === "WAITING_FOR_QUOTE_ACCEPTANCE") {
            return this.handleReceiveTransferRes(res.data, transfer.homeTransactionId);
        } else {
            throw SDKClientError.returnedCurrentStateUnsupported(`Returned currentStateUnsupported. ${res.data.currentState}`, { httpCode: 500, mlCode: "2000" });
        }
    }

    private async handleSendTransferRes(res: TSDKOutboundTransferResponse, homeTransactionId: string): Promise<TMTNSendMoneyResponse> {
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
        return this.getTMTNSendMoneyResponse(acceptRes.data, homeTransactionId);
    }

    private async handleReceiveTransferRes(res: TSDKOutboundTransferResponse, homeTransactionId: string): Promise<TMTNSendMoneyResponse> {
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
        return this.getTMTNSendMoneyResponse(acceptRes.data, homeTransactionId);
    }

    private getTMTNCollectMoneyRequest(deps: TMTNUpdateSendMoneyRequest, transferId: string): TMTNCollectMoneyRequest {
        return {
            "amount": deps.amount,
            "amountType": "RECEIVE",
            "currency": this.mtnConfig.X_CURRENCY,
            "externalId": transferId,
            "payer": {
                "partyId": deps.msisdn,
                "partyIdType": this.mtnConfig.SUPPORTED_ID_TYPE,
            },
            "payerMessage": deps.payerMessage,
            "payeeNote": deps.payeeNote,

        };
    }

    async updateSentTransfer(transferAccept: TMTNUpdateSendMoneyRequest, transferId: string): Promise<void> {
        this.logger.info(`Updating transfer for id ${transferAccept.msisdn} and transfer id ${transferId}`);

        if (!(transferAccept.acceptQuote)) {
            throw ValidationError.quoteNotAcceptedError();
        }
        await this.mtnClient.collectMoney(this.getTMTNCollectMoneyRequest(transferAccept, transferId));
    }

    async handleCallback(payload: TMTNCallbackPayload): Promise<void> {
        this.logger.info(`Handling callback for transaction with id ${payload.externalId}`);
        try {
            if (payload.status === "SUCCESSFUL") {
                await this.sdkClient.updateTransfer({ acceptQuote: true }, payload.externalId);
            } else {
                await this.sdkClient.updateTransfer({ acceptQuote: false }, payload.externalId);
            }
        } catch (error: unknown) {
            if (error instanceof SDKClientError) {
                // perform refund or rollback if payment was successful
                if (payload.status === "SUCCESSFUL") {
                    await this.handleRefund(this.getRefundRequestBody(payload));
                }
            }
        }
    }

    private async handleRefund(refund: TMTNRefundRequestBody): Promise<void> {
        try {
            await this.mtnClient.refundMoney(refund);
        } catch (error: unknown) {
            this.mtnClient.logFailedRefund(refund);
        }
    }

    private getRefundRequestBody(callbackPayload: TMTNCallbackPayload): TMTNRefundRequestBody {
        return {
            "amount": callbackPayload.amount,
            "currency": callbackPayload.currency,
            "externalId": callbackPayload.externalId,
            "payerMessage": "Refund",
            "payeeNote": callbackPayload.payeeNote,
            "referenceIdToRefund": callbackPayload.financialTransactionId
        }
    }

}


