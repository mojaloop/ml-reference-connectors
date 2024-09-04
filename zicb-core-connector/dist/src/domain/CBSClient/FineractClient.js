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
exports.FineractClient = exports.ROUTES = void 0;
const errors_1 = require("./errors");
const constants_1 = require("../../constants");
exports.ROUTES = Object.freeze({
    search: 'search',
    savingsAccount: 'savingsaccounts',
    clients: 'clients',
    charges: 'charges',
});
class FineractClient {
    fineractConfig;
    httpClient;
    logger;
    constructor(fineractConfig, httpClient, logger) {
        this.fineractConfig = fineractConfig;
        this.httpClient = httpClient;
        this.logger = logger;
    }
    async lookupPartyInfo(accountNo) {
        this.logger.info(`Looking up party with account ${accountNo}`);
        return this.getAccountId(accountNo);
    }
    async calculateWithdrawQuote(quoteDeps) {
        // Check this for documentation on charge schema. https://demo.mifos.io/api-docs/apiLive.htm#charges
        this.logger.info(`Calculating quote `);
        const charges = await this.getCharges();
        let fee = 0;
        charges.data.forEach((charge) => {
            if (charge.chargeAppliesTo.id === constants_1.CHARGE_APPLIES_TO.Savings &&
                charge.chargeTimeType.id === constants_1.CHARGE_TIME_TYPES.Withdrawal) {
                if (charge.chargeCalculationType.id === 1) {
                    fee = fee + charge.amount;
                }
                else {
                    fee = fee + (charge.amount / 100) * quoteDeps.amount;
                }
            }
        });
        return {
            feeAmount: fee,
        };
    }
    async verifyBeneficiary(accountNo) {
        // Fineract has no fees for deposits. Only calculating for withdraws.
        this.logger.info(`Calculating quote for party with account ${accountNo}`);
        return await this.getAccountId(accountNo);
    }
    async receiveTransfer(transferDeps) {
        const accountNo = transferDeps.transaction.accountNumber.toString();
        const amount = transferDeps.transaction.transactionAmount.toString();
        this.logger.info(`Transaction for party with account ${accountNo} worth ${amount}`);
        try {
            const url = `${this.fineractConfig.FINERACT_BASE_URL}/${exports.ROUTES.savingsAccount}/${transferDeps.accountId}/transactions?command=deposit`;
            this.logger.info(`Request to fineract ${url}`);
            return await this.httpClient.send({
                url: url,
                method: 'POST',
                headers: this.getDefaultHeaders(),
                data: transferDeps.transaction,
            });
        }
        catch (error) {
            this.logger.error(`Failed to Deposit: ${error?.message}`);
            throw errors_1.FineractError.depositFailedError();
        }
    }
    async getAccountId(accountNo) {
        this.logger.info(`Searching for Account with account number ${accountNo}`);
        const res = await this.searchAccount(accountNo);
        if (!res.data[0]) {
            this.logger.warn(`Account number ${accountNo} not found`, 'FIN');
            throw errors_1.FineractError.noAccountFoundError();
        }
        const returnedEntity = res.data[0];
        const getAccountRes = await this.getSavingsAccount(returnedEntity.entityId);
        if (!getAccountRes.data.status.active) {
            this.logger.warn('Fineract Account not active', getAccountRes.data);
            throw errors_1.FineractError.accountNotActiveError();
        }
        else if (getAccountRes.data.subStatus.blockCredit || getAccountRes.data.subStatus.blockDebit) {
            throw errors_1.FineractError.accountDebitOrCreditBlockedError('Account blocked for credit or debit');
        }
        const currency = getAccountRes.data.currency.code;
        const getClientRes = await this.getClient(getAccountRes.data.clientId);
        if (getClientRes.statusCode !== 200) {
            this.logger.warn(`Failed to get client with Id ${getAccountRes.data.clientId}`, getAccountRes.data);
            throw errors_1.FineractError.getClientWithIdError();
        }
        const lookUpRes = {
            accountId: returnedEntity.entityId,
            data: getClientRes.data,
            status: getClientRes.statusCode,
            currency: currency,
        };
        this.logger.info(`Client details found`, lookUpRes);
        return lookUpRes;
    }
    async searchAccount(accountNo) {
        const url = `${this.fineractConfig.FINERACT_BASE_URL}/${exports.ROUTES.search}?query=${accountNo}&resource=savingsaccount`;
        this.logger.info(`Request to fineract ${url}`);
        return await this.httpClient.send({
            url: url,
            method: 'GET',
            headers: this.getDefaultHeaders(),
        });
    }
    async getSavingsAccount(accountId) {
        const url = `${this.fineractConfig.FINERACT_BASE_URL}/${exports.ROUTES.savingsAccount}/${accountId}`;
        this.logger.debug('Request to fineract url:', { url });
        const accountRes = await this.httpClient.send({
            url,
            method: 'GET',
            headers: this.getDefaultHeaders(),
        });
        if (accountRes.statusCode !== 200) {
            const errMessage = `Search for Account failed with status code ${accountRes.statusCode}`;
            this.logger.warn(errMessage, { accountId });
            throw errors_1.FineractError.searchAccountError(errMessage);
        }
        // todo: return accountRes.data
        return accountRes;
    }
    getDefaultHeaders() {
        return {
            'fineract-platform-tenantId': this.fineractConfig.FINERACT_TENANT_ID,
            Authorization: this.getAuthHeader(),
            'Content-Type': 'application/json',
        };
    }
    getAuthHeader() {
        return `Basic ${Buffer.from(`${this.fineractConfig.FINERACT_USERNAME}:${this.fineractConfig.FINERACT_PASSWORD}`).toString('base64')}`;
    }
    async getClient(clientId) {
        const url = `${this.fineractConfig.FINERACT_BASE_URL}/${exports.ROUTES.clients}/${clientId}`;
        this.logger.info(`Request to fineract ${url}`);
        return await this.httpClient.send({
            url: url,
            method: 'GET',
            headers: this.getDefaultHeaders(),
        });
    }
    async sendTransfer(transactionPayload) {
        this.logger.info('Request to fineract. Withdraw');
        const url = `${this.fineractConfig.FINERACT_BASE_URL}/${exports.ROUTES.savingsAccount}/${transactionPayload.accountId}/transactions?command=withdrawal`;
        try {
            return await this.httpClient.post(url, transactionPayload.transaction, {
                headers: this.getDefaultHeaders(),
            });
        }
        catch (error) {
            const errMessage = error?.message || 'Unknown Error';
            this.logger.error(`error in sendTransfer: ${errMessage}`);
            throw errors_1.FineractError.withdrawFailedError(errMessage);
        }
    }
    async getCharges() {
        this.logger.info('Request to get charges. Quote');
        const url = `${this.fineractConfig.FINERACT_BASE_URL}/${exports.ROUTES.charges}`;
        try {
            return await this.httpClient.get(url, {
                headers: this.getDefaultHeaders(),
            });
        }
        catch (error) {
            this.logger.error(`getCharges error: ${error?.message}`);
            throw errors_1.FineractError.getChargesError();
        }
    }
}
exports.FineractClient = FineractClient;
//# sourceMappingURL=FineractClient.js.map