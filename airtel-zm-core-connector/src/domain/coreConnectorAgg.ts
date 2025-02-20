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
- Kasweka Michael Mukoko <kaswekamukoko@gmail.com>
 - Niza Tembo <mcwayzj@gmail.com>

 --------------
 ******/

'use strict';

import { randomUUID } from 'crypto';
import {
    PartyType,
    IAirtelClient,
    TAirtelDisbursementRequestBody,
    TAirtelConfig,
    TAirtelUpdateSendMoneyRequest,
    TAirtelCollectMoneyRequest,
    AirtelError,
    TCallbackRequest,
    TAirtelCollectMoneyResponse,
    TAirtelKycResponse,
} from './CBSClient';
import {
    ILogger,
    TLookupPartyInfoResponse,
    TQuoteResponse,
    TQuoteRequest,
    TtransferResponse,
    TtransferRequest,
    ValidationError,
    TtransferPatchNotificationRequest,
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
import {
    TAirtelSendMoneyRequest,
    TAirtelSendMoneyResponse,
} from './CBSClient';
import config from '../config';

export class CoreConnectorAggregate {
    public IdType: string;
    private logger: ILogger;
    DATE_FORMAT = 'dd MM yy';

    constructor(
        private readonly sdkClient: ISDKClient,
        private readonly airtelConfig: TAirtelConfig,
        private readonly airtelClient: IAirtelClient,
        logger: ILogger,
    ) {
        this.IdType = airtelConfig.SUPPORTED_ID_TYPE;
        this.logger = logger;
    }

    // Payee (These functions are used in the SDK Core Connector Routes)
    // Get Parties   --(1)
    async getParties(id: string, idType: string): Promise<TLookupPartyInfoResponse> {
        this.logger.info(`Get Parties for ${id}`);
        if (!(idType === config.get("airtel.SUPPORTED_ID_TYPE"))) {
            throw ValidationError.unsupportedIdTypeError();
        }

        const lookupRes = await this.airtelClient.getKyc({ msisdn: id });
        const party = {
            data: this.getPartiesResponseDTO(lookupRes, id),
            statusCode: Number(lookupRes.status.code),
        };
        this.logger.info(`Party found`, { party });
        return party;
    }

    private getPartiesResponseDTO(lookupRes: TAirtelKycResponse, id: string): Payee {
        return {
            idType: config.get("airtel.SUPPORTED_ID_TYPE"),
            idValue: id,
            displayName: `${lookupRes.data.first_name} ${lookupRes.data.last_name}`,
            firstName: lookupRes.data.first_name,
            middleName: lookupRes.data.first_name,
            type: PartyType.CONSUMER,
            kycInformation: `${JSON.stringify(lookupRes)}`,
            lastName: lookupRes.data.last_name,
            extensionList: this.getGetPartiesExtensionList(),
            supportedCurrencies: config.get("airtel.X_CURRENCY")
        };
    }

    // Get Extension List DTO to be used in Party Response on Extension List
    // Get Parties   --(1.1)
    private getGetPartiesExtensionList(): TPayeeExtensionListEntry[] {
        return [
            {
                "key": "Rpt.UpdtdPtyAndAcctId.Agt.FinInstnId.LEI",
                "value": config.get("airtel.LEI")
            },
            {
                "key": "Rpt.UpdtdPtyAndAcctId.Pty.CtryOfRes",
                "value": config.get("airtel.X_COUNTRY")
            }
        ];
    }


    //  Quote Requests(includes get kyc from get Parties)    --(2)
    async quoteRequest(quoteRequest: TQuoteRequest): Promise<TQuoteResponse> {
        this.logger.info(`Quote requests for ${this.IdType} ${quoteRequest.to.idValue}`);
        if (quoteRequest.to.idType !== this.IdType) {
            throw ValidationError.unsupportedIdTypeError();
        }

        if (quoteRequest.currency !== config.get("airtel.X_CURRENCY")) {
            throw ValidationError.unsupportedCurrencyError();
        }

        const res = await this.airtelClient.getKyc({
            msisdn: quoteRequest.to.idValue,

        });

        if (!this.checkQuoteExtensionLists(quoteRequest)) {
            this.logger.warn("Some extensionLists are undefined. Checks Failed", quoteRequest);
        }

        if (res.data.is_barred) {
            throw AirtelError.payeeBlockedError("Account is barred ", 500, "5400");
        }

        const serviceCharge = Number(config.get("airtel.SERVICE_CHARGE"));
        const fees = serviceCharge / 100 * Number(quoteRequest.amount);

        await this.checkAccountBarred(quoteRequest.to.idValue);

        const quoteExpiration = config.get("airtel.EXPIRATION_DURATION");
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
            transferAmount: quoteRequest.amount,
            transferAmountCurrency: quoteRequest.currency,
        };
    }

    private checkQuoteExtensionLists(quoteRequest: TQuoteRequest): boolean {
        return !!(quoteRequest.extensionList && quoteRequest.extensionList.length > 0);
    }


    // Get Quote Resonse Extension List DTO to be used in Quote Response on Extension List
    // Get Quote    --(2.3)
    private getQuoteResponseExtensionList(quoteRequest: TQuoteRequest): TPayeeExtensionListEntry[] {
        this.logger.info(`QuoteRequest ${quoteRequest}`);
        return [
            ...this.getGetPartiesExtensionList()
        ];
    }


    // Receive Transfers(Payee getting funds)     --(3)
    async receiveTransfer(transfer: TtransferRequest): Promise<TtransferResponse> {
        this.logger.info(`Transfer for  ${this.IdType} ${transfer.to.idValue}`);
        if (transfer.to.idType != this.IdType) {
            throw ValidationError.unsupportedIdTypeError();
        }
        if (transfer.currency !== config.get("airtel.X_CURRENCY")) {
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

    // QR & RT     --(2.1 & 3.1)
    private async checkAccountBarred(msisdn: string): Promise<void> {

        const res = await this.airtelClient.getKyc({ msisdn: msisdn });

        if (res.data.is_barred) {
            throw ValidationError.accountBarredError();
        }
    }


    // RT  --(3.1)
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

    // Check Transfer Amount Type in Validate Quote    --(3.1.1)
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

    // Check Recieve Amount Type in Validate Quote     --(3.1.1)
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

    // Check Payee Transfer Extension Lists in Receive Transfer  -- (3.1.2)
    private checkPayeeTransfersExtensionLists(transfer: TtransferRequest): boolean {
        this.logger.info(`checking Payee Transfer Extension List ${transfer}`);
        return !!(transfer.to.extensionList && transfer.from.extensionList && transfer.to.extensionList.length > 0 && transfer.from.extensionList.length > 0);
    }

    // Update Transfer   --(4)
    async updateTransfer(updateTransferPayload: TtransferPatchNotificationRequest, transferId: string): Promise<void> {
        this.logger.info(`Committing The Transfer with id ${transferId}`);
        if (updateTransferPayload.currentState !== 'COMPLETED') {
            throw ValidationError.transferNotCompletedError();
        }

        const airtelDisbursementRequest: TAirtelDisbursementRequestBody = this.getDisbursementRequestBody(updateTransferPayload);
        try {
            await this.airtelClient.sendMoney(airtelDisbursementRequest);
        } catch (error: unknown) {
            await this.initiateCompensationAction(airtelDisbursementRequest);
        }
    }

    private async initiateCompensationAction(req: TAirtelDisbursementRequestBody) {
        this.logger.error("Failed to make transfer to customer", { request: req });
        await this.airtelClient.logFailedIncomingTransfer(req);
    }


    //Get Disbursements Transfer   --(4.1)

    private getDisbursementRequestBody(requestBody: TtransferPatchNotificationRequest): TAirtelDisbursementRequestBody {
        if (!requestBody.quoteRequest) {
            throw ValidationError.quoteNotDefinedError('Quote Not Defined Error', '5000', 500);
        }
        return {
            "payee": {
                "msisdn": requestBody.quoteRequest.body.payee.partyIdInfo.partyIdentifier,
                "wallet_type": "NORMAL"
            },
            "reference": requestBody.quoteRequest.body.transactionId,
            "pin": this.airtelConfig.AIRTEL_PIN,
            "transaction": {
                "amount": Number(requestBody.quoteRequest.body.amount),
                "id": requestBody.quoteRequest.body.transactionId,
                "type": "B2C"
            }
        };
    }



    //  Payer (These are used in the DFSP Core Connector Routes)
    // Send Transfer  -- (5)

    async sendMoney(transfer: TAirtelSendMoneyRequest, amountType: "SEND" | "RECEIVE"): Promise<TAirtelSendMoneyResponse> {
        this.logger.info(`Transfer from airtel account with ID${transfer.payer.payerId}`);

        const transferRequest: TSDKOutboundTransferRequest = await this.getTSDKOutboundTransferRequest(transfer, amountType);
        const res = await this.sdkClient.initiateTransfer(transferRequest);
        if (res.data.currentState === "WAITING_FOR_CONVERSION_ACCEPTANCE") {
            return this.handleSendTransferRes(res.data);
        } else if (res.data.currentState === "WAITING_FOR_QUOTE_ACCEPTANCE") {
            return this.handleReceiveTransferRes(res.data);
        } else {
            throw SDKClientError.returnedCurrentStateUnsupported(`Returned currentStateUnsupported. ${res.data.currentState}`, { httpCode: 500, mlCode: "2000" });
        }
    }

    private checkPayeeKYCInformation(res: TSDKOutboundTransferResponse | TtransferContinuationResponse): boolean {
        return !!(res.quoteResponse?.body.extensionList?.extension && res.quoteResponse?.body.extensionList?.extension.length > 0);
    }

    private async handleSendTransferRes(res: TSDKOutboundTransferResponse): Promise<TAirtelSendMoneyResponse> {
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
        return this.getTAirtelSendMoneyResponse(acceptRes.data);
    }

    private async handleReceiveTransferRes(res: TSDKOutboundTransferResponse): Promise<TAirtelSendMoneyResponse> {
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
        return this.getTAirtelSendMoneyResponse(acceptRes.data);
    }

    // Get TSDKOutbound Transfer Request DTO --(5.1) 
    private async getTSDKOutboundTransferRequest(transfer: TAirtelSendMoneyRequest, amountType: "SEND" | "RECEIVE"): Promise<TSDKOutboundTransferRequest> {
        const res = await this.airtelClient.getKyc({
            msisdn: transfer.payer.payerId
        });
        return {
            'homeTransactionId': randomUUID(),
            'from': {
                'idType': this.airtelConfig.SUPPORTED_ID_TYPE,
                'idValue': transfer.payer.payerId,
                'fspId': this.airtelConfig.FSP_ID,
                "displayName": `${res.data.first_name} ${res.data.last_name}`,
                "firstName": res.data.first_name,
                "middleName": res.data.first_name,
                "lastName": res.data.last_name,
                "merchantClassificationCode": "123",
                "supportedCurrencies": [this.airtelConfig.X_CURRENCY]
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

    // Get OutBound Transfer Extension List DTO used in getTSDKOutboundTransferRequest DTO --(5.1.1)
    private getOutboundTransferExtensionList(sendMoneyRequestPayload: TAirtelSendMoneyRequest): TPayerExtensionListEntry[] | undefined {
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


    //  Airtel Send Money Response DTO  --(5.1)
    private getTAirtelSendMoneyResponse(transfer: TSDKOutboundTransferResponse): TAirtelSendMoneyResponse {
        this.logger.info(`Getting response for transfer with Id ${transfer.transferId}`);
        return {
            "payeeDetails": {
                "idType": transfer.to.idType,
                "idValue": transfer.to.idValue,
                "fspId": transfer.to.fspId !== undefined ? transfer.to.fspId : "No FSP ID Returned",
                "displayName": transfer.getPartiesResponse !== undefined ? transfer.getPartiesResponse.body.party.name : "Chikondi Banda",
                "dateOfBirth": transfer.to.dateOfBirth !== undefined ? transfer.to.dateOfBirth : "No Date of Birth Returned",
            },
            "receiveAmount": transfer.quoteResponse?.body.payeeReceiveAmount?.amount !== undefined ? transfer.quoteResponse.body.payeeReceiveAmount.amount : "No payee receive amount",
            "receiveCurrency": transfer.fxQuoteResponse?.body.conversionTerms.targetAmount.currency !== undefined ? transfer.fxQuoteResponse?.body.conversionTerms.targetAmount.currency : "No Currency returned from Mojaloop Connector",
            "fees": transfer.quoteResponse?.body.payeeFspFee?.amount !== undefined ? transfer.quoteResponse?.body.payeeFspFee?.amount : "No fee amount returned from Mojaloop Connector",
            "feeCurrency": transfer.fxQuoteResponse?.body.conversionTerms.targetAmount.currency !== undefined ? transfer.fxQuoteResponse?.body.conversionTerms.targetAmount.currency : "No Fee currency retrned from Mojaloop Connector",
            "transactionId": transfer.transferId !== undefined ? transfer.transferId : "No transferId returned",
        };
    }

    // Validation of Conversion Terms --(5.1)

    private validateConversionTerms(transferRes: TSDKOutboundTransferResponse): TValidationResponse {
        this.logger.info(`Validating Conversion Terms with transfer response amount ${transferRes.amount}`);
        let result = true;
        const message: string[] = [];
        if (
            !(this.airtelConfig.X_CURRENCY === transferRes.fxQuoteResponse?.body.conversionTerms.sourceAmount.currency)
        ) {
            result = false;
            message.push(`airtelConfig.TNM_CURRENCY ${this.airtelConfig.X_CURRENCY} did not match currency returned in transferRes.fxQuotesResponse?.body.conversionTerms.sourceAmount.currency ${transferRes.fxQuoteResponse?.body.conversionTerms.sourceAmount.currency}`);
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

    //  Validion of Returned Quotes --(5.1)
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

    // Update Sent Transfer --(6)
    async updateSentTransfer(transferAccept: TAirtelUpdateSendMoneyRequest, transferId: string): Promise<TAirtelCollectMoneyResponse> {
        this.logger.info(`Updating transfer for id ${transferAccept.msisdn} and transfer id ${transferId}`);

        if (!(transferAccept.acceptQuote)) {
            throw ValidationError.quoteNotAcceptedError();
        }
        return await this.airtelClient.collectMoney(this.getTAirtelCollectMoneyRequest(transferAccept, transferId));
    }

    // Get Airtel Collect Money Request DT0  --(6.1)
    private getTAirtelCollectMoneyRequest(collection: TAirtelUpdateSendMoneyRequest, transferId: string): TAirtelCollectMoneyRequest {
        return {
            "reference": "string",
            "subscriber": {
                "country": this.airtelConfig.X_COUNTRY,
                "currency": this.airtelConfig.X_CURRENCY,
                "msisdn": collection.msisdn,
            },
            "transaction": {
                "amount": Number(collection.amount),
                "country": this.airtelConfig.X_COUNTRY,
                "currency": this.airtelConfig.X_CURRENCY,
                "id": transferId,
            }
        };
    }


    // Handle Call Back --(7)
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
                await this.handleRefund(payload);
            }
        }
    }

    // Handle Refund  --(7.1)
    private async handleRefund(payload: TCallbackRequest) {
        try {
            if (payload.transaction.status_code === "TS") {
                await this.airtelClient.refundMoney({
                    "transaction": {
                        "airtel_money_id": payload.transaction.airtel_money_id,
                    }
                });
            }
        } catch (error: unknown) {
            this.logger.error("Refund failed. Initiating manual process...");
            this.airtelClient.logFailedRefund(payload.transaction.airtel_money_id);
        }
    }
}
