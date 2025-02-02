# Payer Update Send Money
This sequence diagram shows the steps the core connector undertakes to handle a request responding to a quote that was shown to a customer. 

```mermaid
sequenceDiagram
  autoNumber
  DFSP Customer App->>CC: POST /send-money/{id}/acceptQuote=true | false]
  CC->>CC: Check acceptQuote
  Alt If Quote not Accepted
  CC-->>DFSP Customer App: Response 500 OK
  End
  CC->>CBS Api:POST /merchant/v2/payments
  CBS Api-->>CC:Response
  CC-->>CC: Check Response
  Alt If Couldnt make reservation
  CC-->>DFSP Customer App: Response 500
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
  CC->>CBS Api : Rolback transfer POST /refund/customer/funds
  CBS Api-->>CC:Check Response
  Alt if Response not Successful
  CC->>CC: Initiate manual refund
  End
  End
  CC-->> DFSP Customer App: Response 200
```
