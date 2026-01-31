## ADDED Requirements

### Requirement: Workspace Context Collection
The plugin SHALL collect the file paths of all currently open markdown notes in the Obsidian workspace.

#### Scenario: Collect open note paths
- **WHEN** the plugin needs to gather workspace context
- **THEN** it retrieves all leaves of type "markdown" from the workspace
- **AND** extracts the file path from each leaf's view
- **AND** deduplicates paths (same file may be open in multiple panes)

### Requirement: Selected Text Collection
The plugin SHALL collect the currently selected text from the active editor, if any selection exists.

#### Scenario: Collect selected text with source
- **WHEN** the plugin needs to gather workspace context
- **AND** text is selected in the active editor
- **THEN** it retrieves the selected text content
- **AND** identifies the source file path of the selection

#### Scenario: No selection present
- **WHEN** the plugin needs to gather workspace context
- **AND** no text is selected in the active editor
- **THEN** the selected text portion of the context is omitted

#### Scenario: Selection truncation
- **WHEN** the selected text exceeds `maxSelectionLength` characters
- **THEN** the selection is truncated to the configured limit
- **AND** an indicator is added showing truncation occurred

### Requirement: Context Injection to OpenCode
The plugin SHALL inject the workspace context (open notes and selected text) into the OpenCode session currently displayed in the embedded iframe.

#### Scenario: Inject context on OpenCode focus
- **WHEN** the OpenCode view becomes the active leaf
- **AND** the setting "Inject workspace context" is enabled
- **AND** the OpenCode server is running
- **AND** a `sessionID` can be resolved from the current iframe URL
- **THEN** the plugin sends the workspace context to that session
- **AND** the context is injected using `session.prompt({ noReply: true })` (no AI response triggered)

#### Scenario: Initial context injection
- **WHEN** the OpenCode server is running
- **AND** the OpenCode view becomes the active leaf
- **AND** a tracked session exists (created on first open)
- **THEN** the plugin injects the current workspace context

### Requirement: Context Replacement (Non-Destructive)
The plugin SHALL replace previous context injections rather than accumulating them.

#### Scenario: Update previous context part
- **WHEN** the plugin injects new context
- **AND** a previous context part exists for the session
- **THEN** the plugin updates the previous context part in-place to match the new context
- **AND** no new context message is added to the session history

#### Scenario: Ignore previous context part and re-inject
- **WHEN** in-place update is not available
- **AND** a previous context part exists for the session
- **THEN** the plugin marks the previous context part as `ignored: true`
- **AND** injects new context with `noReply: true`
- **AND** stores the new message/part IDs for future updates

#### Scenario: Replacement failure handling
- **WHEN** a previous context part cannot be updated or ignored (already removed, invalid IDs)
- **THEN** the plugin continues with fresh context injection
- **AND** logs the error to console for debugging

#### Scenario: Never revert
- **WHEN** updating context
- **THEN** the plugin MUST NOT call `session.revert()` as part of this feature

### Requirement: Focus-based Context Updates
The plugin SHALL refresh workspace context when the OpenCode view becomes the active leaf.

### Requirement: Session Tracking and URL Persistence
The plugin SHALL create and track an OpenCode session and preserve the iframe URL for the duration of the Obsidian process.

#### Scenario: Create session on first view open
- **WHEN** the OpenCode view is opened for the first time in the current Obsidian run
- **AND** the OpenCode server is running
- **THEN** the plugin creates a new OpenCode session
- **AND** updates the iframe URL to the session route
- **AND** stores that URL for later restores

#### Scenario: Restore last URL on reopen
- **WHEN** the OpenCode view is closed and reopened
- **AND** a previous iframe URL was stored in memory
- **THEN** the iframe is loaded with the stored URL

#### Scenario: Adopt user-changed session
- **WHEN** the user navigates to a different session within the iframe UI
- **AND** the plugin is about to inject context
- **THEN** the plugin reads the iframe `src` URL
- **AND** resolves the session ID from that URL
- **AND** updates the tracked session and stored URL to match

#### Scenario: No session route
- **WHEN** the iframe URL does not contain a session route
- **AND** the plugin is about to inject context
- **THEN** the plugin does not inject any context

#### Scenario: Invalidate stored URL when base changes
- **WHEN** hostname, port, or project directory changes
- **THEN** the plugin clears the stored URL and tracked session
- **AND** a new session is created on the next first open

#### Scenario: Workspace changes while OpenCode stays active
- **WHEN** the user changes open notes or selection while the OpenCode view remains active
- **THEN** the context MAY be briefly stale until the user focuses OpenCode again
- **AND** this staleness is an accepted trade-off for simplicity

### Requirement: Context Injection Settings
The plugin SHALL provide settings to control workspace context injection behavior.

#### Scenario: Enable/disable toggle
- **WHEN** the user disables "Inject workspace context"
- **THEN** the plugin does not register focus-based event listeners
- **AND** no context is injected into OpenCode sessions

#### Scenario: Enabled by default
- **WHEN** the plugin is installed fresh
- **THEN** the "Inject workspace context" setting defaults to enabled

#### Scenario: Limit number of notes
- **WHEN** more than `maxNotesInContext` notes are open
- **THEN** the plugin includes only the first N paths
- **AND** the default limit is 20 notes

#### Scenario: Limit selection length
- **WHEN** the selected text exceeds `maxSelectionLength` characters
- **THEN** the plugin truncates the selection
- **AND** the default limit is 2000 characters

### Requirement: Context Format
The plugin SHALL format the context as a system reminder containing file paths and optional selected text.

#### Scenario: Context message format with selection
- **WHEN** context is injected
- **AND** text is selected
- **THEN** the message is wrapped in `<system-reminder>` tags
- **AND** includes a header "Currently open notes in Obsidian:"
- **AND** lists each file path as a bullet point
- **AND** includes a "Selected text (from <filepath>):" section
- **AND** wraps the selected text in triple quotes

#### Scenario: Context message format without selection
- **WHEN** context is injected
- **AND** no text is selected
- **THEN** the message contains only the open notes section
- **AND** the selected text section is omitted

#### Scenario: Empty context
- **WHEN** no markdown files are open
- **AND** no text is selected
- **THEN** no context message is injected
- **AND** any previous injected context part is marked as `ignored: true`
