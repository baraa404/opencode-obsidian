## ADDED Requirements

### Requirement: Release workflow triggers on version tags
The release workflow SHALL trigger when a git tag matching the pattern `v*` is pushed to the repository.

#### Scenario: Tag push triggers workflow
- **WHEN** a developer pushes a tag named `v0.1.0` to the repository
- **THEN** the GitHub Actions release workflow SHALL start execution within 1 minute

### Requirement: Release workflow builds the plugin
The release workflow SHALL build the plugin by running the production build command.

#### Scenario: Successful build
- **WHEN** the release workflow executes
- **THEN** it SHALL run `bun run build` successfully
- **AND** the files `main.js` and `styles.css` SHALL be generated in the repository root

#### Scenario: Build failure prevents release
- **WHEN** the build command fails
- **THEN** the workflow SHALL fail without creating a GitHub release
- **AND** an error notification SHALL be visible in the Actions tab

### Requirement: Release workflow creates GitHub release
The release workflow SHALL create a GitHub release with the tag name as the release name.

#### Scenario: Release creation
- **WHEN** the build succeeds
- **THEN** a GitHub release SHALL be created with name matching the git tag (e.g., "0.1.0" for tag "v0.1.0")
- **AND** the release SHALL be marked as a pre-release
- **AND** the release SHALL include the three required assets: `manifest.json`, `main.js`, `styles.css`

### Requirement: Manifest version matches release version
The manifest.json uploaded to the release SHALL have its `version` field matching the release tag version.

#### Scenario: Version synchronization
- **GIVEN** the git tag is `v0.2.0`
- **AND** the package.json version is "0.2.0"
- **WHEN** the release workflow runs
- **THEN** the released manifest.json SHALL contain `"version": "0.2.0"`

#### Scenario: Version extraction from tag
- **GIVEN** the git tag is `v1.0.0-beta.1`
- **WHEN** the release workflow processes the tag
- **THEN** it SHALL extract version "1.0.0-beta.1"
- **AND** update manifest.json accordingly
