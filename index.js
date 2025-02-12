const express = require("express");
const path = require("path");
const client = require("prom-client"); // Added missing import
const app = express();
const PORT = 5000; // Ensure it matches Prometheus config
const register = new client.Registry();

// Enable default Prometheus metrics
client.collectDefaultMetrics({ register });

// Expose metrics at /metrics
app.get("/metrics", async (req, res) => {
    res.setHeader("Content-Type", register.contentType);
    res.end(await register.metrics());
    console.log("Metrics endpoint accessed"); // Log for debugging
});

// Import route handlers
const {
    updateFeedback,
    deleteFeedback,
    getFeedbackById,
    ensureFileExists,
} = require("./utils/UpdateDeleteFeedbackUtil");

const {
    getPostById,
    getComments,
    addComment,
} = require("./utils/UserComments");

const { addFeedback, getFeedback } = require("./utils/FoodblogUtil");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

const statusMonitor = require("express-status-monitor");
app.use(statusMonitor());

// Serve the main HTML file
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Feedback-related routes
app.get("/get-feedback", getFeedback);
app.post("/add-blogpost", addFeedback);
app.put("/edit-feedback/:id", updateFeedback);
app.delete("/delete-feedback/:id", deleteFeedback);

// UserComments-related routes
app.get("/get-post/:id", getPostById);
app.get("/get-comments/:id", getComments);
app.post("/add-comment/:id", addComment);

// Ensure necessary files exist before starting the server
ensureFileExists()
    .then(() => console.log("Required files are initialized."))
    .catch((err) => console.error("Error initializing files:", err));

// Start the server
const server = app.listen(PORT, () => {
    console.log(`Demo project running at: http://localhost:${PORT}`);
});

module.exports = { app, server };
