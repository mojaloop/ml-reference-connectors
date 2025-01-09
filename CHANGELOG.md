# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

## 1.13.0 (2025-01-09)


### Features

* added auth and kyc ([93f09ca](https://github.com/mojaloop/ml-reference-connectors/commit/93f09ca78216622c735e7d655a73f7b06a01a6ed))
* added boilerplate code for outgoing payments ([0902506](https://github.com/mojaloop/ml-reference-connectors/commit/0902506d5f4aed99c39bc9d03aa3de5b20216b38))
* added callback endpoint and request handler function ([8e1f100](https://github.com/mojaloop/ml-reference-connectors/commit/8e1f100c03233de75fc6de22b0e081fbb2fe0a88))
* added collectMoney function and refactored aggregate ([9132392](https://github.com/mojaloop/ml-reference-connectors/commit/91323925847239cf75ffdc6606cc68266a742352))
* added logging for errors ([d8899bf](https://github.com/mojaloop/ml-reference-connectors/commit/d8899bf5ae621af62fa66573897e8f487a80d660))
* added logging of request and respone bodies ([60a7e03](https://github.com/mojaloop/ml-reference-connectors/commit/60a7e036a10a31278c01220ff26c5f1d8414610d))
* added property attribute to data object in getCustomer method in CBSclient ([2b410c4](https://github.com/mojaloop/ml-reference-connectors/commit/2b410c4e9e6c882e34b12950679da952afa919b3))
* added quote validation logic for incoming payments ([5b1ce67](https://github.com/mojaloop/ml-reference-connectors/commit/5b1ce67be3c25431b514c573068014b3e07833fc))
* added refund function to tnm client ([c1b6183](https://github.com/mojaloop/ml-reference-connectors/commit/c1b6183b05d71e095a97316fc417da5701306f46))
* added route handler for PATCH notification ([349ffb7](https://github.com/mojaloop/ml-reference-connectors/commit/349ffb7ea4c488ae0bdf00cef424ea8d06de42e1))
* change callback req method to post for tnm ([db3180e](https://github.com/mojaloop/ml-reference-connectors/commit/db3180eae26e0f8a456bcfe78a612e14e6b4eb93))
* create new connector for mtn ug ([651ac79](https://github.com/mojaloop/ml-reference-connectors/commit/651ac79fcf57b4c1f6c21ade8ae9b4c81d67130d))
* fixed MTN Client to support integration ([089a13c](https://github.com/mojaloop/ml-reference-connectors/commit/089a13c281dd0ff926c6dd8e59cb8a8b7dc16c8f))
* implement callback functionality ([db356f5](https://github.com/mojaloop/ml-reference-connectors/commit/db356f59f0523dac1272e0e99e526d76646621a3))
* implemented functions for incoming transactions ([96c3644](https://github.com/mojaloop/ml-reference-connectors/commit/96c364477372bd937559ea7880714b0e45bbb6f5))
* implemented get transaction enquirey ([a043d6f](https://github.com/mojaloop/ml-reference-connectors/commit/a043d6f1d88c5871da7338e030063f2e59a88cb6))
* implemented outgoing payments functionality ([2e64944](https://github.com/mojaloop/ml-reference-connectors/commit/2e649443416e27ccc44f4958c588a34c44cfea19))
* implemented recieve transfers ([4c0c2aa](https://github.com/mojaloop/ml-reference-connectors/commit/4c0c2aac058972bd12cf00802e9fb2a1bab9bcbd))
* read ISO returned name and configure http timeout ([05fb823](https://github.com/mojaloop/ml-reference-connectors/commit/05fb823e671c18afcbdd9c88b55575b901e692b4))
* refactored aggregate and added callback handler ([dfd0bdd](https://github.com/mojaloop/ml-reference-connectors/commit/dfd0bdd943300c09d0c62e9d4b0ce654155d811b))
* updated api documentation ([82a0435](https://github.com/mojaloop/ml-reference-connectors/commit/82a0435188179bf5d2337cf26a7fa4aafaab53b6))
* updated readme doc in root folder ([0589704](https://github.com/mojaloop/ml-reference-connectors/commit/058970451cd935e670ec6370df74f3e14c98eec1))


### Bug Fixes

* added await on refund handler ([7ba561f](https://github.com/mojaloop/ml-reference-connectors/commit/7ba561f7278258e7f63fc431d713efbcee55e418))
* added await on refund handler ([7a496af](https://github.com/mojaloop/ml-reference-connectors/commit/7a496af77335c8415c7d60fc6a1cc52a1828a607))
* added changes from update-payer send money ([a5cc399](https://github.com/mojaloop/ml-reference-connectors/commit/a5cc3991164d491edb9c5d1f6f3c4243c175b594))
* fix failing tests ([0c1f6d6](https://github.com/mojaloop/ml-reference-connectors/commit/0c1f6d625997101970eb6a64cb8f3603b463fd27))
* fix linting errors ([c845b56](https://github.com/mojaloop/ml-reference-connectors/commit/c845b56068d949c507fef087d52ba6a659205bcd))
* fixed env file name and removed integration tests from pipeline run ([853f26a](https://github.com/mojaloop/ml-reference-connectors/commit/853f26ae7a4e73e93290ea7aa87395ed4b7cba15))
* fixed eslint errors ([fddad62](https://github.com/mojaloop/ml-reference-connectors/commit/fddad62df7bcf15749833bdcdf1ce622ba7974b6))
* fixed failing callback test ([fd8844c](https://github.com/mojaloop/ml-reference-connectors/commit/fd8844c7e7f8cb1c41381f076367a007ffc4b632))
* fixed failing ci jobs ([1f1bd2f](https://github.com/mojaloop/ml-reference-connectors/commit/1f1bd2f5d20e5bf93f7cf35f2f83b0fa9a1b1d81))
* fixed failing integration tests ([e338c28](https://github.com/mojaloop/ml-reference-connectors/commit/e338c281112da0784c74372a77838a3d90737395))
* fixed failing tests ([5276cf5](https://github.com/mojaloop/ml-reference-connectors/commit/5276cf5fc64c28083ed9fb7505ae025c2ed5df6e))
* fixed liniting errors and tests in airtel-zm connector ([c2a4dff](https://github.com/mojaloop/ml-reference-connectors/commit/c2a4dff0b96119f89823bdbfe568bb27aaf02757))
* fixed linting errors ([163dbee](https://github.com/mojaloop/ml-reference-connectors/commit/163dbeedb9d2cd741744931ac474d414338f8567))
* fixed linting errors and fixed failing tests in ci ([0839177](https://github.com/mojaloop/ml-reference-connectors/commit/08391772959d050ec631284e3a004f3a538a54f3))
* fixed middleName return in getParties call ([a1b7bd0](https://github.com/mojaloop/ml-reference-connectors/commit/a1b7bd0683197ab3fbb0bca2f3b5ee42d37f650e))
* fixed parameter name in api spce ([f785f2c](https://github.com/mojaloop/ml-reference-connectors/commit/f785f2cda3832cc11db4c1ba1275bc0b7ef179ad))
* fixed parameter names on get parties ([3b9abcb](https://github.com/mojaloop/ml-reference-connectors/commit/3b9abcb008ed7bab84d406b3cdac6857b9303511))
* fixed quote validation functions ([c04f729](https://github.com/mojaloop/ml-reference-connectors/commit/c04f72932298b1b7ed85763f527053ad361ea3de))
* fixing linting errors and environmental variables ([b27ee08](https://github.com/mojaloop/ml-reference-connectors/commit/b27ee089a1ab707292dbdf6d35a9ad065db9102c))
* implemented changes to fix failing tests ([a05a85b](https://github.com/mojaloop/ml-reference-connectors/commit/a05a85bd3ab08ec0d1180eb3cb5cd9be8b071428))
* put default values if return value from mojaloop connector is undefined ([803c705](https://github.com/mojaloop/ml-reference-connectors/commit/803c7052ac6ed446aecdcbacf62d44b3c055afcc))
* refactored code and uncommented updateSentTransfer in agg ([0b33a83](https://github.com/mojaloop/ml-reference-connectors/commit/0b33a83d9dc1e6d0cfe50e576c9cfe671e5a777a))
* refactored interface and git hooks scripts ([40e67ac](https://github.com/mojaloop/ml-reference-connectors/commit/40e67ac0dd6918f631bd1ebf0a22ae9b8acd2df7))
* removed unused vars to fix linting errrors ([e2d5e6f](https://github.com/mojaloop/ml-reference-connectors/commit/e2d5e6fc944ea962ac9c67c51697a3e90eb074f5))
* synchronize lock file ([1d0f557](https://github.com/mojaloop/ml-reference-connectors/commit/1d0f5574f91945929a1809b01011e5c264eea638))

## 1.12.0 (2024-11-12)


### Features

* added boilerplate code for outgoing payments ([0902506](https://github.com/mojaloop/ml-reference-connectors/commit/0902506d5f4aed99c39bc9d03aa3de5b20216b38))
* added callback endpoint and request handler function ([8e1f100](https://github.com/mojaloop/ml-reference-connectors/commit/8e1f100c03233de75fc6de22b0e081fbb2fe0a88))
* added collectMoney function and refactored aggregate ([9132392](https://github.com/mojaloop/ml-reference-connectors/commit/91323925847239cf75ffdc6606cc68266a742352))
* added property attribute to data object in getCustomer method in CBSclient ([2b410c4](https://github.com/mojaloop/ml-reference-connectors/commit/2b410c4e9e6c882e34b12950679da952afa919b3))
* added refund function to tnm client ([c1b6183](https://github.com/mojaloop/ml-reference-connectors/commit/c1b6183b05d71e095a97316fc417da5701306f46))
* added route handler for PATCH notification ([349ffb7](https://github.com/mojaloop/ml-reference-connectors/commit/349ffb7ea4c488ae0bdf00cef424ea8d06de42e1))
* implement callback functionality ([db356f5](https://github.com/mojaloop/ml-reference-connectors/commit/db356f59f0523dac1272e0e99e526d76646621a3))
* implemented functions for incoming transactions ([96c3644](https://github.com/mojaloop/ml-reference-connectors/commit/96c364477372bd937559ea7880714b0e45bbb6f5))
* implemented get transaction enquirey ([a043d6f](https://github.com/mojaloop/ml-reference-connectors/commit/a043d6f1d88c5871da7338e030063f2e59a88cb6))
* implemented outgoing payments functionality ([2e64944](https://github.com/mojaloop/ml-reference-connectors/commit/2e649443416e27ccc44f4958c588a34c44cfea19))
* implemented recieve transfers ([4c0c2aa](https://github.com/mojaloop/ml-reference-connectors/commit/4c0c2aac058972bd12cf00802e9fb2a1bab9bcbd))
* read ISO returned name and configure http timeout ([05fb823](https://github.com/mojaloop/ml-reference-connectors/commit/05fb823e671c18afcbdd9c88b55575b901e692b4))
* updated api documentation ([82a0435](https://github.com/mojaloop/ml-reference-connectors/commit/82a0435188179bf5d2337cf26a7fa4aafaab53b6))
* updated readme doc in root folder ([0589704](https://github.com/mojaloop/ml-reference-connectors/commit/058970451cd935e670ec6370df74f3e14c98eec1))


### Bug Fixes

* added await on refund handler ([7ba561f](https://github.com/mojaloop/ml-reference-connectors/commit/7ba561f7278258e7f63fc431d713efbcee55e418))
* added await on refund handler ([7a496af](https://github.com/mojaloop/ml-reference-connectors/commit/7a496af77335c8415c7d60fc6a1cc52a1828a607))
* added changes from update-payer send money ([a5cc399](https://github.com/mojaloop/ml-reference-connectors/commit/a5cc3991164d491edb9c5d1f6f3c4243c175b594))
* fix linting errors ([c845b56](https://github.com/mojaloop/ml-reference-connectors/commit/c845b56068d949c507fef087d52ba6a659205bcd))
* fixed env file name and removed integration tests from pipeline run ([853f26a](https://github.com/mojaloop/ml-reference-connectors/commit/853f26ae7a4e73e93290ea7aa87395ed4b7cba15))
* fixed eslint errors ([fddad62](https://github.com/mojaloop/ml-reference-connectors/commit/fddad62df7bcf15749833bdcdf1ce622ba7974b6))
* fixed failing ci jobs ([1f1bd2f](https://github.com/mojaloop/ml-reference-connectors/commit/1f1bd2f5d20e5bf93f7cf35f2f83b0fa9a1b1d81))
* fixed failing tests ([5276cf5](https://github.com/mojaloop/ml-reference-connectors/commit/5276cf5fc64c28083ed9fb7505ae025c2ed5df6e))
* implemented changes to fix failing tests ([a05a85b](https://github.com/mojaloop/ml-reference-connectors/commit/a05a85bd3ab08ec0d1180eb3cb5cd9be8b071428))
* put default values if return value from mojaloop connector is undefined ([803c705](https://github.com/mojaloop/ml-reference-connectors/commit/803c7052ac6ed446aecdcbacf62d44b3c055afcc))
* refactored interface and git hooks scripts ([40e67ac](https://github.com/mojaloop/ml-reference-connectors/commit/40e67ac0dd6918f631bd1ebf0a22ae9b8acd2df7))
* removed unused vars to fix linting errrors ([e2d5e6f](https://github.com/mojaloop/ml-reference-connectors/commit/e2d5e6fc944ea962ac9c67c51697a3e90eb074f5))

## 1.11.0 (2024-10-28)


### Features

* added boilerplate code for outgoing payments ([0902506](https://github.com/mojaloop/ml-reference-connectors/commit/0902506d5f4aed99c39bc9d03aa3de5b20216b38))
* added callback endpoint and request handler function ([8e1f100](https://github.com/mojaloop/ml-reference-connectors/commit/8e1f100c03233de75fc6de22b0e081fbb2fe0a88))
* added collectMoney function and refactored aggregate ([9132392](https://github.com/mojaloop/ml-reference-connectors/commit/91323925847239cf75ffdc6606cc68266a742352))
* added property attribute to data object in getCustomer method in CBSclient ([2b410c4](https://github.com/mojaloop/ml-reference-connectors/commit/2b410c4e9e6c882e34b12950679da952afa919b3))
* added refund function to tnm client ([c1b6183](https://github.com/mojaloop/ml-reference-connectors/commit/c1b6183b05d71e095a97316fc417da5701306f46))
* added route handler for PATCH notification ([349ffb7](https://github.com/mojaloop/ml-reference-connectors/commit/349ffb7ea4c488ae0bdf00cef424ea8d06de42e1))
* implement callback functionality ([db356f5](https://github.com/mojaloop/ml-reference-connectors/commit/db356f59f0523dac1272e0e99e526d76646621a3))
* implemented functions for incoming transactions ([96c3644](https://github.com/mojaloop/ml-reference-connectors/commit/96c364477372bd937559ea7880714b0e45bbb6f5))
* implemented get transaction enquirey ([a043d6f](https://github.com/mojaloop/ml-reference-connectors/commit/a043d6f1d88c5871da7338e030063f2e59a88cb6))
* implemented outgoing payments functionality ([2e64944](https://github.com/mojaloop/ml-reference-connectors/commit/2e649443416e27ccc44f4958c588a34c44cfea19))
* implemented recieve transfers ([4c0c2aa](https://github.com/mojaloop/ml-reference-connectors/commit/4c0c2aac058972bd12cf00802e9fb2a1bab9bcbd))
* updated api documentation ([82a0435](https://github.com/mojaloop/ml-reference-connectors/commit/82a0435188179bf5d2337cf26a7fa4aafaab53b6))
* updated readme doc in root folder ([0589704](https://github.com/mojaloop/ml-reference-connectors/commit/058970451cd935e670ec6370df74f3e14c98eec1))


### Bug Fixes

* added await on refund handler ([7ba561f](https://github.com/mojaloop/ml-reference-connectors/commit/7ba561f7278258e7f63fc431d713efbcee55e418))
* added await on refund handler ([7a496af](https://github.com/mojaloop/ml-reference-connectors/commit/7a496af77335c8415c7d60fc6a1cc52a1828a607))
* added changes from update-payer send money ([a5cc399](https://github.com/mojaloop/ml-reference-connectors/commit/a5cc3991164d491edb9c5d1f6f3c4243c175b594))
* fix linting errors ([c845b56](https://github.com/mojaloop/ml-reference-connectors/commit/c845b56068d949c507fef087d52ba6a659205bcd))
* fixed env file name and removed integration tests from pipeline run ([853f26a](https://github.com/mojaloop/ml-reference-connectors/commit/853f26ae7a4e73e93290ea7aa87395ed4b7cba15))
* fixed eslint errors ([fddad62](https://github.com/mojaloop/ml-reference-connectors/commit/fddad62df7bcf15749833bdcdf1ce622ba7974b6))
* fixed failing ci jobs ([1f1bd2f](https://github.com/mojaloop/ml-reference-connectors/commit/1f1bd2f5d20e5bf93f7cf35f2f83b0fa9a1b1d81))
* fixed failing tests ([5276cf5](https://github.com/mojaloop/ml-reference-connectors/commit/5276cf5fc64c28083ed9fb7505ae025c2ed5df6e))
* implemented changes to fix failing tests ([a05a85b](https://github.com/mojaloop/ml-reference-connectors/commit/a05a85bd3ab08ec0d1180eb3cb5cd9be8b071428))
* put default values if return value from mojaloop connector is undefined ([803c705](https://github.com/mojaloop/ml-reference-connectors/commit/803c7052ac6ed446aecdcbacf62d44b3c055afcc))
* refactored interface and git hooks scripts ([40e67ac](https://github.com/mojaloop/ml-reference-connectors/commit/40e67ac0dd6918f631bd1ebf0a22ae9b8acd2df7))
* removed unused vars to fix linting errrors ([e2d5e6f](https://github.com/mojaloop/ml-reference-connectors/commit/e2d5e6fc944ea962ac9c67c51697a3e90eb074f5))

## 1.10.0 (2024-10-16)


### Features

* added boilerplate code for outgoing payments ([0902506](https://github.com/mojaloop/ml-reference-connectors/commit/0902506d5f4aed99c39bc9d03aa3de5b20216b38))
* added callback endpoint and request handler function ([8e1f100](https://github.com/mojaloop/ml-reference-connectors/commit/8e1f100c03233de75fc6de22b0e081fbb2fe0a88))
* added collectMoney function and refactored aggregate ([9132392](https://github.com/mojaloop/ml-reference-connectors/commit/91323925847239cf75ffdc6606cc68266a742352))
* added property attribute to data object in getCustomer method in CBSclient ([2b410c4](https://github.com/mojaloop/ml-reference-connectors/commit/2b410c4e9e6c882e34b12950679da952afa919b3))
* added refund function to tnm client ([c1b6183](https://github.com/mojaloop/ml-reference-connectors/commit/c1b6183b05d71e095a97316fc417da5701306f46))
* added route handler for PATCH notification ([349ffb7](https://github.com/mojaloop/ml-reference-connectors/commit/349ffb7ea4c488ae0bdf00cef424ea8d06de42e1))
* implement callback functionality ([db356f5](https://github.com/mojaloop/ml-reference-connectors/commit/db356f59f0523dac1272e0e99e526d76646621a3))
* implemented functions for incoming transactions ([96c3644](https://github.com/mojaloop/ml-reference-connectors/commit/96c364477372bd937559ea7880714b0e45bbb6f5))
* implemented get transaction enquirey ([a043d6f](https://github.com/mojaloop/ml-reference-connectors/commit/a043d6f1d88c5871da7338e030063f2e59a88cb6))
* implemented outgoing payments functionality ([2e64944](https://github.com/mojaloop/ml-reference-connectors/commit/2e649443416e27ccc44f4958c588a34c44cfea19))
* implemented recieve transfers ([4c0c2aa](https://github.com/mojaloop/ml-reference-connectors/commit/4c0c2aac058972bd12cf00802e9fb2a1bab9bcbd))
* updated api documentation ([82a0435](https://github.com/mojaloop/ml-reference-connectors/commit/82a0435188179bf5d2337cf26a7fa4aafaab53b6))
* updated readme doc in root folder ([0589704](https://github.com/mojaloop/ml-reference-connectors/commit/058970451cd935e670ec6370df74f3e14c98eec1))


### Bug Fixes

* added await on refund handler ([7ba561f](https://github.com/mojaloop/ml-reference-connectors/commit/7ba561f7278258e7f63fc431d713efbcee55e418))
* added await on refund handler ([7a496af](https://github.com/mojaloop/ml-reference-connectors/commit/7a496af77335c8415c7d60fc6a1cc52a1828a607))
* added changes from update-payer send money ([a5cc399](https://github.com/mojaloop/ml-reference-connectors/commit/a5cc3991164d491edb9c5d1f6f3c4243c175b594))
* fix linting errors ([c845b56](https://github.com/mojaloop/ml-reference-connectors/commit/c845b56068d949c507fef087d52ba6a659205bcd))
* fixed env file name and removed integration tests from pipeline run ([853f26a](https://github.com/mojaloop/ml-reference-connectors/commit/853f26ae7a4e73e93290ea7aa87395ed4b7cba15))
* fixed eslint errors ([fddad62](https://github.com/mojaloop/ml-reference-connectors/commit/fddad62df7bcf15749833bdcdf1ce622ba7974b6))
* fixed failing ci jobs ([1f1bd2f](https://github.com/mojaloop/ml-reference-connectors/commit/1f1bd2f5d20e5bf93f7cf35f2f83b0fa9a1b1d81))
* fixed failing tests ([5276cf5](https://github.com/mojaloop/ml-reference-connectors/commit/5276cf5fc64c28083ed9fb7505ae025c2ed5df6e))
* implemented changes to fix failing tests ([a05a85b](https://github.com/mojaloop/ml-reference-connectors/commit/a05a85bd3ab08ec0d1180eb3cb5cd9be8b071428))
* put default values if return value from mojaloop connector is undefined ([803c705](https://github.com/mojaloop/ml-reference-connectors/commit/803c7052ac6ed446aecdcbacf62d44b3c055afcc))
* refactored interface and git hooks scripts ([40e67ac](https://github.com/mojaloop/ml-reference-connectors/commit/40e67ac0dd6918f631bd1ebf0a22ae9b8acd2df7))
* removed unused vars to fix linting errrors ([e2d5e6f](https://github.com/mojaloop/ml-reference-connectors/commit/e2d5e6fc944ea962ac9c67c51697a3e90eb074f5))

## 1.9.0 (2024-10-15)


### Features

* added boilerplate code for outgoing payments ([0902506](https://github.com/mojaloop/ml-reference-connectors/commit/0902506d5f4aed99c39bc9d03aa3de5b20216b38))
* added callback endpoint and request handler function ([8e1f100](https://github.com/mojaloop/ml-reference-connectors/commit/8e1f100c03233de75fc6de22b0e081fbb2fe0a88))
* added collectMoney function and refactored aggregate ([9132392](https://github.com/mojaloop/ml-reference-connectors/commit/91323925847239cf75ffdc6606cc68266a742352))
* added property attribute to data object in getCustomer method in CBSclient ([2b410c4](https://github.com/mojaloop/ml-reference-connectors/commit/2b410c4e9e6c882e34b12950679da952afa919b3))
* added refund function to tnm client ([c1b6183](https://github.com/mojaloop/ml-reference-connectors/commit/c1b6183b05d71e095a97316fc417da5701306f46))
* added route handler for PATCH notification ([349ffb7](https://github.com/mojaloop/ml-reference-connectors/commit/349ffb7ea4c488ae0bdf00cef424ea8d06de42e1))
* implement callback functionality ([db356f5](https://github.com/mojaloop/ml-reference-connectors/commit/db356f59f0523dac1272e0e99e526d76646621a3))
* implemented functions for incoming transactions ([96c3644](https://github.com/mojaloop/ml-reference-connectors/commit/96c364477372bd937559ea7880714b0e45bbb6f5))
* implemented get transaction enquirey ([a043d6f](https://github.com/mojaloop/ml-reference-connectors/commit/a043d6f1d88c5871da7338e030063f2e59a88cb6))
* implemented outgoing payments functionality ([2e64944](https://github.com/mojaloop/ml-reference-connectors/commit/2e649443416e27ccc44f4958c588a34c44cfea19))
* implemented recieve transfers ([4c0c2aa](https://github.com/mojaloop/ml-reference-connectors/commit/4c0c2aac058972bd12cf00802e9fb2a1bab9bcbd))
* updated api documentation ([82a0435](https://github.com/mojaloop/ml-reference-connectors/commit/82a0435188179bf5d2337cf26a7fa4aafaab53b6))
* updated readme doc in root folder ([0589704](https://github.com/mojaloop/ml-reference-connectors/commit/058970451cd935e670ec6370df74f3e14c98eec1))


### Bug Fixes

* added await on refund handler ([7ba561f](https://github.com/mojaloop/ml-reference-connectors/commit/7ba561f7278258e7f63fc431d713efbcee55e418))
* added await on refund handler ([7a496af](https://github.com/mojaloop/ml-reference-connectors/commit/7a496af77335c8415c7d60fc6a1cc52a1828a607))
* added changes from update-payer send money ([a5cc399](https://github.com/mojaloop/ml-reference-connectors/commit/a5cc3991164d491edb9c5d1f6f3c4243c175b594))
* fix linting errors ([c845b56](https://github.com/mojaloop/ml-reference-connectors/commit/c845b56068d949c507fef087d52ba6a659205bcd))
* fixed eslint errors ([fddad62](https://github.com/mojaloop/ml-reference-connectors/commit/fddad62df7bcf15749833bdcdf1ce622ba7974b6))
* fixed failing tests ([5276cf5](https://github.com/mojaloop/ml-reference-connectors/commit/5276cf5fc64c28083ed9fb7505ae025c2ed5df6e))
* put default values if return value from mojaloop connector is undefined ([803c705](https://github.com/mojaloop/ml-reference-connectors/commit/803c7052ac6ed446aecdcbacf62d44b3c055afcc))
* refactored interface and git hooks scripts ([40e67ac](https://github.com/mojaloop/ml-reference-connectors/commit/40e67ac0dd6918f631bd1ebf0a22ae9b8acd2df7))
* removed unused vars to fix linting errrors ([e2d5e6f](https://github.com/mojaloop/ml-reference-connectors/commit/e2d5e6fc944ea962ac9c67c51697a3e90eb074f5))

## 1.8.0 (2024-10-11)


### Features

* added boilerplate code for outgoing payments ([0902506](https://github.com/mojaloop/ml-reference-connectors/commit/0902506d5f4aed99c39bc9d03aa3de5b20216b38))
* added callback endpoint and request handler function ([8e1f100](https://github.com/mojaloop/ml-reference-connectors/commit/8e1f100c03233de75fc6de22b0e081fbb2fe0a88))
* added collectMoney function and refactored aggregate ([9132392](https://github.com/mojaloop/ml-reference-connectors/commit/91323925847239cf75ffdc6606cc68266a742352))
* added property attribute to data object in getCustomer method in CBSclient ([2b410c4](https://github.com/mojaloop/ml-reference-connectors/commit/2b410c4e9e6c882e34b12950679da952afa919b3))
* added refund function to tnm client ([c1b6183](https://github.com/mojaloop/ml-reference-connectors/commit/c1b6183b05d71e095a97316fc417da5701306f46))
* added route handler for PATCH notification ([349ffb7](https://github.com/mojaloop/ml-reference-connectors/commit/349ffb7ea4c488ae0bdf00cef424ea8d06de42e1))
* implement callback functionality ([db356f5](https://github.com/mojaloop/ml-reference-connectors/commit/db356f59f0523dac1272e0e99e526d76646621a3))
* implemented functions for incoming transactions ([96c3644](https://github.com/mojaloop/ml-reference-connectors/commit/96c364477372bd937559ea7880714b0e45bbb6f5))
* implemented get transaction enquirey ([a043d6f](https://github.com/mojaloop/ml-reference-connectors/commit/a043d6f1d88c5871da7338e030063f2e59a88cb6))
* implemented outgoing payments functionality ([2e64944](https://github.com/mojaloop/ml-reference-connectors/commit/2e649443416e27ccc44f4958c588a34c44cfea19))
* implemented recieve transfers ([4c0c2aa](https://github.com/mojaloop/ml-reference-connectors/commit/4c0c2aac058972bd12cf00802e9fb2a1bab9bcbd))
* updated api documentation ([82a0435](https://github.com/mojaloop/ml-reference-connectors/commit/82a0435188179bf5d2337cf26a7fa4aafaab53b6))
* updated readme doc in root folder ([0589704](https://github.com/mojaloop/ml-reference-connectors/commit/058970451cd935e670ec6370df74f3e14c98eec1))


### Bug Fixes

* added await on refund handler ([7ba561f](https://github.com/mojaloop/ml-reference-connectors/commit/7ba561f7278258e7f63fc431d713efbcee55e418))
* added await on refund handler ([7a496af](https://github.com/mojaloop/ml-reference-connectors/commit/7a496af77335c8415c7d60fc6a1cc52a1828a607))
* added changes from update-payer send money ([a5cc399](https://github.com/mojaloop/ml-reference-connectors/commit/a5cc3991164d491edb9c5d1f6f3c4243c175b594))
* fix linting errors ([c845b56](https://github.com/mojaloop/ml-reference-connectors/commit/c845b56068d949c507fef087d52ba6a659205bcd))
* fixed eslint errors ([fddad62](https://github.com/mojaloop/ml-reference-connectors/commit/fddad62df7bcf15749833bdcdf1ce622ba7974b6))
* fixed failing tests ([5276cf5](https://github.com/mojaloop/ml-reference-connectors/commit/5276cf5fc64c28083ed9fb7505ae025c2ed5df6e))
* put default values if return value from mojaloop connector is undefined ([803c705](https://github.com/mojaloop/ml-reference-connectors/commit/803c7052ac6ed446aecdcbacf62d44b3c055afcc))
* refactored interface and git hooks scripts ([40e67ac](https://github.com/mojaloop/ml-reference-connectors/commit/40e67ac0dd6918f631bd1ebf0a22ae9b8acd2df7))
* removed unused vars to fix linting errrors ([e2d5e6f](https://github.com/mojaloop/ml-reference-connectors/commit/e2d5e6fc944ea962ac9c67c51697a3e90eb074f5))

## 1.7.0 (2024-10-02)


### Features

* added boilerplate code for outgoing payments ([0902506](https://github.com/mojaloop/ml-reference-connectors/commit/0902506d5f4aed99c39bc9d03aa3de5b20216b38))
* added callback endpoint and request handler function ([8e1f100](https://github.com/mojaloop/ml-reference-connectors/commit/8e1f100c03233de75fc6de22b0e081fbb2fe0a88))
* added collectMoney function and refactored aggregate ([9132392](https://github.com/mojaloop/ml-reference-connectors/commit/91323925847239cf75ffdc6606cc68266a742352))
* added property attribute to data object in getCustomer method in CBSclient ([2b410c4](https://github.com/mojaloop/ml-reference-connectors/commit/2b410c4e9e6c882e34b12950679da952afa919b3))
* added refund function to tnm client ([c1b6183](https://github.com/mojaloop/ml-reference-connectors/commit/c1b6183b05d71e095a97316fc417da5701306f46))
* added route handler for PATCH notification ([349ffb7](https://github.com/mojaloop/ml-reference-connectors/commit/349ffb7ea4c488ae0bdf00cef424ea8d06de42e1))
* implement callback functionality ([db356f5](https://github.com/mojaloop/ml-reference-connectors/commit/db356f59f0523dac1272e0e99e526d76646621a3))
* implemented functions for incoming transactions ([96c3644](https://github.com/mojaloop/ml-reference-connectors/commit/96c364477372bd937559ea7880714b0e45bbb6f5))
* implemented get transaction enquirey ([a043d6f](https://github.com/mojaloop/ml-reference-connectors/commit/a043d6f1d88c5871da7338e030063f2e59a88cb6))
* implemented outgoing payments functionality ([2e64944](https://github.com/mojaloop/ml-reference-connectors/commit/2e649443416e27ccc44f4958c588a34c44cfea19))
* implemented recieve transfers ([4c0c2aa](https://github.com/mojaloop/ml-reference-connectors/commit/4c0c2aac058972bd12cf00802e9fb2a1bab9bcbd))
* updated api documentation ([82a0435](https://github.com/mojaloop/ml-reference-connectors/commit/82a0435188179bf5d2337cf26a7fa4aafaab53b6))
* updated readme doc in root folder ([0589704](https://github.com/mojaloop/ml-reference-connectors/commit/058970451cd935e670ec6370df74f3e14c98eec1))


### Bug Fixes

* added await on refund handler ([7ba561f](https://github.com/mojaloop/ml-reference-connectors/commit/7ba561f7278258e7f63fc431d713efbcee55e418))
* added await on refund handler ([7a496af](https://github.com/mojaloop/ml-reference-connectors/commit/7a496af77335c8415c7d60fc6a1cc52a1828a607))
* added changes from update-payer send money ([a5cc399](https://github.com/mojaloop/ml-reference-connectors/commit/a5cc3991164d491edb9c5d1f6f3c4243c175b594))
* fix linting errors ([c845b56](https://github.com/mojaloop/ml-reference-connectors/commit/c845b56068d949c507fef087d52ba6a659205bcd))
* fixed eslint errors ([fddad62](https://github.com/mojaloop/ml-reference-connectors/commit/fddad62df7bcf15749833bdcdf1ce622ba7974b6))
* fixed failing tests ([5276cf5](https://github.com/mojaloop/ml-reference-connectors/commit/5276cf5fc64c28083ed9fb7505ae025c2ed5df6e))
* put default values if return value from mojaloop connector is undefined ([803c705](https://github.com/mojaloop/ml-reference-connectors/commit/803c7052ac6ed446aecdcbacf62d44b3c055afcc))
* refactored interface and git hooks scripts ([40e67ac](https://github.com/mojaloop/ml-reference-connectors/commit/40e67ac0dd6918f631bd1ebf0a22ae9b8acd2df7))
* removed unused vars to fix linting errrors ([e2d5e6f](https://github.com/mojaloop/ml-reference-connectors/commit/e2d5e6fc944ea962ac9c67c51697a3e90eb074f5))

## 1.6.0 (2024-09-23)


### Features

* added boilerplate code for outgoing payments ([0902506](https://github.com/mojaloop/ml-reference-connectors/commit/0902506d5f4aed99c39bc9d03aa3de5b20216b38))
* added callback endpoint and request handler function ([8e1f100](https://github.com/mojaloop/ml-reference-connectors/commit/8e1f100c03233de75fc6de22b0e081fbb2fe0a88))
* added collectMoney function and refactored aggregate ([9132392](https://github.com/mojaloop/ml-reference-connectors/commit/91323925847239cf75ffdc6606cc68266a742352))
* added property attribute to data object in getCustomer method in CBSclient ([2b410c4](https://github.com/mojaloop/ml-reference-connectors/commit/2b410c4e9e6c882e34b12950679da952afa919b3))
* added refund function to tnm client ([c1b6183](https://github.com/mojaloop/ml-reference-connectors/commit/c1b6183b05d71e095a97316fc417da5701306f46))
* implement callback functionality ([db356f5](https://github.com/mojaloop/ml-reference-connectors/commit/db356f59f0523dac1272e0e99e526d76646621a3))
* implemented get transaction enquirey ([a043d6f](https://github.com/mojaloop/ml-reference-connectors/commit/a043d6f1d88c5871da7338e030063f2e59a88cb6))
* implemented outgoing payments functionality ([2e64944](https://github.com/mojaloop/ml-reference-connectors/commit/2e649443416e27ccc44f4958c588a34c44cfea19))
* implemented recieve transfers ([4c0c2aa](https://github.com/mojaloop/ml-reference-connectors/commit/4c0c2aac058972bd12cf00802e9fb2a1bab9bcbd))
* updated api documentation ([82a0435](https://github.com/mojaloop/ml-reference-connectors/commit/82a0435188179bf5d2337cf26a7fa4aafaab53b6))
* updated readme doc in root folder ([0589704](https://github.com/mojaloop/ml-reference-connectors/commit/058970451cd935e670ec6370df74f3e14c98eec1))


### Bug Fixes

* added changes from update-payer send money ([a5cc399](https://github.com/mojaloop/ml-reference-connectors/commit/a5cc3991164d491edb9c5d1f6f3c4243c175b594))
* fix linting errors ([c845b56](https://github.com/mojaloop/ml-reference-connectors/commit/c845b56068d949c507fef087d52ba6a659205bcd))
* fixed eslint errors ([fddad62](https://github.com/mojaloop/ml-reference-connectors/commit/fddad62df7bcf15749833bdcdf1ce622ba7974b6))
* fixed failing tests ([5276cf5](https://github.com/mojaloop/ml-reference-connectors/commit/5276cf5fc64c28083ed9fb7505ae025c2ed5df6e))
* put default values if return value from mojaloop connector is undefined ([803c705](https://github.com/mojaloop/ml-reference-connectors/commit/803c7052ac6ed446aecdcbacf62d44b3c055afcc))
* refactored interface and git hooks scripts ([40e67ac](https://github.com/mojaloop/ml-reference-connectors/commit/40e67ac0dd6918f631bd1ebf0a22ae9b8acd2df7))
* removed unused vars to fix linting errrors ([e2d5e6f](https://github.com/mojaloop/ml-reference-connectors/commit/e2d5e6fc944ea962ac9c67c51697a3e90eb074f5))

## 1.5.0 (2024-09-22)


### Features

* added boilerplate code for outgoing payments ([0902506](https://github.com/mojaloop/ml-reference-connectors/commit/0902506d5f4aed99c39bc9d03aa3de5b20216b38))
* added callback endpoint and request handler function ([8e1f100](https://github.com/mojaloop/ml-reference-connectors/commit/8e1f100c03233de75fc6de22b0e081fbb2fe0a88))
* added collectMoney function and refactored aggregate ([9132392](https://github.com/mojaloop/ml-reference-connectors/commit/91323925847239cf75ffdc6606cc68266a742352))
* added property attribute to data object in getCustomer method in CBSclient ([2b410c4](https://github.com/mojaloop/ml-reference-connectors/commit/2b410c4e9e6c882e34b12950679da952afa919b3))
* added refund function to tnm client ([c1b6183](https://github.com/mojaloop/ml-reference-connectors/commit/c1b6183b05d71e095a97316fc417da5701306f46))
* implement callback functionality ([db356f5](https://github.com/mojaloop/ml-reference-connectors/commit/db356f59f0523dac1272e0e99e526d76646621a3))
* implemented get transaction enquirey ([a043d6f](https://github.com/mojaloop/ml-reference-connectors/commit/a043d6f1d88c5871da7338e030063f2e59a88cb6))
* implemented outgoing payments functionality ([2e64944](https://github.com/mojaloop/ml-reference-connectors/commit/2e649443416e27ccc44f4958c588a34c44cfea19))
* implemented recieve transfers ([4c0c2aa](https://github.com/mojaloop/ml-reference-connectors/commit/4c0c2aac058972bd12cf00802e9fb2a1bab9bcbd))
* updated api documentation ([82a0435](https://github.com/mojaloop/ml-reference-connectors/commit/82a0435188179bf5d2337cf26a7fa4aafaab53b6))
* updated readme doc in root folder ([0589704](https://github.com/mojaloop/ml-reference-connectors/commit/058970451cd935e670ec6370df74f3e14c98eec1))


### Bug Fixes

* added changes from update-payer send money ([a5cc399](https://github.com/mojaloop/ml-reference-connectors/commit/a5cc3991164d491edb9c5d1f6f3c4243c175b594))
* fix linting errors ([c845b56](https://github.com/mojaloop/ml-reference-connectors/commit/c845b56068d949c507fef087d52ba6a659205bcd))
* fixed eslint errors ([fddad62](https://github.com/mojaloop/ml-reference-connectors/commit/fddad62df7bcf15749833bdcdf1ce622ba7974b6))
* fixed failing tests ([5276cf5](https://github.com/mojaloop/ml-reference-connectors/commit/5276cf5fc64c28083ed9fb7505ae025c2ed5df6e))
* put default values if return value from mojaloop connector is undefined ([803c705](https://github.com/mojaloop/ml-reference-connectors/commit/803c7052ac6ed446aecdcbacf62d44b3c055afcc))
* refactored interface and git hooks scripts ([40e67ac](https://github.com/mojaloop/ml-reference-connectors/commit/40e67ac0dd6918f631bd1ebf0a22ae9b8acd2df7))

## 1.4.0 (2024-09-22)


### Features

* added boilerplate code for outgoing payments ([0902506](https://github.com/mojaloop/ml-reference-connectors/commit/0902506d5f4aed99c39bc9d03aa3de5b20216b38))
* added callback endpoint and request handler function ([8e1f100](https://github.com/mojaloop/ml-reference-connectors/commit/8e1f100c03233de75fc6de22b0e081fbb2fe0a88))
* added collectMoney function and refactored aggregate ([9132392](https://github.com/mojaloop/ml-reference-connectors/commit/91323925847239cf75ffdc6606cc68266a742352))
* added property attribute to data object in getCustomer method in CBSclient ([2b410c4](https://github.com/mojaloop/ml-reference-connectors/commit/2b410c4e9e6c882e34b12950679da952afa919b3))
* added refund function to tnm client ([c1b6183](https://github.com/mojaloop/ml-reference-connectors/commit/c1b6183b05d71e095a97316fc417da5701306f46))
* implement callback functionality ([db356f5](https://github.com/mojaloop/ml-reference-connectors/commit/db356f59f0523dac1272e0e99e526d76646621a3))
* implemented get transaction enquirey ([a043d6f](https://github.com/mojaloop/ml-reference-connectors/commit/a043d6f1d88c5871da7338e030063f2e59a88cb6))
* implemented outgoing payments functionality ([2e64944](https://github.com/mojaloop/ml-reference-connectors/commit/2e649443416e27ccc44f4958c588a34c44cfea19))
* implemented recieve transfers ([4c0c2aa](https://github.com/mojaloop/ml-reference-connectors/commit/4c0c2aac058972bd12cf00802e9fb2a1bab9bcbd))
* updated api documentation ([82a0435](https://github.com/mojaloop/ml-reference-connectors/commit/82a0435188179bf5d2337cf26a7fa4aafaab53b6))
* updated readme doc in root folder ([0589704](https://github.com/mojaloop/ml-reference-connectors/commit/058970451cd935e670ec6370df74f3e14c98eec1))


### Bug Fixes

* added changes from update-payer send money ([a5cc399](https://github.com/mojaloop/ml-reference-connectors/commit/a5cc3991164d491edb9c5d1f6f3c4243c175b594))
* fix linting errors ([c845b56](https://github.com/mojaloop/ml-reference-connectors/commit/c845b56068d949c507fef087d52ba6a659205bcd))
* fixed eslint errors ([fddad62](https://github.com/mojaloop/ml-reference-connectors/commit/fddad62df7bcf15749833bdcdf1ce622ba7974b6))
* fixed failing tests ([5276cf5](https://github.com/mojaloop/ml-reference-connectors/commit/5276cf5fc64c28083ed9fb7505ae025c2ed5df6e))
* put default values if return value from mojaloop connector is undefined ([803c705](https://github.com/mojaloop/ml-reference-connectors/commit/803c7052ac6ed446aecdcbacf62d44b3c055afcc))
* refactored interface and git hooks scripts ([40e67ac](https://github.com/mojaloop/ml-reference-connectors/commit/40e67ac0dd6918f631bd1ebf0a22ae9b8acd2df7))

## 1.3.0 (2024-09-22)


### Features

* added boilerplate code for outgoing payments ([0902506](https://github.com/mojaloop/ml-reference-connectors/commit/0902506d5f4aed99c39bc9d03aa3de5b20216b38))
* added callback endpoint and request handler function ([8e1f100](https://github.com/mojaloop/ml-reference-connectors/commit/8e1f100c03233de75fc6de22b0e081fbb2fe0a88))
* added collectMoney function and refactored aggregate ([9132392](https://github.com/mojaloop/ml-reference-connectors/commit/91323925847239cf75ffdc6606cc68266a742352))
* added property attribute to data object in getCustomer method in CBSclient ([2b410c4](https://github.com/mojaloop/ml-reference-connectors/commit/2b410c4e9e6c882e34b12950679da952afa919b3))
* added refund function to tnm client ([c1b6183](https://github.com/mojaloop/ml-reference-connectors/commit/c1b6183b05d71e095a97316fc417da5701306f46))
* implement callback functionality ([db356f5](https://github.com/mojaloop/ml-reference-connectors/commit/db356f59f0523dac1272e0e99e526d76646621a3))
* implemented get transaction enquirey ([a043d6f](https://github.com/mojaloop/ml-reference-connectors/commit/a043d6f1d88c5871da7338e030063f2e59a88cb6))
* implemented outgoing payments functionality ([2e64944](https://github.com/mojaloop/ml-reference-connectors/commit/2e649443416e27ccc44f4958c588a34c44cfea19))
* implemented recieve transfers ([4c0c2aa](https://github.com/mojaloop/ml-reference-connectors/commit/4c0c2aac058972bd12cf00802e9fb2a1bab9bcbd))
* updated api documentation ([82a0435](https://github.com/mojaloop/ml-reference-connectors/commit/82a0435188179bf5d2337cf26a7fa4aafaab53b6))
* updated readme doc in root folder ([0589704](https://github.com/mojaloop/ml-reference-connectors/commit/058970451cd935e670ec6370df74f3e14c98eec1))


### Bug Fixes

* added changes from update-payer send money ([a5cc399](https://github.com/mojaloop/ml-reference-connectors/commit/a5cc3991164d491edb9c5d1f6f3c4243c175b594))
* fix linting errors ([c845b56](https://github.com/mojaloop/ml-reference-connectors/commit/c845b56068d949c507fef087d52ba6a659205bcd))
* fixed eslint errors ([fddad62](https://github.com/mojaloop/ml-reference-connectors/commit/fddad62df7bcf15749833bdcdf1ce622ba7974b6))
* fixed failing tests ([5276cf5](https://github.com/mojaloop/ml-reference-connectors/commit/5276cf5fc64c28083ed9fb7505ae025c2ed5df6e))
* put default values if return value from mojaloop connector is undefined ([803c705](https://github.com/mojaloop/ml-reference-connectors/commit/803c7052ac6ed446aecdcbacf62d44b3c055afcc))
* refactored interface and git hooks scripts ([40e67ac](https://github.com/mojaloop/ml-reference-connectors/commit/40e67ac0dd6918f631bd1ebf0a22ae9b8acd2df7))

## 1.2.0 (2024-09-22)


### Features

* added boilerplate code for outgoing payments ([0902506](https://github.com/mojaloop/ml-reference-connectors/commit/0902506d5f4aed99c39bc9d03aa3de5b20216b38))
* added callback endpoint and request handler function ([8e1f100](https://github.com/mojaloop/ml-reference-connectors/commit/8e1f100c03233de75fc6de22b0e081fbb2fe0a88))
* added collectMoney function and refactored aggregate ([9132392](https://github.com/mojaloop/ml-reference-connectors/commit/91323925847239cf75ffdc6606cc68266a742352))
* added property attribute to data object in getCustomer method in CBSclient ([2b410c4](https://github.com/mojaloop/ml-reference-connectors/commit/2b410c4e9e6c882e34b12950679da952afa919b3))
* added refund function to tnm client ([c1b6183](https://github.com/mojaloop/ml-reference-connectors/commit/c1b6183b05d71e095a97316fc417da5701306f46))
* implement callback functionality ([db356f5](https://github.com/mojaloop/ml-reference-connectors/commit/db356f59f0523dac1272e0e99e526d76646621a3))
* implemented get transaction enquirey ([a043d6f](https://github.com/mojaloop/ml-reference-connectors/commit/a043d6f1d88c5871da7338e030063f2e59a88cb6))
* implemented outgoing payments functionality ([2e64944](https://github.com/mojaloop/ml-reference-connectors/commit/2e649443416e27ccc44f4958c588a34c44cfea19))
* implemented recieve transfers ([4c0c2aa](https://github.com/mojaloop/ml-reference-connectors/commit/4c0c2aac058972bd12cf00802e9fb2a1bab9bcbd))
* updated api documentation ([82a0435](https://github.com/mojaloop/ml-reference-connectors/commit/82a0435188179bf5d2337cf26a7fa4aafaab53b6))
* updated readme doc in root folder ([0589704](https://github.com/mojaloop/ml-reference-connectors/commit/058970451cd935e670ec6370df74f3e14c98eec1))


### Bug Fixes

* added changes from update-payer send money ([a5cc399](https://github.com/mojaloop/ml-reference-connectors/commit/a5cc3991164d491edb9c5d1f6f3c4243c175b594))
* fix linting errors ([c845b56](https://github.com/mojaloop/ml-reference-connectors/commit/c845b56068d949c507fef087d52ba6a659205bcd))
* fixed eslint errors ([fddad62](https://github.com/mojaloop/ml-reference-connectors/commit/fddad62df7bcf15749833bdcdf1ce622ba7974b6))
* fixed failing tests ([5276cf5](https://github.com/mojaloop/ml-reference-connectors/commit/5276cf5fc64c28083ed9fb7505ae025c2ed5df6e))
* put default values if return value from mojaloop connector is undefined ([803c705](https://github.com/mojaloop/ml-reference-connectors/commit/803c7052ac6ed446aecdcbacf62d44b3c055afcc))
* refactored interface and git hooks scripts ([40e67ac](https://github.com/mojaloop/ml-reference-connectors/commit/40e67ac0dd6918f631bd1ebf0a22ae9b8acd2df7))

## 1.1.0 (2024-09-22)


### Features

* added boilerplate code for outgoing payments ([0902506](https://github.com/mojaloop/ml-reference-connectors/commit/0902506d5f4aed99c39bc9d03aa3de5b20216b38))
* added callback endpoint and request handler function ([8e1f100](https://github.com/mojaloop/ml-reference-connectors/commit/8e1f100c03233de75fc6de22b0e081fbb2fe0a88))
* added collectMoney function and refactored aggregate ([9132392](https://github.com/mojaloop/ml-reference-connectors/commit/91323925847239cf75ffdc6606cc68266a742352))
* added property attribute to data object in getCustomer method in CBSclient ([2b410c4](https://github.com/mojaloop/ml-reference-connectors/commit/2b410c4e9e6c882e34b12950679da952afa919b3))
* added refund function to tnm client ([c1b6183](https://github.com/mojaloop/ml-reference-connectors/commit/c1b6183b05d71e095a97316fc417da5701306f46))
* implement callback functionality ([db356f5](https://github.com/mojaloop/ml-reference-connectors/commit/db356f59f0523dac1272e0e99e526d76646621a3))
* implemented get transaction enquirey ([a043d6f](https://github.com/mojaloop/ml-reference-connectors/commit/a043d6f1d88c5871da7338e030063f2e59a88cb6))
* implemented outgoing payments functionality ([2e64944](https://github.com/mojaloop/ml-reference-connectors/commit/2e649443416e27ccc44f4958c588a34c44cfea19))
* implemented recieve transfers ([4c0c2aa](https://github.com/mojaloop/ml-reference-connectors/commit/4c0c2aac058972bd12cf00802e9fb2a1bab9bcbd))
* updated api documentation ([82a0435](https://github.com/mojaloop/ml-reference-connectors/commit/82a0435188179bf5d2337cf26a7fa4aafaab53b6))
* updated readme doc in root folder ([0589704](https://github.com/mojaloop/ml-reference-connectors/commit/058970451cd935e670ec6370df74f3e14c98eec1))


### Bug Fixes

* added changes from update-payer send money ([a5cc399](https://github.com/mojaloop/ml-reference-connectors/commit/a5cc3991164d491edb9c5d1f6f3c4243c175b594))
* fix linting errors ([c845b56](https://github.com/mojaloop/ml-reference-connectors/commit/c845b56068d949c507fef087d52ba6a659205bcd))
* fixed eslint errors ([fddad62](https://github.com/mojaloop/ml-reference-connectors/commit/fddad62df7bcf15749833bdcdf1ce622ba7974b6))
* fixed failing tests ([5276cf5](https://github.com/mojaloop/ml-reference-connectors/commit/5276cf5fc64c28083ed9fb7505ae025c2ed5df6e))
* put default values if return value from mojaloop connector is undefined ([803c705](https://github.com/mojaloop/ml-reference-connectors/commit/803c7052ac6ed446aecdcbacf62d44b3c055afcc))
* refactored interface and git hooks scripts ([40e67ac](https://github.com/mojaloop/ml-reference-connectors/commit/40e67ac0dd6918f631bd1ebf0a22ae9b8acd2df7))

## [1.2.0](https://github.com/mojaloop/ml-reference-connectors/compare/v1.2.1...v1.2.0) (2024-09-21)


### Features

* added boilerplate code for outgoing payments ([0902506](https://github.com/mojaloop/ml-reference-connectors/commit/0902506d5f4aed99c39bc9d03aa3de5b20216b38))
* added callback endpoint and request handler function ([8e1f100](https://github.com/mojaloop/ml-reference-connectors/commit/8e1f100c03233de75fc6de22b0e081fbb2fe0a88))
* added collectMoney function and refactored aggregate ([9132392](https://github.com/mojaloop/ml-reference-connectors/commit/91323925847239cf75ffdc6606cc68266a742352))
* added refund function to tnm client ([c1b6183](https://github.com/mojaloop/ml-reference-connectors/commit/c1b6183b05d71e095a97316fc417da5701306f46))
* implement callback functionality ([db356f5](https://github.com/mojaloop/ml-reference-connectors/commit/db356f59f0523dac1272e0e99e526d76646621a3))
* implemented outgoing payments functionality ([2e64944](https://github.com/mojaloop/ml-reference-connectors/commit/2e649443416e27ccc44f4958c588a34c44cfea19))
* implemented recieve transfers ([4c0c2aa](https://github.com/mojaloop/ml-reference-connectors/commit/4c0c2aac058972bd12cf00802e9fb2a1bab9bcbd))
* updated api documentation ([82a0435](https://github.com/mojaloop/ml-reference-connectors/commit/82a0435188179bf5d2337cf26a7fa4aafaab53b6))


### Bug Fixes

* fix linting errors ([c845b56](https://github.com/mojaloop/ml-reference-connectors/commit/c845b56068d949c507fef087d52ba6a659205bcd))
* fixed failing tests ([5276cf5](https://github.com/mojaloop/ml-reference-connectors/commit/5276cf5fc64c28083ed9fb7505ae025c2ed5df6e))

## [1.1.0](https://github.com/mojaloop/ml-reference-connectors/compare/v1.2.1...v1.1.0) (2024-09-21)


### Features

* added boilerplate code for outgoing payments ([0902506](https://github.com/mojaloop/ml-reference-connectors/commit/0902506d5f4aed99c39bc9d03aa3de5b20216b38))
* added callback endpoint and request handler function ([8e1f100](https://github.com/mojaloop/ml-reference-connectors/commit/8e1f100c03233de75fc6de22b0e081fbb2fe0a88))
* added collectMoney function and refactored aggregate ([9132392](https://github.com/mojaloop/ml-reference-connectors/commit/91323925847239cf75ffdc6606cc68266a742352))
* added refund function to tnm client ([c1b6183](https://github.com/mojaloop/ml-reference-connectors/commit/c1b6183b05d71e095a97316fc417da5701306f46))
* implement callback functionality ([db356f5](https://github.com/mojaloop/ml-reference-connectors/commit/db356f59f0523dac1272e0e99e526d76646621a3))
* implemented outgoing payments functionality ([2e64944](https://github.com/mojaloop/ml-reference-connectors/commit/2e649443416e27ccc44f4958c588a34c44cfea19))
* implemented recieve transfers ([4c0c2aa](https://github.com/mojaloop/ml-reference-connectors/commit/4c0c2aac058972bd12cf00802e9fb2a1bab9bcbd))
* updated api documentation ([82a0435](https://github.com/mojaloop/ml-reference-connectors/commit/82a0435188179bf5d2337cf26a7fa4aafaab53b6))


### Bug Fixes

* fix linting errors ([c845b56](https://github.com/mojaloop/ml-reference-connectors/commit/c845b56068d949c507fef087d52ba6a659205bcd))
* fixed failing tests ([5276cf5](https://github.com/mojaloop/ml-reference-connectors/commit/5276cf5fc64c28083ed9fb7505ae025c2ed5df6e))
