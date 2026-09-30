# Architecture, Database, API, and Authentication

## Architectural summary
The project uses a direct Flutter client architecture with Firebase Realtime Database as the live backend. The app listens to streams, keeps state in Riverpod providers, and renders UI based on the latest telemetry and configuration values.

## Layers

### 1. Presentation layer
Location: `lib/screens`

Responsibilities:
- Dashboard view
- Analytics view
- Alerts view
- Settings view
- App-level navigation

### 2. State and data access layer
Location: `lib/providers`

Responsibilities:
- Firebase database access
- Stream subscriptions for telemetry and thresholds
- Notifier-based threshold configuration updates
- UI state coordination with Riverpod

### 3. Domain model layer
Location: `lib/models`

Responsibilities:
- `TelemetryData` representation
- Parsing logic from Firebase map data
- Default values for empty datasets

### 4. Application bootstrap
Location: `lib/main.dart`

Responsibilities:
- Firebase initialization
- Root app creation
- Navigation setup and dashboard composition
- Custom dashboard chart and alert logic

## Data flow
1. App initializes Firebase in `main()`.
2. `telemetryStreamProvider` listens to `telemetry/device1`.
3. `historyStreamProvider` listens to `telemetry/history`.
4. `thresholdsStreamProvider` listens to `settings/thresholds`.
5. UI consumes these streams via Riverpod.
6. Threshold updates from Settings are written back to Firebase.
7. Alarm silence has a dedicated control path at `controls/alert_silenced`.

## Database & data model

### Database technology
Firebase Realtime Database is the active database layer used by the app.

### Current data paths
- `telemetry/device1` – current live telemetry snapshot
- `telemetry/history` – historical readings
- `settings/thresholds` – monitoring thresholds
- `controls/alert_silenced` – alarm silence state

### Telemetry model
The `TelemetryData` model includes:
- `airTemp`: double
- `foodTemp`: double
- `humidity`: double
- `gasPpm`: double
- `gasVoltage`: double
- `statusCode`: String
- `updatedAt`: int
- `uptimeSeconds`: int

### Supported alias fields
- air temperature: `airTemp`, `air_temp`, `temperature`, `temp`, `dhtTemp`, `dht_temp`
- food temperature: `food_temp`, `foodTemp`
- humidity: `humidity`
- gas concentration: `gas_ppm`, `gasPpm`, `gasRaw`
- gas voltage: `gas_voltage`, `gasVoltage`
- status code: `status_code`
- updated timestamp: `updated_at`
- uptime: `uptime_seconds`

### Threshold configuration
```json
{
  "temp_limit": 8.0,
  "gas_limit": 100
}
```

### Default thresholds
- `temp_limit = 8.0`
- `gas_limit = 100.0`

## API specification
The project does not implement a separate REST or GraphQL backend. The current application uses Firebase Realtime Database directly from the Flutter client.

### Read paths
- `telemetry/device1`
- `telemetry/history`
- `settings/thresholds`

### Write paths
- `settings/thresholds`
- `controls/alert_silenced`

### Data contract
#### Telemetry snapshot
```json
{
  "airTemp": 5.4,
  "foodTemp": 4.1,
  "humidity": 62.5,
  "gasPpm": 95,
  "gasVoltage": 1.2,
  "status_code": "NOMINAL",
  "updated_at": 1712345678901,
  "uptime_seconds": 1200
}
```

#### Thresholds configuration
```json
{
  "temp_limit": 8.0,
  "gas_limit": 100
}
```

#### Alert silence control
```json
true
```

## Authentication and authorization
No formal authentication or authorization system is implemented in the current app code.

### Current state
- No user login flow
- No role-based access control
- No secure per-user session model
- Prototype controls are exposed in the app without backend gating

### Current prototype assumption
The app is treated as a shared operational dashboard and not a hardened production system.

## Security implication
This current prototype should be treated as a development or demo environment, not a hardened production authorization boundary.

## Dependency rules
- Screens depend on providers and models
- Providers depend on Firebase and model parsing
- Models are passive data containers
- UI does not own business logic beyond local visual state

## Architectural constraints
- No dedicated domain service layer or repository abstraction yet
- No classic API backend abstraction
- Single-device assumption encoded in the path names
- Prototype-level settings and controls are included in the same app surface

## Scalability notes
The current architecture is sufficient for a single-site prototype but would need a clear multi-device and security layer before production expansion.
