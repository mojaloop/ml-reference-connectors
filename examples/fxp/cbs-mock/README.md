# cbs-mock

This directory contains a custom Docker image for simulating a Core Banking System (CBS) backend, specifically for testing the Mojaloop Core Connector implementation.

## Context

- **Purpose:** This mock service is used to test the core connector by simulating the CBS backend APIs and rulesets.
- **Base Image:** The Docker image is based on the [Mojaloop Testing Toolkit](https://github.com/mojaloop/ml-testing-toolkit) (ML Testing Toolkit) Docker image.
- **Customization:**
  - The image overrides the default APIs and rulesets of the ML Testing Toolkit with custom files provided in the `spec_files` directory.
  - This allows for tailored simulation of backend behavior required for core connector integration and functional testing.

## Usage

1. **Build the Docker Image:**
   ```sh
   cd cbs-mock
   docker build -t cbs-mock-test .
   ```
2. **Run the Container:**
   ```sh
   docker run -p 4040:4040 cbs-mock-test
   ```
   - The service will be available on port 4040 by default (matching the ML Testing Toolkit default).
   - You can map to a different external port if needed.

## Customization
- Place your custom API definitions, rules, and configuration files in the `spec_files` directory before building the image.
- These files will override or supplement the defaults in the base ML Testing Toolkit image.

## Notes
- This mock is not limited to the ML Testing Toolkit; any backend simulation service can be used for CBS mocking. In this setup, ML Testing Toolkit is leveraged for its API simulation capabilities. 