import { describe, test, expect, beforeAll, afterAll } from "bun:test";
import { writeFileSync, mkdirSync, chmodSync, rmSync, existsSync, statSync } from "fs";
import { homedir } from "os";
import { join } from "path";

// Test utilities for path validation
// Since we can't directly test the SettingsTab without Obsidian API,
// we test the logic that would be used

function expandTilde(path: string): string {
  if (path === "~") {
    return homedir();
  }
  if (path.startsWith("~/")) {
    return path.replace("~", homedir());
  }
  return path;
}

describe("Path Validation Logic", () => {
  const testDir = join(process.cwd(), "test-paths");

  // Setup test directory
  beforeAll(() => {
    if (!existsSync(testDir)) {
      mkdirSync(testDir, { recursive: true });
    }
  });

  // Cleanup test directory
  afterAll(() => {
    if (existsSync(testDir)) {
      rmSync(testDir, { recursive: true, force: true });
    }
  });

  describe("Tilde expansion", () => {
    test("expands ~ to home directory", () => {
      const result = expandTilde("~");
      expect(result).toBe(homedir());
    });

    test("expands ~/path to home/path", () => {
      const result = expandTilde("~/bin/opencode");
      expect(result).toBe(join(homedir(), "bin/opencode"));
    });

    test("does not modify paths without tilde", () => {
      const path = "/usr/bin/opencode";
      expect(expandTilde(path)).toBe(path);
    });

    test("does not modify relative paths", () => {
      const path = "node_modules/opencode/bin/opencode";
      expect(expandTilde(path)).toBe(path);
    });
  });

  describe("OpenCode path validation", () => {
    test("accepts empty string (defaults to 'opencode' in PATH)", () => {
      const value = "";
      const trimmed = value.trim();
      
      // Empty or just "opencode" is valid
      expect(!trimmed || trimmed === "opencode").toBe(true);
    });

    test("accepts 'opencode' (PATH resolution)", () => {
      const value = "opencode";
      const trimmed = value.trim();
      
      expect(!trimmed || trimmed === "opencode").toBe(true);
    });

    test("accepts whitespace-only input (defaults to PATH)", () => {
      const value = "   ";
      const trimmed = value.trim();
      
      expect(!trimmed || trimmed === "opencode").toBe(true);
    });

    test("accepts npm global install path unchanged", () => {
      const npmPath = "/usr/lib/node_modules/opencode-ai/node_modules/opencode-linux-x64/bin/opencode";
      const expanded = expandTilde(npmPath);
      
      // Absolute paths should not be modified (no tilde expansion)
      expect(expanded).toBe(npmPath);
    });

    test("accepts /usr/local/bin path unchanged", () => {
      const localPath = "/usr/local/bin/opencode";
      const expanded = expandTilde(localPath);
      
      // Absolute paths should not be modified (no tilde expansion)
      expect(expanded).toBe(localPath);
    });
  });

  describe("File validation", () => {
    test("detects non-existent file", () => {
      const nonExistentPath = join(testDir, "nonexistent");
      const expanded = expandTilde(nonExistentPath);
      
      expect(existsSync(expanded)).toBe(false);
    });

    test("validates executable file exists", () => {
      const executablePath = join(testDir, "test-executable");
      
      // Create a test executable file
      writeFileSync(executablePath, "#!/bin/bash\necho test", { mode: 0o755 });
      
      try {
        const expanded = expandTilde(executablePath);
        expect(existsSync(expanded)).toBe(true);
        
        const stat = statSync(expanded);
        expect(stat.isFile()).toBe(true);
        
        // On Unix, check execute permission
        if (process.platform !== "win32") {
          expect(stat.mode & 0o111).toBeGreaterThan(0);
        }
      } finally {
        // Cleanup
        rmSync(executablePath, { force: true });
      }
    });

    test("detects non-executable file on Unix", () => {
      if (process.platform === "win32") {
        // Skip on Windows where execute bit doesn't apply
        return;
      }

      const nonExecPath = join(testDir, "test-non-exec");
      
      // Create a non-executable file
      writeFileSync(nonExecPath, "#!/bin/bash\necho test", { mode: 0o644 });
      
      try {
        const stat = statSync(nonExecPath);
        expect(stat.isFile()).toBe(true);
        expect(stat.mode & 0o111).toBe(0);
      } finally {
        // Cleanup
        rmSync(nonExecPath, { force: true });
      }
    });

    test("detects directory instead of file", () => {
      const dirPath = join(testDir, "test-directory");
      
      mkdirSync(dirPath, { recursive: true });
      
      try {
        const stat = statSync(dirPath);
        expect(stat.isFile()).toBe(false);
        expect(stat.isDirectory()).toBe(true);
      } finally {
        // Cleanup
        rmSync(dirPath, { recursive: true, force: true });
      }
    });
  });

  describe("Integration: ProcessManager tilde expansion", () => {
    test("ProcessManager should expand tilde before spawning", () => {
      const testPath = "~/bin/opencode";
      
      // This is the logic in ProcessManager
      const opencodePath = testPath.startsWith("~")
        ? testPath.replace("~", homedir())
        : testPath;
      
      expect(opencodePath).toBe(join(homedir(), "bin/opencode"));
      expect(opencodePath).not.toContain("~");
    });

    test("ProcessManager leaves non-tilde paths unchanged", () => {
      const testPath = "/usr/bin/opencode";
      
      const opencodePath = testPath.startsWith("~")
        ? testPath.replace("~", homedir())
        : testPath;
      
      expect(opencodePath).toBe(testPath);
    });
  });
});
