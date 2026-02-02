# Contributing

Thank you for your interest in contributing to the OpenCode Obsidian plugin!

## What We Accept

We welcome the following types of contributions:

- Windows and WSL support
- Documentation improvements
- Bug fixes

**Note:** Core product features and major changes require prior discussion. Please [open an issue](https://github.com/mtymek/opencode-obsidian/issues) first to discuss your proposal before starting work. PRs for new features submitted without prior approval may be closed.

I'm also interested in collecting a set of Agent Skills useful in the context of Obsidian vaults. Feel free to submit an issue or PR with your ideas.

## Development Setup

### Requirements

- [Bun](https://bun.sh/) 1.3+
- Obsidian (for testing the plugin)

### Getting Started

```bash
git clone https://github.com/mtymek/opencode-obsidian.git
cd opencode-obsidian
bun install
```

### Development Workflow

To work on the plugin during development:

1. Build the plugin:
   ```bash
   bun run build  # One-time production build
   ```

2. The plugin will be built to `main.js` in the project root

3. For testing in Obsidian:
   - Enable Community Plugins in Obsidian settings
   - Copy the built plugin to your vault's `.obsidian/plugins/opencode-obsidian/` directory
   - Reload Obsidian or use the "Reload app without saving" command

### Commands

```bash
bun install    # Install dependencies
bun run build  # Production build with type checking
bun test       # Run tests
```

## Release Process

This project uses automated GitHub releases for distribution via BRAT.

### Version Commands

We use semantic versioning (semver) with the following commands:

```bash
bun run version:patch   # Bump patch version (0.1.0 -> 0.1.1) - bug fixes
bun run version:minor   # Bump minor version (0.1.0 -> 0.2.0) - new features
bun run version:major   # Bump major version (0.1.0 -> 1.0.0) - breaking changes
```

### How Releases Work

1. When you run a version command:
   - `package.json` version is bumped
   - `manifest.json` is automatically synchronized via the `version` lifecycle script
   - A git commit is created with both files
   - A git tag is created (e.g., `v0.2.0`)
   - The commit and tag are pushed to GitHub

2. GitHub Actions automatically:
   - Triggers on the new tag
   - Builds the plugin
   - Creates a GitHub release marked as "pre-release"
   - Attaches `manifest.json`, `main.js`, and `styles.css`

3. BRAT users automatically receive the update

### Creating a Release

```bash
# After your changes are merged to main...
bun run version:minor   # or patch/major as appropriate
# That's it! The rest is automated.
```

**Important:** Always use the version commands - don't create tags manually or update version numbers by hand. The automation keeps `package.json` and `manifest.json` in sync.

## Before Submitting a PR

1. Run `bun run build` to ensure type checking passes
2. Run `bun test` to ensure all tests pass
3. Test the plugin in Obsidian to verify functionality

## Pull Requests

1. Keep PRs small and focused on a single concern
2. Explain what your PR is attempting to fix or improve
3. Link any relevant issues in the PR description

## License

By contributing to the OpenCode Obsidian plugin, you agree to license your contribution under the [MIT License](LICENSE).
