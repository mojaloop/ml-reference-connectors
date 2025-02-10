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
import config from '../config';
import {
    INBMClient,
    TNBMCollectMoneyRequest,
    TNBMConfig,
    TNBMDisbursementRequestBody,
    TNBMInvoiceRequest,
    TNBMKycResponse,
    TNBMSendMoneyRequest,
    TNBMSendMoneyResponse,
    TNBMUpdateSendMoneyRequest,
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
        this.logger.info(`Getting party information for ${id} and IdType ${IdType}`);
        this.logger.info(`${IdType} === ${this.cbsConfig.SUPPORTED_ID_TYPE} = ${IdType === this.cbsConfig.SUPPORTED_ID_TYPE}`);
        if (!(IdType === this.cbsConfig.SUPPORTED_ID_TYPE)) {
            throw ValidationError.unsupportedIdTypeError();
        }

        const res = await this.nbmClient.getKyc({
            account_number: id,
        });

        return this.getPartiesResponse(res);
    }

    private getPartiesResponse(res: TNBMKycResponse): Party {
        return {
            statusCode: () => 200,
            idType: "ACCOUNT_ID",
            idValue: res.data.account_number,
            extensionList: this.getPartiesExtensionList(),
            type: "CONSUMER",
            kycInformation: JSON.stringify(res.data),
            supportedCurrencies: config.get("nbm.X_CURRENCY")
        };
    }

    private getPartiesExtensionList(): TPayeeExtensionListEntry[] {
        return [
            {
                "key": "Rpt.UpdtdPtyAndAcctId.Agt.FinInstnId.LEI",
                "value": config.get("nbm.LEI")
            },
            {
                "key": "Rpt.UpdtdPtyAndAcctId.Pty.PstlAdr.Ctry",
                "value": config.get("nbm.X_COUNTRY")
            },

            {
                "key": "Rpt.UpdtdPtyAndAcctId.Pty.CtryOfRes",
                "value": config.get("nbm.X_COUNTRY")
            }
        ];
    }


    async quoteRequest(quoteRequest: TQuoteRequest): Promise<TQuoteResponse> {
        this.logger.info(`Calculating quote for ${quoteRequest.to.idValue} and amount ${quoteRequest.amount}`);
        if (quoteRequest.to.idType !== this.cbsConfig.SUPPORTED_ID_TYPE) {
            throw ValidationError.unsupportedIdTypeError();
        }
        if (!this.checkQuoteExtensionLists(quoteRequest)) {
            // throw ValidationError.invalidExtensionListsError(
            //     "Some extensionLists are undefined",
            //     '3100',
            //     500
            // );
            this.logger.warn("Some extensionLists are undefined. Checks Failed", quoteRequest);
        }
        if (quoteRequest.currency !== this.cbsConfig.X_CURRENCY) {
            throw ValidationError.unsupportedCurrencyError();
        }
        const res = await this.nbmClient.getKyc({ account_number: quoteRequest.to.idValue });
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
            quoteRequest: quoteRequest,
        });
    }

    private checkQuoteExtensionLists(quoteRequest: TQuoteRequest): boolean {
        return !!(quoteRequest.to.extensionList && quoteRequest.from.extensionList && quoteRequest.to.extensionList.length > 0 && quoteRequest.from.extensionList.length > 0);
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
            "transactionId": deps.quoteRequest.transactionId,
            "extensionList": this.getQuoteResponseExtensionList(deps.quoteRequest)
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
        this.logger.info(`Received transfer request for ${transfer.to.idValue}`);
        if (transfer.to.idType != this.IdType) {
            throw ValidationError.unsupportedIdTypeError();
        }
        if (!this.checkPayeeTransfersExtensionLists(transfer)) {
            // throw ValidationError.invalidExtensionListsError(
            //     "ExtensionList check Failed in Payee Transfers",
            //     '3100',
            //     500
            // )
            this.logger.warn("Some extensionLists are undefined; Checks Failed", transfer);
        }
        if (transfer.currency !== this.cbsConfig.X_CURRENCY) {
            throw ValidationError.unsupportedCurrencyError();
        }
        if (!this.validateQuote(transfer)) {
            throw ValidationError.invalidQuoteError();
        }
        // this.checkAccountBarred(transfer.to.idValue);
        return {
            completedTimestamp: new Date().toJSON(),
            homeTransactionId: transfer.transferId,
            transferState: 'RESERVED',
        };
    }

    private checkPayeeTransfersExtensionLists(transfer: TtransferRequest): boolean {
        return !!(transfer.to.extensionList && transfer.from.extensionList && transfer.to.extensionList.length > 0 && transfer.from.extensionList.length > 0);
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
        let result = true;
        if (
            parseFloat(transfer.amount) !==
            parseFloat(transfer.quote.transferAmount) - parseFloat(transfer.quote.payeeFspCommissionAmount || '0')
            // POST /transfers request.amount == request.quote.transferAmount - request.quote.payeeFspCommissionAmount
        ) {
            this.logger.error(`Invalid amount ${transfer.amount} != ${transfer.quote.transferAmount} - ${transfer.quote.payeeFspCommissionAmount}`);
            result = false;
        }

        if (!transfer.quote.payeeReceiveAmount || !transfer.quote.payeeFspFeeAmount) {
            this.logger.error(`transfer.quote.payeeReceiveAmount or !transfer.quote.payeeFspFeeAmount not defined`);
            throw ValidationError.notEnoughInformationError("transfer.quote.payeeReceiveAmount or !transfer.quote.payeeFspFeeAmount not defined", "5000");
        }

        if (
            parseFloat(transfer.quote.payeeReceiveAmount) !==
            parseFloat(transfer.quote.transferAmount) -
            parseFloat(transfer.quote.payeeFspFeeAmount)
        ) {
            this.logger.error(`Invalid payeeReceiveAmount ${transfer.quote.payeeReceiveAmount} != ${transfer.quote.transferAmount} - ${transfer.quote.payeeFspFeeAmount}`);
            result = false;

        }
        return result;
    }

    private checkReceiveAmounts(transfer: TtransferRequest): boolean {
        this.logger.info('Validating Type Receive Quote...', { transfer });
        let result = true;
        if (!transfer.quote.payeeFspFeeAmount || !transfer.quote.payeeReceiveAmount) {
            this.logger.error(`transfer.quote.payeeFspFeeAmount or transfer.quote.payeeReceiveAmount not defined`);
            throw ValidationError.notEnoughInformationError("transfer.quote.payeeFspFeeAmount or transfer.quote.payeeReceiveAmount not defined", "5000");
        }
        if (
            parseFloat(transfer.amount) !==
            parseFloat(transfer.quote.transferAmount) -
            parseFloat(transfer.quote.payeeFspCommissionAmount || '0') +
            parseFloat(transfer.quote.payeeFspFeeAmount)
        ) {
            this.logger.error(`Invalid amount ${transfer.amount} != ${transfer.quote.transferAmount} - ${transfer.quote.payeeFspCommissionAmount} + ${transfer.quote.payeeFspFeeAmount}`);
            result = false;
        }

        if (parseFloat(transfer.quote.payeeReceiveAmount) !== parseFloat(transfer.quote.transferAmount)) {
            this.logger.error(`Invalid payeeReceiveAmount ${transfer.quote.payeeReceiveAmount} != ${transfer.quote.transferAmount}`);
            result = false;
        }
        return result;
    }

    private async checkAccountBarred(msisdn: string): Promise<void> {
        const res = await this.nbmClient.getKyc({ account_number: msisdn });
        // Add Logic for Barred Account
        if (res.data.locked_amount) {
            throw ValidationError.accountBarredError();
        }
    }

    async updateTransfer(updateTransferPayload: TtransferPatchNotificationRequest, transferId: string): Promise<void> {
        this.logger.info(`Committing transfer on patch notification for ${updateTransferPayload.quoteRequest?.body.payee.partyIdInfo.partyIdentifier} and transfer id ${transferId}`);
        if (updateTransferPayload.currentState !== 'COMPLETED') {
            await this.initiateCompensationAction();
            throw ValidationError.transferNotCompletedError();
        }
        const makePaymentRequest: TNBMDisbursementRequestBody = this.getMakePaymentRequestBody(updateTransferPayload);
        await this.nbmClient.sendMoney(makePaymentRequest); //todo: define better error handling logic
    }

    private async initiateCompensationAction() {
        // todo function implementation to be defined.
    }

    private getMakePaymentRequestBody(requestBody: TtransferPatchNotificationRequest): TNBMDisbursementRequestBody {
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
    async sendMoney(transfer: TNBMSendMoneyRequest, amountType: "SEND" | "RECEIVE"): Promise<TNBMSendMoneyResponse> {
        this.logger.info(`Received send money request for payer with ID ${transfer.payer.payerId}`);

        const res = await this.sdkClient.initiateTransfer(await this.getTSDKOutboundTransferRequest(transfer, amountType));
        if (res.data.currentState === "WAITING_FOR_CONVERSION_ACCEPTANCE") {
            return await this.checkAndRespondToConversionTerms(res);
        }
        if (!this.validateReturnedQuote(res.data)) {
            throw ValidationError.invalidReturnedQuoteError();
        }
        return this.getTCbsSendMoneyResponse(res.data);
    }

    private async checkAndRespondToConversionTerms(res: THttpResponse<TSDKOutboundTransferResponse>): Promise<TNBMSendMoneyResponse> {
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
        this.logger.info(`Validating Conversion Terms with transfer response amount ${transferRes.amount}`);
        let result = true;
        if (
            !(this.cbsConfig.X_CURRENCY === transferRes.fxQuoteResponse?.body.conversionTerms.sourceAmount.currency)
        ) {
            this.logger.error(`X_CURRENCY ${this.cbsConfig.X_CURRENCY} != ${transferRes.quoteResponse?.body.transferAmount.currency}`);
            result = false;
        }
        if (transferRes.amountType === 'SEND') {
            if (!(transferRes.amount === transferRes.fxQuoteResponse?.body.conversionTerms.sourceAmount.amount)) {
                this.logger.error(`Amount ${transferRes.amount} != ${transferRes.fxQuoteResponse?.body.conversionTerms.sourceAmount.amount}`);
                result = false;
            }
            if (!transferRes.to.supportedCurrencies) {
                this.logger.error(`Payee Supported Currency not defined`);
                throw SDKClientError.genericQuoteValidationError("Payee Supported Currency not defined", { httpCode: 500, mlCode: "4000" });
            }
            if (!transferRes.to.supportedCurrencies.some(value => value === transferRes.quoteResponse?.body.transferAmount.currency)) {
                this.logger.error(`Payee Supported Currency ${transferRes.to.supportedCurrencies} does not contain ${transferRes.quoteResponse?.body.transferAmount.currency}`);
                result = false;
            }
            if (!(transferRes.currency === transferRes.fxQuoteResponse?.body.conversionTerms.sourceAmount.currency)) {
                this.logger.error(`Currency ${transferRes.currency} != ${transferRes.fxQuoteResponse?.body.conversionTerms.sourceAmount.currency}`);
                result = false;
            }
        } else if (transferRes.amountType === 'RECEIVE') {
            if (!(transferRes.amount === transferRes.fxQuoteResponse?.body.conversionTerms.targetAmount.amount)) {
                this.logger.error(`Amount ${transferRes.amount} != ${transferRes.fxQuoteResponse?.body.conversionTerms.targetAmount.amount}`);
                result = false;
            }
            if (!(transferRes.currency === transferRes.quoteResponse?.body.transferAmount.currency)) {
                this.logger.error(`Currency ${transferRes.currency} != ${transferRes.quoteResponse?.body.transferAmount.currency}`);
                result = false;
            }
            if (transferRes.fxQuoteResponse) {
                if (!transferRes.from.supportedCurrencies) {
                    this.logger.error(`Payee Supported Currency not defined`);
                    throw ValidationError.unsupportedCurrencyError();
                }
                if (!(transferRes.from.supportedCurrencies.some(value => value === transferRes.fxQuoteResponse?.body.conversionTerms.targetAmount.currency))) {
                    this.logger.error(`Payee Supported Currency ${transferRes.from.supportedCurrencies} does not contain ${transferRes.fxQuoteResponse?.body.conversionTerms.targetAmount.currency}`);
                    result = false;
                }
            }
        }
        return result;
    }

    private validateReturnedQuote(outboundTransferRes: TSDKOutboundTransferResponse): boolean {
        this.logger.info(`Validating Returned Quote with transfer response amount ${outboundTransferRes.amount}`);

        let result = true;
        if (!this.validateConversionTerms(outboundTransferRes)) {
            result = false;
        }
        const quoteResponseBody = outboundTransferRes.quoteResponse?.body;
        const fxQuoteResponseBody = outboundTransferRes.fxQuoteResponse?.body;
        if (!quoteResponseBody) {
            this.logger.error(`Quote Response Body not defined`);
            throw SDKClientError.noQuoteReturnedError();
        }
        if (outboundTransferRes.amountType === "SEND") {
            if (!(parseFloat(outboundTransferRes.amount) === parseFloat(quoteResponseBody.transferAmount.amount) - parseFloat(quoteResponseBody.payeeFspCommission?.amount || "0"))) {
                this.logger.error(`Invalid amount ${outboundTransferRes.amount} != ${quoteResponseBody.transferAmount.amount} - ${quoteResponseBody.payeeFspCommission?.amount}`);
                result = false;
            }
            if (!quoteResponseBody.payeeReceiveAmount) {
                this.logger.error(`Payee Receive Amount not defined`);
                throw SDKClientError.genericQuoteValidationError("Payee Receive Amount not defined", { httpCode: 500, mlCode: "4000" });
            }
            if (!(parseFloat(quoteResponseBody.payeeReceiveAmount.amount) === parseFloat(quoteResponseBody.transferAmount.amount) - parseFloat(quoteResponseBody.payeeFspCommission?.amount || '0'))) {
                this.logger.error(`Invalid payeeReceiveAmount ${quoteResponseBody.payeeReceiveAmount.amount} != ${quoteResponseBody.transferAmount.amount} - ${quoteResponseBody.payeeFspCommission?.amount}`);
                result = false;
            }
            if (!(fxQuoteResponseBody?.conversionTerms.targetAmount.amount === quoteResponseBody.transferAmount.amount)) {
                this.logger.error(`Invalid fxQuoteResponseBody.conversionTerms.targetAmount.amount ${fxQuoteResponseBody?.conversionTerms.targetAmount.amount} != ${quoteResponseBody.transferAmount.amount}`);
                result = false;
            }
        } else if (outboundTransferRes.amountType === "RECEIVE") {
            if (!outboundTransferRes.quoteResponse) {
                this.logger.error(`Quote Response not defined`);
                throw SDKClientError.noQuoteReturnedError();
            }
            if (!(parseFloat(outboundTransferRes.amount) === parseFloat(quoteResponseBody.transferAmount.amount) - parseFloat(quoteResponseBody.payeeFspCommission?.amount || "0") + parseFloat(quoteResponseBody.payeeFspFee?.amount || "0"))) {
                this.logger.error(`Invalid amount ${outboundTransferRes.amount} != ${quoteResponseBody.transferAmount.amount} - ${quoteResponseBody.payeeFspCommission?.amount} + ${quoteResponseBody.payeeFspFee?.amount}`);
                result = false;
            }

            if (!(quoteResponseBody.payeeReceiveAmount?.amount === quoteResponseBody.transferAmount.amount)) {
                this.logger.error(`Invalid payeeReceiveAmount ${quoteResponseBody.payeeReceiveAmount?.amount} != ${quoteResponseBody.transferAmount.amount}`);
                result = false;
            }
            if (fxQuoteResponseBody) {
                if (!(fxQuoteResponseBody.conversionTerms.targetAmount.amount === quoteResponseBody.transferAmount.amount)) {
                    this.logger.error(`Invalid fxQuoteResponseBody.conversionTerms.targetAmount.amount ${fxQuoteResponseBody.conversionTerms.targetAmount.amount} != ${quoteResponseBody.transferAmount.amount}`);
                    result = false;
                }
            }
        } else {
            this.logger.error(`Invalid amountType received ${outboundTransferRes.amountType}`);
            SDKClientError.genericQuoteValidationError("Invalid amountType received", { httpCode: 500, mlCode: "4000" });
        }
        return result;
    }

    private getTCbsSendMoneyResponse(transfer: TSDKOutboundTransferResponse): TNBMSendMoneyResponse {
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

    private async getTSDKOutboundTransferRequest(transfer: TNBMSendMoneyRequest, amountType: "SEND" | "RECEIVE"): Promise<TSDKOutboundTransferRequest> {
        const res = await this.nbmClient.getKyc({
            account_number: transfer.payer.payerId
        });

        return {
            'homeTransactionId': randomUUID(),
            'from': {
                'idType': this.cbsConfig.SUPPORTED_ID_TYPE,
                'idValue': transfer.payer.payerId,
                'fspId': this.cbsConfig.FSP_ID,
                "displayName": `${res.data.account_number}`,

                "merchantClassificationCode": "123",
                extensionList: this.getOutboundTransferExtensionList(transfer),
                "supportedCurrencies": [config.get("nbm.X_CURRENCY")]
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

    private getOutboundTransferExtensionList(sendMoneyRequestPayload: TNBMSendMoneyRequest): TPayerExtensionListEntry[] {
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

    async updateSendMoney(updateSendMoneyDeps: TNBMUpdateSendMoneyRequest, transerId: string): Promise<TtransferContinuationResponse> {
        this.logger.info(`Updating transfer for id ${updateSendMoneyDeps} `);

        if (!(updateSendMoneyDeps.acceptQuote)) {
            throw ValidationError.quoteNotAcceptedError();
        }
        const res = await this.sdkClient.updateTransfer({ acceptQuote: true }, transerId); //todo: implement better error handling logic 
        return res.data;
    }

    private getTCbsCollectMoneyRequest(collection: TNBMUpdateSendMoneyRequest, transferId: string): TNBMCollectMoneyRequest {
        return {
            "amount": 10000,
            "description": collection.acceptQuote.toString(),
            "reference": "Test",
            "credit_account": "10034867",	
            "currency": "MWK" 
        };
    }
}
