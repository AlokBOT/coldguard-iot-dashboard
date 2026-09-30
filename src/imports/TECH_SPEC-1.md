# Technical Specification

## Overview

The application is a Flutter mobile app that monitors cold-storage telemetry using Firebase Realtime Database and a dark dashboard interface.

## Frontend

- Framework: Flutter
- Language: Dart
- State management: Riverpod
- UI library: Material Design widgets
- Charts: `fl_chart`

## Backend and data layer

- Database: Firebase Realtime Database
- Firebase project: `cold-storage-iot-c5726`
- Firebase URL embedded in `telemetry_provider.dart`
- Source connection pattern: direct client-side reads and writes to Firebase paths

## Current implemented dependencies

From [pubspec.yaml](../pubspec.yaml):

- `flutter_riverpod` for state management
- `firebase_core` for Firebase initialization
- `firebase_database` for Realtime Database access
- `fl_chart` for chart rendering
- `cupertino_icons` for UI icons

## Runtime environment

- Minimum Flutter SDK: ^3.11.0
- Android and iOS projects are actively configured
- Android Gradle plugin and Firebase services plugin are included
- iOS project is included in the workspace

## Architecture characteristics

- App initializes Firebase on startup
- App subscribes to live telemetry streams
- Threshold values come from Firebase and are watched by Riverpod providers
- UI reads state from providers and renders dashboard components
- Settings screen updates thresholds in Firebase via Notifier methods

## Operational assumptions

- Single device path is used: `telemetry/device1`
- All current UI logic assumes one monitored storage unit
- Dataset updates come from an ESP32 or similar edge node sending data in JSON map format
- The app treats Firebase as the live source of truth for device readings and configuration

## Constraints and risks

- Firebase URL and configuration are hardcoded in the app
- No environment configuration file is in place yet
- No explicit security rules are in repository
- The app is not yet using a dedicated backend service or repository abstraction
- Authentication and role control are absent from the codebase

## Implementation notes

- The app uses `NotiferProvider` for bottom nav state and threshold configuration
- `StreamProvider.autoDispose` is used for telemetry and history streams
- `TelemetryData.fromMap` normalizes multiple possible sensor field names
- `ThresholdConfigNotifier.updateThresholds` writes values back to Firebase using `ref('settings/thresholds')`

## Quality expectations

- The app should not crash on empty or incomplete data
- The UI should respond to incoming telemetry stream updates
- Threshold logic should continue to work if defaults are missing
- Error states should be surfaced clearly in the UI
