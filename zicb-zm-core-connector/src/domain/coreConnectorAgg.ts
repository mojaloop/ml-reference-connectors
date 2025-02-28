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

    IZicbClient,
    TZicbConfig,
    TZicbSendMoneyResponse,

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
    TLookupPartyInfoResponse,
} from './interfaces';
import {
    ISDKClient,
    SDKClientError,
    TSDKOutboundTransferRequest,
    TSDKOutboundTransferResponse,
    TtransferContinuationResponse,
} from './SDKClient';
import config from '../config';
import { PartyType, TVerifyCustomerByAccountNumberRequest, TVerifyCustomerByAccountNumberResponse, TWalletToWalletInternalFundsTransferRequest, TWalletToWalletInternalFundsTransferResponse, TZicbSendMoneyRequest, TZicbUpdateSendMoneyRequest } from './CBSClient/types';


export class CoreConnectorAggregate implements ICoreConnectorAggregate {
    IdType: string;
    logger: ILogger;
    DATE_FORMAT = 'dd MM yy';

    constructor(
        readonly sdkClient: ISDKClient,
        readonly zicbClient: IZicbClient,
        readonly zicbConfig: TZicbConfig,
        logger: ILogger,
    ) {
        this.IdType = this.zicbConfig.SUPPORTED_ID_TYPE;
        this.logger = logger;
    }

    //Payee
    // Get Parties   --(1)
    async getParties(id: string, IdType: string): Promise<TLookupPartyInfoResponse> {
        this.logger.info(`Getting party information for ${id}`);
        if (!(IdType === this.zicbConfig.SUPPORTED_ID_TYPE)) {
            throw ValidationError.unsupportedIdTypeError();
        }
        const verifyCustomerByAccountNumberRequestBody = this.getVerifyByCustomerAccountNumberRequestBody(id);
        const res = await this.zicbClient.verifyCustomerByAccountNumber(verifyCustomerByAccountNumberRequestBody);


        const party = {
            data: this.getPartiesResponse(res, id),
            statusCode: Number(res.status),
        };
        this.logger.info(`Party found`, { party });
        return party;
    }


    // Get Verify by Cusotomer Account Number -- (1.1)
    private getVerifyByCustomerAccountNumberRequestBody(id: string): TVerifyCustomerByAccountNumberRequest {
        return {
            "service": "BNK9911",
            "request": {
                "accountNos": id,
                "customerNos": null,
                "getByCustNo": false,
                "getByAccType": false,
                "accountType": null
            }
        };
    }


    //  Get Parties Response -- (1.2.1)
    private extractNames(fullName: string): { firstName: string; middleName?: string; lastName: string } {
        const nameParts = fullName.trim().split(/\s+/); // Split by spaces

        if (nameParts.length === 1) {
            return { firstName: nameParts[0], lastName: nameParts[0] }; // If only one name, set as both first and last
        } else if (nameParts.length === 2) {
            return { firstName: nameParts[0], lastName: nameParts[1] }; // Two names: first and last
        } else {
            return { firstName: nameParts[0], middleName: nameParts.slice(1, -1).join(' '), lastName: nameParts[nameParts.length - 1] };
        }
    }


    //  Get Parties Response -- (1.2)

    private getPartiesResponse(res: TVerifyCustomerByAccountNumberResponse, id: string): Party {
        return {
            idType: config.get("zicb.SUPPORTED_ID_TYPE"),
            idValue: id,
            displayName: `${res.response.accountList[0].accDesc}`,
            firstName: this.extractNames(res.response.accountList[0].accDesc).firstName,
            middleName: this.extractNames(res.response.accountList[0].accDesc).middleName || this.extractNames(res.response.accountList[0].accDesc).firstName,
            lastName: this.extractNames(res.response.accountList[0].accDesc).lastName,
            type: PartyType.CONSUMER,
            kycInformation: JSON.stringify(res.response.accountList),
            extensionList: this.getGetPartiesExtensionList(),
            supportedCurrencies: this.zicbConfig.X_CURRENCY,
        };
    }

    //  Get Parties Response -- (1.2.2)

    private getGetPartiesExtensionList(): TPayeeExtensionListEntry[] {
        return [
            {
                "key": "Rpt.UpdtdPtyAndAcctId.Agt.FinInstnId.LEI",
                "value": config.get("zicb.LEI")
            },
            {
                "key": "Rpt.UpdtdPtyAndAcctId.Pty.PstlAdr.Ctry",
                "value": config.get("zicb.X_COUNTRY")
            },
            {
                "key": "Rpt.UpdtdPtyAndAcctId.Pty.CtryOfRes",
                "value": config.get("zicb.X_COUNTRY")
            }
        ];
    }

    // Quote Requests   --(2)
    async quoteRequest(quoteRequest: TQuoteRequest): Promise<TQuoteResponse> {
        this.logger.info(`Calculating quote for ${quoteRequest.to.idValue} and amount ${quoteRequest.amount}`);

        if (quoteRequest.to.idType !== this.zicbConfig.SUPPORTED_ID_TYPE) {
            throw ValidationError.unsupportedIdTypeError();
        }

        if (quoteRequest.currency !== this.zicbConfig.X_CURRENCY) {
            throw ValidationError.unsupportedCurrencyError();
        }
        if (!this.checkQuoteExtensionLists(quoteRequest)) {
            this.logger.warn("Some extensionLists are undefined. Checks Failed", quoteRequest);
        }

        // Requesting for customer information
        const verifyCustomerByAccountNumberRequestBody = this.getVerifyByCustomerAccountNumberRequestBody(quoteRequest.to.idValue);
        const res = await this.zicbClient.verifyCustomerByAccountNumber(verifyCustomerByAccountNumberRequestBody);

        const fees = (Number(this.zicbConfig.SENDING_SERVICE_CHARGE) / 100) * Number(quoteRequest.amount);


        // TODO: check if frozen status in account list response implies that the account is blocked

        await this.checkAccountBarred(quoteRequest.to.idValue);

        const quoteExpiration = this.zicbConfig.EXPIRATION_DURATION;
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

    //  Get Quote Response -- (2.2)

    private getQuoteResponse(deps: TGetQuotesDeps): TQuoteResponse {
        return {
            "expiration": deps.expiration,
            'extensionList': this.getQuoteResponseExtensionList(deps.quoteRequest),
            "payeeFspCommissionAmount": "0",
            "payeeFspCommissionAmountCurrency": this.zicbConfig.X_CURRENCY,
            "payeeFspFeeAmount": deps.fees.toString(),
            "payeeFspFeeAmountCurrency": this.zicbConfig.X_CURRENCY,
            "payeeReceiveAmount": deps.quoteRequest.amount,
            "payeeReceiveAmountCurrency": this.zicbConfig.X_CURRENCY,
            "quoteId": deps.quoteRequest.quoteId,
            "transferAmount": (deps.fees + Number(deps.quoteRequest.amount)).toString(),
            "transferAmountCurrency": deps.quoteRequest.currency,
            "transactionId": deps.quoteRequest.transactionId
        };
    }

    //  Check Quote Extension Lists -- (2.1)

    private checkQuoteExtensionLists(quoteRequest: TQuoteRequest): boolean {
        return !!(quoteRequest.to.extensionList && quoteRequest.from.extensionList && quoteRequest.to.extensionList.length > 0 && quoteRequest.from.extensionList.length > 0);
    }

    //  Get Quote Response Extension List -- (2.2.1)

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

    // QR & RT     --(2.2 & 3.2)

    private async checkAccountBarred(id: string): Promise<void> {

        const verifyCustomerByAccountNumberRequestBody = this.getVerifyByCustomerAccountNumberRequestBody(id);
        const res = await this.zicbClient.verifyCustomerByAccountNumber(verifyCustomerByAccountNumberRequestBody);

        // Currently all the account responses have a frozen status of "A" , what does it mean??

        if (res.response.accountList[0].frozenStatus !== "A") {
            throw ValidationError.accountBarredError();
        }
    }

    // QR & RT     --(2.3 & 3.3)
    private checkPayeeTransfersExtensionLists(transfer: TtransferRequest): boolean {
        return !!(transfer.to.extensionList && transfer.from.extensionList && transfer.to.extensionList.length > 0 && transfer.from.extensionList.length > 0);
    }


    //  Receive Transfer -- (3)

    async receiveTransfer(transfer: TtransferRequest): Promise<TtransferResponse> {
        this.logger.info(`Received transfer request for ${transfer.to.idValue}`);
        if (transfer.to.idType != this.IdType) {
            throw ValidationError.unsupportedIdTypeError();
        }
        if (transfer.currency !== this.zicbConfig.X_CURRENCY) {
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



    // Validate Quote -- (3.1)

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



    // update Transfer -- (4)
    async updateTransfer(updateTransferPayload: TtransferPatchNotificationRequest, transferId: string): Promise<void> {
        this.logger.info(`Committing transfer on patch notification for ${updateTransferPayload.quoteRequest?.body.payee.partyIdInfo.partyIdentifier} and transfer id ${transferId}`);
        if (updateTransferPayload.currentState !== 'COMPLETED') {
            throw ValidationError.transferNotCompletedError();
        }
        const disbursementToCustomerWalletRequest: TWalletToWalletInternalFundsTransferRequest = this.getDisbursementToCustomerWalletRequestBody(updateTransferPayload);
        try {
            await this.zicbClient.walletToWalletInternalFundsTransfer(disbursementToCustomerWalletRequest);
        } catch (error: unknown) {
            await this.initiateCompensationAction(disbursementToCustomerWalletRequest);
        }
    }

    // getDisbursementToCustomerWalletRequestBody DTO -- (4.1)
    private getDisbursementToCustomerWalletRequestBody(requestBody: TtransferPatchNotificationRequest): TWalletToWalletInternalFundsTransferRequest {
        if (!requestBody.quoteRequest) {
            throw ValidationError.quoteNotDefinedError('Quote Not Defined Error', '5000', 500);
        }

        if (!requestBody.transferId) {
            throw ValidationError.transferIdNotDefinedError("transferId not defined on patch notification handling", "5000", 500);
        }

        const today = new Date();
        const formattedDate = today.toISOString().split('T')[0];

        return {
            "service": "BNK9930",
            "request": {
                "amount": String(requestBody.quoteRequest.body.amount.amount),
                "destAcc": requestBody.quoteRequest.body.payee.partyIdInfo.partyIdentifier,
                "destBranch": "001",
                "payCurrency": config.get("zicb.X_CURRENCY"),
                "payDate": formattedDate,
                "referenceNo": Date.now().toString(),
                "remarks": "Payer's Message in Mojaloop Switch",
                "srcAcc": config.get("zicb.DISBURSEMENT_ACCOUNT_NO"),
                "srcBranch": "101",
                "srcCurrency": config.get("zicb.X_CURRENCY"),
                "transferTyp": "INTERNAL"
            }
        };
    }

    // initiateCompensationAction -- (4.2)
    private async initiateCompensationAction(req: TWalletToWalletInternalFundsTransferRequest) {
        this.logger.error("Failed to make transfer to customer", { request: req });
        await this.zicbClient.logFailedIncomingTransfer(req);
    }




    // Payer
    // Send Money -- (5)

    async sendMoney(transfer: TZicbSendMoneyRequest, amountType: "SEND" | "RECEIVE"): Promise<TZicbSendMoneyResponse> {
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

    // Handle Send Transfer -- (5.1)

    private async handleSendTransferRes(res: TSDKOutboundTransferResponse): Promise<TZicbSendMoneyResponse> {
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
        return this.getTZicbSendMoneyResponse(acceptRes.data);
    }

    // Handle Recieve Transfer  -- (5.2)

    private async handleReceiveTransferRes(res: TSDKOutboundTransferResponse): Promise<TZicbSendMoneyResponse> {
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
        return this.getTZicbSendMoneyResponse(acceptRes.data);
    }

    // Validate Conversion Terms (5.2.1)

    private validateConversionTerms(transferRes: TSDKOutboundTransferResponse): TValidationResponse {
        this.logger.info(`Validating Conversion Terms with transfer response amount ${transferRes.amount}`);
        let result = true;
        const message: string[] = [];
        if (
            !(this.zicbConfig.X_CURRENCY === transferRes.fxQuoteResponse?.body.conversionTerms.sourceAmount.currency)
        ) {
            result = false;
            message.push(`zicbConfig.TNM_CURRENCY ${this.zicbConfig.X_CURRENCY} did not match currency returned in transferRes.fxQuotesResponse?.body.conversionTerms.sourceAmount.currency ${transferRes.fxQuoteResponse?.body.conversionTerms.sourceAmount.currency}`);
        }
        if (transferRes.amountType === 'SEND') {
            if (!(transferRes.amount === transferRes.fxQuoteResponse?.body.conversionTerms.sourceAmount.amount)) {
                result = false;
                message.push(`transferRes.amount ${transferRes.amount} did not equal transferRes.fxQuotesResponse?.body.conversionTerms.sourceAmount.amount ${transferRes.fxQuoteResponse?.body.conversionTerms.sourceAmount.amount}}`);
            }
            if (transferRes.to.supportedCurrencies) {
                if (!transferRes.to.supportedCurrencies.some(value => value === transferRes.quoteResponse?.body.transferAmount.currency)) {
                    result = false;
                    message.push(`transferRes.to.supportedCurrencies ${transferRes.to.supportedCurrencies.toString()} did not contain transferRes.quoteResponse?.body.transferAmount.currency ${transferRes.quoteResponse?.body.transferAmount.currency} `);
                }
            }
            if (!(transferRes.currency === transferRes.fxQuoteResponse?.body.conversionTerms.sourceAmount.currency)) {
                result = false;
                message.push(`transferRes.currency ${transferRes.currency} did not equal transferRes.fxQuotesResponse?.body.conversionTerms.sourceAmount.currency ${transferRes.fxQuoteResponse?.body.conversionTerms.sourceAmount.currency}`);
            }
        } else if (transferRes.amountType === 'RECEIVE') {
            if (!(transferRes.amount === transferRes.fxQuoteResponse?.body.conversionTerms.targetAmount.amount)) {
                result = false;
                message.push(`transferRes.amount ${transferRes.amount} did not equal transferRes.fxQuotesResponse?.body.conversionTerms.targetAmount.amount ${transferRes.fxQuoteResponse?.body.conversionTerms.targetAmount.amount}`);
            }
            if (!(transferRes.currency === transferRes.quoteResponse?.body.transferAmount.currency)) {
                result = false;
                message.push(`transferRes.currency ${transferRes.currency} did not equal transferRes.quoteResponse?.body.transferAmount.currency ${transferRes.quoteResponse?.body.transferAmount.currency}`);
            }
        }
        return { result, message };
    }

    // Validate Returned  Quote (5.2.2)

    private validateReturnedQuote(outboundTransferRes: TSDKOutboundTransferResponse): TValidationResponse {
        this.logger.info(`Validating Retunred Quote with transfer response amount${outboundTransferRes.amount}`);
        let result = true;
        const message: string[] = [];
        if (outboundTransferRes.amountType === "SEND") {
            const validateFxRes = this.validateConversionTerms(outboundTransferRes);
            if (!validateFxRes.result) {
                result = false;
                message.push(...validateFxRes.message);
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
                message.push(`outboundTransferRes.amount ${outboundTransferRes.amount} did not equal quoteResponseBody.transferAmount.amount ${quoteResponseBody.transferAmount.amount} minus quoteResponseBody.payeeFspCommission?.amount ${quoteResponseBody.payeeFspCommission?.amount}`);
            }
            if (!quoteResponseBody.payeeReceiveAmount) {
                throw SDKClientError.genericQuoteValidationError("Payee Receive Amount not defined", { httpCode: 500, mlCode: "4000" });
            }
            if (!(parseFloat(quoteResponseBody.payeeReceiveAmount.amount) === parseFloat(quoteResponseBody.transferAmount.amount) - parseFloat(quoteResponseBody.payeeFspCommission?.amount || '0'))) {
                result = false;
                message.push(`quoteResponseBody.payeeReceiveAmount.amount ${quoteResponseBody.payeeReceiveAmount.amount} did not equal quoteResponseBody.transferAmount.amount ${quoteResponseBody.transferAmount.amount} minus quoteResponseBody.payeeFspCommission?.amount ${quoteResponseBody.payeeFspCommission?.amount}`);
            }
            if (!(fxQuoteResponseBody?.conversionTerms.targetAmount.amount === quoteResponseBody.transferAmount.amount)) {
                result = false;
                message.push(`fxQuoteResponseBody?.conversionTerms.targetAmount.amount ${fxQuoteResponseBody?.conversionTerms.targetAmount.amount} did not equal quoteResponseBody.transferAmount.amount ${quoteResponseBody.transferAmount.amount}`);
            }
        } else if (outboundTransferRes.amountType === "RECEIVE") {
            if (!outboundTransferRes.quoteResponse) {
                throw SDKClientError.noQuoteReturnedError();
            }
            if (!(parseFloat(outboundTransferRes.amount) === parseFloat(quoteResponseBody.transferAmount.amount) - parseFloat(quoteResponseBody.payeeFspCommission?.amount || "0") + parseFloat(quoteResponseBody.payeeFspFee?.amount || "0"))) {
                result = false;
                message.push(`outboundTransferRes.amount ${outboundTransferRes.amount} did not equal quoteResponseBody.transferAmount.amount ${quoteResponseBody.transferAmount.amount} minus quoteResponseBody.payeeFspCommission?.amount ${quoteResponseBody.payeeFspCommission?.amount} plus quoteResponseBody.payeeFspFee?.amount ${quoteResponseBody.payeeFspFee?.amount}`);
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

    private getTZicbSendMoneyResponse(transfer: TSDKOutboundTransferResponse): TZicbSendMoneyResponse {
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

    private async getTSDKOutboundTransferRequest(transfer: TZicbSendMoneyRequest, amountType: "SEND" | "RECEIVE"): Promise<TSDKOutboundTransferRequest> {

        const verifyCustomerByAccountNumberRequestBody = this.getVerifyByCustomerAccountNumberRequestBody(transfer.payer.payerId);
        const res = await this.zicbClient.verifyCustomerByAccountNumber(verifyCustomerByAccountNumberRequestBody);



        return {
            'homeTransactionId': randomUUID(),
            'from': {
                'idType': this.zicbConfig.SUPPORTED_ID_TYPE,
                'idValue': transfer.payer.payerId,
                'fspId': this.zicbConfig.FSP_ID,
                "displayName": `${res.response.accountList[0].accDesc}`,
                "firstName": this.extractNames(res.response.accountList[0].accDesc).firstName,
                "middleName": this.extractNames(res.response.accountList[0].accDesc).firstName,
                "lastName": this.extractNames(res.response.accountList[0].accDesc).lastName,
                "extensionList": this.getOutboundTransferExtensionList(transfer),
                "supportedCurrencies": [this.zicbConfig.X_CURRENCY]
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

    private getOutboundTransferExtensionList(sendMoneyRequestPayload: TZicbSendMoneyRequest): TPayerExtensionListEntry[] | undefined {
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

    // Update Send Money --(6)
    
    async updateSendMoney(updateSendMoneyDeps: TZicbUpdateSendMoneyRequest, transferId: string): Promise<void> {
        this.logger.info(`Updating transfer for id ${updateSendMoneyDeps.accountNo} and transfer id ${transferId}`);
        // const res = await this.zicbClient.walletToWalletInternalFundsTransfer(this.getCustomerToCollectionWalletRequestBody(updateSendMoneyDeps, transferId));
        try {
            if (!(updateSendMoneyDeps.acceptQuote)) {
                await this.sdkClient.updateTransfer({ acceptQuote: false }, transferId);
                throw ValidationError.quoteNotAcceptedError();
            }
            else {
                await this.sdkClient.updateTransfer({ acceptQuote: true }, transferId);
            }
        } catch (error: unknown) {
            if (error instanceof SDKClientError) {
                // perform refund or rollback if payment was successful
                if (updateSendMoneyDeps.acceptQuote) {
                    await this.handleRefund(this.getCollectionWalletToCustomerRequestBody(updateSendMoneyDeps, transferId));
                }
            }
        }
    }

    // Get CustomerToCollectionWalletRequestBody DTO -- (6.1)
    private getCollectionWalletToCustomerRequestBody(collection: TZicbUpdateSendMoneyRequest, transferId: string): TWalletToWalletInternalFundsTransferRequest {
        this.logger.info(`Getting Customer Funds with ${transferId}`);

        const today = new Date();
        const formattedDate = today.toISOString().split('T')[0];

        return {
            "service": "BNK9930",
            "request": {
                "amount": String(collection.amount),
                "destAcc": collection.accountNo,
                "destBranch": "001",
                "payCurrency": config.get("zicb.X_CURRENCY"),
                "payDate": formattedDate,
                "referenceNo": Date.now().toString(),
                "remarks": collection.payerMessage,
                "srcAcc":  config.get("zicb.COLLECTION_ACCOUNT_NO"),
                "srcBranch": "101",
                "srcCurrency": config.get("zicb.X_CURRENCY"),
                "transferTyp": "INTERNAL"
            }
        };
    }



    // async handleCallback(payload: TCallbackRequest): Promise<void> {
    //     this.logger.info(`Handling callback for transaction with id ${payload.transaction.id}`);
    //     try {
    //         if (payload.transaction.status_code === "TS") {
    //             await this.sdkClient.updateTransfer({ acceptQuote: true }, payload.transaction.id);
    //         } else {
    //             await this.sdkClient.updateTransfer({ acceptQuote: false }, payload.transaction.id);
    //         }
    //     } catch (error: unknown) {
    //         if (error instanceof SDKClientError) {
    //             // perform refund or rollback if payment was successful
    //             if (payload.transaction.status_code === "TS") {
    //                 await this.handleRefund(this.getRefundRequestBody(payload));
    //             }
    //         }
    //     }
    // }

    private async handleRefund(refund: TWalletToWalletInternalFundsTransferRequest): Promise<TWalletToWalletInternalFundsTransferResponse | undefined> {
        try {
            return await this.zicbClient.walletToWalletInternalFundsTransfer(refund);

        } catch (error: unknown) {
            this.zicbClient.logFailedRefund(refund);
        }
    }


}
