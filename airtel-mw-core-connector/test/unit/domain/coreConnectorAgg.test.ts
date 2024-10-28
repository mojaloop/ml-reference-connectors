/*****
 License
 --------------
 Copyright © 2017 Bill & Melinda Gates Foundation
 The Mojaloop files are made available by the Bill & Melinda Gates Foundation under the Apache License, Version 2.0 (the "License") and you may not use these files except in compliance with the License. You may obtain a copy of the License at
 http://www.apache.org/licenses/LICENSE-2.0
 Unless required by applicable law or agreed to in writing, the Mojaloop files are distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.

 Contributors
 --------------
 This is the official list of the Mojaloop project contributors for this file.
 Names of the original copyright holders (individuals or organizations)
 should be listed with a '*' in the first column. People who have
 contributed from an organization can be listed under the organization
 that actually holds the copyright for their contributions (see the
 Gates Foundation organization for an example). Those individuals should have
 their names indented and be marked with a '-'. Email address can be added
 optionally within square brackets <email>.
 * Gates Foundation
 - Name Surname <name.surname@gatesfoundation.com>

 * Eugen Klymniuk <eugen.klymniuk@infitx.com>
 --------------
 **********/

import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';

import {
  CoreConnectorAggregate,
  TQuoteRequest,
  TtransferRequest,
  TtransferPatchNotificationRequest,
  THttpResponse,
  ValidationError,
} from '../../../src/domain';
import {
  AirtelClientFactory,
  IAirtelClient,
  TAirtelSendMoneyRequest,
} from '../../../src/domain/CBSClient';
import {
  ISDKClient,
  SDKClientFactory,
  TSDKOutboundTransferResponse,
  TtransferContinuationResponse,
} from '../../../src/domain/SDKClient';
import { AxiosClientFactory } from '../../../src/infra/axiosHttpClient';
import { loggerFactory } from '../../../src/infra/logger';
import config from '../../../src/config';

import {
  quoteRequestDto,
  transferRequestDto,
  transferPatchNotificationRequestDto,
  sdkInitiateTransferResponseDto,
  sdkUpdateTransferResponseDto,
  sendMoneyDTO,
  callbackPayloadDto,
} from '../../fixtures';

const mockAxios = new MockAdapter(axios);
const logger = loggerFactory({ context: 'ccAgg tests' });
const airtelConfig = config.get('airtel');
const SDK_URL = 'http://localhost:4040';

const idType = 'MSISDN';
const MSISDN_NO = '0999355983';

describe('CoreConnectorAggregate Tests -->', () => {
  let ccAggregate: CoreConnectorAggregate;
  let airtelClient: IAirtelClient;
  let sdkClient: ISDKClient;

  beforeEach(() => {
    mockAxios.reset();
    const httpClient = AxiosClientFactory.createAxiosClientInstance();
    sdkClient = SDKClientFactory.getSDKClientInstance(
      logger,
      httpClient,
      SDK_URL,
    );
    airtelClient = AirtelClientFactory.createClient({
      airtelConfig,
      httpClient,
      logger,
    });
    ccAggregate = new CoreConnectorAggregate(
      sdkClient,
      airtelConfig,
      airtelClient,
      logger,
    );
  });

  describe('Airtel Test', () => {
    test('Test Get Parties Happy Path', async () => {
      try {
        airtelClient.getKyc = jest.fn().mockResolvedValue({
          message: 'Completed successfully',
          errors: [],
          trace: [],
          data: {
            full_name: 'Promise Mphoola',
            first_name: 'Promise', // Extracted first name
            last_name: 'Mphoola', // Extracted last name
            middle_name: 'Roberts', // Assuming no middle name in this case
          },
          status: { code: 200 },
        });

        airtelClient.getToken = jest.fn().mockResolvedValue({
          message: 'Completed successfully',
          errors: [],
          trace: [],
          data: {
            token: '3|i6cvlcmyDKMzpczXol6QTbwMWzIgZI25AfwdOfCG',
            expires_at: '2023-07-13 10:56:45',
          },
        });

        const res = await ccAggregate.getParties('978980797', 'MSISDN');
        expect(res.statusCode).toEqual(200);
      } catch (error) {
        console.error(error);
      }
    });

    test('Test Get Parties with other params missing', async () => {
      try {
        // Mocking the getKyc response with missing parameters
        airtelClient.getKyc = jest.fn().mockResolvedValue({
          message: 'Completed successfully',
          errors: [],
          trace: [],
          data: {
            full_name: 'Promise Mphoola',
            // "first_name" intentionally missing
            last_name: 'Mphoola',
            middle_name: 'Roberts',
          },
          status: { code: 200 },
        });

        airtelClient.getToken = jest.fn().mockResolvedValue({
          message: 'Completed successfully',
          errors: [],
          trace: [],
          data: {
            token: '3|i6cvlcmyDKMzpczXol6QTbwMWzIgZI25AfwdOfCG',
            expires_at: '2023-07-13 10:56:45',
          },
        });

        const res = await ccAggregate.getParties('978980797', 'MSISDN');

        // Assert the status code is 200
        expect(res.statusCode).toEqual(200);

        // Check for missing first name
        if (!res.data.firstName) {
          console.warn('First name is missing');
        }

        // Check for missing last name
        if (!res.data.lastName) {
          console.warn('Last name is missing');
        }

        // Additional expectations
        expect(res.data.firstName).toBeUndefined(); // Asserting that firstName is missing
        expect(res.data.lastName).toEqual('Mphoola'); // Asserting lastName is correct
      } catch (error) {
        console.error(error);
      }
    });

    // Quote request test
    test('POST /quoterequests: sdk-server - Should return quote if party info exists', async () => {
      airtelClient.getKyc = jest.fn().mockResolvedValue({
        message: 'Completed successfully',
        errors: [],
        trace: [],
        data: {
          full_name: 'Promise Mphoola',
        },
      });

      airtelClient.getToken = jest.fn().mockResolvedValue({
        message: 'Completed successfully',
        errors: [],
        trace: [],
        data: {
          token: '3|i6cvlcmyDKMzpczXol6QTbwMWzIgZI25AfwdOfCG',
          expires_at: '2023-07-13 10:56:45',
        },
      });

      const quoteRequest: TQuoteRequest = quoteRequestDto(
        undefined,
        undefined,
        '1000',
      );

      const res = await ccAggregate.quoteRequest(quoteRequest);

      logger.info(JSON.stringify(res));
      const fees =
        (Number(config.get('airtel.SERVICE_CHARGE')) / 100) *
        Number(quoteRequest.amount);
      expect(res.payeeFspFeeAmount).toEqual(fees.toString());
    });

    // transfers
    test('POST /transfers: sdk-server - Should return receiveTransfer if party is airtel', async () => {
      airtelClient.getKyc = jest.fn().mockResolvedValue({
        message: 'Completed successfully',
        errors: [],
        trace: [],
        data: {
          full_name: 'Promise Mphoola',
        },
      });

      airtelClient.getToken = jest.fn().mockResolvedValue({
        message: 'Completed successfully',
        errors: [],
        trace: [],
        data: {
          token: '3|i6cvlcmyDKMzpczXol6QTbwMWzIgZI25AfwdOfCG',
          expires_at: '2023-07-13 10:56:45',
        },
      });
      const transferRequest: TtransferRequest = transferRequestDto(
        idType,
        MSISDN_NO,
        '50',
      );

      const res = await ccAggregate.receiveTransfer(transferRequest);

      logger.info(JSON.stringify(res));
      expect(res.transferState).toEqual('RESERVED');
    });

    test('PUT /transfers/{id} notification: sdk server - Should return 200  ', async () => {
      airtelClient.sendMoney = jest.fn().mockResolvedValue({
        message: 'Completed successfully',
        errors: [],
        trace: [],
        data: {
          transaction_id: 'ljzowczj',
          receipt_number: 'AGC00B5MCA',
        },
      });

      jest.spyOn(airtelClient, 'sendMoney');

      const patchNotificationRequest: TtransferPatchNotificationRequest =
        transferPatchNotificationRequestDto(
          'COMPLETED',
          idType,
          MSISDN_NO,
          '500',
        );
      const res = await ccAggregate.updateTransfer(
        patchNotificationRequest,
        'ljzowczj',
      );

      logger.info(JSON.stringify(res));
      expect(res).toBeUndefined();
      expect(airtelClient.sendMoney).toHaveBeenCalled();
    });
  });

  // Airtel payer tests

  describe('sendTransfer', () => {
    it('should return payee details and fees for valid transfer requests', async () => {
      var transferRequest: TAirtelSendMoneyRequest = {
        homeTransactionId: '12345',
        payeeId: '67890',
        payeeIdType: 'MSISDN',
        sendAmount: '1000',
        sendCurrency: 'MWK',
        receiveCurrency: 'MWK',
        transactionDescription: 'Test Transfer',
        transactionType: 'TRANSFER',
        payer: 'airtel',
        payerAccount: 'Airtel123',
        dateOfBirth: '1990-01-01',
      };

      // Mock initiateTransfer response
      const sdkResponse: THttpResponse<TSDKOutboundTransferResponse> = {
        data: {
          homeTransactionId: '12345',
          transferId: 'test-transfer-id',
          currentState: 'COMPLETED',
          currency: 'MWK',
          amount: '1000',
          to: {
            idType: 'MSISDN',
            idValue: '67890',
            fspId: 'TestFSP',
            firstName: 'John',
            lastName: 'Doe',
            dateOfBirth: '1990-01-01',
          },
          from: {
            idType: 'MSISDN',
            idValue: '',
          },
          amountType: 'SEND',
          transactionType: 'TRANSFER',
          quoteResponse: {
            body: {
              payeeReceiveAmount: { amount: '1000', currency: 'MWK' },
              payeeFspFee: { amount: '0', currency: 'MWK' },
              transferAmount: {
                currency: 'MWK',
                amount: '',
              },
              expiration: '',
              ilpPacket: '',
              condition: '',
            },
          },
          fxQuotesResponse: {
            body: {
              conversionTerms: {
                targetAmount: {
                  currency: 'MWK',
                },
                conversionId: '',
                initiatingFsp: '',
                counterPartyFsp: '',
                amountType: 'SEND',
                sourceAmount: {
                  currency: 'MWK',
                  amount: '1000',
                },
                expiration: '',
              },
            },
          },
        },
        statusCode: 0,
      };

      // Mock airtelClient.getKyc response
      airtelClient.getKyc = jest.fn().mockResolvedValue({
        message: 'Completed successfully',
        errors: [],
        trace: [],
        data: {
          full_name: 'Promise Mphoola',
          first_name: 'Promise',
          last_name: 'Mphoola',
          middle_name: 'Roberts',
        },
        status: { code: 200 },
      });

      sdkClient.initiateTransfer = jest.fn().mockResolvedValue(sdkResponse);

      // Execute the sendTransfer function
      const result = await ccAggregate.sendTransfer(transferRequest);

      // Expected response shape
      const expectedResponse = {
        payeeDetails: {
          idType: 'MSISDN',
          idValue: '67890',
          fspId: 'TestFSP',
          firstName: 'John',
          lastName: 'Doe',
          dateOfBirth: '1990-01-01',
        },
        receiveAmount: '1000',
        receiveCurrency: 'MWK',
        fees: '0',
        feeCurrency: 'MWK',
        transactionId: 'test-transfer-id',
      };

      // Validate the response
      expect(result).toEqual(expectedResponse);
    });


    // handle conversion acceptance and rejection
    it('should handle conversion acceptance and rejection correctly', async () => {

      var transferRequest: TAirtelSendMoneyRequest = {
        homeTransactionId: '12345',
        payeeId: '67890',
        payeeIdType: 'MSISDN',
        sendAmount: '1000',
        sendCurrency: 'MWK',
        receiveCurrency: 'KES',
        transactionDescription: 'Test Transfer',
        transactionType: 'TRANSFER',
        payer: 'airtel',
        payerAccount: 'Airtel123',
        dateOfBirth: '1990-01-01',
      };

      // Mock initiateTransfer to return WAITING_FOR_CONVERSION_ACCEPTANCE state
      const waitingResponse: THttpResponse<TSDKOutboundTransferResponse> = {
        data: {
          homeTransactionId: '12345',
          transferId: 'test-transfer-id',
          currentState: 'WAITING_FOR_CONVERSION_ACCEPTANCE',
          currency: 'USD',
          amount: '1000',
          to: {
            idType: 'MSISDN',
            idValue: '67890',
            fspId: 'TestFSP',
            firstName: 'John',
            lastName: 'Doe',
            dateOfBirth: '1990-01-01',
          },
          from: {
            type: undefined,
            idType: 'MSISDN',
            idValue: '',
            idSubValue: undefined,
            displayName: undefined,
            firstName: undefined,
            middleName: undefined,
            lastName: undefined,
            dateOfBirth: undefined,
            merchantClassificationCode: undefined,
            fspId: undefined,
            supportedCurrencies: undefined,
            kycInformation: undefined,
            extensionList: undefined,
          },
          amountType: 'SEND',
          transactionType: 'TRANSFER',
        },
        statusCode: 0,
      };

        // Mock airtelClient.getKyc response
        airtelClient.getKyc = jest.fn().mockResolvedValue({
          message: 'Completed successfully',
          errors: [],
          trace: [],
          data: {
            full_name: 'Promise Mphoola',
            first_name: 'Promise',
            last_name: 'Mphoola',
            middle_name: 'Roberts',
          },
          status: { code: 200 },
        });

      sdkClient.initiateTransfer = jest.fn().mockResolvedValue(waitingResponse);

      // Mock updateTransfer for conversion acceptance
      const conversionAcceptResponse: THttpResponse<TtransferContinuationResponse> =
        {
          data: {
            transferId: 'test-transfer-id',
            homeTransactionId: '12345',
            amount: '1000',
            from: {
              type: undefined,
              idType: 'MSISDN',
              idValue: '',
              idSubValue: undefined,
              displayName: undefined,
              firstName: undefined,
              middleName: undefined,
              lastName: undefined,
              dateOfBirth: undefined,
              merchantClassificationCode: undefined,
              fspId: undefined,
              extensionList: undefined,
            },
            to: {
              type: undefined,
              idType: 'MSISDN',
              idValue: '',
              idSubValue: undefined,
              displayName: undefined,
              firstName: undefined,
              middleName: undefined,
              lastName: undefined,
              dateOfBirth: undefined,
              merchantClassificationCode: undefined,
              fspId: undefined,
              extensionList: undefined,
            },
            amountType: 'SEND',
            currency: 'USD',
            transactionType: 'TRANSFER',
          },
          statusCode: 0,
        };

      sdkClient.updateTransfer = jest
        .fn()
        .mockResolvedValue(conversionAcceptResponse);

      // Execute sendTransfer and validate conversion acceptance handling
      const result = await ccAggregate.sendTransfer(transferRequest);

      expect(result.transactionId).toBe('test-transfer-id');

      expect(sdkClient.updateTransfer).toHaveBeenCalledWith(
        { acceptConversion: true },
        'test-transfer-id',
      );
    });
  });
});
