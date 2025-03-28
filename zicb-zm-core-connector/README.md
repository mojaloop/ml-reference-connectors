# ZICB  Core Connector 

# Introdution
This core connector facilitates communication between the ZICB api and the Mojaloop Connector. It processes incoming requests from ZICB's customer facing platform and routes them to mojaloop through the mojaloop connector. It was created based on the [Core Connector Template](../core-connector-template/). 



# Integration Accounts

These are accounts that are used to facilitate incoming and outgoing payments in ZICB.
- Disbursements Account: This account is a funded account that is used to support incoming payments. When a request to credit a customer account is received by the connector, checks are performed by the connector and eventually funds will be credited to the customer's account from this account. 
- Collections Account: This is an account that is used to support outgoing payments. When a request to send funds out of airtel is received, this account serves as the holding place for funds that are owed to the scheme.

At the end of the day, these are the accounts used to support the settlement process and to make sure everyday DFSP is paid what they are owed.

# Deployment Configuration .env
These are ZICB Configurations needed for connection. There are found in the [env.example](.env.example)

- <b>AUTH_KEY</b> : This is the authentication key needed to make requests to zicb.

- <b>X_COUNTRY</b> :Specifies the country the DFSP(ZICB) is from.

- <b>X_CURRENCY</b> : Specifies the currency used (i.e., ZMW)
- <b>SUPPORTED_ID_TYPE</b> : The supported ID type beinf used. ZICB used ACCOUNT_NO.
- <b>SERVICE_CHARGE</b>: Service charge for receiving money into a ZICB account.
- <b>EXPIRATION_DURATION</b>: Time limit for sending money before a quote expires.
- <b>TRANSACTION_ENQUIRY_WAIT_TIME</b>: Time interval for checking transaction enquiries.
- <b>FSP_ID</b>: Unique ID for every Core Connector built for each DFSP (i.e, airtelzambia)
- <b>REQUEST_TIMEOUT</b>: Time out for requests.


# Api Service Request
All the requests to zicb all have the same endpoing 
```
/api/json/commercials/zicb/banking
```

To differenciate the differnent requests the request bodies all have the same request structure with different service request numbers. i.e:

```
Wallet to Wallet Internal Funds Transfer

{
	"service":"BNK9930",
	"request":{
        "amount": "4",
        "destAcc": "{{Destinstion Account}}",
        "destBranch": "001",
        "payCurrency": "ZMW",
        "payDate": "2024-07-03",
        "referenceNo": "{{$timestamp}}",
        "remarks": "Being payment for zxy invoice numner 12345 refred 12345",
        "srcAcc": "{{Source Account}}",
        "srcBranch": "101",
        "srcCurrency": "ZMW",
        "transferTyp": "INTERNAL"
    }
}
```

The "service" field for the Internal funds transfer request has a value of "BNK9930".

Anothoer important requst is Verify by Account Number use for kyc checks by passing the account number.

```
Verify By Account No

{
	"service":"BNK9911",
	"request":{
        "accountNos":"{{Account No}}",
        "customerNos":null,
        "getByCustNo":false,
        "getByAccType":false,
        "accountType":null
    }
}
```

# Development 
To run the project clone the repository into your local machine
```bash
git clone https://github.com/mojaloop/ml-reference-connectors
```

Change directory into the project folder and Zicb Core Connector
```bash
cd ml-reference-connectors/zicb-zm-core-connector
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



