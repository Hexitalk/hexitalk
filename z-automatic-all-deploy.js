const { exec } = require("child_process");
const fs = require("fs");
const path = require("path");

const directories = [
  "./auth-ms",
  "./chat-ms",
  "./client-gateway-ms",
  "./hub-ms",
  "./profiles-ms",
  "./socket-ms",
  "./users-ms",
  // "./web-client",
];

async function showMessage(msg) {
  return new Promise((resolve) => {
    //console.clear();
    console.log(msg);
    setTimeout(() => {
      resolve();
    }, 100);
  });
}

function runCommand(command, dir) {
  return new Promise((resolve, reject) => {
    const process = exec(command, { cwd: dir });

    console.log(`> Command: ${command}...`);

    process.stdout.on("data", (data) => {
      console.log(`\t > ${data}`.replace("\n", ""));
    });

    process.stderr.on("data", (data) => {
      console.log(`\t > ${data}`.replace("\n", ""));
    });

    process.on("close", (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`El proceso en ${dir} terminó con el código ${code}`));
      }
    });
  });
}

async function pushAllReposDeploy() {
  await showMessage(`---------------------------------`);

  for (const dir of directories) {
    const projectName = dir.replace("/", "").replace(".", "");
    const absolutePath = path.resolve(dir);

    await showMessage(`# Project: ${projectName.toUpperCase()}`);
    await showMessage(`> Checking path: ${absolutePath}...`);

    if (fs.existsSync(absolutePath)) {
      await showMessage(`> Path: ${absolutePath} OK!`);
      try {
        await showMessage(`> Checking git: ...`);
        if (fs.existsSync(`${absolutePath}/.git`)) {
          await showMessage(`> Checking git: OK!`);
        }

        await runCommand("git switch deploy", absolutePath);
        await runCommand("git merge main", absolutePath);
        await runCommand("git switch main", absolutePath);
        await runCommand("git push --all", absolutePath);
      } catch (error) {
        console.error(`Directory not found: ${absolutePath}`);
      }
    } else {
      console.error(`El directorio ${absolutePath} no existe.`);
    }

    await showMessage(`---------------------------------`);
  }
}

pushAllReposDeploy();
