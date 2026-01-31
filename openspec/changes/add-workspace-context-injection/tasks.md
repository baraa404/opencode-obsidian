# Tasks: Add Workspace Context Injection

## 1. Dependencies

- [x] 1.1 No new dependencies required (use direct `fetch()` calls)

## 2. Types and Settings

- [x] 2.1 Add `injectWorkspaceContext: boolean` to `OpenCodeSettings` interface (default: `true`)
- [x] 2.2 Add `maxNotesInContext: number` to `OpenCodeSettings` interface (default: `20`)
- [x] 2.3 Add `maxSelectionLength: number` to `OpenCodeSettings` interface (default: `2000`)
- [x] 2.4 Update `DEFAULT_SETTINGS` with new values

## 3. OpenCode Client Module

- [x] 3.1 Create `src/OpenCodeClient.ts` with a small HTTP wrapper
- [x] 3.2 Implement `createSession()` and session URL helpers
- [x] 3.3 Implement `updateContext()` using update-part or ignore+reinject (no revert)
- [x] 3.4 Track last injected context message/part IDs for the tracked session
- [x] 3.5 Add error handling for API failures (silent catch, log to console)

## 4. Workspace Context Module

- [x] 4.1 Create `src/WorkspaceContext.ts` for collecting workspace context
- [x] 4.2 Implement `getOpenNotePaths()` using `getLeavesOfType("markdown")`
- [x] 4.3 Implement `getSelectedText()` to get current editor selection with source file
- [x] 4.4 Implement `formatContext()` to generate the combined context string
- [x] 4.5 Add deduplication for files open in multiple panes
- [x] 4.6 Add truncation for selections exceeding `maxSelectionLength`

## 5. Main Plugin Integration

- [x] 5.1 Import `OpenCodeClient` and `WorkspaceContext` in main.ts
- [x] 5.2 Initialize `WorkspaceContext` in `onload()`
- [x] 5.3 Create `updateOpenCodeContext()` method triggered on OpenCode view focus
- [x] 5.4 Register `active-leaf-change` event listener to detect OpenCode view focus (conditional on setting)
- [x] 5.5 Create an OpenCode session on first view open and store the iframe URL (in-memory)
- [x] 5.6 Before injecting, resolve `sessionID` by parsing the current iframe URL (if no session route, no-op)
- [x] 5.7 Add server running check before attempting context updates
- [x] 5.8 Trigger initial context injection when server reaches running state and a session exists

## 6. Settings UI

- [x] 6.1 Add toggle for "Inject workspace context" in SettingsTab
- [x] 6.2 Add slider for "Max notes in context" (1-50 range)
- [x] 6.3 Add slider or input for "Max selection length" (500-5000 range)
- [x] 6.4 Add descriptive text explaining the feature includes open notes and selected text

## 7. Testing

- [ ] 7.1 Manual test: Open multiple notes, verify context appears in OpenCode
- [ ] 7.2 Manual test: Select text, verify selection appears in context with source file
- [ ] 7.3 Manual test: Change open notes while OpenCode is not focused, then focus OpenCode and verify context refreshes
- [ ] 7.4 Manual test: Clear selection, verify selection section is removed
- [ ] 7.5 Manual test: Disable setting, verify no context injection
- [ ] 7.6 Manual test: Server not running, verify no errors thrown
- [ ] 7.7 Manual test: Large selection, verify truncation works
- [ ] 7.8 Build and verify no TypeScript errors
