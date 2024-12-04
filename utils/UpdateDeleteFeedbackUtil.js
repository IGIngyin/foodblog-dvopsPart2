const fs = require("fs").promises;
const path = require("path");

const dataFilePath = path.join(__dirname, "foodblogs.json");

// Ensure the file exists
async function ensureFileExists() {
    try {
        await fs.access(dataFilePath);
    } catch (error) {
        await fs.writeFile(dataFilePath, JSON.stringify([]), "utf8");
    }
}

// Read JSON data from file
async function readJSON() {
    const data = await fs.readFile(dataFilePath, "utf8");
    return JSON.parse(data);
}

// Write JSON data to file
async function writeJSON(data) {
    await fs.writeFile(dataFilePath, JSON.stringify(data, null, 2), "utf8");
}

// Validation function
function validateFeedback(data) {
    const { restaurantName, location, visitDate, rating, content, imageUrl } =
        data;

    // Validate required fields
    if (
        !restaurantName ||
        !location ||
        !visitDate ||
        !rating ||
        !content ||
        !imageUrl
    ) {
        throw new Error("All fields are required.");
    }

    // Validate rating (1-5 range)
    if (rating < 1 || rating > 5) {
        throw new Error("Rating must be between 1 and 5.");
    }

    // Validate image URL format
    const imageUrlPattern = /\.(jpg|jpeg|png|gif)$/i; // Valid image file extensions
    if (!imageUrlPattern.test(imageUrl)) {
        throw new Error(
            "Invalid image URL. Must be a .jpg, .jpeg, .png, or .gif file."
        );
    }

    // Validate no special characters in restaurant name and location
    const specialCharPattern = /[!@#$%^&*(),.?":{}|<>]/g; // Detect special characters
    if (specialCharPattern.test(restaurantName)) {
        throw new Error("Restaurant name cannot contain special characters.");
    }
    if (specialCharPattern.test(location)) {
        throw new Error("Location name cannot contain special characters.");
    }

    // Validate feedback content length (at least 5 words)
    if (content.split(" ").filter(Boolean).length < 5) {
        throw new Error("Feedback content must be at least 5 words long.");
    }
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

        validateFeedback(req.body); // Validate the input data

        feedbackData[index] = { ...feedbackData[index], ...req.body };
        await writeJSON(feedbackData);

        res.status(201).json({ message: "Feedback updated successfully!" });
    } catch (error) {
        console.error("Error updating feedback:", error);
        res.status(500).json({ message: error.message });
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
