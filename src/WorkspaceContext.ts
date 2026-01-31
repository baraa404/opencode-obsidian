import { App, MarkdownView } from "obsidian";

type SelectedTextContext = {
  text: string;
  sourcePath: string;
  truncated: boolean;
};

export class WorkspaceContext {
  private app: App;
  private lastSelection: { text: string; sourcePath: string } | null = null;
  private lastMarkdownView: MarkdownView | null = null;

  constructor(app: App) {
    this.app = app;
  }

  getOpenNotePaths(maxNotes: number): string[] {
    const leaves = this.app.workspace.getLeavesOfType("markdown");
    const paths = new Set<string>();

    for (const leaf of leaves) {
      const view = leaf.view as MarkdownView;
      const path = view.file?.path;
      if (path) {
        paths.add(path);
      }
    }

    return Array.from(paths).slice(0, Math.max(0, maxNotes));
  }

  updateSelectionFromView(view: MarkdownView | null): void {
    if (view) {
      this.lastMarkdownView = view;
    }
    const sourcePath = view?.file?.path;
    const selection = view?.editor?.getSelection() ?? "";

    if (!sourcePath || !selection.trim()) {
      this.lastSelection = null;
      return;
    }

    this.lastSelection = {
      text: selection,
      sourcePath,
    };
  }

  getSelectedText(maxSelectionLength: number): SelectedTextContext | null {
    const view = this.app.workspace.getActiveViewOfType(MarkdownView) ?? this.lastMarkdownView;
    const sourcePath = view?.file?.path;
    const selection = view?.editor?.getSelection() ?? "";

    let text = "";
    let path = "";

    if (sourcePath && selection.trim()) {
      text = selection;
      path = sourcePath;
      this.lastSelection = { text, sourcePath: path };
    } else if (this.lastSelection) {
      text = this.lastSelection.text;
      path = this.lastSelection.sourcePath;
    } else {
      return null;
    }

    const truncated = text.length > maxSelectionLength;
    const trimmed = truncated ? text.slice(0, maxSelectionLength) : text;

    return {
      text: trimmed,
      sourcePath: path,
      truncated,
    };
  }

  formatContext(openPaths: string[], selection: SelectedTextContext | null): string | null {
    if (openPaths.length === 0 && !selection) {
      return null;
    }

    const lines: string[] = ["<system-reminder>"];

    if (openPaths.length > 0) {
      lines.push("Currently open notes in Obsidian:");
      for (const path of openPaths) {
        lines.push(`- ${path}`);
      }
    }

    if (selection) {
      lines.push("");
      lines.push(`Selected text (from ${selection.sourcePath}):`);
      lines.push('"""');
      lines.push(selection.text);
      if (selection.truncated) {
        lines.push("[truncated]");
      }
      lines.push('"""');
    }

    lines.push("</system-reminder>");
    return lines.join("\n");
  }
}
