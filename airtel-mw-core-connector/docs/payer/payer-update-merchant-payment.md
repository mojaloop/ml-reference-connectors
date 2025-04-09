# Payer Update Merchant Payment 
This sequence diagram details the process of updating an initiated merchant payment and the steps the core connector takes to initiate a payment in the mojaloop connector.

```mermaid
sequenceDiagram
  autoNumber
  Airtel App->>CC: POST /merchant-payment/{id}/acceptQuote=true | false
  CC->>CC: Check acceptQuote
  Alt If Quote not Accepted
  CC-->>Airtel App: Response 500 OK
  End
  CC->>CBS Api:POST /merchant/v2/payments
  CBS Api-->>CC:Response
  CC-->CC: Check Response
  Alt If Couldnt make reservation
  CC-->>Airtel App: Response 500
  End
  CBS Api->>CC: PUT /callback
  CC->>CC: Check payment status 
  Alt If Transaction Successful
  CC->>ML Connector:PUT  /transfers/{id} {acceptQuote = true}
  Else
  CC->>ML Connector:PUT  /transfers/{id} {acceptQuote = false}
  End
  ML Connector-->>CC: Response
  CC->>CC: Check response
  Alt if http error code 500 or 504 or currentState = ERROR_OCCURED
  CC->>CBS Api : Rolback transfer POST /standard/v2/payments/refund
  CBS Api-->>CC:Check Response
  Alt if Response not Successful
  CC->>CC: Initiate manual refund
  End
  End
  CC-->> CBS Api: Response 200