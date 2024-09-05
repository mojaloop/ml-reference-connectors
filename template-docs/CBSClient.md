# Core Banking Solution (CBS) Client
The CBS Client is responsible for all communication between the core connector and the core banking solution.

If the financial service provider we were integrating is a Mobile Network Operator like airtel that has an open api, then the CBS Client would be responsible for making http requests to airtel's mobile money api.

The CBS Client is responsible for setting up request resources that are required to effectively communicate with the Core Banking Solution of the Financial Service Provider.

# CBS Client
The CBS Client is defined in a `CBSClient.ts` file located in `core-connector-template/src/domain/CBSClient`

The CBS Client is a typescript class that implements an interface that is special for every DFSP. This interface should be defined in the `types.ts` file so that the concrete class implements all methods of this interface.

Depending on whether the core banking solution api is RESTFUL, 
# Types

# Errors

# Factory