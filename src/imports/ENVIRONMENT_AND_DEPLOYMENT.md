# Environment & Deployment

## Development environment

- Flutter SDK: 3.11+
- Dart SDK: managed by Flutter
- Android project configured for Firebase services
- iOS project included for mobile builds

## Current configuration files

- [pubspec.yaml](../pubspec.yaml)
- [android/app/build.gradle.kts](../android/app/build.gradle.kts)
- [android/settings.gradle.kts](../android/settings.gradle.kts)
- [android/app/google-services.json](../android/app/google-services.json)
- [ios/Runner/Info.plist](../ios/Runner/Info.plist)

## Firebase configuration

The app uses a Firebase project with the following project identifier:

- Project ID: `cold-storage-iot-c5726`
- Firebase database URL: `https://cold-storage-iot-c5726-default-rtdb.asia-southeast1.firebasedatabase.app`

## Environment-specific notes

- There is no `.env` file or environment-specific build configuration file in the repository
- The app currently uses hardcoded Firebase and application identifiers
- This is acceptable for prototype development but should be upgraded for production deployment

## Platform-specific notes

### Android
- Internet permission is enabled
- Firebase services plugin is active
- Application ID is `com.example.cold_storage_app`

### iOS
- Standard Flutter iOS app configuration is present
- Release naming uses the default Xcode/CocoaPods structure

## Secret handling rule

Do not store actual secrets or API keys in environment documentation. Keep only non-sensitive references and environment names.

## Current deployment state

This project currently exists as a local Flutter application and is not yet configured with a formal release pipeline or deployment workflow.

## Build process

- Flutter project builds with the standard Flutter toolchain
- Android and iOS platform projects are included
- Firebase initialization is required at runtime

## Current deployment assumptions

- This is a prototype/mobile monitor application
- Deployment is expected to be local or internal prototype delivery rather than a production release pipeline
- Build signing is still using the default debug configuration in Android

## Recommended future deployment process

1. Configure production Firebase project and rules
2. Set environment-specific Firebase configuration
3. Configure app ID and signing identities
4. Create staging and production builds
5. Validate telemetry and threshold behavior on real devices
6. Publish to the appropriate app stores or internal distribution channel

## CI/CD status

No CI/CD pipeline or deployment automation files were found in the repository.

## Rollback and monitoring

- No deployment rollback workflow is currently implemented
- No production monitoring stack is in the repository yet
- This should be added before scaling the app beyond prototype use
