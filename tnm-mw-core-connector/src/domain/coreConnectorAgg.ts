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
            data: {
                displayName: `${lookupRes.data.full_name}`,
                firstName: lookupRes.data.full_name,
                idType: this.tnmClient.tnmConfig.SUPPORTED_ID_TYPE,
                extensionList: this.getGetPartiesExtensionList(),
                idValue: id,
                lastName: lookupRes.data.full_name,
                middleName: lookupRes.data.full_name,
                type: PartyType.CONSUMER,
                kycInformation: `${JSON.stringify(lookupRes)}`,
            },
            statusCode: 200,
        };
        this.logger.info(`Party found`, { party });
        return party;
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
        ]
    }

    async quoteRequest(quoteRequest: TQuoteRequest): Promise<TQuoteResponse> {
        this.logger.info(`Quote requests for ${this.IdType} ${quoteRequest.to.idValue}`);

        if (!this.checkQuoteExtensionLists(quoteRequest)) {
            throw ValidationError.invalidExtensionListsError(
                "Some extensionLists are undefined",
                '3100',
                500
            );
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
            transferAmount: (Number(quoteRequest.amount) + fees).toString() ,
            transferAmountCurrency: quoteRequest.currency,
        };
    }

    private checkQuoteExtensionLists(quoteRequest: TQuoteRequest): boolean {
        return !!(quoteRequest.to.extensionList && quoteRequest.from.extensionList && quoteRequest.to.extensionList.length > 0 && quoteRequest.from.extensionList.length > 0)
    }

    
    //TODO: Check actual response for barred accounts
    private async checkAccountBarred(msisdn: string): Promise<void> {
        const res = await this.tnmClient.getKyc({ msisdn: msisdn });
        if (res.message != "Completed successfully") {
            throw ValidationError.accountBarredError();
        }
    }

    

    private getQuoteResponseExtensionList(quoteRequest: TQuoteRequest): TPayeeExtensionListEntry[] {
        let newExtensionList: TPayeeExtensionListEntry[] = []
        //todo: check if the correct level of information has been provided.
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

        if (transfer.currency !== config.get("tnm.TNM_CURRENCY")) {
            this.logger.error("Unsupported currency ", { currency: transfer.currency });
            throw ValidationError.unsupportedCurrencyError();
        }

        if (!this.checkPayeeTransfersExtensionLists(transfer)) {
            throw ValidationError.invalidExtensionListsError(
                "ExtensionList check Failed in Payee Transfers",
                '3100',
                500
            )
        }

        if (!this.validateQuote(transfer)) {
            this.logger.error("Invalid quote", { quote: transfer });
            throw ValidationError.invalidQuoteError();
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

    private validateQuote(transfer: TtransferRequest): boolean {
        // todo define implmentation
        this.logger.info(`Validating code for transfer with amount ${transfer.amount}`);
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
            this.logger.error("transfer.amount !== transfer.quote.transferAmount - transfer.quote.payeeFspCommissionAmount");
            result = false;
        }

        if (!transfer.quote.payeeReceiveAmount || !transfer.quote.payeeFspFeeAmount) {
            this.logger.error("transfer.quote.payeeReceiveAmount or !transfer.quote.payeeFspFeeAmount not defined");
            throw ValidationError.notEnoughInformationError("transfer.quote.payeeReceiveAmount or !transfer.quote.payeeFspFeeAmount not defined", "5000");
        }

        if (
            parseFloat(transfer.quote.payeeReceiveAmount) !==
            parseFloat(transfer.quote.transferAmount) -
            parseFloat(transfer.quote.payeeFspFeeAmount)
        ) {
            this.logger.error("transfer.quote.payeeReceiveAmount !== transfer.quote.transferAmount - transfer.quote.payeeFspFeeAmount");
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

    
    async updateTransfer(updateTransferPayload: TtransferPatchNotificationRequest, transferId: string): Promise<void> {
        this.logger.info(`Committing transfer on patch notification for ${updateTransferPayload.quoteRequest?.body.payee.partyIdInfo.partyIdentifier} and transfer id ${transferId}`);
        if (updateTransferPayload.currentState !== 'COMPLETED') {
            throw ValidationError.transferNotCompletedError();
        }
        if (!this.validatePatchQuote(updateTransferPayload)) {
            throw ValidationError.invalidQuoteError();
        }

        const makePaymentRequest: TMakePaymentRequest = this.getMakePaymentRequestBody(updateTransferPayload);
        await this.tnmClient.sendMoney(makePaymentRequest);

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


    private validatePatchQuote(transfer: TtransferPatchNotificationRequest): boolean {
        this.logger.info(`Validating code for transfer with state ${transfer.currentState}`);
        // todo define implmentation
        return true;
    }


    // Payer
    async sendMoney(transfer: TNMSendMoneyRequest, amountType: "SEND" | "RECEIVE"): Promise<TNMSendMoneyResponse> {
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

    private async checkAndRespondToConversionTerms(res: THttpResponse<TSDKOutboundTransferResponse>): Promise<TNMSendMoneyResponse> {
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
            "receiveCurrency": transfer.fxQuotesResponse?.body.conversionTerms.targetAmount.currency !== undefined ? transfer.fxQuotesResponse?.body.conversionTerms.targetAmount.currency : "No Currency returned from Mojaloop Connector",
            "fees": transfer.quoteResponse?.body.payeeFspFee?.amount !== undefined ? transfer.quoteResponse?.body.payeeFspFee?.amount : "No fee amount returned from Mojaloop Connector",
            "feeCurrency": transfer.fxQuotesResponse?.body.conversionTerms.targetAmount.currency !== undefined ? transfer.fxQuotesResponse?.body.conversionTerms.targetAmount.currency : "No Fee currency retrned from Mojaloop Connector",
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
                "extensionList": this.getOutboundTransferExtensionList(transfer)
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

    private getOutboundTransferExtensionList(sendMoneyRequestPayload: TNMSendMoneyRequest): TPayerExtensionListEntry[] {
        return [
            {
                "key": "CdtTrfTxInf.Dbtr.PrvtId.DtAndPlcOfBirth.BirthDt",
                "value": sendMoneyRequestPayload.payer.DateAndPlaceOfBirth.BirthDt
            },
            {
                "key": "CdtTrfTxInf.Dbtr.PrvtId.DtAndPlcOfBirth.PrvcOfBirth",
                "value": sendMoneyRequestPayload.payer.DateAndPlaceOfBirth.PrvcOfBirth
            },
            {
                "key": "CdtTrfTxInf.Dbtr.PrvtId.DtAndPlcOfBirth.CityOfBirth",
                "value": sendMoneyRequestPayload.payer.DateAndPlaceOfBirth.CityOfBirth
            },
            {
                "key": "CdtTrfTxInf.Dbtr.PrvtId.DtAndPlcOfBirth.CtryOfBirth",
                "value": sendMoneyRequestPayload.payer.DateAndPlaceOfBirth.CtryOfBirth
            }
        ]
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
        try{
            if(payload.success){
                await this.sdkClient.updateTransfer({acceptQuote: true},payload.transaction_id);
            }else{
                await this.sdkClient.updateTransfer({acceptQuote: false},payload.transaction_id);
            }
        }catch (error: unknown){
            if(error instanceof SDKClientError){
                // perform refund or rollback
                await this.handleRefund(payload);
            }
        }
    }

    private async handleRefund(payload: TNMCallbackPayload){
        try{
            if(payload.success){
                await this.tnmClient.refundPayment({receipt_number:payload.receipt_number});
            }
        }catch(error: unknown){
            this.logger.error("Refund failed. Initiating manual process...");
            // todo: define a way to start a manual refund process.
            throw error;
        }
    }
}
