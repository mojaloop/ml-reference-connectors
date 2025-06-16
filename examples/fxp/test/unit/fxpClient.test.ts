import { AxiosClientFactory, IFXPClient, IHTTPClient, logger, TConfirmFxTransferResponse, TFxQuoteResponse, TNotifyFxTransferStateResponse } from "@mojaloop/core-connector-lib";
import { fxpConfig } from "../../config";
import { ConnectorError } from "../../src/errors";
import { MockFXPClient } from "../../src/FXPClient";
import { fxQuotesReqDTO, fxTransferDTO, fxTransferNotificationDTO } from "../../test/fixtures";
const httpClient: IHTTPClient = AxiosClientFactory.createAxiosClientInstance();


if(!fxpConfig.fxpConfig){
    throw ConnectorError.cbsConfigUndefined("FXP Config Not defined. Please fix the configuration in config.ts","0",0);
}


const fxpClient: IFXPClient = new MockFXPClient(httpClient,logger,fxpConfig.fxpConfig);
describe("FXP Client Tests", ()=>{
    test("getFxQuote Test", async ()=>{
        const fxQuote: TFxQuoteResponse = await fxpClient.getFxQuote(fxQuotesReqDTO());
        expect(fxQuote.conversionTerms).toBeDefined();
    });

    test("confirm fxTransfers Test", async ()=>{
        const fxTransfersResponse: TConfirmFxTransferResponse = await fxpClient.confirmFxTransfer(fxTransferDTO());
        expect(fxTransfersResponse.conversionState).toEqual("RESERVED");
    });

    test("notify fxTransfers Test", async ()=>{
        const fxNotificationRes: Promise<TNotifyFxTransferStateResponse> = fxpClient.notifyFxTransferState(fxTransferNotificationDTO());
        await expect(fxNotificationRes).resolves;
    });
});
