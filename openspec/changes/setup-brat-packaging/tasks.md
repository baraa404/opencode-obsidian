## 1. Repository Preparation

- [x] 1.1 Verify `main.js` is in `.gitignore` (already configured)
- [x] 1.2 Confirm `styles.css` remains tracked in git (static source file)
- [x] 1.3 Verify repository builds cleanly (`bun run build` produces `main.js`)

## 2. Version Management Scripts

- [x] 2.1 Create `scripts/sync-manifest-version.ts` to read package.json version and update manifest.json
- [x] 2.2 Add "version" lifecycle script to package.json: `"bun run scripts/sync-manifest-version.ts && git add manifest.json"`
- [x] 2.3 Add `version:patch` script to package.json: `"bun pm version patch && git push --follow-tags"`
- [x] 2.4 Add `version:minor` script to package.json: `"bun pm version minor && git push --follow-tags"`
- [x] 2.5 Add `version:major` script to package.json: `"bun pm version major && git push --follow-tags"`
- [x] 2.6 Test version:patch locally in a test branch (then delete test tag and reset) - Script tested, full workflow to be verified after merge

## 3. GitHub Actions Release Workflow

- [x] 3.1 Create `.github/workflows/release.yml` with tag trigger (`v*`)
- [x] 3.2 Add workflow step to checkout repository
- [x] 3.3 Add workflow step to setup Bun environment
- [x] 3.4 Add workflow step to install dependencies (`bun install`)
- [x] 3.5 Add workflow step to verify manifest.json version matches the tag (sanity check)
- [x] 3.6 Add workflow step to build plugin (`bun run build`)
- [x] 3.7 Add workflow step to create GitHub release with `prerelease: true`
- [x] 3.8 Add workflow step to upload `manifest.json`, `main.js`, `styles.css` as release assets

## 4. Documentation Updates

- [x] 4.1 Add BRAT installation section to README.md
- [x] 4.2 Update README.md installation instructions to clarify git clone is for developers only
- [x] 4.3 Add release process documentation to CONTRIBUTING.md
- [x] 4.4 Document version commands and when to use each (patch/minor/major)

## 5. Testing and Verification (Post-Implementation)

- [x] 5.1 ~~Run `bun run version:patch` locally (on test branch) and verify both package.json and manifest.json are updated~~ (Script tested successfully)
- [x] 5.2 ~~Verify the version commit includes both package.json and manifest.json changes~~ (Lifecycle script verified)
- [ ] 5.3 Push test tag and verify GitHub Actions workflow triggers and completes successfully
- [ ] 5.4 Verify GitHub release is created with correct name (matching tag without 'v' prefix)
- [ ] 5.5 Verify release is marked as pre-release
- [ ] 5.6 Verify all three assets are attached: `manifest.json`, `main.js`, `styles.css`
- [ ] 5.7 Verify manifest.json in release has correct version matching the tag
- [ ] 5.8 Test installing the plugin via BRAT (if possible in test environment)
- [ ] 5.9 Clean up test release and tag after verification

## 6. Final Steps (Manual)

- [ ] 6.1 Commit all changes (`package.json`, scripts, `.github/workflows/release.yml`, documentation)
- [ ] 6.2 Create PR for review (or merge directly if working solo)
- [ ] 6.3 After merge, create first official beta release using `bun run version:minor` (bump to 0.2.0)
- [ ] 6.4 Verify the release appears correctly and is installable via BRAT
