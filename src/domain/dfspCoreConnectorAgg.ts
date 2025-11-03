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

import {
    ICbsClient,
    TCBSConfig,
    TCbsMerchantPaymentRequest,
    TCbsSendMoneyRequest,
    TCbsSendMoneyResponse,
    TCBSUpdateSendMoneyRequest,
    TCBSUpdateSendMoneyResponse,
} from './CBSClient';
import {
    ILogger,
    TQuoteResponse,
    TQuoteRequest,
    TtransferResponse,
    TtransferRequest,
    IDFSPCoreConnectorAggregate,
    TtransferPatchNotificationRequest,
    THttpResponse,
    AggregateError,
    Party,
    TPayerExtensionListEntry,
    TValidationResponse
} from './interfaces';
import {
    ISDKClient,
    SDKClientError,
    TAccountCreationRequest,
    TAccountCreationResponse,
    TGetTransfersResponse,
    TSDKOutboundTransferRequest,
    TSDKOutboundTransferResponse,
    TtransferContinuationResponse,
} from './SDKClient';
import { isAxiosLikeError } from './utils';

export const aggregateFactory = <D>(
    cbsConfig: TCBSConfig<D>,
    cbsClient: ICbsClient,
    sdkClient: ISDKClient,
    logger: ILogger,
): IDFSPCoreConnectorAggregate<D> => {
    return new DFSPCoreConnectorAggregate<D>(sdkClient, cbsClient, cbsConfig, logger);
};

export class DFSPCoreConnectorAggregate<D> implements IDFSPCoreConnectorAggregate<D> {
    IdType: string;
    logger: ILogger;
    DATE_FORMAT = 'dd MM yy';

    constructor(
        readonly sdkClient: ISDKClient,
        readonly cbsClient: ICbsClient,
        readonly cbsConfig: TCBSConfig<D>,
        logger: ILogger,
    ) {
        this.IdType = this.cbsConfig.SUPPORTED_ID_TYPE;
        this.logger = logger;
    }

    //Payee
    async getParties(id: string, IdType: string): Promise<Party> {
        this.logger.info(`Getting party information for ${id}`);
        if (!(IdType === this.cbsConfig.SUPPORTED_ID_TYPE)) {
            throw AggregateError.unsupportedIdTypeError();
        }
        return await this.cbsClient.getAccountInfo({ accountId: id });
    }

    async quoteRequest(quoteRequest: TQuoteRequest): Promise<TQuoteResponse> {
        this.logger.info(`Calculating quote for ${quoteRequest.to.idValue} and amount ${quoteRequest.amount}`);
        if (quoteRequest.to.idType !== this.cbsConfig.SUPPORTED_ID_TYPE) {
            throw AggregateError.unsupportedIdTypeError();
        }
        if (quoteRequest.currency !== this.cbsConfig.CURRENCY) {
            throw AggregateError.unsupportedCurrencyError();
        }
        if (!this.checkQuoteExtensionLists(quoteRequest)) {
            this.logger.warn('Some extensionLists are undefined. Checks Failed', quoteRequest);
        }
        return await this.cbsClient.getQuote(quoteRequest);
    }

    private checkQuoteExtensionLists(quoteRequest: TQuoteRequest): boolean {
        return !!(
            quoteRequest.to.extensionList &&
            quoteRequest.from.extensionList &&
            quoteRequest.to.extensionList.length > 0 &&
            quoteRequest.from.extensionList.length > 0
        );
    }

    async receiveAndReserveTransfer(transfer: TtransferRequest): Promise<TtransferResponse> {
        this.logger.info(`Received transfer request for ${transfer.to.idValue}`);
        if (transfer.to.idType != this.IdType) {
            throw AggregateError.unsupportedIdTypeError();
        }
        if (transfer.currency !== this.cbsConfig.CURRENCY) {
            throw AggregateError.unsupportedCurrencyError();
        }
        if (!this.checkPayeeTransfersExtensionLists(transfer)) {
            this.logger.warn('Some extensionLists are undefined; Checks Failed', transfer);
        }
        const validateQuoteRes = this.validateQuote(transfer);
        if (!validateQuoteRes.result) {
            throw AggregateError.invalidQuoteError(validateQuoteRes.message.toString());
        }
        return await this.cbsClient.reserveFunds(transfer);
    }

    private checkPayeeTransfersExtensionLists(transfer: TtransferRequest): boolean {
        return !!(
            transfer.to.extensionList &&
            transfer.from.extensionList &&
            transfer.to.extensionList.length > 0 &&
            transfer.from.extensionList.length > 0
        );
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
        ) {
            result = false;
            message.push(
                `transfer.amount ${transfer.amount} did not equal transfer.quote.transferAmount ${transfer.quote.transferAmount} minus transfer.quote.payeeFspCommissionAmount ${transfer.quote.payeeFspCommissionAmount} `,
            );
        }

        if (!transfer.quote.payeeReceiveAmount || !transfer.quote.payeeFspFeeAmount) {
            throw AggregateError.notEnoughInformationError(
                'transfer.quote.payeeReceiveAmount or !transfer.quote.payeeFspFeeAmount not defined',
                '5000',
            );
        }

        if (
            parseFloat(transfer.quote.payeeReceiveAmount) !==
            parseFloat(transfer.quote.transferAmount) - parseFloat(transfer.quote.payeeFspFeeAmount)
        ) {
            result = false;
            message.push(
                `transfer.quote.payeeReceiveAmount ${transfer.quote.payeeReceiveAmount} is equal to transfer.quote.transferAmount ${transfer.quote.transferAmount} minus transfer.quote.payeeFspFeeAmount ${transfer.quote.payeeFspFeeAmount} `,
            );
        }
        return { result, message };
    }

    private checkReceiveAmounts(transfer: TtransferRequest): TValidationResponse {
        this.logger.info('Validating Type Receive Quote...', { transfer });
        let result = true;
        const message: string[] = [];
        if (!transfer.quote.payeeFspFeeAmount || !transfer.quote.payeeReceiveAmount) {
            throw AggregateError.notEnoughInformationError(
                'transfer.quote.payeeFspFeeAmount or transfer.quote.payeeReceiveAmount not defined',
                '5000',
            );
        }
        if (
            parseFloat(transfer.amount) !==
            parseFloat(transfer.quote.transferAmount) -
                parseFloat(transfer.quote.payeeFspCommissionAmount || '0') +
                parseFloat(transfer.quote.payeeFspFeeAmount)
        ) {
            result = false;
            message.push(
                `transfer.amount ${transfer.amount} is equal to transfer.quote.transferAmount ${transfer.quote.transferAmount} minus transfer.quote.payeeFspCommissionAmount || 0 ${transfer.quote.payeeFspCommissionAmount} plus transfer.quote.payeeFspFeeAmount ${transfer.quote.payeeFspFeeAmount}`,
            );
        }

        if (parseFloat(transfer.quote.payeeReceiveAmount) !== parseFloat(transfer.quote.transferAmount)) {
            result = false;
            message.push(
                `transfer.quote.payeeReceiveAmount ${transfer.quote.payeeReceiveAmount} is equal to transfer.quote.transferAmount ${transfer.quote.transferAmount}`,
            );
        }
        return { result, message };
    }

    async updateAndCommitTransferOnPatchNotification(
        updateTransferPayload: TtransferPatchNotificationRequest,
        transferId: string,
    ): Promise<void> {
        this.logger.info(
            `Committing transfer on patch notification for ${updateTransferPayload.quoteRequest?.body.payee.partyIdInfo.partyIdentifier} and transfer id ${transferId}`,
        );
        if (updateTransferPayload.currentState !== 'COMPLETED') {
            await this.cbsClient.unreserveFunds(updateTransferPayload);
            throw AggregateError.transferNotCompletedError();
        }
        return await this.cbsClient.commitReservedFunds(updateTransferPayload);
    }

    // Payer
    async sendMoney(transfer: TCbsSendMoneyRequest, amountType: 'SEND' | 'RECEIVE'): Promise<TCbsSendMoneyResponse> {
        this.logger.info(`Received send money request for payer with ID ${transfer.payer.payerId}`);
        if(this.cbsConfig.CURRENCY_MODE === "single"){
            if(transfer.receiveCurrency !== transfer.sendCurrency){
                throw AggregateError.unsupportedCurrencyError("Receive Currency and Send Currency are different.")
            }
        }
        const res = await this.sdkClient.initiateTransfer(
            await this.getTSDKOutboundTransferRequest(transfer, amountType),
        );
        this.logger.info(`Handling Send Money in ${this.cbsConfig.CURRENCY_MODE} Currency`);
        if(this.cbsConfig.CURRENCY_MODE === "multiple" || !this.cbsConfig.CURRENCY_MODE){
            return this.handleMultiCurrency(res.data,transfer.homeTransactionId);
        }else{
            return this.handleSingleCurrency(res.data, transfer.homeTransactionId);
        }
    }

    async handleSingleCurrency(res: TSDKOutboundTransferResponse, homeTransactionId?: string ): Promise<TCbsSendMoneyResponse> {
        return this.getTCbsSendMoneyResponse(res,homeTransactionId);
    }

    async handleMultiCurrency(res: TSDKOutboundTransferResponse, homeTransactionId?: string): Promise<TCbsSendMoneyResponse> {
        if (res.currentState === 'WAITING_FOR_CONVERSION_ACCEPTANCE') {
            return this.handleSendTransferRes(res, homeTransactionId);
        } else if (res.currentState === 'WAITING_FOR_QUOTE_ACCEPTANCE') {
            return this.handleReceiveTransferRes(res, homeTransactionId);
        } else {
            throw SDKClientError.returnedCurrentStateUnsupported(
                `Returned currentStateUnsupported. ${res.currentState}`,
                { httpCode: 500, mlCode: '2000' },
            );
        }
    }

    private async handleSendTransferRes(
        res: TSDKOutboundTransferResponse,
        homeTransactionId: string | undefined,
    ): Promise<TCbsSendMoneyResponse> {
        /*
            check fxQuote
            respond to conversion terms
            receive response from sdk
            check return quote
            return normalQuote in required format for customer to review 
        */
        let acceptRes: THttpResponse<TtransferContinuationResponse>;
        if (!res.transferId) {
            throw AggregateError.transferIdNotDefinedError('Transfer Id not defined in transfer response', '4000', 500);
        }
        const validateFxRes = this.validateConversionTerms(res);
        if (!validateFxRes.result) {
            acceptRes = await this.sdkClient.updateTransfer(
                {
                    acceptConversion: false,
                },
                res.transferId,
            );
            throw AggregateError.invalidConversionQuoteError(validateFxRes.message.toString(), '4000', 500);
        }
        acceptRes = await this.sdkClient.updateTransfer(
            {
                acceptConversion: true,
            },
            res.transferId,
        );
        const validateQuoteRes = this.validateReturnedQuote(acceptRes.data);
        if (!validateQuoteRes.result) {
            throw AggregateError.invalidReturnedQuoteError(validateQuoteRes.message.toString());
        }
        return this.getTCbsSendMoneyResponse(acceptRes.data, homeTransactionId);
    } 

    private async handleReceiveTransferRes(
        res: TSDKOutboundTransferResponse,
        homeTransactionId: string | undefined,
    ): Promise<TCbsSendMoneyResponse> {
        /*
            check returned normalQuote
            respond to quote 
            receive response from sdk
            check fxQuote
            return returned quote in format specified for customer to review 
        */
        let acceptRes: THttpResponse<TtransferContinuationResponse>;
        if (!res.transferId) {
            throw AggregateError.transferIdNotDefinedError('Transfer Id not defined in transfer response', '4000', 500);
        }
        const validateQuoteRes = this.validateReturnedQuote(res);
        if (!validateQuoteRes.result) {
            acceptRes = await this.sdkClient.updateTransfer(
                {
                    acceptQuote: false,
                },
                res.transferId,
            );
            throw AggregateError.invalidReturnedQuoteError(validateQuoteRes.message.toString());
        }
        acceptRes = await this.sdkClient.updateTransfer(
            {
                acceptQuote: true,
            },
            res.transferId,
        );
        const validateFxRes = this.validateConversionTerms(acceptRes.data);
        if (!validateFxRes.result) {
            throw AggregateError.invalidConversionQuoteError(validateFxRes.message.toString(), '4000', 500);
        }
        return this.getTCbsSendMoneyResponse(acceptRes.data, homeTransactionId);
    }

    private validateConversionTerms(transferRes: TSDKOutboundTransferResponse): TValidationResponse {
        this.logger.info(`Validating Conversion Terms with transfer response amount ${transferRes.amount}`);
        let result = true;
        const message: string[] = [];
        if (!(this.cbsConfig.CURRENCY === transferRes.fxQuoteResponse?.body.conversionTerms.sourceAmount.currency)) {
            result = false;
            message.push(
                `cbsConfig.CURRENCY ${this.cbsConfig.CURRENCY} did not match currency returned in transferRes.fxQuotesResponse?.body.conversionTerms.sourceAmount.currency ${transferRes.fxQuoteResponse?.body.conversionTerms.sourceAmount.currency}`,
            );
        }
        if (transferRes.amountType === 'SEND') {
            if (!(transferRes.amount === transferRes.fxQuoteResponse?.body.conversionTerms.sourceAmount.amount)) {
                result = false;
                message.push(
                    `transferRes.amount ${transferRes.amount} did not equal transferRes.fxQuotesResponse?.body.conversionTerms.sourceAmount.amount ${transferRes.fxQuoteResponse?.body.conversionTerms.sourceAmount.amount}}`,
                );
            }
            if (transferRes.to.supportedCurrencies) {
                if (
                    !transferRes.to.supportedCurrencies.some(
                        (value) => value === transferRes.quoteResponse?.body.transferAmount.currency,
                    )
                ) {
                    result = false;
                    message.push(
                        `transferRes.to.supportedCurrencies ${transferRes.to.supportedCurrencies.toString()} did not contain transferRes.quoteResponse?.body.transferAmount.currency ${transferRes.quoteResponse?.body.transferAmount.currency} `,
                    );
                }
            }
            if (!(transferRes.currency === transferRes.fxQuoteResponse?.body.conversionTerms.sourceAmount.currency)) {
                result = false;
                message.push(
                    `transferRes.currency ${transferRes.currency} did not equal transferRes.fxQuotesResponse?.body.conversionTerms.sourceAmount.currency ${transferRes.fxQuoteResponse?.body.conversionTerms.sourceAmount.currency}`,
                );
            }
        } else if (transferRes.amountType === 'RECEIVE') {
            if (!(transferRes.amount === transferRes.fxQuoteResponse?.body.conversionTerms.targetAmount.amount)) {
                result = false;
                message.push(
                    `transferRes.amount ${transferRes.amount} did not equal transferRes.fxQuotesResponse?.body.conversionTerms.targetAmount.amount ${transferRes.fxQuoteResponse?.body.conversionTerms.targetAmount.amount}`,
                );
            }
            if (!(transferRes.currency === transferRes.quoteResponse?.body.transferAmount.currency)) {
                result = false;
                message.push(
                    `transferRes.currency ${transferRes.currency} did not equal transferRes.quoteResponse?.body.transferAmount.currency ${transferRes.quoteResponse?.body.transferAmount.currency}`,
                );
            }
        }
        return { result, message };
    }

    private validateReturnedQuote(outboundTransferRes: TSDKOutboundTransferResponse): TValidationResponse {
        this.logger.info(`Validating Retunred Quote with transfer response amount${outboundTransferRes.amount}`);
        let result = true;
        const message: string[] = [];
        if (outboundTransferRes.amountType === 'SEND') {
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
        if (outboundTransferRes.amountType === 'SEND') {
            const quoteRequestAmount: string = outboundTransferRes.fxQuoteResponse?.body?.conversionTerms?.targetAmount
                ?.amount
                ? outboundTransferRes.fxQuoteResponse?.body?.conversionTerms?.targetAmount?.amount
                : outboundTransferRes.amount;
            if (
                !(
                    parseFloat(quoteRequestAmount) ===
                    parseFloat(quoteResponseBody.transferAmount.amount) -
                        parseFloat(quoteResponseBody.payeeFspCommission?.amount || '0')
                )
            ) {
                result = false;
                message.push(
                    `outboundTransferRes.amount ${outboundTransferRes.amount} did not equal quoteResponseBody.transferAmount.amount ${quoteResponseBody.transferAmount.amount} minus quoteResponseBody.payeeFspCommission?.amount ${quoteResponseBody.payeeFspCommission?.amount}`,
                );
            }
            if (!quoteResponseBody.payeeReceiveAmount) {
                throw SDKClientError.genericQuoteValidationError('Payee Receive Amount not defined', {
                    httpCode: 500,
                    mlCode: '4000',
                });
            }
            if (
                !(
                    parseFloat(quoteResponseBody.payeeReceiveAmount.amount) ===
                    parseFloat(quoteResponseBody.transferAmount.amount) -
                        parseFloat(quoteResponseBody.payeeFspCommission?.amount || '0')
                )
            ) {
                result = false;
                message.push(
                    `quoteResponseBody.payeeReceiveAmount.amount ${quoteResponseBody.payeeReceiveAmount.amount} did not equal quoteResponseBody.transferAmount.amount ${quoteResponseBody.transferAmount.amount} minus quoteResponseBody.payeeFspCommission?.amount ${quoteResponseBody.payeeFspCommission?.amount}`,
                );
            }
            if (
                !(fxQuoteResponseBody?.conversionTerms.targetAmount.amount === quoteResponseBody.transferAmount.amount)
            ) {
                result = false;
                message.push(
                    `fxQuoteResponseBody?.conversionTerms.targetAmount.amount ${fxQuoteResponseBody?.conversionTerms.targetAmount.amount} did not equal quoteResponseBody.transferAmount.amount ${quoteResponseBody.transferAmount.amount}`,
                );
            }
        } else if (outboundTransferRes.amountType === 'RECEIVE') {
            if (!outboundTransferRes.quoteResponse) {
                throw SDKClientError.noQuoteReturnedError();
            }
            if (
                !(
                    parseFloat(outboundTransferRes.amount) ===
                    parseFloat(quoteResponseBody.transferAmount.amount) -
                        parseFloat(quoteResponseBody.payeeFspCommission?.amount || '0') +
                        parseFloat(quoteResponseBody.payeeFspFee?.amount || '0')
                )
            ) {
                result = false;
                message.push(
                    `outboundTransferRes.amount ${outboundTransferRes.amount} did not equal quoteResponseBody.transferAmount.amount ${quoteResponseBody.transferAmount.amount} minus quoteResponseBody.payeeFspCommission?.amount ${quoteResponseBody.payeeFspCommission?.amount} plus quoteResponseBody.payeeFspFee?.amount ${quoteResponseBody.payeeFspFee?.amount}`,
                );
            }

            if (!(quoteResponseBody.payeeReceiveAmount?.amount === quoteResponseBody.transferAmount.amount)) {
                result = false;
                message.push(
                    `quoteResponseBody.payeeReceiveAmount?.amount ${quoteResponseBody.payeeReceiveAmount?.amount} did not equal quoteResponseBody.transferAmount.amount ${quoteResponseBody.transferAmount.amount}`,
                );
            }
            if (fxQuoteResponseBody) {
                if (
                    !(
                        fxQuoteResponseBody.conversionTerms.targetAmount.amount ===
                        quoteResponseBody.transferAmount.amount
                    )
                ) {
                    result = false;
                    message.push(
                        `fxQuoteResponseBody.conversionTerms.targetAmount.amount ${fxQuoteResponseBody.conversionTerms.targetAmount.amount} did not equal quoteResponseBody.transferAmount.amount ${quoteResponseBody.transferAmount.amount}`,
                    );
                }
            }
        } else {
            SDKClientError.genericQuoteValidationError('Invalid amountType received', {
                httpCode: 500,
                mlCode: '4000',
            });
        }
        return { result, message };
    }

    private getTCbsSendMoneyResponse(
        transfer: TSDKOutboundTransferResponse,
        homeTransactionId: string | undefined,
    ): TCbsSendMoneyResponse {
        this.logger.info(`Getting response for transfer with Id ${transfer.transferId}`);
        return {
            payeeDetails: {
                idType: transfer.to.idType,
                idValue: transfer.to.idValue,
                fspId: transfer.to.fspId !== undefined ? transfer.to.fspId : 'No FSP ID Returned',
                name:
                    transfer.getPartiesResponse?.body.party.name !== undefined
                        ? transfer.getPartiesResponse?.body.party.name
                        : '',
                fspLEI: this.cbsConfig.LEI,
            },
            sendAmount:
                transfer.fxQuoteResponse?.body.conversionTerms.sourceAmount.amount !== undefined
                    ? transfer.fxQuoteResponse.body.conversionTerms.sourceAmount.amount
                    : 'No send amount ',
            sendCurrency:
                transfer.fxQuoteResponse?.body.conversionTerms.sourceAmount.currency !== undefined
                    ? transfer.fxQuoteResponse.body.conversionTerms.sourceAmount.currency
                    : 'No send currency ',
            receiveAmount:
                transfer.quoteResponse?.body.payeeReceiveAmount?.amount !== undefined
                    ? transfer.quoteResponse.body.payeeReceiveAmount.amount
                    : 'No payee receive amount',
            receiveCurrency:
                transfer.fxQuoteResponse?.body.conversionTerms.targetAmount.currency !== undefined
                    ? transfer.fxQuoteResponse?.body.conversionTerms.targetAmount.currency
                    : 'No Currency returned from Mojaloop Connector',
            targetFees: this.getQuoteCharges(transfer),
            sourceFees: this.getFxQuoteResponseCharges(transfer),
            transactionId: transfer.transferId !== undefined ? transfer.transferId : 'No transferId returned',
            homeTransactionId: homeTransactionId ? homeTransactionId : 'undefined',
        };
    }

    private getQuoteCharges(transferRes: TSDKOutboundTransferResponse): string {
        return parseFloat(transferRes.quoteResponse?.body.payeeFspFee?.amount ?? '0').toString();
    }

    private getFxQuoteResponseCharges(data: TSDKOutboundTransferResponse): string {
        if (data.fxQuoteResponse && data.fxQuoteResponse.body.conversionTerms.charges) {
            return data.fxQuoteResponse.body.conversionTerms.charges
                .reduce((total, charge) => {
                    return total + parseFloat(charge.sourceAmount !== undefined ? charge.sourceAmount.amount : '0');
                }, 0)
                .toString();
        }
        return '0';
    }

    private async getTSDKOutboundTransferRequest(
        transfer: TCbsSendMoneyRequest | TCbsMerchantPaymentRequest,
        amountType: 'SEND' | 'RECEIVE',
    ): Promise<TSDKOutboundTransferRequest> {
        return {
            homeTransactionId: transfer.homeTransactionId !== undefined ? transfer.homeTransactionId : '',
            from: {
                idType: this.cbsConfig.SUPPORTED_ID_TYPE,
                idValue: transfer.payer.payerId,
                fspId: this.cbsConfig.FSP_ID,
                displayName: transfer.payer.name,
                firstName: transfer.payer.name,
                middleName: transfer.payer.name,
                lastName: transfer.payer.name,
                supportedCurrencies: [this.cbsConfig.CURRENCY],
            },
            to: {
                idType: transfer.payeeIdType,
                idValue: transfer.payeeId,
            },
            amountType: amountType,
            currency: amountType === 'SEND' ? transfer.sendCurrency : transfer.receiveCurrency,
            amount: 'sendAmount' in transfer ? transfer.sendAmount : transfer.receiveAmount,
            transactionType: transfer.transactionType,
            quoteRequestExtensions: this.getOutboundTransferExtensionList(transfer),
            transferRequestExtensions: this.getOutboundTransferExtensionList(transfer),
        };
    }

    private getOutboundTransferExtensionList(
        sendMoneyRequestPayload: TCbsSendMoneyRequest | TCbsMerchantPaymentRequest,
    ): TPayerExtensionListEntry[] | undefined {
        if (sendMoneyRequestPayload.payer.DateAndPlaceOfBirth) {
            return [
                {
                    key: 'CdtTrfTxInf.Dbtr.Id.PrvtId.DtAndPlcOfBirth.BirthDt',
                    value: sendMoneyRequestPayload.payer.DateAndPlaceOfBirth.BirthDt,
                },
                {
                    key: 'CdtTrfTxInf.Dbtr.Id.PrvtId.DtAndPlcOfBirth.PrvcOfBirth',
                    value: sendMoneyRequestPayload.payer.DateAndPlaceOfBirth.PrvcOfBirth
                        ? sendMoneyRequestPayload.payer.DateAndPlaceOfBirth.PrvcOfBirth
                        : 'Not defined',
                },
                {
                    key: 'CdtTrfTxInf.Dbtr.Id.PrvtId.DtAndPlcOfBirth.CityOfBirth',
                    value: sendMoneyRequestPayload.payer.DateAndPlaceOfBirth.CityOfBirth,
                },
                {
                    key: 'CdtTrfTxInf.Dbtr.Id.PrvtId.DtAndPlcOfBirth.CtryOfBirth',
                    value: sendMoneyRequestPayload.payer.DateAndPlaceOfBirth.CtryOfBirth,
                },
                {
                    key: 'CdtTrfTxInf.Dbtr.Nm',
                    value: sendMoneyRequestPayload.payer.name,
                },
                {
                    key: 'CdtTrfTxInf.Purp.Cd',
                    value: sendMoneyRequestPayload.purposeCode,
                },
            ];
        }
    }

    async updateSendMoney(
        updateSendMoneyDeps: TCBSUpdateSendMoneyRequest,
        transferId: string,
    ): Promise<TCBSUpdateSendMoneyResponse> {
        this.logger.info(`Updating transfer for transfer id ${transferId}`);

        if (!updateSendMoneyDeps.acceptQuote) {
            await this.sdkClient.updateTransfer({ acceptQuoteOrConversion: false }, transferId);
            throw AggregateError.quoteNotAcceptedError();
        }
        try {
            await this.sdkClient.updateTransfer({ acceptQuoteOrConversion: true }, transferId);
            return {
                transferId: transferId,
            };
        } catch (error: unknown) {
            if (isAxiosLikeError(error)) {
                await this.cbsClient.handleRefund(updateSendMoneyDeps, transferId, error.response.data);
            }
            throw AggregateError.updateSendMoneyFailedError(
                `Committing Payment with homeTransactionId ${updateSendMoneyDeps.homeTransactionId} failed. Message ${JSON.stringify(error)}. If payment failed in the switch, a refund was triggered.`,
                '2000',
                500,
            );
        }
    }

    async getTransfers(transferId: string): Promise<TGetTransfersResponse> {
        this.logger.debug(`Getting transfer with Id ${transferId}`);
        const res = await this.sdkClient.getTransfers(transferId);
        return res;
    }

    async postAccounts(accounts: TAccountCreationRequest): Promise<TAccountCreationResponse> {
        this.logger.debug(`Adding accounts`, accounts);
        const res = await this.sdkClient.postAccounts(accounts);
        return res;
    }

    async deleteAccounts(id: string, idType: string): Promise<void> {
        this.logger.debug(`Deleting account`, { Type: idType, Id: id });
        if (!idType || !id) {
            throw AggregateError.idAndIdTypeUndefinedError(
                'Id Type and ID not defined at DELETE /accounts',
                '2000',
                500,
            );
        }
        const res = await this.sdkClient.deleteAccounts(id, idType);
        return res;
    }
}
