# Reference Core Connectors
[![Git Releases](https://img.shields.io/github/release/mojaloop/ml-reference-connectors.svg?style=flat)](https://github.com/mojaloop/ml-reference-connectors/releases)
[![CircleCI](https://circleci.com/gh/mojaloop/ml-reference-connectors.svg?style=svg)](https://circleci.com/gh/mojaloop/ml-reference-connectors)

This is a collection of all reference core connectors from COMESA Digital Retdail Payments Platform project. Every folder that is post fixed with the word `-core-connector` is a core connector for a specific participant

# Creating a new Connector
Clone this repository or fork it.

```bash
git clone https://github.com/mojaloop/ml-reference-connectors.git
```

Change into the cloned directory
```bash
cd ml-reference-connectors
```

Create a new core connector by running this command

```bash
./create.sh -c zm -n airtel
```

Once you have run this command, it will created a folder named `airtel-zm-core-connector`

This command also creates a new branch for the core connector. For this connector, it will be called `ft/airtel-zm-core-connector`. It will install npm dependencies, build and start the server. To stop the server from running, press `CTRL + C`

> Do not commit directly to main. Only work on the core connector you created or are assigned to. This will prevent merge conflicts

# Developer Commands
Here are some commands to manage this repo of connectors.

Running pre push checks
```bash
npm run check:pre-push
```

Installing dependencies in all connectors 
```bash
npm run dep:install-all
```

Updating the dependencies in all connectors
```bash
npm run dep:update-all
```

# Customizing the core connector
To refactor the newly created core connector refer to the core connector template guide [here](./docs/README.md).

