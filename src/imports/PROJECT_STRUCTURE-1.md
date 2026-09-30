# Project Structure

## Root structure

```text
cold_storage_app/
├── android/
├── ios/
├── lib/
├── linux/
├── macos/
├── test/
├── web/
├── windows/
├── analysis_options.yaml
├── README.md
├── pubspec.yaml
├── AI_RULES.md
├── docs/
└── build/
```

## Application code

```text
lib/
├── main.dart
├── models/
│   └── telemetry_model.dart
├── providers/
│   ├── target_config_provider.dart
│   └── telemetry_provider.dart
└── screens/
    ├── alerts_screen.dart
    ├── analytics_screen.dart
    ├── history_screen.dart
    └── settings_screen.dart
```

## Documentation folder

```text
docs/
├── PRD.md
├── USER_STORIES.md
├── USER_FLOWS.md
├── UI_UX_SPEC.md
├── DESIGN_SYSTEM.md
├── TECH_SPEC.md
├── ARCHITECTURE.md
├── DATABASE.md
├── API_SPEC.md
├── AUTH_SPEC.md
├── SECURITY.md
├── EDGE_CASES.md
├── TEST_PLAN.md
├── PROJECT_STRUCTURE.md
├── ENVIRONMENT_CONFIG.md
├── DEPLOYMENT.md
```

## File placement rules

- Application behavior belongs in `lib/`
- Firebase access belongs in provider files
- Data modeling belongs in the `models/` folder
- Screens belong in the `screens/` folder
- Test files belong in `test/`
- Platform-specific configuration belongs in the native folders (`android/`, `ios/`, etc.)
- Documentation belongs in the `docs/` folder and project root
