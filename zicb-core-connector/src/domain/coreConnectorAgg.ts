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
    IFineractClient,
    IdType,
    PartyType,
    TFineractConfig,
    TFineractTransactionPayload,
    TFineractTransferDeps,
    TFineractGetAccountResponse,
    TZicbConfig,
    TGetCustomerRequest,
    IZicbClient,
    ZicbError,
    TInternalFundsTransferRequest,
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
} from './interfaces';
import {
    ISDKClient,
    SDKClientError,
    TFineractOutboundTransferRequest,
    TFineractOutboundTransferResponse,
    TSDKOutboundTransferRequest,
    TtransferContinuationResponse,
    TUpdateTransferDeps,
} from './SDKClient';
import { FineractError } from './CBSClient';
import config from '../config';
import { ZicbClient } from './CBSClient/ZicbClient';
import { readdirSync } from 'fs';

export class CoreConnectorAggregate {
    public IdType: string;
    private logger: ILogger;
    DATE_FORMAT = 'dd MM yy';

    constructor(
        private readonly fineractConfig: TFineractConfig,
        private readonly fineractClient: IFineractClient,
        private readonly sdkClient: ISDKClient,
        logger: ILogger,
        private readonly zicbConfig: TZicbConfig,
        private readonly zicbClient: IZicbClient,
    ) {
        this.IdType = zicbConfig.SUPPORTED_ID_TYPE;
        this.logger = logger;
    }

    async getParties(id: string, idType: string): Promise<TLookupPartyInfoResponse> {
        this.logger.info(`Get Parties for ${id}`);
        if (!(idType === config.get("zicb.SUPPORTED_ID_TYPE"))) {
            throw ValidationError.unsupportedIdTypeError();
        }
        const customerRequest: TGetCustomerRequest = this.getTGetCustomerRequest(id)
        const lookupRes = await this.zicbClient.verifyCustomerByAccountNumber(customerRequest);
        const party = {
            data: {
                displayName: lookupRes.response.accountList[0].accDesc,
                firstName: lookupRes.response.accountList[0].accDesc,
                idType: config.get("zicb.SUPPORTED_ID_TYPE"),
                idValue: id,
                lastName: lookupRes.response.accountList[0].accDesc,
                middleName: lookupRes.response.accountList[0].accDesc,
                type: PartyType.CONSUMER,
                kycInformation: `${JSON.stringify(lookupRes)}`,
            },
            statusCode: lookupRes.status,
        };
        this.logger.info(`Party found`, { party });
        return party;
    }

    // Get Customer DTO 
    private getTGetCustomerRequest(accountNo: string): TGetCustomerRequest {
        return {
            "service": this.zicbConfig.SERVICE_REQUEST,
            "request": {
                "accountNos": accountNo,
                "getByCustNo": false,
                "getByAccType": false,
            }
        }
    }

    async quoteRequest(quoteRequest: TQuoteRequest): Promise<TQuoteResponse> {
        this.logger.info(`Get Parties for ${this.IdType} ${quoteRequest.to.idValue}`);
        if (quoteRequest.to.idType !== this.IdType) {
            throw ValidationError.unsupportedIdTypeError();
        }

        // Getting Customer Request data 
        const customerRequest: TGetCustomerRequest = this.getTGetCustomerRequest(quoteRequest.to.idValue);
        const res = await this.zicbClient.verifyCustomerByAccountNumber(customerRequest);


        if (quoteRequest.currency !== config.get("zicb.ZICB_CURRENCY")) {
            throw ValidationError.unsupportedCurrencyError();
        }

        // TODO: Find out what the frozen statuses are and which one is barred
        if (res.response.accountList[0].frozenStatus == "N") {
            throw ZicbError.payeeBlockedError("Account is frozen", 500, "5400");
        }

        const serviceCharge = config.get("zicb.SERVICE_CHARGE");
        const quoteExpiration = config.get("zicb.EXPIRATION_DURATION")
        const expiration = new Date();
        expiration.setHours(expiration.getHours() + Number(quoteExpiration));
        const expirationJSON = expiration.toJSON();


        return {
            expiration: expirationJSON,
            payeeFspCommissionAmount: '0',
            payeeFspCommissionAmountCurrency: quoteRequest.currency,
            payeeFspFeeAmount: serviceCharge,
            payeeFspFeeAmountCurrency: quoteRequest.currency,
            payeeReceiveAmount: quoteRequest.amount,
            payeeReceiveAmountCurrency: quoteRequest.currency,
            quoteId: quoteRequest.quoteId,
            transactionId: quoteRequest.transactionId,
            transferAmount: quoteRequest.amount,
            transferAmountCurrency: quoteRequest.currency,
        };
    }

    async receiveTransfer(transfer: TtransferRequest): Promise<TtransferResponse> {
        this.logger.info(`Transfer for  ${this.IdType} ${transfer.to.idValue}`);
        if (transfer.to.idType != this.IdType) {
            throw ValidationError.unsupportedIdTypeError();
        }
        if (transfer.currency !== config.get("zicb.ZICB_CURRENCY")) {
            throw ValidationError.unsupportedCurrencyError();
        }

        if (!this.validateQuote(transfer)) {
            throw ValidationError.invalidQuoteError();
        }

        return {
            completedTimestamp: new Date().toJSON(),
            homeTransactionId: transfer.transferId,
            transferState: 'RECEIVED',
        };
    }

    //Validating Quote 
    private validateQuote(transfer: TtransferRequest): boolean {
        // todo define implmentation
        this.logger.info(`Validating code for transfer with amount ${transfer.amount}`);
        return true;
    }

    // Update transfer for put /

    async patchNotification(updateTransferPayload: TtransferPatchNotificationRequest, transferId: string): Promise <void>{
        this.logger.info(`Committing The Transfer with id ${transferId}`);
        if (updateTransferPayload.currentState !== 'COMPLETED') {
            throw ValidationError.transferNotCompletedError();
        }

        if (!this.validatePatchQuote(updateTransferPayload)) {
            throw ValidationError.invalidQuoteError();
        }

        const recieveTransfer: TInternalFundsTransferRequest = this.getInternalFundsTransferRequestBody(updateTransferPayload)
        await this.zicbClient.walletToWalletInternalFundsTransfer(recieveTransfer);
        
    }

    // Get internal Funds transfer request body from mojaloop to zicb

    private getInternalFundsTransferRequestBody(requestBody: TtransferPatchNotificationRequest) :TInternalFundsTransferRequest{
        if (!requestBody.quoteRequest) {
            throw ValidationError.quoteNotDefinedError('Quote Not Defined Error', '5000', 500);
        }

        return {
            "service":this.zicbConfig.SERVICE_REQUEST,
            "request":{
                "amount": requestBody.quoteRequest.body.amount.amount,
                "destAcc": requestBody.quoteRequest.body.payee.partyIdInfo.partyIdentifier,
                "destBranch": this.zicbConfig.ZICB_DESTINATION_BRANCH,
                "payCurrency": this.zicbConfig.ZICB_CURRENCY,
                "payDate": new Date().toLocaleDateString(),
                "referenceNo": new Date().toLocaleTimeString(),
                "remarks": requestBody.quoteRequest.body.note !== undefined  ? requestBody.quoteRequest.body.note  : "No note sent",
                "srcAcc": this.zicbConfig.DFSP_DISBURSEMENT_ACCOUNT,
                "srcBranch": this.zicbConfig.ZICB_SOURCE_BRANCH,
                "srcCurrency": this.zicbConfig.ZICB_CURRENCY,
                "transferTyp": "INTERNAL"
            }
        }
    }

    private validatePatchQuote(transfer: TtransferPatchNotificationRequest): boolean {
        this.logger.info(`Validating code for transfer with state ${transfer.currentState}`);
        // todo define implmentation
        return true;
    }

    async sendTransfer(transfer: TFineractOutboundTransferRequest): Promise<TFineractOutboundTransferResponse> {
        this.logger.info(`Transfer from fineract account with ID${transfer.from.fineractAccountId}`);
        const accountData = await this.getSavingsAccount(transfer.from.fineractAccountId);
        if (accountData.subStatus.blockCredit || accountData.subStatus.blockDebit) {
            const errMessage = 'Account blocked from credit or debit';
            this.logger.warn(errMessage, accountData);
            throw FineractError.accountDebitOrCreditBlockedError(errMessage);
        }
        const sdkOutboundTransfer: TSDKOutboundTransferRequest = this.getSDKTransferRequest(transfer);
        const transferRes = await this.sdkClient.initiateTransfer(sdkOutboundTransfer);
        if (
            !transferRes.data.quoteResponse ||
            !transferRes.data.quoteResponse.body.payeeFspCommission ||
            !transferRes.data.quoteResponse.body.payeeFspFee
        ) {
            throw SDKClientError.noQuoteReturnedError();
        }
        const totalFineractFee = await this.fineractClient.calculateWithdrawQuote({
            amount: this.getAmountSum([
                parseFloat(transferRes.data.amount),
                parseFloat(transferRes.data.quoteResponse.body.payeeFspFee.amount),
                parseFloat(transferRes.data.quoteResponse.body.payeeFspCommission.amount),
            ]),
        });
        if (!this.checkAccountBalance(totalFineractFee.feeAmount, accountData.summary.availableBalance)) {
            this.logger.warn('Payer account does not have sufficient funds for transfer', accountData);
            throw FineractError.accountInsufficientBalanceError();
        }

        return {
            totalAmountFromFineract: totalFineractFee.feeAmount,
            transferResponse: transferRes.data,
        };
    }

    async updateSentTransfer(transferAccept: TUpdateTransferDeps): Promise<TtransferContinuationResponse> {
        this.logger.info(
            `Continuing transfer with id ${transferAccept.sdkTransferId} and account with id ${transferAccept.fineractTransaction.fineractAccountId}`,
        );
        let transaction: TFineractTransferDeps | null = null;

        try {
            transaction = await this.getTransaction(transferAccept);
            const withdrawRes = await this.fineractClient.sendTransfer(transaction);
            if (withdrawRes.statusCode != 200) {
                throw FineractError.withdrawFailedError(`Withdraw failed with status code ${withdrawRes.statusCode}`);
            }

            const updateTransferRes = await this.sdkClient.updateTransfer(
                { acceptQuote: true },
                transferAccept.sdkTransferId as number,
            );

            return updateTransferRes.data;
        } catch (error: unknown) {
            if (transaction) return await this.processUpdateSentTransferError(error, transaction);
            throw error;
        }
    }

    extractAccountFromIBAN(IBAN: string): string {
        // todo: think how to validate account numbers
        const accountNo = IBAN.slice(
            this.fineractConfig.FINERACT_BANK_COUNTRY_CODE.length +
            this.fineractConfig.FINERACT_CHECK_DIGITS.length +
            this.fineractConfig.FINERACT_BANK_ID.length +
            this.fineractConfig.FINERACT_ACCOUNT_PREFIX.length,
        );
        this.logger.debug('extracted account number from IBAN:', { accountNo, IBAN });
        if (accountNo.length < 1) {
            throw ValidationError.invalidAccountNumberError();
        }

        return accountNo;
    }

    private getSDKTransferRequest(transfer: TFineractOutboundTransferRequest): TSDKOutboundTransferRequest {
        return {
            homeTransactionId: transfer.homeTransactionId,
            from: transfer.from.payer,
            to: transfer.to,
            amountType: transfer.amountType,
            currency: transfer.currency,
            amount: transfer.amount,
            transactionType: transfer.transactionType,
            subScenario: transfer.subScenario,
            note: transfer.note,
            quoteRequestExtensions: transfer.quoteRequestExtensions,
            transferRequestExtensions: transfer.transferRequestExtensions,
            skipPartyLookup: transfer.skipPartyLookup,
        };
    }

    private getAmountSum(amounts: number[]): number {
        let sum = 0;
        for (const amount of amounts) {
            sum = amount + sum;
        }
        return sum;
    }

    private checkAccountBalance(totalAmount: number, accountBalance: number): boolean {
        return accountBalance > totalAmount;
    }

    private async getSavingsAccount(accountId: number): Promise<TFineractGetAccountResponse> {
        this.logger.debug('getting active savingsAccount...', { accountId });
        const account = await this.fineractClient.getSavingsAccount(accountId);

        if (!account.data.status.active) {
            throw ValidationError.accountVerificationError();
        }

        return account.data;
    }

    private async getTransaction(transferAccept: TUpdateTransferDeps): Promise<TFineractTransferDeps> {
        this.logger.info('Getting fineract transaction');
        const accountRes = await this.fineractClient.getSavingsAccount(
            transferAccept.fineractTransaction.fineractAccountId,
        );

        const date = new Date();
        return {
            accountId: transferAccept.fineractTransaction.fineractAccountId,
            transaction: {
                locale: this.fineractConfig.FINERACT_LOCALE,
                dateFormat: this.DATE_FORMAT,
                transactionDate: `${date.getDate()} ${date.getMonth() + 1} ${date.getFullYear()}`,
                transactionAmount: transferAccept.fineractTransaction.totalAmount.toString(),
                paymentTypeId: this.fineractConfig.FINERACT_PAYMENT_TYPE_ID,
                accountNumber: accountRes.data.accountNo,
                routingCode: transferAccept.fineractTransaction.routingCode,
                receiptNumber: transferAccept.fineractTransaction.receiptNumber,
                bankNumber: transferAccept.fineractTransaction.bankNumber,
            },
        };
    }

    // think of better way to handle refunding
    private async processUpdateSentTransferError(error: unknown, transaction: TFineractTransferDeps): Promise<never> {
        let needRefund = error instanceof SDKClientError;
        try {
            const errMessage = error instanceof Error ? error.message : 'Unknown error';
            this.logger.error(`error in updateSentTransfer: ${errMessage}`, { error, needRefund, transaction });
            if (!needRefund) throw error;
            //Refund the money
            const depositRes = await this.fineractClient.receiveTransfer(transaction);
            if (depositRes.statusCode != 200) {
                const logMessage = `Invalid statusCode from fineractClient.receiveTransfer: ${depositRes.statusCode}`;
                this.logger.warn(logMessage);
                throw new Error(logMessage);
            }
            needRefund = false;
            this.logger.info('Refund successful', { needRefund });
            throw error;
        } catch (err: unknown) {
            if (!needRefund) throw error;

            const details = {
                amount: parseFloat(transaction.transaction.transactionAmount),
                fineractAccountId: transaction.accountId,
            };
            this.logger.error('refundFailedError', { details, transaction });
            throw ValidationError.refundFailedError(details);
        }
    }
}
