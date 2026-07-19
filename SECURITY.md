# Security Policy

## Supported Versions

Currently, only the latest release of JanjiCare is actively supported with security updates.

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |
| < 1.0   | :x:                |

## Reporting a Vulnerability

If you discover a security vulnerability within JanjiCare, please send an e-mail to our security team via [security@janjicare.com](mailto:security@janjicare.com). All security vulnerabilities will be promptly addressed.

Please do not publicly disclose the issue until it has been addressed by us. We will work with you to ensure a timely resolution and will acknowledge your contribution.

## OWASP Compliance

JanjiCare development strictly adheres to the OWASP Top 10 (2025) framework. For example, in compliance with **A10:2025 - Mishandling of Exceptional Conditions**, all external network and API integrations are configured to fail silently or generically. Internal exception logic, stack traces, and third-party URLs (such as AI provider endpoints) are strictly logged internally and never exposed to the client.
