# Send Money Integration Approaches 

Airtel Money DRPP integration patterns.

Table of Contents
- [Introduction](#introduction)
    - [Initial Step](#initial-step)
- [Approach 1](#approach-1)
- [Approach 2](#approach-2)

# Introduction
The send-money integration patterns are the approaches the integration team has designed to be able to support customers of Airtel in sending outbound payments.


# Initial Step
The send-money customer journey begins when the customer expresses interest to send funds by specifying details about the payee and amount to send. This initiation step applies to both approaches going to be presented in this documentation

Here is a sequence diagram that describes the process. 

In this sequence diagram the Airtel Customer Facing application (USSD or Mobile App) receives some data from the customer about the payment details and then sends the data to a Core Connector middleware that is designed to retrieve information about the payee and how much it will cost to execute the transfer

```mermaid
sequenceDiagram
  autoNumber
  Airtel Customer App->>Core Connector: POST /send-money/ {}
  Core Connector->>Core Connector: Check Request
  Alt if Checks fail
  Core Connector-->>Airtel Customer App: Response 400
  End
  Core Connector->>ML Connector: POST /transfers /{amountType: SEND} 
  ML Connector-->>Core Connector: Response
  Core Connector->> Core Connector: Check Response
  Alt if Checks fail
  Core Connector-->>Airtel Customer App: Response 500
  End

  Alt if WAITING_FOR_CONVERSION_ACCEPTANCE
  Core Connector->>Core Connector: Check Response Conversion Terms
  Alt if Conversion Terms are invalid
  Core Connector->>ML Connector: PUT /transfers/{id}[acceptConversion: false]
  Core Connector-->>Airtel Customer App: Response 500
  End
  Core Connector->>ML Connector: PUT /transfers/{id}[acceptConversion: true]
  End
  ML Connector-->>Core Connector:Response, Normal Quote
  Alt if response not successful
  Core Connector-->>Airtel Customer App: Response 500
  End
  Core Connector->>Core Connector: Check Returned Quote
  Alt if Quote is invalid
  Core Connector-->>Airtel Customer App: Response 500
  End
  Core Connector-->>Airtel Customer App: Response 200
  Airtel Customer App->>Airtel Customer App:Show terms of transfer to customer
```

## Approach 1