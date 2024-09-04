import { TtransferPatchNotificationRequest, TQuoteRequest, TtransferRequest } from 'src/domain/interfaces/types';
export declare const quoteRequestDto: (idType?: string, idValue?: string, amount?: string) => TQuoteRequest;
export declare const transferRequestDto: (idType: string, idValue: string, amount: string) => TtransferRequest;
export declare const transferPatchNotificationRequestDto: (currentState: string, partyIdType: string, partyIdentifier: string, amount: string) => TtransferPatchNotificationRequest;
