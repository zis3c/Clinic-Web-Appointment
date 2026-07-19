# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Initial setup for JanjiCare Web Appointment System.
- Admin, Doctor, and Patient dashboards with tailored metrics.
- Appointment scheduling workflow with conflict validation.
- Notification system for real-time status updates.
- Tailwind CSS styling for a responsive and modern user interface.
- Export to PDF functionality for system reports.
- Advanced Analytics Dashboard showing appointment trends.
- **AI Configuration UI**: New admin settings page for configuring external AI models, featuring an adaptive terminal UI with real-time connection logging and status badges.
- **Universal AI Chatbot**: Expanded the JanjiCare AI Assistant beyond the patient portal, making it available to Doctors and Administrators across all authenticated dashboards.

### Fixed
- **OWASP A10 Vulnerability**: Fixed an information disclosure leak in the AI connection test endpoint by preventing raw backend exceptions and stack traces from being exposed to the client.
- **CI Pipeline Stabilized**: Fixed GitHub Actions failing on empty Reverb environment variables and missing Redis containers by correctly provisioning fallback values and updating default caching drivers to use `database`.
- Addressed mobile view padding issues in Analytics and Reports dashboards.
- Resolved text wrapping and truncation issues for long doctor specialties.
- Fixed sidebar collapse bug on mobile screens.
- Corrected missing table syntax tags in Reports overview.

### Changed
- Refactored mobile list views for enhanced readability and performance.
