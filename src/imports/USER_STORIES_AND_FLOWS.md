# User Stories & User Flows

## Product scope

This project is treated as an Advanced MVP. The implementation already includes threshold editing, Firebase write-back, device configuration screens, and local settings toggles, so these are active prototype features.

## User stories

### Dashboard monitoring
- As a facility operator, I want to see live temperature, humidity, and gas readings so that I can confirm the cold-storage room is healthy.
- As a facility operator, I want a visible online/offline device indicator so that I know whether the telemetry source is currently connected.
- As a technician, I want a critical status banner so that I can identify urgent problems immediately.

### Alerting
- As a facility operator, I want alert banners when temperature or gas levels exceed thresholds so that I can act quickly.
- As a technician, I want alert cards grouped by issue type so that I can understand repeated events without confusion.
- As a user, I want to silence an active alarm temporarily so that I can acknowledge the condition without losing monitoring.

### Historical analysis
- As a supervisor, I want to view 24-hour and 48-hour charts so that I can review recent trends.
- As a technician, I want threshold reference lines on chart views so that I can compare values against limits.
- As a user, I want to see the last known readings in a history list so that I can inspect recent telemetry records.

### Configuration
- As a technician, I want to change the temperature threshold from the settings screen so that I can tune alert sensitivity in the prototype environment.
- As a technician, I want to change the gas threshold from the settings screen so that I can tune alert sensitivity in the prototype environment.
- As a user, I want the threshold adjustments to sync with Firebase so that the app reflects the current configuration.
- As a user, I want to see device and sensor information so that I know which hardware is connected.

### Prototype preferences
- As a user, I want a local push-notification toggle so that I can simulate the preference state in the current prototype.
- As a user, I want an offline/stale telemetry indication so that I know when data is no longer current.

## Functional requirements
1. The dashboard shall show current air temperature, humidity, and gas/VOC values.
2. The app shall surface online/offline status based on telemetry freshness.
3. The app shall highlight values exceeding configured thresholds.
4. The app shall show historical trend charts.
5. The app shall allow threshold editing in the active prototype UI.
6. The app shall persist threshold edits to Firebase Realtime Database.
7. The app shall persist alarm silence state to Firebase.
8. The app shall show device metadata and sensor status.
9. The app shall display the last known telemetry when the source is stale.

## Acceptance criteria
- A user can open the app and immediately view telemetry cards.
- A stale telemetry state is visibly displayed when no fresh data arrives.
- An alert banner appears when temperature exceeds the threshold.
- A gas alert appears when gas/VOC exceeds the threshold.
- A threshold slider can be adjusted in the settings view.
- Modified thresholds are stored in the configured Firebase path.
- The app should not crash when telemetry or thresholds are empty.

## User flows and navigation

### Navigation structure
The current app uses a four-tab bottom navigation:
1. Dashboard
2. Analytics
3. Alerts
4. Settings

### Main user flows
#### 1. App startup and live dashboard
1. App launches
2. Firebase initializes
3. App subscribes to `telemetry/device1`
4. Dashboard renders current telemetry values
5. Header shows online/offline status
6. Dashboard charts are populated with live readings
7. Alert banner is shown if thresholds are breached

#### 2. View telemetry analytics
1. User taps Analytics tab
2. App subscribes to `telemetry/history`
3. User sees charts for air temperature, humidity, and gas levels
4. User selects 24h or 48h filters
5. Threshold lines are rendered for context

#### 3. Review active alerts
1. User taps Alerts tab
2. App reads recent alerting history
3. App groups repeated events by event type
4. User sees latest reading and event count
5. If the data is within safe range, the no-alert state appears

#### 4. Update monitoring thresholds
1. User opens Settings tab
2. App reads current thresholds from Firebase
3. User adjusts Air Temperature Limit or Gas / VOC Limit using sliders
4. App writes the updated values to Firebase
5. Dashboard and alerts refresh using the new threshold configuration

#### 5. Silence alarm temporarily
1. Critical threshold breach is active
2. User taps the Silence Alarm button on the banner
3. The local app state and Firebase control value update
4. The banner text changes to `Alarm Silenced (Monitoring Active)`
5. When the condition clears or the snooze window expires, the system can retrigger alert conditions

#### 6. Offline behavior
1. Device telemetry stops updating
2. Data age exceeds the configured stale interval
3. Online badge changes to offline
4. Warning banner appears stating telemetry is stale
5. System remains visible with the last known telemetry snapshot

## Success/failure paths
- Success: telemetry remains fresh and within thresholds -> normal dashboard
- Failure: threshold breach -> alert banner and warning card
- Failure: data is stale -> offline staleness indicator and warning messages
- Failure: no data -> empty-state fallback behavior with safe defaults

## Back-navigation behavior
- Bottom navigation is the primary navigation pattern
- Users return to the dashboard by selecting the Dashboard tab
- No explicit deep-link navigation is implemented in the current code
