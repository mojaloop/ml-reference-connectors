import { AxiosError, AxiosRequestHeaders } from "axios";
import { AxiosClientFactory, IHTTPClient, ISDKClient, logger, SDKClientError, SDKClientFactory } from "../../src";
import { getSDKOutboundTransferRequestDTO, sdkInitiateTransferResponseDto } from "../fixtures";

const httpClient: IHTTPClient = AxiosClientFactory.createAxiosClientInstance();
const sdkClient: ISDKClient = SDKClientFactory.getSDKClientInstance(
    logger,
    httpClient,
    "http://localhost:14040"
);
jest.setTimeout(60000);
describe("SDK Client Tests", ()=>{
    test("test successful transfer initiation", async ()=>{
        httpClient.send = jest.fn().mockResolvedValueOnce(
            sdkInitiateTransferResponseDto("90030343","WAITING_FOR_QUOTE_ACCEPTANCE")
        );
        const res = await sdkClient.initiateTransfer(getSDKOutboundTransferRequestDTO());
        expect(res.data.transferId).toBeDefined();
        expect(res.data.currentState).toEqual("WAITING_FOR_QUOTE_ACCEPTANCE");
    });

    test("test transaction request failed with 504 timeout", async () =>{
        httpClient.send = jest.fn().mockImplementation(()=>{
            throw new AxiosError('Gateway Timeout', undefined, undefined, undefined, {
                status: 504,
                statusText: 'Gateway timeout',
                headers: {},
                config: {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer your-token-here',
                        'Accept': 'application/json',
                        'User-Agent': 'MyApp/1.0.0',
                        'Cache-Control': 'no-cache',
                    } as unknown as AxiosRequestHeaders,
                },
                data: 'Gateway TimeOut',
            });
        });
        try{
            await sdkClient.initiateTransfer(getSDKOutboundTransferRequestDTO());
        }catch(error: unknown){
            if(error instanceof SDKClientError){
                expect(error.message).toContain("Gateway timedout 504");
                logger.error(error.message);
            }
        }
    });

    test("test successful transfer update", async ()=>{
        httpClient.send = jest.fn().mockResolvedValueOnce(
            sdkInitiateTransferResponseDto("90030343","COMPLETED")
        );
        const res = await sdkClient.updateTransfer({acceptQuote:true}, crypto.randomUUID());
        expect(res.data.transferId).toBeDefined();
        expect(res.data.currentState).toEqual("COMPLETED");
    });

    test("test update transaction request failed with 504 timeout", async () =>{
        httpClient.send = jest.fn().mockImplementation(()=>{
            throw new AxiosError('Gateway Timeout', undefined, undefined, undefined, {
                status: 504,
                statusText: 'Gateway timeout',
                headers: {},
                config: {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer your-token-here',
                        'Accept': 'application/json',
                        'User-Agent': 'MyApp/1.0.0',
                        'Cache-Control': 'no-cache',
                    } as unknown as AxiosRequestHeaders,
                },
                data: 'Gateway TimeOut',
            });
        });
        try{
            await sdkClient.updateTransfer({acceptQuote:true}, crypto.randomUUID());
        }catch(error: unknown){
            if(error instanceof SDKClientError){
                expect(error.message).toContain("Gateway timedout 504");
                logger.error(error.message);
            }
        }
    });
});