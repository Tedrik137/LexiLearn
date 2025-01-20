const exec = require("child_process").exec;
const spawn = require("child_process").spawn;
const readline = require("readline");

// Inline utility functions
const green = (text) => `\x1b[32m${text}\x1b[0m`;
const yellow = (text) => `\x1b[33m${text}\x1b[0m`;
const red = (text) => `\x1b[31m${text}\x1b[0m`;

// Validate Android SDK Path
const validateAndroidHomeWin = (path) => {
  if (!path || !path.startsWith("/mnt/c/")) {
    console.error(
      red(
        "Invalid ANDROID_HOME_WIN path. Ensure it points to the Windows Android SDK."
      )
    );
    return false;
  }
  return true;
};

// Environment Variables
const ANDROID_HOME_WIN = process.env.ANDROID_HOME_WIN;
const RUN_CMD = `"${ANDROID_HOME_WIN}/emulator/emulator.exe"`;
const LIST_CMD = `"${ANDROID_HOME_WIN}/emulator/emulator.exe" -avd -list-avds`;

if (validateAndroidHomeWin(ANDROID_HOME_WIN)) {
  (async () => {
    await runEmulator();
  })();
}

function getDevices() {
  return new Promise((resolve, reject) => {
    exec(LIST_CMD, (error, stdout) => {
      if (error) {
        if (error.message.includes("emulator.exe")) {
          console.error(
            red(
              "Error retrieving device list. Ensure emulator binaries are accessible."
            )
          );
        } else {
          console.error(
            red(`Error retrieving list of devices: ${error.message}`)
          );
        }
        reject(error);
        return;
      }

      const devices = stdout
        .split("\n")
        .map((name) => name.trim())
        .filter((name) => name);

      resolve(devices);
    });
  });
}

async function runEmulator() {
  const emulators = await getDevices();

  if (emulators.length === 0) {
    console.log(red("No devices available."));
    return;
  }

  console.log("Select an emulator:\n");
  emulators.forEach((emulator, index) => {
    console.log(`   [${index + 1}] ${emulator}`);
  });

  const selectedEmulatorIndex = await getUserInput("\nEmulator: ");

  if (isValidIndex(selectedEmulatorIndex, emulators.length)) {
    const selectedEmulator = emulators[selectedEmulatorIndex - 1];
    console.log(green(`\nStarting ${selectedEmulator}...`));

    try {
      // Use an array for the command and its arguments
      const emulatorProcess = spawn(RUN_CMD, ["-avd", selectedEmulator], {
        stdio: "inherit",
        shell: true, // Use shell to handle path with spaces properly
      });

      emulatorProcess.on("close", (code) => {
        if (code !== 0) {
          console.log(red(`${selectedEmulator} exited with error.`));
        } else {
          console.log(yellow(`${selectedEmulator} exited gracefully.`));
        }
      });
    } catch (err) {
      console.error(red("Error running emulator."));
      console.error(err.message);
    }
  } else {
    console.log(red("Invalid selection."));
  }
}

function getUserInput(prompt) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question(prompt, (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

function isValidIndex(index, arrayLength) {
  const num = parseInt(index, 10);
  return !isNaN(num) && num >= 1 && num <= arrayLength;
}
