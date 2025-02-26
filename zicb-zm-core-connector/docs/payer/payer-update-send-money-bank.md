# Payer Update Send Money
This sequence diagram shows the steps the core connector undertakes to handle a request responding to a quote that was shown to a customer. 

```mermaid
sequenceDiagram
  autoNumber
  ZICB App->>ZICB App: Seek customer consent and debit funds from customer wallet if customer consents
  ZICB App->>CC: POST /send-money/{id}/acceptQuote=true | false
  CC->>CC: Check acceptQuote
  Alt If Quote not Accepted
  CC->>ML Connector:PUT  /transfers/{id} {acceptQuote = false}
  ML Connector-->>CC: Response 
  CC-->>ZICB App: Response 500 OK
  End 
  CC->>ML Connector:PUT  /transfers/{id} {acceptQuote = true}
  ML Connector-->>CC: Response
  CC->>CC: Check response
  Alt if http error code 500,400, 504 or currentState = ERROR_OCCURED
  CC->>ZICB CBS : Rolback transfer POST api/json/commercials/zicb/banking
  ZICB CBS-->>CC:Check Response
  Alt if Response not Successful
  CC->>CC: Initiate manual refund
  End
  End
  CC-->> ZICB App: Response 200
```
