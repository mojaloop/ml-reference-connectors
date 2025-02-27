##  FXP fxQuotes Process

This sequence diagram shows the sequence of steps that happen between the mojaloop connector and the fxp core connector to handle fxQuotes.

```mermaid
sequenceDiagram
    autonumber
    ML Connector ->> FXP Core Connector: POST /fxQuotes
    FXP Core Connector ->> FXP Core Connector: Validate request schema
    Alt if validation fails
    FXP Core Connector -->> ML Connector: Response 400
    End
    FXP Core Connector ->> FXP Core Connector: Calculate quotation for currency conversion
    FXP Core Connector -->> ML Connector: Response 200
```