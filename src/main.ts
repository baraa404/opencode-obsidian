import { Plugin, WorkspaceLeaf, Notice } from "obsidian";
import { OpenCodeSettings, DEFAULT_SETTINGS, OPENCODE_VIEW_TYPE } from "./types";
import { OpenCodeView } from "./OpenCodeView";
import { OpenCodeSettingTab } from "./SettingsTab";
import { ProcessManager, ProcessState } from "./ProcessManager";
import { registerOpenCodeIcons, OPENCODE_ICON_NAME } from "./icons";

export default class OpenCodePlugin extends Plugin {
  settings: OpenCodeSettings = DEFAULT_SETTINGS;
  private processManager: ProcessManager; 
  private stateChangeCallbacks: Array<(state: ProcessState) => void> = [];

  async onload(): Promise<void> {
    console.log("Loading OpenCode plugin");

    registerOpenCodeIcons();

    await this.loadSettings();

    const vaultPath = this.getVaultPath();
    const projectDirectory = this.getProjectDirectory();

    this.processManager = new ProcessManager(
      this.settings,
      vaultPath,
      projectDirectory,
      (state) => this.notifyStateChange(state)
    );

    console.log("[OpenCode] Configured with project directory:", projectDirectory);

    this.registerView(OPENCODE_VIEW_TYPE, (leaf) => new OpenCodeView(leaf, this));
    this.addSettingTab(new OpenCodeSettingTab(this.app, this));

    this.addRibbonIcon(OPENCODE_ICON_NAME, "OpenCode", () => {
      this.activateView();
    });

    this.addCommand({
      id: "toggle-opencode-view",
      name: "Toggle OpenCode panel",
      callback: () => {
        this.toggleView();
      },
      hotkeys: [
        {
          modifiers: ["Mod", "Shift"],
          key: "o",
        },
      ],
    });

    this.addCommand({
      id: "start-opencode-server",
      name: "Start OpenCode server",
      callback: () => {
        this.startServer();
      },
    });

    this.addCommand({
      id: "stop-opencode-server",
      name: "Stop OpenCode server",
      callback: () => {
        this.stopServer();
      },
    });

    if (this.settings.autoStart) {
      this.app.workspace.onLayoutReady(async () => {
        await this.startServer();
      });
    }

    console.log("OpenCode plugin loaded");
  }

  async onunload(): Promise<void> {
    this.stopServer();
    this.app.workspace.detachLeavesOfType(OPENCODE_VIEW_TYPE);
  }

  async loadSettings(): Promise<void> {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }

  async saveSettings(): Promise<void> {
    await this.saveData(this.settings);
    this.processManager.updateSettings(this.settings);
  }

  // Update project directory and restart server if running
  async updateProjectDirectory(directory: string): Promise<void> {
    this.settings.projectDirectory = directory;
    await this.saveData(this.settings);

    this.processManager.updateProjectDirectory(this.getProjectDirectory());

    // Restart server if it's currently running
    if (this.getProcessState() === "running") {
      this.stopServer();
      await this.startServer();
    }
  }

  // Get existing view leaf if any
  private getExistingLeaf(): WorkspaceLeaf | null {
    const leaves = this.app.workspace.getLeavesOfType(OPENCODE_VIEW_TYPE);
    return leaves.length > 0 ? leaves[0] : null;
  }

  // Activate or create the view
  async activateView(): Promise<void> {
    const existingLeaf = this.getExistingLeaf();

    if (existingLeaf) {
      this.app.workspace.revealLeaf(existingLeaf);
      return;
    }

    // Create new leaf in right sidebar
    const leaf = this.app.workspace.getRightLeaf(false);
    if (leaf) {
      await leaf.setViewState({
        type: OPENCODE_VIEW_TYPE,
        active: true,
      });
      this.app.workspace.revealLeaf(leaf);
    }
  }

  // Toggle view visibility
  async toggleView(): Promise<void> {
    const existingLeaf = this.getExistingLeaf();

    if (existingLeaf) {
      // Check if visible
      const rightSplit = this.app.workspace.rightSplit;
      if (rightSplit && !rightSplit.collapsed) {
        existingLeaf.detach();
      } else {
        this.app.workspace.revealLeaf(existingLeaf);
      }
    } else {
      await this.activateView();
    }
  }

  async startServer(): Promise<boolean> {
    const success = await this.processManager.start();
    if (success) {
      new Notice("OpenCode server started");
    }
    return success;
  }

  stopServer(): void {
    this.processManager.stop();
    new Notice("OpenCode server stopped");
  }

  getProcessState(): ProcessState {
    return this.processManager?.getState() ?? "stopped";
  }

  getLastError(): string | null {
    return this.processManager.getLastError() ?? null;
  }

  getServerUrl(): string {
    return this.processManager.getUrl() ?? `http://127.0.0.1:${this.settings.port}`;
  }

  onProcessStateChange(callback: (state: ProcessState) => void): () => void {
    this.stateChangeCallbacks.push(callback);
    return () => {
      const index = this.stateChangeCallbacks.indexOf(callback);
      if (index > -1) {
        this.stateChangeCallbacks.splice(index, 1);
      }
    };
  }

  private notifyStateChange(state: ProcessState): void {
    for (const callback of this.stateChangeCallbacks) {
      callback(state);
    }
  }

  private getVaultPath(): string {
    const adapter = this.app.vault.adapter as any;
    const vaultPath = adapter.basePath || "";
    if (!vaultPath) {
      console.warn("[OpenCode] Warning: Could not determine vault path");
    }
    return vaultPath;
  }

  getProjectDirectory(): string {
    if (this.settings.projectDirectory) {
      return this.settings.projectDirectory;
    }
    return this.getVaultPath();
  }
}
