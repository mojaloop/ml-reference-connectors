# Airtel Core Connector: haha

# Introdution
This core connector facilitates communication between the Airtel Zambia mobile money api and the Mojaloop Connector. It processes incoming requests from Airtel's customer facing platform and routes them to mojaloop through the mojaloop connector. It was created based on the [Core Connector Template](../core-connector-template/). 

# Integration Accounts
These are accounts that are used to facilitate incoming and outgoing payments in the airtel mobile money platform.
- Disbursements Account: This account is a funded account that is used to support incoming payments. When a request to credit a customer account is received by the connector, checks are performed by the connector and eventually funds will be credited to the customer's account from this account. 
- Collections Account: This is an account that is used to support outgoing payments. When a request to send funds out of airtel is received, this account serves as the holding place for funds that are owed to the scheme.

At the end of the day, these are the accounts used to support the settlement process and to make sure everyday DFSP is paid what they are owed.

# Deployment Configuration .env
These are Airtel Configurations needed for connection. There are found in the [env.example](.env.example)

- <b>AIRTEL_BASE_URL</b> : This is the base url for airtel uat environment 
- <b>CLIENT_ID</b>: According to Airtel Documentation,  The client_id is a public identifier for apps. It must also be unique across all clients that the authorization server handles. This is equivalent to consumer key displayed under keys section of application listing.
- <b>CLIENT_SECRET</b>  : According to Airtel Documentation,  The client_secret is a secret known only to the application and the authorization server.This is equivalent to consumer secret displayed under keys section of application
- <b>GRANT_TYPE</b>:  According to Airtel Documentation, The Client Credential grant type is used by confidential and public clients to fetch access token. 
- <b>X_COUNTRY</b> :Specifies the country where Airtel is being used (i.e, Zambia)

- <b>X_CURRENCY</b> : Specifies the currency used (i.e., ZMW)
- <b>SUPPORTED_ID_TYPE</b> : The supported ID type beinf used. Airtel used MSISDN.
- <b>SERVICE_CHARGE</b>: Service charge for receiving money into an Airtel account.
- <b>EXPIRATION_DURATION</b>: Time limit for sending money before a quote expires.
- <b>AIRTEL_PIN</b> : Pin used for Airtel Disbursements.
- <b>TRANSACTION_ENQUIRY_WAIT_TIME</b>: Time interval for checking transaction enquiries.
- <b>FSP_ID</b>: Unique ID for every Core Connector built for each DFSP (i.e, airtelzambia)



# Development 
To run the project clone the repository into your local machine
```bash
git clone https://github.com/mojaloop/ml-reference-connectors
```

Change directory into the project folder
```bash
cd ml-reference-connectors
```


# Set node version

```bash
nvm use
```

# Install dependencies

```bash
npm install
```

# Build 
```bash
npm run build
```

# Run 
```bash
npm run start
```

# Functional Tests

```bash
npm run test:functional
```
# Unit Tests

```bash
npm run test:unit
```
# Build and Run

```bash
npm run start:build
```
# Run with Docker

```bash
docker compose -f ./test/func/docker-compose.yml up -d
```
# Tear down Docker

```bash
docker compose -f ./test/func/docker-compose.yml down
```
