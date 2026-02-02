# Proposal: Setup BRAT-compatible packaging and releases

## Why

The plugin needs a reliable distribution mechanism for beta testing before official Obsidian marketplace submission. Currently, users must manually clone and build the plugin, creating friction for early adopters. BRAT (Beta Reviewer's Auto-update Tool) is the standard in the Obsidian community for beta plugin distribution. By setting up BRAT-compatible GitHub releases with automated version management, we enable users to install and auto-update the plugin with one click, accelerating feedback cycles during early development.

## What Changes

- **Version management scripts**: Add npm scripts (`version:patch`, `version:minor`, `version:major`) using `bun pm version` to automate version bumping and git tagging
- **Manifest synchronization**: Script or workflow step to ensure `manifest.json` version matches `package.json` before release
- **GitHub Actions release workflow**: Automated workflow triggered on `v*` tags that builds the plugin and creates GitHub releases with required assets (`manifest.json`, `main.js`, `styles.css`)
- **Repository cleanup**: `main.js` is already in `.gitignore` (build artifact); `styles.css` remains in git as it's a static source file
- **Documentation updates**: Add BRAT installation instructions to README and release process documentation to CONTRIBUTING.md

## Capabilities

### New Capabilities

- `brat-release-automation`: Automated GitHub release creation with BRAT-compatible asset packaging on version tag push
- `version-management`: Developer tooling for semantic version bumping with automated git tagging
- `manifest-sync`: Ensures `manifest.json` version field stays synchronized with `package.json` version during release process

### Modified Capabilities

_None - this change introduces infrastructure/tooling without modifying existing plugin functionality._

## Impact

- **CI/CD**: New GitHub Actions workflow for releases; existing CI workflow unaffected
- **Developer workflow**: New npm scripts for version management; standard `bun pm version` behavior
- **Repository structure**: Build artifacts removed from git tracking; releases become sole distribution mechanism
- **User experience**: BRAT users can install via `TfTHacker/obsidian42-brat` plugin with auto-update support
- **Dependencies**: No new runtime dependencies; uses existing `bun` toolchain
