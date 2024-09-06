# Core Connector Aggregate
All business logic is specified inside the core connector aggregate. The core connector aggregate is a class inside the `coreConnectorAgg.ts` file located inside the `src/domain` folder of the core connector template.

This is where all the business logic is tied together. This is where all the different pieces of the puzzles are tied together. The route handlers in the routes class invoke functions in the core connector aggregate class to execute functionality associated with a particular endpoint.

The data returned by an aggregate function is returned to the route handler which in turn returns the data as a json response back to the client that made the request.

# Aggregate Attributes
The core connector aggregate requires some attributes to be able to execute it's functionality. It requires a CBS Client to be able to make requests to the core banking solution of the DFSP being created. It requires a logger to be able to log info messages on the console. It also requires an SDK Client to be able to make requests to the mojaloop connector.

These attributes are specified as part of the aggregate class constructor.

# Aggregate Functions 
The core connector aggregate has functions that handle specific problems in a typical integration. The functions that it must have are listed here

# Payee Integration
The payee integration functions are majorly three
- Get Parties
- Quote Requests
- 