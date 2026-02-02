## ADDED Requirements

### Requirement: Version patch command
The system SHALL provide a command to bump the patch version, synchronize manifest.json, create a commit, and push a git tag.

#### Scenario: Patch version bump
- **GIVEN** the current version is "0.1.0"
- **WHEN** a developer runs `bun run version:patch`
- **THEN** the package.json version SHALL be updated to "0.1.1"
- **AND** the manifest.json version SHALL be updated to "0.1.1"
- **AND** a git commit SHALL be created with message "0.1.1" containing both files
- **AND** a git tag "v0.1.1" SHALL be created
- **AND** the commit and tag SHALL be pushed to origin

### Requirement: Version minor command
The system SHALL provide a command to bump the minor version, synchronize manifest.json, create a commit, and push a git tag.

#### Scenario: Minor version bump
- **GIVEN** the current version is "0.1.5"
- **WHEN** a developer runs `bun run version:minor`
- **THEN** the package.json version SHALL be updated to "0.2.0"
- **AND** the manifest.json version SHALL be updated to "0.2.0"
- **AND** a git commit SHALL be created with message "0.2.0" containing both files
- **AND** a git tag "v0.2.0" SHALL be created
- **AND** the commit and tag SHALL be pushed to origin

### Requirement: Version major command
The system SHALL provide a command to bump the major version, synchronize manifest.json, create a commit, and push a git tag.

#### Scenario: Major version bump
- **GIVEN** the current version is "0.5.2"
- **WHEN** a developer runs `bun run version:major`
- **THEN** the package.json version SHALL be updated to "1.0.0"
- **AND** the manifest.json version SHALL be updated to "1.0.0"
- **AND** a git commit SHALL be created with message "1.0.0" containing both files
- **AND** a git tag "v1.0.0" SHALL be created
- **AND** the commit and tag SHALL be pushed to origin

### Requirement: Version commands require clean working directory
The version commands SHALL fail if the git working directory is not clean.

#### Scenario: Uncommitted changes prevent version bump
- **GIVEN** there are uncommitted changes in the working directory
- **WHEN** a developer runs any version command
- **THEN** the command SHALL fail with an error message
- **AND** no version bump, commit, or tag SHALL be created
