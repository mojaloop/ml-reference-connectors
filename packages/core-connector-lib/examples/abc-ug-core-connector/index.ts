import { getCBSClientInstance } from "./src/CBSClient/CBSClientFactory";
import Connector from "@mojaloop/core-connector-lib";

coreConnector = C
// Set CBSClient
Connector.CBSClient = getCBSClientInstance();

// Set Send Money API

// Set Extension List values 

// 


Connector.start();