# UI/UX Specification & Design System

## Design intent
The application uses a dark facility-monitoring dashboard style designed for operational alerts and quick visual scanning.

## Design language
- Dark theme background: near-black and charcoal surfaces
- Accent blue for normal operational status and charting
- Red for critical warnings and threshold breaches
- Orange/amber for warning states
- Green for healthy status and nominal readings
- Monospace styling used for numeric telemetry values and timestamps

## Screen inventory

### 1. Dashboard screen
Purpose:
- Show current system status
- Present high-level telemetry metrics
- Show live alert banner

Layout:
- Header with app title and online/offline indicator
- Three metric cards for air temperature, humidity, and gas/VOC
- Large chart for air temperature trend
- Alert banner below the content area
- Bottom navigation bar

Components:
- System Online/System Offline badge
- Date and local time text
- Metric cards with value, unit, and status badge
- Temperature chart
- Alert banner with silence button

Interaction behavior:
- Metrics update automatically when telemetry changes
- Alert banner appears when thresholds are exceeded
- Alarm silence button writes state back to Firebase

### 2. Analytics screen
Purpose:
- Review recent sensor trends and threshold breaches

Layout:
- AppBar with title and subtitle
- Time filter chips for 24h and 48h
- Trend charts stacked vertically

Components:
- Filter chips
- Air temperature chart
- Humidity chart
- Gas/VOC chart
- Threshold reference lines

### 3. Alerts screen
Purpose:
- Review active alert events and repeated incidents

Layout:
- App bar title `System Alerts`
- List of grouped alert cards
- Empty state when no alerts exist

### 4. Settings screen
Purpose:
- Display hardware and monitoring configuration

Layout:
- Device information card
- Threshold settings card
- Preferences card
- About card

Components:
- Device online/offline status indicator
- Sensor list for DHT11 and MQ-135
- Slider controls for limits
- Local push-notification toggle
- About metadata

## Design system

### Color palette
- Background: near-black / charcoal
- Primary accent: blue
- Warning: orange/amber
- Critical: red
- Healthy: green
- Muted text: gray-blue

### Typography
- Default font family: `Inter`
- Numeric values use monospace styling
- Titles and labels use bold or semibold weight

### Spacing and layout
- Rounded cards with moderate border radius
- Consistent internal padding across cards and list rows
- Bottom navigation used as primary app navigation

### Surface styling
- Containers use dark translucent backgrounds with thin borders
- Status indicators include rounded badges and pulse dots
- Charts use clean threshold lines and subtle grid styling

### Component patterns
- Metric cards
- Trend charts
- Warning banners
- Alert cards
- Settings cards
- Toggle/switch controls
- Sliders for threshold adjustments

### States and feedback
- Healthy state: green accent
- Warning state: amber accent
- Critical state: red accent
- Offline state: gray/red stale indicator
- Loading state: spinner

## Accessibility and usability
- Use strong contrast between text and dark background
- Avoid clutter in the dashboard cards
- Use short labels for quick scanning
- Use clear color-coded states for healthy vs warning vs critical states
- Maintain large touch target areas for mobile controls

## Responsive behavior
- Primary layout is mobile-first
- Cards adapt within vertical stacking and horizontal metric rows
- App is suitable for monitoring interfaces rather than full desktop-scale analytics

## States to support
- Loading
- Empty dataset
- Offline/stale data
- Normal range
- Warning threshold breach
- Critical threshold breach
- Alarm silenced state
- Error state during data fetch

## Motion and transitions
- Minimal transition and animation requirements
- Pulse indicator for active device state
- Basic chart animation/refresh patterns already in the UI code
