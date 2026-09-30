# Edge Cases & Error Handling

## Current edge cases handled in app logic

### No telemetry data
- App falls back to `TelemetryData.empty()`
- UI continues rendering with safe zero-value placeholders
- Warning/offline states are displayed if data is missing or stale

### Null or missing threshold values
- App uses default thresholds: `temp_limit = 8.0`, `gas_limit = 100.0`

### Device offline
- App determines offline state by comparing the timestamp age to a 15-second threshold
- Offline indicator is shown in the header
- Warning banner is displayed when the telemetry is stale

### Repeated alert events
- Alerts are grouped by issue type and recency so repeated events remain readable

### Missing or malformed sensor fields
- The parser accepts alternate field alias names and defaults missing values to zero

### No alert state
- App shows a dedicated empty-state screen indicating no active alerts

### Error in database fetch
- UI shows an error message rather than crashing

## Additional behaviors to document

- Alarm silence state is written back to Firebase and used to suppress active critical alerts visually
- App should tolerate empty history and empty thresholds without crashing
- A stale dataset still displays the last known reading with offline status

## Future edge cases to add

- Expired login/session state
- Multi-device conflict or unknown device ID
- Database permission denied
- Network disconnection during threshold updates
- Duplicate or conflicting threshold writes
- Sensor calibration error or out-of-range values
