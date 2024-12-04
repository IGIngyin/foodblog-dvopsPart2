const express = require("express");
const path = require("path");
const app = express();
const PORT = 3000;

// Import route handlers
const {
    addFeedback,
    getFeedback,
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

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

// Serve the main HTML file
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Feedback-related routes
app.get("/get-feedback", getFeedback);
app.post("/add-blogpost", addFeedback);
app.get("/get-feedback/:id", getFeedbackById);
app.put("/edit-feedback/:id", updateFeedback);
app.delete("/delete-feedback/:id", deleteFeedback);

// UserComments-related routes
app.get("/get-post/:id", getPostById);
app.get("/get-comments/:id", getComments);
app.post("/add-comment/:id", addComment);

// Ensure necessary files exist before starting the server
ensureFileExists()
    // .then(() => console.log("Required files are initialized."))
    .catch((err) => console.error("Error initializing files:", err));

// Start the server
const server = app.listen(PORT, () => {
    console.log(`Server started at: http://localhost:${PORT}`);
});

module.exports = { app, server };
