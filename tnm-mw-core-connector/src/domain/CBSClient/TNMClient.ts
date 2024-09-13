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


 - Kasweka Michael Mukoko <kaswekamukoko@gmail.com>
 - Niza Tembo <mcwayzj@gmail.com>

 --------------
 ******/

 import { IHTTPClient, ILogger } from "../interfaces";
 import { TNMError } from "./errors";
 import {ITNMClient as ITNMClient, TNMCollectMoneyRequest, TNMCollectMoneyResponse, TNMConfig, TnmValidateResponse, TNMRefundMoneyRequest, TNMRefundMoneyResponse, TNMTransactionEnquiryRequest, TNMTransactionEnquiryResponse, TGetKycArgs, TGetTokenArgs, TGetTokenResponse } from "./types";

 export const TNM_ROUTES = Object.freeze({
     getToken: '/authenticate',
     getKyc: '/payments/validate/{{MSSDN}}',
     sendMoney: '/payments/',
     collectMoney: '/payments',
     refundMoney: '/invoices/refund/{{receipt_number}}',
     transactionEnquiry: '/payments/{{transaction_id}}/'
 });


 export class TNMClient implements ITNMClient {
     tnmConfig: TNMConfig;
     httpClient: IHTTPClient;
     logger: ILogger;

     constructor(airtelConfig: TNMConfig, httpClient: IHTTPClient, logger: ILogger) {
         this.tnmConfig = airtelConfig;
         this.httpClient = httpClient;
         this.logger = logger;
     }


     async refundMoney(deps: TNMRefundMoneyRequest): Promise<TNMRefundMoneyResponse> {
         this.logger.info("Refunding Money to Customer in TNM");
         const url = `https://${this.tnmConfig.TNM_BASE_URL}${TNM_ROUTES.refundMoney}`;

         try{
             const res = await this.httpClient.post<TNMRefundMoneyRequest,TNMRefundMoneyResponse>(url, deps,{
                 headers: {
                     ...this.getDefaultHeader(),
                     'Authorization': `Bearer ${await this.getAuthHeader()}`,
                 }
             });
             if (res.data.status.code !== '200') {
                 throw TNMError.refundMoneyError();
             }
             return res.data;
         }catch(error){
             this.logger.error(`Error Refunding Money: ${error}`, { url, data: deps });
             throw error;
         }
     }


     async collectMoney(deps: TNMCollectMoneyRequest): Promise<TNMCollectMoneyResponse> {
         this.logger.info("Collecting Money from Airtel");
         const url = `https://${this.tnmConfig.TNM_BASE_URL}${TNM_ROUTES.collectMoney}`;

         try {
             const res = await this.httpClient.post<TNMCollectMoneyRequest, TNMCollectMoneyResponse>(url, deps, {
                 headers: {
                     ...this.getDefaultHeader(),
                     'Authorization': `Bearer ${await this.getAuthHeader()}`,
                 }
             });
             if (res.data.status.code !== '200') {
                 throw TNMError.collectMoneyError();
             }
             return res.data;

         }catch(error){
             this.logger.error(`Error Collecting Money: ${error}`, { url, data: deps });
             throw error;
         }
     }




    //  async sendMoney(deps: TAirtelDisbursementRequestBody): Promise<TAirtelDisbursementResponse> {
    //      this.logger.info("Sending Disbursement Body To Airtel");
    //      const url = `https://${this.tnmConfig.AIRTEL_BASE_URL}${TNM_ROUTES.sendMoney}`;
    //      try {
    //          const res = await this.httpClient.post<TAirtelDisbursementRequestBody, TAirtelDisbursementResponse>(url, deps,
    //              {
    //                  headers: {
    //                      ...this.getDefaultHeader(),
    //                      'Authorization': `Bearer ${await this.getAuthHeader()}`,
    //                  }
    //              }
    //          );

    //          if (res.data.status.code !== '200') {
    //              throw TNMError.disbursmentError();
    //          }
    //          return res.data;
    //      } catch (error) {
    //          this.logger.error(`Error Sending Money: ${error}`, { url, data: deps });
    //          throw error;
    //      }
    //  }

     //  Get transaction Enquiry

     async getTransactionEnquiry(deps: TNMTransactionEnquiryRequest): Promise<TNMTransactionEnquiryResponse> {
         this.logger.info("Getting Transaction Status Enquiry from Airtel");
         const url = `https://${this.tnmConfig.TNM_BASE_URL}${TNM_ROUTES.transactionEnquiry}${deps.transactionId}`;
         this.logger.info(url);
         try {
             const res = await this.httpClient.get<TNMTransactionEnquiryResponse>(url, {
                 headers: {
                     ...this.getDefaultHeader(),
                     'Authorization': `Bearer ${await this.getAuthHeader()}`
                 }
             });

             if (res.data.status.code !== '200') {
                 this.logger.error(`Failed to get token: ${res.statusCode} - ${res.data}`);
                 throw TNMError.getTokenFailedError();
             }
             return res.data;
         } catch (error) {
             this.logger.error(`Error getting token: ${error}`, { url, data: deps });
             throw error;
         }

     }

     async getToken(deps: TGetTokenArgs): Promise<TGetTokenResponse> {
         this.logger.info("Getting Access Token from TNM");
         const url = `https://${this.tnmConfig.TNM_BASE_URL}${TNM_ROUTES.getToken}`;
         this.logger.info(url);
         try {
             const res = await this.httpClient.post<TGetTokenArgs, TGetTokenResponse>(url, deps, {
                 headers: this.getDefaultHeader()
             });
             if (res.statusCode !== 200) {
                 this.logger.error(`Failed to get token: ${res.statusCode} - ${res.data}`);
                 throw TNMError.getTokenFailedError();
             }
             return res.data;
         } catch (error) {
             this.logger.error(`Error getting token: ${error}`, { url, data: deps });
             throw error;
         }
     }


     async getKyc(deps: TGetKycArgs): Promise<TnmValidateResponse> {
         this.logger.info("Getting KYC Information");
         const res = await this.httpClient.get<TnmValidateResponse>(`https://${this.tnmConfig.TNM_BASE_URL}${TNM_ROUTES.getKyc}${deps.msisdn}`, {
             headers: {
                 ...this.getDefaultHeader(),
                 'Authorization': `Bearer ${await this.getAuthHeader()}`
             }
         });
         if (res.data.message !== 'Completed successfully') {
             throw TNMError.getKycError();
         }
         return res.data;
     }


     private getDefaultHeader() {
         return {
             'Content-Type': 'application/json',
             'Token': this.tnmConfig.TOKEN,

         };
     }


     private async getAuthHeader(): Promise<string> {
         const res = await this.getToken({
             password: this.tnmConfig.CLIENT_PASSWORD,
             wallet: this.tnmConfig.CLIENT_WALLET,
         });
         return res.data.token;
     }
 }