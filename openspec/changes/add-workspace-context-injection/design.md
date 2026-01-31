# Design: Workspace Context Injection

## Context

The plugin embeds OpenCode in an iframe and spawns a local server. OpenCode exposes an HTTP API that allows programmatic interaction with sessions. Obsidian's Workspace API provides access to open files, emits events when the workspace changes, and provides access to the active editor's selection.

**Stakeholders:** Users who want AI to be aware of their open notes and selected text without manual input.

**Constraints:**
- Must not overload the context window with repeated injections
- Must work with the existing ProcessManager and view lifecycle
- Desktop-only (uses Node.js APIs)

## Goals / Non-Goals

**Goals:**
- Automatically provide OpenCode with awareness of open notes
- Include currently selected text for immediate context
- Keep context window clean (no accumulation of stale context)
- Minimal performance impact (focus-based updates)
- User control via settings (enabled by default)

**Non-Goals:**
- Injecting full file contents (only paths + selection)
- Real-time synchronization with every keystroke
- Mobile support

## Decisions

### Decision 1: Use direct HTTP calls for API communication
**What:** Use direct `fetch()` calls to the local OpenCode server for session management and message/part updates.

**Why:** The plugin needs a few specific endpoints (create session, prompt with `noReply`, update/ignore parts). Using `fetch()` avoids adding SDK bundle size and keeps implementation explicit.

**Alternatives considered:**
- `@opencode-ai/sdk`: Type-safe, but adds dependency/bundle size and still requires careful session targeting.
- postMessage to iframe: Not supported by OpenCode web UI.

### Decision 2: Replace context via update/ignore (never revert)
**What:** Track the injected context part ID. On updates, prefer updating that part in-place. If in-place update is not available, mark the previous part as `ignored: true` and create a new context injection.

**Why:** In OpenCode, `session.revert()` implements user-visible undo semantics and can delete messages after the revert point during cleanup, which is unsafe for automatic context refresh.

**Alternatives considered:**
- Revert + re-inject: Rejected (destructive semantics).
- Append only: Would accumulate redundant messages.
- One-time injection: Context becomes stale.
- System prompt field: Not specified as replace-only.

### Decision 3: Inject paths + selected text, not full content
**What:** Send file paths (e.g., `Notes/Project.md`) and the currently selected text (if any), but not full file contents.

**Why:** 
- Keeps context concise and within token limits
- Users control what's "in scope" by opening/closing files
- Selected text provides immediate, relevant context without overwhelming
- Full content injection could easily exceed context limits

### Decision 4: Track context for the active iframe session
**What:** Maintain a single tracked session and context reference (session ID + injected context part reference) based on the current iframe URL.

**Why:** This plugin assumes only one OpenCode tab exists at a time. The injected context must follow the session the user is actively viewing in the embedded UI, which is determined by the iframe URL at injection time.

### Decision 5: Include selection source file
**What:** When including selected text, also indicate which file it's from.

**Why:** Helps the AI understand the context of the selection (e.g., "Selected from Daily/2026-01-12.md").

### Decision 6: Inject context on OpenCode view focus
**What:** Refresh context when the OpenCode view becomes the active leaf.

**Why:** Keeps injections tied to user intent (they are about to use OpenCode), avoids constant background updates, and reduces risk of flooding the server.

**Trade-off:** Context can be briefly stale if the workspace changes while the OpenCode view remains active. This is accepted for simplicity.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│ Obsidian Plugin                                             │
│                                                             │
│  ┌─────────────────┐    ┌──────────────────┐               │
│  │ WorkspaceContext│    │   OpenCodeClient │               │
│  │                 │    │                  │               │
│  │ - getOpenPaths()│    │ - updateContext()│               │
│  │ - getSelection()│    │ - update/ignore │               │
│  │ - formatContext │    │                  │               │
│  └────────┬────────┘    └────────┬─────────┘               │
│           │                      │                          │
│           └──────────┬───────────┘                          │
│                      │                                      │
│           ┌──────────▼──────────┐                          │
│           │     main.ts         │                          │
│           │                     │                          │
│           │ - view focus events │                          │
│           │ - context refresh   │                          │
│           └──────────┬──────────┘                          │
│                      │                                      │
└──────────────────────┼──────────────────────────────────────┘
                       │ HTTP
              ┌────────▼────────┐
              │ OpenCode Server │
              │                 │
              │ - session.create│
              │ - session.prompt│
              │ - part.update   │
              └─────────────────┘
```

## Data Flow

1. User focuses the OpenCode view (active leaf)
2. `WorkspaceContext` collects:
   a. `getOpenNotePaths()` - current open files
   b. `getSelectedText()` - current selection (if any)
3. `OpenCodeClient.updateContext()`:
   a. Determines the current session ID by parsing the iframe URL (`.../session/<sessionID>`)
   b. If no session ID is available (iframe not on a session route), do nothing
   c. Updates or ignores the previously injected context part (if any)
   d. Injects fresh context with `noReply: true`
   e. Stores injected message/part IDs for future updates
4. OpenCode AI now has updated context for next interaction

## Context Format

```
<system-reminder>
Currently open notes in Obsidian:
- Daily/2026-01-12.md
- Projects/Feature-Spec.md
- Reference/API-Docs.md

Selected text (from Projects/Feature-Spec.md):
"""
The plugin SHALL inject workspace context into OpenCode sessions.
This includes both open file paths and selected text.
"""
</system-reminder>
```

When no text is selected, the "Selected text" section is omitted.

## Risks / Trade-offs

| Risk | Mitigation |
|------|------------|
| Session changes between updates | Parse iframe URL at injection time; update tracked session and context reference |
| Iframe not on a session route | No-op (do not inject) |
| Server not running when focus fires | Check `getProcessState() === "running"` before attempting |
| Context replacement is destructive | Avoid `session.revert()`; update or mark the previous part as `ignored` |
| Tracking lost on plugin reload | Acceptable - next focus injects fresh context, old message becomes stale but harmless |
| Large selection could bloat context | Truncate selection to reasonable limit (e.g., 2000 chars) |
| Workspace changes while OpenCode is active | Accepted staleness until the next focus-based refresh |

## Migration Plan

No migration needed. New feature enabled by default but can be disabled in settings.

## Open Questions

1. ~~Should we also inject the active file distinctly (e.g., "Currently editing: X.md")?~~
   - Resolved: The selected text section includes the source file, which serves this purpose.

2. Should context be injected on view open or only on focus?
   - Decision: Inject on focus; view open triggers focus in typical usage, but the event is the single source of refresh.
