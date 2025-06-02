#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const os = require("os");
const { program } = require("commander");
const simpleGit = require("simple-git");
const ejs = require("ejs");

const GIT_REPO_URL = "https://github.com/mojaloop/ml-reference-connectors.git";
const validModes = ["fxp", "dfsp"];

program
  .option("-m, --mode <mode>", "Mode: fxp or dfsp")
  .option("-n, --name <name>", "Name of the connector project");

program.parse(process.argv);
const { mode, name } = program.opts();

if (!mode || !name) {
  console.error("Both --mode and --name options are required.");
  process.exit(1);
}

if (!validModes.includes(mode)) {
  console.error(`Invalid mode. Must be one of: ${validModes.join(", ")}`);
  process.exit(1);
}

const destDir = path.resolve(process.cwd(), name);
if (fs.existsSync(destDir)) {
  console.error(`Folder "${name}" already exists in this directory.`);
  process.exit(1);
}

const tmpDir = path.join(os.tmpdir(), `core-connector-templates-${Date.now()}`);
const examplePath = `examples/${mode}`;

function renderTemplateDir(src, dest, data) {
  fs.mkdirSync(dest, { recursive: true });

  for (const entry of fs.readdirSync(src)) {
    const srcPath = path.join(src, entry);
    const destPath = path.join(dest, entry);
    const stat = fs.statSync(srcPath);

    if (stat.isDirectory()) {
      renderTemplateDir(srcPath, destPath, data);
    } else {
      const content = fs.readFileSync(srcPath, "utf-8");
      const rendered = ejs.render(content, data);
      fs.writeFileSync(destPath, rendered);
    }
  }
}

(async () => {
  const git = simpleGit();

  try {
    console.log("Cloning template repository...");
    await git.clone(GIT_REPO_URL, tmpDir, ["--branch", "main", "--single-branch"]);

    const templatePath = path.join(tmpDir, examplePath);
    if (!fs.existsSync(templatePath)) {
      throw new Error(`Template "${mode}" not found in repo.`);
    }

    console.log(`Rendering ${mode} template with project name "${name}"...`);
    renderTemplateDir(templatePath, destDir, { projectName: name });

    console.log(`✅ Connector project created at ${destDir}`);
  } catch (err) {
    console.error("❌ Error:", err.message);
  } finally {
    try {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    } catch (cleanupErr) {
      console.warn("⚠️ Could not remove temp directory:", cleanupErr.message);
    }
  }
})();

process.on("SIGINT", () => {
  try {
    if (fs.existsSync(tmpDir)) {
      fs.rmSync(tmpDir, { recursive: true, force: true });
      console.log("\n🧹 Temp directory cleaned up after Ctrl+C");
    }
  } catch (err) {
    console.warn("\n⚠️ Failed to cleanup temp directory:", err.message);
  } finally {
    process.exit(130); // Exit with code for SIGINT
  }
});
