const { defineConfig } = require("cypress");
const { spawn } = require("child_process");
let server;
let baseUrl;

module.exports = defineConfig({
    e2e: {
        setupNodeEvents(on, config) {
            require("@cypress/code-coverage/task")(on, config);

            on("task", {
                startServer() {
                    return new Promise((resolve, reject) => {
                        if (server) {
                            resolve(baseUrl);
                        }

                        server = spawn("node", ["-r", "nyc", "index-test.js"]);
                        let resolved = false; // Track resolution

                        const timeout = setTimeout(() => {
                            if (!resolved) {
                                reject("Server startup timed out.");
                                server.kill();
                            }
                        }, 60000); // Timeout after 60 seconds

                        server.stdout.on("data", (data) => {
                            console.log(data.toString());
                            if (data.toString().includes("Demo project at:")) {
                                const baseUrlPrefix = "Demo project at: ";
                                const startIndex = data
                                    .toString()
                                    .indexOf(baseUrlPrefix);
                                if (startIndex !== -1) {
                                    baseUrl = data
                                        .toString()
                                        .substring(
                                            startIndex + baseUrlPrefix.length
                                        )
                                        .trim();
                                    clearTimeout(timeout); // Clear timeout on success
                                    resolved = true;
                                    resolve(baseUrl);
                                }
                            }
                        });

                        server.stderr.on("data", (data) => {
                            clearTimeout(timeout);
                            reject(data.toString());
                        });
                    });
                },

                stopServer() {
                    if (server) {
                        server.kill();
                    }
                    return null;
                },
            });

            return config;
        },
    },
});
