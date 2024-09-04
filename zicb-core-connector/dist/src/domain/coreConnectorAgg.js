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
Object.defineProperty(exports, "__esModule", { value: true });
exports.CoreConnectorAggregate = void 0;
const tslib_1 = require("tslib");
const CBSClient_1 = require("./CBSClient");
const interfaces_1 = require("./interfaces");
const SDKClient_1 = require("./SDKClient");
const CBSClient_2 = require("./CBSClient");
const config_1 = tslib_1.__importDefault(require("../config"));
class CoreConnectorAggregate {
    fineractConfig;
    fineractClient;
    sdkClient;
    zicbConfig;
    zicbClient;
    IdType;
    logger;
    DATE_FORMAT = 'dd MM yy';
    constructor(fineractConfig, fineractClient, sdkClient, logger, zicbConfig, zicbClient) {
        this.fineractConfig = fineractConfig;
        this.fineractClient = fineractClient;
        this.sdkClient = sdkClient;
        this.zicbConfig = zicbConfig;
        this.zicbClient = zicbClient;
        this.IdType = zicbConfig.SUPPORTED_ID_TYPE;
        this.logger = logger;
    }
    async getParties(id, idType) {
        this.logger.info(`Get Parties for ${id}`);
        if (!(idType === config_1.default.get("zicb.SUPPORTED_ID_TYPE"))) {
            throw interfaces_1.ValidationError.unsupportedIdTypeError();
        }
        const customerRequest = this.getTGetCustomerRequest(id);
        const lookupRes = await this.zicbClient.verifyCustomerByAccountNumber(customerRequest);
        const party = {
            data: {
                displayName: lookupRes.response.accountList[0].accDesc,
                firstName: lookupRes.response.accountList[0].accDesc,
                idType: config_1.default.get("zicb.SUPPORTED_ID_TYPE"),
                idValue: id,
                lastName: lookupRes.response.accountList[0].accDesc,
                middleName: lookupRes.response.accountList[0].accDesc,
                type: CBSClient_1.PartyType.CONSUMER,
                kycInformation: `${JSON.stringify(lookupRes)}`,
            },
            statusCode: lookupRes.status,
        };
        this.logger.info(`Party found`, { party });
        return party;
    }
    // Get Customer DTO 
    getTGetCustomerRequest(accountNo) {
        return {
            "service": this.zicbConfig.SERVICE_REQUEST,
            "request": {
                "accountNos": accountNo,
                "getByCustNo": false,
                "getByAccType": false,
            }
        };
    }
    async quoteRequest(quoteRequest) {
        this.logger.info(`Get Parties for ${this.IdType} ${quoteRequest.to.idValue}`);
        if (quoteRequest.to.idType !== this.IdType) {
            throw interfaces_1.ValidationError.unsupportedIdTypeError();
        }
        // Getting Customer Request data 
        const customerRequest = this.getTGetCustomerRequest(quoteRequest.to.idValue);
        const res = await this.zicbClient.verifyCustomerByAccountNumber(customerRequest);
        if (quoteRequest.currency !== config_1.default.get("zicb.ZICB_CURRENCY")) {
            throw interfaces_1.ValidationError.unsupportedCurrencyError();
        }
        // TODO: Find out what the frozen statuses are and which one is barred
        if (res.response.accountList[0].frozenStatus == "N") {
            throw CBSClient_1.ZicbError.payeeBlockedError("Account is frozen", 500, "5400");
        }
        const serviceCharge = config_1.default.get("zicb.SERVICE_CHARGE");
        const quoteExpiration = config_1.default.get("zicb.EXPIRATION_DURATION");
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
    async receiveTransfer(transfer) {
        this.logger.info(`Transfer for  ${this.IdType} ${transfer.to.idValue}`);
        if (transfer.to.idType != this.IdType) {
            throw interfaces_1.ValidationError.unsupportedIdTypeError();
        }
        if (transfer.currency !== config_1.default.get("zicb.ZICB_CURRENCY")) {
            throw interfaces_1.ValidationError.unsupportedCurrencyError();
        }
        if (!this.validateQuote(transfer)) {
            throw interfaces_1.ValidationError.invalidQuoteError();
        }
        return {
            completedTimestamp: new Date().toJSON(),
            homeTransactionId: transfer.transferId,
            transferState: 'RECEIVED',
        };
    }
    //Validating Quote 
    validateQuote(transfer) {
        // todo define implmentation
        this.logger.info(`Validating code for transfer with amount ${transfer.amount}`);
        return true;
    }
    // Update transfer for put /
    async patchNotification(updateTransferPayload, transferId) {
        this.logger.info(`Committing The Transfer with id ${transferId}`);
        if (updateTransferPayload.currentState !== 'COMPLETED') {
            throw interfaces_1.ValidationError.transferNotCompletedError();
        }
        if (!this.validatePatchQuote(updateTransferPayload)) {
            throw interfaces_1.ValidationError.invalidQuoteError();
        }
        const recieveTransfer = this.getInternalFundsTransferRequestBody(updateTransferPayload);
        await this.zicbClient.walletToWalletInternalFundsTransfer(recieveTransfer);
    }
    // Get internal Funds transfer request body from mojaloop to zicb
    getInternalFundsTransferRequestBody(requestBody) {
        if (!requestBody.quoteRequest) {
            throw interfaces_1.ValidationError.quoteNotDefinedError('Quote Not Defined Error', '5000', 500);
        }
        return {
            "service": this.zicbConfig.SERVICE_REQUEST,
            "request": {
                "amount": requestBody.quoteRequest.body.amount.amount,
                "destAcc": requestBody.quoteRequest.body.payee.partyIdInfo.partyIdentifier,
                "destBranch": this.zicbConfig.ZICB_DESTINATION_BRANCH,
                "payCurrency": this.zicbConfig.ZICB_CURRENCY,
                "payDate": new Date().toLocaleDateString(),
                "referenceNo": new Date().toLocaleTimeString(),
                "remarks": requestBody.quoteRequest.body.note !== undefined ? requestBody.quoteRequest.body.note : "No note sent",
                "srcAcc": this.zicbConfig.DFSP_DISBURSEMENT_ACCOUNT,
                "srcBranch": this.zicbConfig.ZICB_SOURCE_BRANCH,
                "srcCurrency": this.zicbConfig.ZICB_CURRENCY,
                "transferTyp": "INTERNAL"
            }
        };
    }
    validatePatchQuote(transfer) {
        this.logger.info(`Validating code for transfer with state ${transfer.currentState}`);
        // todo define implmentation
        return true;
    }
    async sendTransfer(transfer) {
        this.logger.info(`Transfer from fineract account with ID${transfer.from.fineractAccountId}`);
        const accountData = await this.getSavingsAccount(transfer.from.fineractAccountId);
        if (accountData.subStatus.blockCredit || accountData.subStatus.blockDebit) {
            const errMessage = 'Account blocked from credit or debit';
            this.logger.warn(errMessage, accountData);
            throw CBSClient_2.FineractError.accountDebitOrCreditBlockedError(errMessage);
        }
        const sdkOutboundTransfer = this.getSDKTransferRequest(transfer);
        const transferRes = await this.sdkClient.initiateTransfer(sdkOutboundTransfer);
        if (!transferRes.data.quoteResponse ||
            !transferRes.data.quoteResponse.body.payeeFspCommission ||
            !transferRes.data.quoteResponse.body.payeeFspFee) {
            throw SDKClient_1.SDKClientError.noQuoteReturnedError();
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
            throw CBSClient_2.FineractError.accountInsufficientBalanceError();
        }
        return {
            totalAmountFromFineract: totalFineractFee.feeAmount,
            transferResponse: transferRes.data,
        };
    }
    async updateSentTransfer(transferAccept) {
        this.logger.info(`Continuing transfer with id ${transferAccept.sdkTransferId} and account with id ${transferAccept.fineractTransaction.fineractAccountId}`);
        let transaction = null;
        try {
            transaction = await this.getTransaction(transferAccept);
            const withdrawRes = await this.fineractClient.sendTransfer(transaction);
            if (withdrawRes.statusCode != 200) {
                throw CBSClient_2.FineractError.withdrawFailedError(`Withdraw failed with status code ${withdrawRes.statusCode}`);
            }
            const updateTransferRes = await this.sdkClient.updateTransfer({ acceptQuote: true }, transferAccept.sdkTransferId);
            return updateTransferRes.data;
        }
        catch (error) {
            if (transaction)
                return await this.processUpdateSentTransferError(error, transaction);
            throw error;
        }
    }
    extractAccountFromIBAN(IBAN) {
        // todo: think how to validate account numbers
        const accountNo = IBAN.slice(this.fineractConfig.FINERACT_BANK_COUNTRY_CODE.length +
            this.fineractConfig.FINERACT_CHECK_DIGITS.length +
            this.fineractConfig.FINERACT_BANK_ID.length +
            this.fineractConfig.FINERACT_ACCOUNT_PREFIX.length);
        this.logger.debug('extracted account number from IBAN:', { accountNo, IBAN });
        if (accountNo.length < 1) {
            throw interfaces_1.ValidationError.invalidAccountNumberError();
        }
        return accountNo;
    }
    getSDKTransferRequest(transfer) {
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
    getAmountSum(amounts) {
        let sum = 0;
        for (const amount of amounts) {
            sum = amount + sum;
        }
        return sum;
    }
    checkAccountBalance(totalAmount, accountBalance) {
        return accountBalance > totalAmount;
    }
    async getSavingsAccount(accountId) {
        this.logger.debug('getting active savingsAccount...', { accountId });
        const account = await this.fineractClient.getSavingsAccount(accountId);
        if (!account.data.status.active) {
            throw interfaces_1.ValidationError.accountVerificationError();
        }
        return account.data;
    }
    async getTransaction(transferAccept) {
        this.logger.info('Getting fineract transaction');
        const accountRes = await this.fineractClient.getSavingsAccount(transferAccept.fineractTransaction.fineractAccountId);
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
    async processUpdateSentTransferError(error, transaction) {
        let needRefund = error instanceof SDKClient_1.SDKClientError;
        try {
            const errMessage = error instanceof Error ? error.message : 'Unknown error';
            this.logger.error(`error in updateSentTransfer: ${errMessage}`, { error, needRefund, transaction });
            if (!needRefund)
                throw error;
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
        }
        catch (err) {
            if (!needRefund)
                throw error;
            const details = {
                amount: parseFloat(transaction.transaction.transactionAmount),
                fineractAccountId: transaction.accountId,
            };
            this.logger.error('refundFailedError', { details, transaction });
            throw interfaces_1.ValidationError.refundFailedError(details);
        }
    }
}
exports.CoreConnectorAggregate = CoreConnectorAggregate;
//# sourceMappingURL=coreConnectorAgg.js.map