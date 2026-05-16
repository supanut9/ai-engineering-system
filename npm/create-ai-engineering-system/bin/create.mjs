#!/usr/bin/env node
// create-ai-engineering-system
//
// Thin Node wrapper around scripts/init-project.sh from the
// ai-engineering-system repo. Lets users run:
//
//   npm create ai-engineering-system@latest -- --name my-app --stack go-gin-hexagonal
//
// instead of cloning the system repo manually.
//
// Behavior:
//   1. Resolve the system source.
//      a. AI_ENG_SYSTEM_HOME env var if set.
//      b. A walked-up local checkout (when the wrapper is run from inside the
//         system repo, e.g. during development).
//      c. Otherwise: shallow-clone the public repo into a temp directory at
//         the tag matching this package's version.
//   2. Verify bash >= 4 is on PATH (init-project.sh requires it).
//   3. Exec bash <system>/scripts/init-project.sh with all forwarded args.
//   4. Clean up the temp clone on exit (if we made one).

import { spawnSync, execFileSync } from "node:child_process";
import { existsSync, mkdtempSync, readFileSync, rmSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { tmpdir } from "node:os";
import { fileURLToPath } from "node:url";
import process from "node:process";

const REPO_URL = "https://github.com/supanut9/ai-engineering-system.git";
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// ----------------------------------------------------------
// Read this package's version (used to pin the cloned tag)
// ----------------------------------------------------------
function readPackageVersion() {
  const pkgPath = resolve(__dirname, "..", "package.json");
  try {
    const pkg = JSON.parse(readFileSync(pkgPath, "utf8"));
    return pkg.version ?? "0.0.0";
  } catch {
    return "0.0.0";
  }
}
const PKG_VERSION = readPackageVersion();

// ----------------------------------------------------------
// Logging helpers
// ----------------------------------------------------------
const info  = (msg) => process.stderr.write(`[info] ${msg}\n`);
const warn  = (msg) => process.stderr.write(`[warn] ${msg}\n`);
const fatal = (msg) => { process.stderr.write(`[fatal] ${msg}\n`); process.exit(1); };

// ----------------------------------------------------------
// Argument handling — pass-through to init-project.sh,
// but recognise --help so we can print our own banner.
// ----------------------------------------------------------
const argv = process.argv.slice(2);
if (argv.length === 0 || argv.includes("--help") || argv.includes("-h")) {
  process.stdout.write(`\
create-ai-engineering-system v${PKG_VERSION}

Usage:
  npm create ai-engineering-system@latest -- --name <name> --stack <stack> [options]

This is a thin wrapper around the AI Engineering System's init-project.sh.
All flags after the '--' separator are forwarded verbatim.

Common flags forwarded:
  --name  <name>    Project directory name
  --stack <stack>   One of: go-gin-layered | go-gin-clean | go-gin-hexagonal |
                            nestjs-layered | nextjs-default | fastify-hexagonal |
                            fastapi-layered | react-native-expo
  --agent <agent>   claude | codex | both    (default: claude)
  --git / --no-git  Initialise a git repo    (default: --git)
  --target <path>  Destination path          (default: ./<name>)

Wrapper-specific environment variables:
  AI_ENG_SYSTEM_HOME   Path to a local ai-engineering-system checkout. When set,
                       the wrapper uses it instead of cloning from GitHub.
  AI_ENG_KEEP_TMP=1    Keep the temporary clone on exit (debugging).

Examples:
  npm create ai-engineering-system@latest -- --name my-api --stack go-gin-hexagonal
  npm create ai-engineering-system@latest -- --name my-app --stack nextjs-default --agent both
`);
  if (argv.length === 0) process.exit(1);
  process.exit(0);
}

// ----------------------------------------------------------
// Step 1: Resolve the system source
// ----------------------------------------------------------
function isSystemRoot(dir) {
  return existsSync(join(dir, "scripts", "init-project.sh"))
      && existsSync(join(dir, "VERSION"));
}

function walkUpForSystem(startDir) {
  let dir = startDir;
  // Walk up at most 6 levels — enough for monorepo dev, bounded so we don't
  // wander up to filesystem root on a published install.
  for (let i = 0; i < 6; i++) {
    if (isSystemRoot(dir)) return dir;
    const parent = dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  return null;
}

let systemHome;
let tmpClone = null;

if (process.env.AI_ENG_SYSTEM_HOME) {
  const candidate = resolve(process.env.AI_ENG_SYSTEM_HOME);
  if (!isSystemRoot(candidate)) {
    fatal(`AI_ENG_SYSTEM_HOME does not look like an ai-engineering-system checkout: ${candidate}`);
  }
  systemHome = candidate;
  info(`Using local system at ${systemHome} (AI_ENG_SYSTEM_HOME)`);
} else {
  const local = walkUpForSystem(__dirname);
  if (local) {
    systemHome = local;
    info(`Using local system at ${systemHome} (walked up from wrapper)`);
  } else {
    tmpClone = mkdtempSync(join(tmpdir(), "ai-eng-system-"));
    const tag = `v${PKG_VERSION}`;
    info(`Cloning ai-engineering-system @ ${tag} into ${tmpClone}`);
    let cloneOk = false;
    try {
      execFileSync("git", [
        "clone", "--depth", "1", "--branch", tag, REPO_URL, tmpClone
      ], { stdio: ["ignore", "inherit", "inherit"] });
      cloneOk = true;
    } catch {
      warn(`Tag ${tag} not found upstream; falling back to default branch.`);
    }
    if (!cloneOk) {
      try {
        execFileSync("git", [
          "clone", "--depth", "1", REPO_URL, tmpClone
        ], { stdio: ["ignore", "inherit", "inherit"] });
      } catch (err) {
        fatal(`git clone failed: ${err?.message ?? String(err)}`);
      }
    }
    if (!isSystemRoot(tmpClone)) {
      fatal(`Cloned repo at ${tmpClone} is missing scripts/init-project.sh — incompatible system version?`);
    }
    systemHome = tmpClone;
  }
}

// ----------------------------------------------------------
// Step 2: Verify bash >= 4 is on PATH
// ----------------------------------------------------------
function checkBash() {
  const probe = spawnSync("bash", [
    "-c",
    "if (( BASH_VERSINFO[0] < 4 )); then exit 99; fi; echo \"${BASH_VERSION}\""
  ], { encoding: "utf8" });
  if (probe.error) {
    fatal(`bash is not on PATH: ${probe.error.message}`);
  }
  if (probe.status === 99) {
    fatal("bash 4+ is required. On macOS, install a newer bash:  brew install bash");
  }
  if (probe.status !== 0) {
    fatal(`bash check failed (exit ${probe.status}): ${probe.stderr?.trim() ?? ""}`);
  }
  info(`bash ${probe.stdout.trim()}`);
}
checkBash();

// ----------------------------------------------------------
// Step 3: Exec init-project.sh
// ----------------------------------------------------------
const initScript = join(systemHome, "scripts", "init-project.sh");
if (!existsSync(initScript)) {
  fatal(`init-project.sh not found at ${initScript}`);
}

info(`Running ${initScript} ${argv.join(" ")}`);
const run = spawnSync("bash", [initScript, ...argv], { stdio: "inherit" });

// ----------------------------------------------------------
// Step 4: Cleanup
// ----------------------------------------------------------
function cleanup() {
  if (tmpClone && !process.env.AI_ENG_KEEP_TMP) {
    try { rmSync(tmpClone, { recursive: true, force: true }); } catch { /* ignore */ }
  }
}
process.on("exit", cleanup);
process.on("SIGINT", () => { cleanup(); process.exit(130); });
process.on("SIGTERM", () => { cleanup(); process.exit(143); });

if (run.error) fatal(`failed to spawn init-project.sh: ${run.error.message}`);
process.exit(run.status ?? 1);
