```mermaid
sequenceDiagram
  autoNumber
  ML Integration Service->>CC: PUT /send-money/{id}/acceptQuote=true | false]
  CC->>CC: Check acceptQuote
  Alt If Quote not Accepted
  CC-->>ML Integration Service: Response 500 OK
  End
  CC->>Airtel:POST /merchant/v2/payments
  Airtel-->>CC:Response
  CC-->CC: Check Response
  Alt If Couldnt make reservation
  CC-->>ML Integration Service: Response 500
  End
  Airtel->>CC: PUT /airtel-callback
  CC->>CC: Check payment status 
  Alt If Transaction Successful
  CC->>ML Connector:PUT  /transfers/{id} {acceptQuote = true}
  Else
  CC->>ML Connector:PUT  /transfers/{id} {acceptQuote = false}
  End
  ML Connector-->>CC: Response
  CC->>CC: Check response
  Alt if http error code 500 or 504 or currentState = ERROR_OCCURED
  CC->>Airtel : Rolback transfer POST /standard/v2/payments/refund
  Airtel-->>CC:Check Response
  Alt if Response not Successful
  CC->>CC: Initiate manual refund
  End
  End
  CC-->> Airtel: Response 200
```
