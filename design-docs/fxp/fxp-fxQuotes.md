##  FXP fxQuotes Process

This sequence diagram shows the sequence of steps that happen between the mojaloop connector and the fxp core connector to handle fxQuotes.

Quoting for transfers will be for 2 use cases
- P2P Send Money 
- P2B Merchant Payment 

### Send Money Quoting 
Sequence of steps taken while executing an fxQuote request for a P2P transfer

```mermaid
sequenceDiagram
    autonumber
    ML Connector ->> FXP Core Connector: POST /fxQuotesP2p
    FXP Core Connector ->> FXP Core Connector: Validate request schema
    Alt if validation fails
    FXP Core Connector -->> ML Connector: Response 400
    End
    FXP Core Connector ->> FXP API: Calculate quotation for currency conversion
    FXP API -->> FXP Core Connector: Response 200 {Quote}
    FXP Core Connector -->> ML Connector: Response 200
```

### Merchant Payment Quoting
Sequence of steps taken while executing an fxQuote request for a P2B transfer
```mermaid
sequenceDiagram
    autonumber
    ML Connector ->> FXP Core Connector: POST /fxQuotesP2b
    FXP Core Connector ->> FXP Core Connector: Validate request schema
    Alt if validation fails
    FXP Core Connector -->> ML Connector: Response 400
    End
    FXP Core Connector ->> FXP API: Calculate quotation for currency conversion
    FXP API -->> FXP Core Connector: Response 200 {Quote}
    FXP Core Connector -->> ML Connector: Response 200
```