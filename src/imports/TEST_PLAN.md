# Testing & Acceptance Criteria

## Current testing baseline

The repository currently has only one widget test verifying the dashboard title renders. This should be treated as the starting baseline for prototype validation.

## Test categories

### Unit tests
- Telemetry parsing from map data
- Default threshold handling
- Offline threshold logic
- Empty telemetry handling

### Widget tests
- Dashboard renders header and metric cards
- Analytics screen renders charts with history data
- Alerts screen renders empty state without data
- Settings screen renders thresholds and controls

### Integration tests
- Firebase threshold write-back from settings UI
- Firebase alarm silence writes
- Dashboard refresh after new telemetry arrives

### Regression tests
- Threshold breach triggers alert banner
- Alert resolves when values return to safe range
- Offline badge appears when data is stale

## Acceptance criteria

- App launches and initializes Firebase
- Dashboard displays current telemetry values
- Air temperature, humidity, and gas readings update from data stream
- Alerts appear when configured thresholds are exceeded
- Threshold sliders change the configuration and persist it to Firebase
- Alarm silence state persists to Firebase
- Offline and stale states are visibly communicated
- No crash occurs when telemetry is empty or missing

## Definition of Done for current prototype

- All key dashboard flows display data properly
- Settings threshold updates are reflected in the app and database
- Alerts and offline logic work on a real or simulated telemetry stream
- At least basic widget and data-model test coverage exists
- Documentation reflects the current feature set and prototype maturity
