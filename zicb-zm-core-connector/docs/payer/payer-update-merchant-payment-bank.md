# Payer Update Merchant Payment 
This sequence diagram details the process of updating an initiated merchant payment and the steps the core connector takes to initiate a payment in the mojaloop connector.

```mermaid
sequenceDiagram
  autoNumber
  ZICB App->>ZICB App: Seek customer consent and debit funds from customer wallet if customer consents
  ZICB App->>CC: POST /merchant-payment/{id}/acceptTerms=true | false
  CC->>CC: Check acceptTerms
  Alt If Quote not Accepted
  CC->>ML Connector:PUT  /transfers/{id} {acceptConversion = false}
  ML Connector-->>CC: Response 
  CC-->>ZICB App: Response 500 OK
  End
  CC->>ML Connector:PUT  /transfers/{id} {acceptConversion = true}
  ML Connector-->>CC: Response
  CC->>CC: Check response
  Alt if http error code 500,400, 504 or currentState = ERROR_OCCURED
  CC->>CBS Api : Rolback transfer POST /refund/customer/funds
  CBS Api-->>CC:Check Response
  Alt if Response not Successful
  CC->>CC: Initiate manual refund
  End
  End
  CC-->> ZICB App: Response 200
```
