// eslint-disable-next-line @typescript-eslint/no-var-requires
const spawn = require("cross-spawn");

const TOTAL_SPAWN_STEPS = 8;

const main = async () => {
  let currentSpawnStep = 0;

  const logProgress = message => {
    currentSpawnStep += 1;
    console.log(
      `\n\x1b[36m${currentSpawnStep}/${TOTAL_SPAWN_STEPS} ${message}...\x1b[0m\n`
    );
  };

  const spawnPromise = (command, args, message) =>
    new Promise((resolve, reject) => {
      logProgress(message);
      const childProcess = spawn(command, args, { stdio: "inherit" });
      childProcess.on("close", code => {
        if (code === 0) {
          resolve();
        } else {
          reject(
            new Error(`${command} ${args.join(" ")} exited with code ${code}`)
          );
        }
      });
    });

  const spawnStart = async message =>
    new Promise((resolve, reject) => {
      logProgress(message);
      process.env.FORCE_COLOR = true;
      const childProcess = spawn("npm", ["run", "start"], { env: process.env });
      childProcess.stdout.on("data", data => {
        process.stdout.write(data);
        if (data.toString().includes("server is up")) {
          console.log("\nContinue to next step? (Y/n)...");
        }
      });
      childProcess.stderr.on("data", data => {
        process.stderr.write(data);
      });
      process.stdin.setRawMode(true);
      process.stdin.once("data", data => {
        childProcess.kill();
        process.stdin.setRawMode(false);
        if (data.toString() === "n") {
          reject(new Error("Aborted"));
        } else {
          resolve();
        }
      });
    });

  try {
    await spawnPromise(
      "npm",
      ["install"],
      "Preparing install for TSC and ESLint checks"
    );
    await spawnPromise("npm", ["run", "tsc"], "Typescript checks");
    await spawnPromise("npm", ["run", "eslint"], "ESLint checks");
    await spawnPromise("npm", ["run", "test"], "Run unit tests");
    await spawnPromise(
      "npm",
      ["install", "--omit=dev"],
      "Preparing install for production launch"
    );
    await spawnPromise("npm", ["run", "build"], "Production build");
    await spawnStart("Production start");
    await spawnPromise(
      "npm",
      ["install"],
      "Testing successful! Reverting to development install"
    );
  } catch (e) {
    console.error(e);
  } finally {
    process.exit(0);
  }
};

main();
