# Configuration.
All configuration for any core connector should be put in environment variables. Environment variables are configured through the `.env.example` file in the root of the core connector template folder. Before using the .env.example file, you should create a .env file from it so that it can be used by the executing core connector process as a source of environment variables. Convict is the tool that is used in this repository for configuration management.

To learn more about convict as a tool, read through it's documentation on [npmjs](https://www.npmjs.com/package/convict)

# Configuration Types
Inside the src folder in the core connector folder, there is a configuration file `config.ts`. This is configuration file is what is used to specify what configuration variables are required to run the server.

All configuration environment variables for specific module must specified in a type before they are added to config.ts

# Environment Variable Injection
For environment variables to be used, it is important that they are 