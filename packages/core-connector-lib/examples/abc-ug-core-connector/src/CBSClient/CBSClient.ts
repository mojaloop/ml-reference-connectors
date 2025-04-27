import { IHTTPClient, ILogger } from "@mojaloop/core-connector-lib";
import { ICbsClient, TCbsCollectMoneyRequest, TCbsCollectMoneyResponse, TCBSConfig, TCbsDisbursementRequestBody, TCbsDisbursementResponse, TCbsKycResponse, TCbsRefundMoneyRequest, TCbsRefundMoneyResponse, TGetKycArgs, TGetTokenArgs, TGetTokenResponse } from "@mojaloop/core-connector-lib/dist/src/domain/CBSClient"; 

export class CBSClient implements ICbsClient {
    cbsConfig: TCBSConfig;
    httpClient: IHTTPClient;
    logger: ILogger;
    getKyc(deps: TGetKycArgs): Promise<TCbsKycResponse> {
        throw new Error("Method not implemented.");
    }
    getToken(deps: TGetTokenArgs): Promise<TGetTokenResponse> {
        throw new Error("Method not implemented.");
    }
    sendMoney(deps: TCbsDisbursementRequestBody): Promise<TCbsDisbursementResponse> {
        throw new Error("Method not implemented.");
    }
    collectMoney(deps: TCbsCollectMoneyRequest): Promise<TCbsCollectMoneyResponse> {
        throw new Error("Method not implemented.");
    }
    refundMoney(deps: TCbsRefundMoneyRequest): Promise<TCbsRefundMoneyResponse> {
        throw new Error("Method not implemented.");
    }
    logFailedIncomingTransfer(req: TCbsDisbursementRequestBody): Promise<void> {
        throw new Error("Method not implemented.");
    }
    logFailedRefund(airtel_money_id: string): Promise<void> {
        throw new Error("Method not implemented.");
    }
    //implement connectivity to DFSP
} 