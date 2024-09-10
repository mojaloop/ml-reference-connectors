# Reference Core Connectors
[![Git Releases](https://img.shields.io/github/release/mojaloop/ml-reference-connectors.svg?style=flat)](https://github.com/mojaloop/ml-reference-connectors/releases)
[![CircleCI](https://circleci.com/gh/mojaloop/ml-reference-connectors.svg?style=svg)](https://circleci.com/gh/mojaloop/ml-reference-connectors)

This is a collection of all reference core connectors from COMESA Digital Retail Payments Platform project.


# Core Connectors in this Collection
- Airtel Core Connector Zambia

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

This command also creates a new branch for the core connector. For this connector, it will be called `ft/airtel-zm-core-connector`

> Do not commit directly to main. Only work on the core connector you created or are assigned to. This will prevent merge conflicts

# Setup
Run these commands to setup the newly created connector

# Node Setup
Make sure [nvm](https://github.com/nvm-sh/nvm) is installed

```bash
nvm install
nvm use
```

# Install dependencies
```bash
npm i
```

# Building the core connector
To build a new core connector refer to the core connector template guide [here](./docs/README.md) to refactor your newly created connector for the new dfsp

