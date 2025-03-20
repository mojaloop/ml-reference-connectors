import { getCBSClientInstance } from "./src/CBSClient/CBSClientFactory";
import {Connector} from "@mojaloop/core-connector-lib";

// Set CBSClient
Connector.CBSClient = getCBSClientInstance();

// Set Send Money API

// Set 


Connector.start();