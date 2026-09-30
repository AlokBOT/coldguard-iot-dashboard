# Security Requirements

## Current implementation security posture

The app currently has a direct Firebase client connection and no hardening-specific security policy files in the repository.

## Security risks to acknowledge

- Firebase URL and project configuration are embedded in client code
- Firebase API keys are present in the Android config file
- No Firebase security rules are included in the repository
- No authentication layer is enforced in the app
- Threshold controls and alarm silencing are writable from the client as implemented

## Required security behaviors for the current prototype

- Keep Firebase access restricted and validated by Firebase rules
- Treat the app as a demo or prototype unless rules and auth are implemented
- Never expose live write secrets or privileged credentials in the client codebase
- Use environment-specific configuration for production deployments

## Recommended future controls

- Firebase Authentication for app users
- Firebase Realtime Database security rules limiting writes to authorized clients
- Role-based access for threshold configuration and alarm management
- Validation of incoming sensor data
- Audit trail for alarm state changes and threshold adjustments
- Logging and monitoring of failed database writes or invalid data

## Privacy and compliance

The current app does not include an explicit privacy compliance framework. The design assumes a local/localized prototype environment rather than regulated personal data handling.
