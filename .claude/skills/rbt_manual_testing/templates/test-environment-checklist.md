# Test Environment Checklist

> Dùng checklist này để xác minh test environment đã sẵn sàng trước khi bắt đầu test execution.

- Dự án: {{PROJECT}}
- Release: {{RELEASE}}
- Ngày: {{DATE}}
- Owner: {{OWNER}}

## 1. Environment access

|Item|Expected|Status|Ghi chú|
|---|---|---|---|
|Application URL accessible|[URL]|[ ]| |
|API base URL accessible|[URL]|[ ]| |
|Test accounts available|[Roles/accounts]|[ ]| |
|Required permissions granted|[Permissions]|[ ]| |
|VPN/network access ready|[Network/VPN]|[ ]| |

## 2. Build and configuration

|Item|Expected|Status|Ghi chú|
|---|---|---|---|
|Build/version deployed|[Build number]|[ ]| |
|Feature flags configured|[Flags]|[ ]| |
|Environment variables configured|[Config list]|[ ]| |
|Third-party integrations configured|[Services]|[ ]| |

## 3. Test data

|Data set|Purpose|Status|Owner|
|---|---|---|---|
|User accounts|Login/role testing|[ ]| |
|Product/order data|Business flow testing|[ ]| |
|Negative/edge data|Validation testing|[ ]| |
|Cleanup procedure|Reset after testing|[ ]| |

## 4. Tooling

|Tool|Purpose|Status|Ghi chú|
|---|---|---|---|
|Test management tool|Test execution tracking|[ ]| |
|Bug tracker|Defect logging|[ ]| |
|Browser/devices|UI testing|[ ]| |
|API client|API testing|[ ]| |
|Test reporter|Reporting|[ ]| |

## 5. Smoke verification

|Check|Expected result|Actual result|Pass/Fail|
|---|---|---|---|
|Open application home page|Page loads successfully| |[ ]|
|Login with test account|Login succeeds| |[ ]|
|Call health check endpoint|Returns healthy status| |[ ]|
|Create/read sample data|Operation succeeds| |[ ]|

## 6. Sign-off

|Role|Name|Decision|Date|
|---|---|---|---|
|QA Lead|{{OWNER}}|Ready / Not ready|{{DATE}}|
|DevOps|[Name]|Ready / Not ready|[Date]|

## Revision history

|Version|Date|Author|Change|
|:---:|---|---|---|
|0.1|{{DATE}}|{{OWNER}}|Checklist ban đầu|
