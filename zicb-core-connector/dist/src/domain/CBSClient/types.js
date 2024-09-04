"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.frozenStatusTypes = exports.FineractLookupStage = exports.PartyType = exports.IdType = void 0;
var IdType;
(function (IdType) {
    IdType["MSISDN"] = "MSISDN";
    IdType["IBAN"] = "IBAN";
    IdType["ACCOUNT_NO"] = "ACCOUNT_NO";
    IdType["EMAIL"] = "EMAIL";
    IdType["PERSONAL_ID"] = "PERSONAL_ID";
    IdType["BUSINESS"] = "BUSINESS";
    IdType["DEVICE"] = "DEVICE";
    IdType["ACCOUNT_ID"] = "ACCOUNT_ID";
    IdType["ALIAS"] = "ALIAS";
})(IdType || (exports.IdType = IdType = {}));
var PartyType;
(function (PartyType) {
    PartyType["CONSUMER"] = "CONSUMER";
    PartyType["AGENT"] = "AGENT";
    PartyType["BUSINESS"] = "BUSINESS";
    PartyType["DEVICE"] = "DEVICE";
})(PartyType || (exports.PartyType = PartyType = {}));
var FineractLookupStage;
(function (FineractLookupStage) {
    FineractLookupStage["SEARCH"] = "search";
    FineractLookupStage["SAVINGSACCOUNT"] = "savingsaccount";
    FineractLookupStage["CLIENT"] = "client";
})(FineractLookupStage || (exports.FineractLookupStage = FineractLookupStage = {}));
// Froezen Status types for TGetCustomerResponse
var frozenStatusTypes;
(function (frozenStatusTypes) {
    frozenStatusTypes["A"] = "A";
    frozenStatusTypes["N"] = "N";
})(frozenStatusTypes || (exports.frozenStatusTypes = frozenStatusTypes = {}));
//# sourceMappingURL=types.js.map