# Product Requirements Document

## Document status

This document describes the current project as implemented in the app code and treats the current scope as an Advanced MVP. The codebase is the source of truth for feature availability.

## Product name

Cold Storage IoT Monitor

## Product vision

Provide a live facility dashboard for monitoring cold-storage environmental parameters, identifying anomalies, and surfacing conditions that require attention before product quality or operational safety is impacted.

## Problem being solved

Cold-storage environments must maintain stable temperature, humidity, and air quality conditions. Without a central live monitor, operators may miss threshold breaches, stale sensor readings, or changes in gas/VOC conditions that affect product quality and safety.

## Target users

- Facility operator
- Site technician
- Supervisor monitoring a cold-storage room
- Maintenance person checking live system health
- Prototype stakeholder reviewing telemetry in a physical facility

## User personas

### Facility Operator
- Monitors a live dashboard during the workday
- Wants immediate awareness of abnormal temperature or gas conditions
- Needs a simple view of current status and event alerts

### Technician
- Checks whether the device is online
- Reviews trend data to diagnose drift or sensor issues
- Confirms whether the system is operating within thresholds

### Supervisor
- Wants a high-level overview of operational health
- Reviews recent charts and alert events
- Will tolerate a prototype monitoring interface rather than a full enterprise control plane

## Core features

- Live dashboard showing current telemetry
- Air temperature monitoring
- Humidity monitoring
- Gas/VOC monitoring
- Real-time system online/offline status
- Alert banner and event warning logic
- Historical trend charts for last 24 or 48 hours
- Threshold settings editable from the app UI
- Firebase Realtime Database integration for telemetry and controls
- Device information and sensor status view
- Local prototype preference toggle for push notifications
- Advanced MVP status with prototype controls retained and documented as active

## Secondary features

- Historical telemetry list screen
- Alert grouping for consecutive events
- Alarm silencing from the dashboard banner
- Local cached display of last known telemetry values
- Offline/stale telemetry indicator
- Dark monitoring dashboard styling

## Features explicitly out of scope for the current prototype

- Full user authentication and authorization
- Multi-tenant access control
- Role-based admin separation beyond the prototype UI
- Enterprise device fleet management
- Push notification delivery service integration
- Formal audit workflow and compliance controls
- Multi-region or multi-facility dashboards
- Full production-grade cybersecurity hardening

## User roles

The current app code does not implement full role-based access control. In practice, the prototype behaves as a shared monitoring interface with device controls exposed in the same app surface.

- Current prototype role: Operator / Viewer / Field Technician
- Active prototype controls: threshold editing, alarm silence state, local notification preference toggles, device status display

## Business requirements and rules

- The dashboard must display live telemetry values for air temperature, humidity, and gas/VOC.
- The interface must surface a clear online/offline device state.
- Critical conditions must trigger warning banners and alert card states.
- Threshold values are editable within the prototype app and write back to Firebase.
- The alarm silence state must be persisted to Firebase as a control value.
- The app must remain readable in a dark monitoring environment.

## Functional requirements

- Read data from Firebase Realtime Database path `telemetry/device1`
- Read threshold configuration from `settings/thresholds`
- Read historical readings from `telemetry/history`
- Display live metrics in cards and charts
- Show alerts and warnings when configured thresholds are breached
- Update telemetry history charts when new readings arrive
- Write threshold adjustments and alarm silencing state back to the configured Firebase paths
- Surface offline conditions when telemetry is stale

## Non-functional requirements

- Must run as a Flutter mobile app for Android and iOS
- Must support live dashboard updates in near real time
- Must provide responsive cards and charts for a monitor-like UI
- Must be understandable for field operators without extra setup
- Must remain stable under missing or stale telemetry

## Platform requirements

- Flutter SDK: 3.11+
- Android support included in project
- iOS support included in project
- Web, Linux, macOS, and Windows folders also exist but are not the primary source-of-truth deliverable for this prototype

## Constraints

- Uses Firebase Realtime Database as the live data backend
- Depends on a specific Firebase project and URL embedded in code
- Prototype architecture assumes a single monitored device path (`device1`)
- No formal auth or backend service layer is present yet
- All available feature decisions are based on implemented code, not on a separate backend contract

## Success criteria

- Dashboard loads and displays real-time telemetry
- Temperature, humidity, and gas values are shown clearly
- Threshold limits are visible and adjustable from the settings UI
- Alerts trigger when values exceed safe ranges
- Offline device state is visible when telemetry is stale
- App remains usable in a dark facility dashboard style

## Advanced MVP scope

This project is intentionally treated as an Advanced MVP, meaning the app includes prototype controls that are active in the code and must be documented as implemented features rather than future work.

## Future roadmap

- Add dedicated authentication and role separation
- Move threshold editing behind an admin-only route or permission model
- Add actual push notifications via Firebase Cloud Messaging
- Add multi-device and multi-facility monitoring
- Add stronger Firebase security rules and schema validation
- Add release pipeline and environment segregation
