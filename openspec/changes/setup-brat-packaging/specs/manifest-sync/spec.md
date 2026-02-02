## ADDED Requirements

### Requirement: Manifest version is synchronized with package version
When the package version is bumped, the `version` field in `manifest.json` SHALL be updated to match the new package.json version before the version commit is created.

#### Scenario: Synchronized version bump
- **GIVEN** package.json contains `"version": "0.1.0"`
- **AND** manifest.json contains `"version": "0.1.0"`
- **WHEN** a developer runs `bun run version:minor`
- **THEN** package.json SHALL be updated to `"version": "0.2.0"`
- **AND** manifest.json SHALL be updated to `"version": "0.2.0"`
- **AND** both files SHALL be included in the same git commit

### Requirement: Version sync happens via lifecycle script
The version synchronization SHALL be triggered by Bun's "version" lifecycle script, which runs after package.json is updated but before the version commit is created.

#### Scenario: Lifecycle script execution
- **GIVEN** the "version" script is defined in package.json
- **WHEN** `bun pm version` is executed
- **THEN** the "version" script SHALL run after package.json is updated
- **AND** the script SHALL update manifest.json
- **AND** the script SHALL stage manifest.json with `git add`
- **AND** the version commit SHALL include both updated files

### Requirement: Manifest structure is preserved
When updating the manifest version, all other fields in manifest.json SHALL be preserved.

#### Scenario: Manifest fields preserved
- **GIVEN** manifest.json contains fields: id, name, version, minAppVersion, description, author, isDesktopOnly
- **WHEN** the version is updated during version bump
- **THEN** all fields except `version` SHALL remain unchanged
- **AND** the JSON structure and formatting SHALL be preserved

### Requirement: Package and manifest versions are compatible
The version strings in package.json and manifest.json SHALL follow semantic versioning and be compatible.

#### Scenario: Semantic version compatibility
- **GIVEN** package.json has version "1.2.3-beta.2"
- **WHEN** the manifest is synchronized
- **THEN** manifest.json SHALL have version "1.2.3-beta.2"
- **AND** the version SHALL be a valid semver string
