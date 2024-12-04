const fs = require("fs").promises;
const path = require("path");

const dataFilePath = path.join(__dirname, "foodblogs.json");

async function readJSON() {
    const data = await fs.readFile(dataFilePath, "utf8");
    return JSON.parse(data);
}

async function writeJSON(data) {
    await fs.writeFile(dataFilePath, JSON.stringify(data, null, 2), "utf8");
}

// Get all feedback entries
async function getFeedback(req, res) {
    try {
        const feedbackData = await readJSON();
        res.status(200).json(feedbackData);
    } catch (error) {
        console.error("Error fetching feedback:", error);
        res.status(500).json({ message: "Unable to fetch feedback data." });
    }
}

// Add new feedback
async function addFeedback(req, res) {
    try {
        const {
            restaurantName,
            location,
            visitDate,
            rating,
            content,
            imageUrl,
        } = req.body;
        const newFeedback = {
            id: Date.now().toString(),
            restaurantName,
            location,
            visitDate,
            rating,
            content,
            imageUrl,
        };
        const feedbackData = await readJSON();
        feedbackData.push(newFeedback);
        await writeJSON(feedbackData);
        res.status(201).json({ message: "Feedback added successfully!" });
    } catch (error) {
        console.error("Error adding feedback:", error);
        res.status(500).json({ message: "Error adding feedback." });
    }
}

module.exports = {
    addFeedback,
    getFeedback,
};
