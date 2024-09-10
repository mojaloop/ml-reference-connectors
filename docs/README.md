# Core Connector Template
Core Connector template to be adapted for rapid core connector development.

> For full forms check the glossary section

# Table of Contents
1. [Introduction](./README.md#introduction)
2. [API Service](./Service.md) 
3. [Route Handling and Api Specifications](./RoutingAndApiSpecifications.md)
4. [Networking](./Networking.md)
5. [Core Banking Solution Client](./CBSClient.md)
6. [Mojaloop Connector Client](./SDKClient.md)
7. [Configuration Management](./Configuration.md)
8. [Aggregate for Business Logic](./CoreConnectorAggregate.md)
9. [Error Handling](./ErrorHandling.md)
10. [Integration Accounts](./IntegrationAccounts.md)
11. [Request Lifecycle](./RequestHandling.md)

# Introduction
A core connector is a middleware that facilitates a connection between the DFSP and the mojaloop connector.

![Core Connector Overiew](./assets/Overview.png)

# Prerequisites
Before you start building a core connector, there are some requirements that need to be in place before implementation starts. These are important because they affect the success of the integration

- CBS Sandbox API
- Access credentials 
- Typescript knowledge
- Beginner docker knowledge 
- Git knowledge
- Mojaloop Knowledge
- For Windows users you will need WSL (Ubuntu)

If you need to get knowledge on how Mojaloop works, consider taking the [Mojaloop Training Program](https://mojaloop.io/mojaloop-training-program/).

# Payee Integration.

This section describes how to implement payee integrations to support payee operations from the Mojaloop Connector

# How to implement Get Parties
TBD...

# How to implement Quote Requests
TBD...

# How to implenent Transfers
TBD...

# Payer Integration
This section describes how to implement payer integrations to support payer operations to the Mojaloop Connector

# How to implement Send Money
TBD...

# How to implement Update Send Money
TBD...

# Glossary
- DFSP : Digital Financial Service Provider
- CBS: Core Banking Solution
- API: Application Programming Interface
- WSL: Windows Sub-System For Linux