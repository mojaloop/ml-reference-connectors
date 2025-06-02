#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const os = require("os");
const { program } = require("commander");
const simpleGit = require("simple-git");
const { rmSync, cpSync, existsSync } = fs;

const GIT_REPO_URL = "https://github.com/mojaloop/ml-reference-connectors.git"; // replace with your repo

program
  .option("-m, --mode <mode>", "Mode: fxp or dfsp")
  .option("-n, --name <name>", "Name of the connector project");

program.parse(process.argv);

const { mode, name } = program.opts();
const validModes = ["fxp", "dfsp"];

if (!mode || !name) {
  console.error("Both --mode and --name options are required.");
  process.exit(1);
}

if (!validModes.includes(mode)) {
  console.error(`Invalid mode. Must be one of: ${validModes.join(", ")}`);
  process.exit(1);
}

const destDir = path.resolve(process.cwd(), name);
if (existsSync(destDir)) {
  console.error(`Folder "${name}" already exists in this directory.`);
  process.exit(1);
}

const tmpDir = path.join(os.tmpdir(), `core-connector-templates-${Date.now()}`);
const examplePath = `examples/${mode}`;

(async () => {
  const git = simpleGit();

  try {
    console.log("Cloning template repository...");
    await git.clone(GIT_REPO_URL, tmpDir);
    await git.cwd(tmpDir);
    await git.checkout("ft/core-connector-lib");

    const templatePath = path.join(tmpDir, examplePath);
    if (!existsSync(templatePath)) {
      throw new Error(`Template "${mode}" not found in repo.`);
    }

    console.log(`Copying ${mode} template...`);
    cpSync(templatePath, destDir, { recursive: true });

    console.log(`✅ Connector project created at ${destDir}`);
  } catch (err) {
    console.error("❌ Error:", err.message);
  } finally {
    rmSync(tmpDir, { recursive: true, force: true });
  }
})();
