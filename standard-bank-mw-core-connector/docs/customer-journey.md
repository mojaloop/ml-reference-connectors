
```mermaid
  sequenceDiagram
  autoNumber

  %% Payer side
  Payer->>Payer App: Customer transfer details.

  Payer App->>Payer CC:POST /send-money/ {}

  Payer CC->>Payer CC: Check Request

  Alt if Checks fail
    Payer CC-->>Payer App: Response 400
  End

  Payer CC->>Payer MC: POST /transfers /{amountType: SEND} 



  Payer MC-->>Hub: 
  Hub-->>Payee MC: 



  %% Payee Side
  Payee MC->>Payee CC:  POST /transfers/ {}

  Payee CC->> Payee CC:Validation Checks, Expiration Check, Quote Expiration Validation, Currency Conversion Checks

  Alt if Checks Fail
    Payee CC-->>Payee MC: Response 400
  End

  Payee CC->>Payee DFSP API: GET [/endpoint-for-getting-customer] 

  Payee DFSP API-->>Payee CC: Response 

  Payee CC->>Payee CC: Check response and customer account status 

  Alt if Customer account has issues 
    Payee CC-->> Payee MC: Response 500, mlCode: 5400
  End

  Payee CC-->>Payee MC: Response 200 {RESERVED}






  Payee MC-->Hub: 
  Hub-->>Payer MC: 




  %% Payer Side
  Payer MC-->>Payer CC: Response

  Alt if WAITING_FOR_CONVERSION_ACCEPTANCE
    Alt if Conversion terms are valid
      Payer CC->>Payer MC: PUT /transfers/{id}[acceptConversion: true]
    Else Conversion terms are invalid
      Payer CC->>Payer MC: PUT /transfers/{id}[acceptConversion: false]

      Payer CC-->>Payer CC: Throw InvalidConversionQuoteError
    End
  End




  Payer MC->>Hub: How does ML determine the quote
  Hub-->>Payer MC: Quote data





  Payer MC->>Payer CC: Normal Quote

  Payer CC->>Payer App: Quote response

  Payer App->>Payer: Terms of transfer




  Payer App->>Payer App: Seek customer consent and debit funds from customer wallet if customer consents

  Payer App->>Payer CC: PUT /send-money/{id}/acceptQuote=true | false

  Payer CC->>Payer CC: Check acceptQuote

  Alt If Quote not Accepted
    Payer CC->>Payer MC:PUT  /transfers/{id} {acceptQuote = false}

    Payer MC-->>Payer CC: Response 
    
    Payer CC-->>Payer App: Response 500 OK
  End 

  Payer CC->>Payer MC:PUT  /transfers/{id} {acceptQuote = true}
  





  Payer MC-->>Hub: 
  Hub-->>Payee MC: 




  %% Payee Side
  Payee MC->>Payee CC: PUT /transfers/{id}

  Alt if Current State !== COMPLETED
    Payee CC-->>Payee MC: Response 500
  End

  Payee CC->>Payee CC: Validation Checks, Expiration Check, Quote Expiration Validation, Currency Conversion Checks

  Alt if Checks Fail
    Payee CC-->>Payee MC: Response 400
  End

  Payee CC->>Payee DFSP API: POST [/endpoint-for-disbursing-funds-to-payee]

  Payee DFSP API-->Payee CC: Response

  Alt if Response not Successful
    Payee CC->>Payee CC: Log failed transaction for further action by DFSP
  End

  Payee CC-->>Payee MC: Response 200




  Payee MC-->>Hub: 
  Hub-->>Payer MC: 





  %% Payer Side

  Payer MC-->>Payer CC: Response
  
  Payer CC->>Payer CC: Check response
  
  Alt if http error code 500,400, 504 or currentState = ERROR_OCCURED
    Payer CC->>Payer DFSP API : POST [/Endpoint for refunding an account]
    
    Payer DFSP API-->>Payer CC:Check Response
    
    Alt if Response not Successful
      Payer CC->>Payer CC: Initiate manual refund
    End
  End
  
 Payer CC-->>Payer App: Response 200
 ```