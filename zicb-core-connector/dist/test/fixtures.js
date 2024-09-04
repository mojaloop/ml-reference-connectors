"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.transferPatchNotificationRequestDto = exports.transferRequestDto = exports.quoteRequestDto = void 0;
const tslib_1 = require("tslib");
const crypto = tslib_1.__importStar(require("node:crypto"));
// Quote Request DTO
const quoteRequestDto = (idType = "ACCOUNT_NO", idValue = "1019000001703", amount = "100") => ({
    amount: amount,
    amountType: "SEND",
    currency: "ZMW",
    from: {
        idType: "MSISDN",
        idValue: "978034884"
    },
    initiator: "PAYER",
    initiatorType: "CONSUMER",
    quoteId: crypto.randomUUID(),
    to: {
        //@ts-expect-error partyIdType var not of type IdType
        idType: idType,
        idValue: idValue
    },
    transactionId: crypto.randomUUID(),
    transactionType: "TRANSFER"
});
exports.quoteRequestDto = quoteRequestDto;
const transferRequestDto = (idType, idValue, amount) => ({
    amount: amount,
    amountType: "SEND",
    currency: "ZMW",
    from: {
        idType: "ACCOUNT_NO",
        idValue: "1019000002881"
    },
    to: {
        //@ts-expect-error partyIdType var not of type IdType
        idType: idType,
        idValue: idValue
    },
    ilpPacket: {
        data: {
            amount: {
                amount: amount,
                currency: "ZMW",
            },
            payee: {
                partyIdInfo: {
                    //@ts-expect-error partyIdType var not of type IdType
                    partyIdType: idType,
                    partyIdentifier: idValue,
                    fspId: "zicb-123-qwerty",
                },
                merchantClassificationCode: "1234",
                name: "Payee Name",
                personalInfo: {
                    complexName: {
                        firstName: "PayeeFirstName",
                        lastName: "PayeeLastName",
                    },
                    dateOfBirth: "YYYY-MM-DD",
                },
                supportedCurrencies: ["ZMW"],
            },
            payer: {
                //@ts-expect-error partyIdType var not of type IdType
                idType: idType,
                idValue: idValue
            },
            quoteId: crypto.randomUUID(),
            transactionId: crypto.randomUUID(),
            transactionType: {
                initiator: "PAYER",
                initiatorType: "CONSUMER",
                scenario: "TRANSFER",
                subScenario: "LOCALLY_DEFINED_SUBSCENARIO",
            },
        },
    },
    transferId: crypto.randomUUID(),
    note: "Transfer Quote Request",
});
exports.transferRequestDto = transferRequestDto;
const transferPatchNotificationRequestDto = (currentState, partyIdType, partyIdentifier, amount) => ({
    //@ts-expect-error currentState var to of type
    currentState: currentState,
    direction: "INBOUND",
    finalNotification: {
        completedTimestamp: "6966-12-29T00:03:24.449Z",
        extensionList: [
            {
                key: "string",
                value: "string"
            }
        ],
        transferState: "RECEIVED"
    },
    fulfil: {
        body: {},
        headers: {}
    },
    initiatedTimestamp: "1197-12-29T23:21:38.743Z",
    lastError: {
        httpStatusCode: 0,
        mojaloopError: {
            errorInformation: {
                errorCode: "5100",
                errorDescription: "string",
                extensionList: {
                    extension: [
                        {
                            key: "string",
                            value: "string"
                        }
                    ]
                }
            }
        }
    },
    prepare: {
        body: {},
        headers: {}
    },
    quote: {
        fulfilment: "string",
        internalRequest: {},
        mojaloopResponse: {},
        request: {},
        response: {}
    },
    quoteRequest: {
        body: {
            quoteId: '',
            transactionId: '47e8a9cd-3d89-55c5-a15a-b57a28ad763e',
            payee: {
                partyIdInfo: {
                    //@ts-expect-error partyIdType var not of type IdType
                    partyIdType: partyIdType,
                    partyIdentifier: partyIdentifier,
                    partySubIdOrType: undefined,
                    fspId: undefined,
                    extensionList: undefined
                },
                merchantClassificationCode: undefined,
                name: undefined,
                personalInfo: undefined,
                supportedCurrencies: undefined
            },
            payer: {
                partyIdInfo: {
                    partyIdType: 'MSISDN',
                    partyIdentifier: '978980797',
                    partySubIdOrType: undefined,
                    fspId: undefined,
                    extensionList: undefined
                },
                merchantClassificationCode: undefined,
                name: undefined,
                personalInfo: undefined,
                supportedCurrencies: undefined
            },
            amountType: 'SEND',
            amount: {
                amount: amount,
                currency: "ZMW"
            },
            transactionType: {
                scenario: 'TRANSFER',
                subScenario: undefined,
                initiator: 'PAYER',
                initiatorType: 'BUSINESS',
                refundInfo: undefined,
                balanceOfPayments: undefined
            }
        },
        headers: {}
    },
    quoteResponse: {
        body: {},
        headers: {}
    },
    transferId: "47e8a9cd-3d89-55c5-a15a-b57a28ad763e"
});
exports.transferPatchNotificationRequestDto = transferPatchNotificationRequestDto;
//# sourceMappingURL=fixtures.js.map