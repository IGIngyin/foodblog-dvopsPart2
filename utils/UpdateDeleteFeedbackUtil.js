const fs = require("fs").promises;
const path = require("path");

const dataFilePath = path.join(__dirname, "foodblogs.json");

async function ensureFileExists() {
    try {
        await fs.access(dataFilePath);
    } catch (error) {
        await fs.writeFile(dataFilePath, JSON.stringify([]), "utf8");
    }
}

async function readJSON() {
    const data = await fs.readFile(dataFilePath, "utf8");
    return JSON.parse(data);
}

async function writeJSON(data) {
    await fs.writeFile(dataFilePath, JSON.stringify(data, null, 2), "utf8");
}

// Fetch a specific feedback post by ID
async function getFeedbackById(req, res) {
    try {
        const feedbackData = await readJSON();
        const feedback = feedbackData.find((f) => f.id === req.params.id);
        if (!feedback) {
            return res.status(404).json({ message: "Feedback not found." });
        }
        res.status(200).json(feedback);
    } catch (error) {
        console.error("Error fetching feedback by ID:", error);
        res.status(500).json({ message: "Error fetching feedback by ID." });
    }
}

// Update feedback by ID
async function updateFeedback(req, res) {
    try {
        const { id } = req.params;
        const feedbackData = await readJSON();
        const index = feedbackData.findIndex((f) => f.id === id);
        if (index === -1) {
            return res.status(404).json({ message: "Feedback not found." });
        }
        feedbackData[index] = { ...feedbackData[index], ...req.body };
        await writeJSON(feedbackData);
        res.status(201).json({ message: "Feedback updated successfully!" });
    } catch (error) {
        console.error("Error updating feedback:", error);
        res.status(500).json({ message: "Error updating feedback." });
    }
}

// Delete feedback by ID
async function deleteFeedback(req, res) {
    try {
        const { id } = req.params;
        const feedbackData = await readJSON();
        const newFeedbackData = feedbackData.filter((f) => f.id !== id);
        if (feedbackData.length === newFeedbackData.length) {
            return res.status(404).json({ message: "Feedback not found." });
        }
        await writeJSON(newFeedbackData);
        res.status(200).json({ message: "Feedback deleted successfully!" });
    } catch (error) {
        console.error("Error deleting feedback:", error);
        res.status(500).json({ message: "Error deleting feedback." });
    }
}

module.exports = {
    getFeedbackById,
    updateFeedback,
    deleteFeedback,
    ensureFileExists,
};
