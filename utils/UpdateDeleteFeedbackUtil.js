const fs = require("fs").promises;
const path = require("path");
const dataFilePath = path.join(__dirname, "foodblogs.json");

// Ensure necessary files exist
async function ensureFileExists() {
    try {
        await fs.access(dataFilePath);
    } catch (error) {
        await fs.writeFile(dataFilePath, JSON.stringify([]), "utf8");
    }
}

// Read JSON data
async function readJSON(filename) {
    const data = await fs.readFile(filename, "utf8");
    return JSON.parse(data);
}

// Write JSON data
async function writeJSON(data, filename) {
    await fs.writeFile(filename, JSON.stringify(data, null, 2), "utf8");
}

// Fetch all feedback
async function getFeedback(req, res) {
    try {
        const feedbackData = await readJSON(dataFilePath);
        res.status(200).json(feedbackData);
    } catch (error) {
        console.error("Error fetching feedback:", error);
        res.status(500).json({ message: "Error fetching feedback." });
    }
}

// Add new feedback
async function addFeedback(req, res) {
    try {
        const { restaurantName, location, visitDate, rating, content, imageUrl } = req.body;

        // Validation: Ensure all required fields are present
        if (!restaurantName || !location || !visitDate || !rating || !content) {
            return res.status(400).json({ message: "All fields are required." });
        }

        // Validation: No special characters in restaurantName or location
        const specialCharPattern = /[!@#$%^&*(),.?":{}|<>]/g;
        if (specialCharPattern.test(restaurantName)) {
            return res.status(400).json({
                message:
                    "Please fill a proper name of the restaurant. Special characters cannot be included in the name of the restaurant.",
            });
        }
        if (specialCharPattern.test(location)) {
            return res.status(400).json({
                message:
                    "Please fill a proper location. Special characters cannot be included in the location.",
            });
        }

        // Validation: Ensure content is at least 5 words long
        const wordCount = content.split(" ").filter(Boolean).length;
        if (wordCount < 5) {
            return res.status(400).json({ message: "Feedback must be at least 5 words long." });
        }

        // Validation: Ensure imageUrl is valid
        const urlPattern = /\.(jpg|jpeg|png|gif)$/i; // Valid image extensions
        const validImageUrl = imageUrl && urlPattern.test(imageUrl) ? imageUrl : "images/NoImage.jpg";

        // Create new feedback object
        const newFeedback = {
            id: Date.now().toString(),
            restaurantName,
            location,
            visitDate,
            rating,
            content,
            imageUrl: validImageUrl,
        };

        const allPosts = await readJSON(dataFilePath);
        allPosts.push(newFeedback);
        await writeJSON(allPosts, dataFilePath);

        res.status(201).json({ success: true, message: "Feedback added successfully!", newFeedback });
    } catch (error) {
        console.error("Error adding feedback:", error);
        res.status(500).json({ message: "Error adding feedback." });
    }
}

// Fetch a specific feedback post by ID
async function getFeedbackById(req, res) {
    try {
        const { id } = req.params;
        const allPosts = await readJSON(dataFilePath);
        const feedback = allPosts.find((post) => post.id === id);

        if (!feedback) {
            return res.status(404).json({ message: "Feedback not found." });
        }

        res.status(200).json(feedback);
    } catch (error) {
        console.error("Error fetching feedback:", error);
        res.status(500).json({ message: "Error fetching feedback." });
    }
}

// Update feedback by ID
async function updateFeedback(req, res) {
    try {
        const { id } = req.params;
        const { restaurantName, location, visitDate, rating, content, imageUrl } = req.body;

        // Validation: Ensure all required fields are present
        if (!restaurantName || !location || !visitDate || !rating || !content || !imageUrl) {
            return res.status(400).json({ message: "All fields are required." });
        }

        // Validation: No special characters in restaurantName or location
        const specialCharPattern = /[!@#$%^&*(),.?":{}|<>]/g;
        if (specialCharPattern.test(restaurantName)) {
            return res.status(400).json({
                message:
                    "Please fill a proper name of the restaurant. Special characters cannot be included in the name of the restaurant.",
            });
        }
        if (specialCharPattern.test(location)) {
            return res.status(400).json({
                message:
                    "Please fill a proper location. Special characters cannot be included in the location.",
            });
        }

        // Validation: Ensure content is at least 5 words long
        const wordCount = content.split(" ").filter(Boolean).length;
        if (wordCount < 5) {
            return res.status(400).json({ message: "Feedback must be at least 5 words long." });
        }

        // Validation: Ensure imageUrl is valid
        const imageUrlPattern = /\.(jpg|jpeg|png|gif)$/i; // Valid image extensions
        if (!imageUrlPattern.test(imageUrl)) {
            return res.status(400).json({
                message: "Invalid image URL format. Must end with .jpg, .jpeg, .png, or .gif.",
            });
        }

        const allPosts = await readJSON(dataFilePath);
        const postIndex = allPosts.findIndex((post) => post.id === id);

        if (postIndex === -1) {
            return res.status(404).json({ message: "Feedback not found." });
        }

        allPosts[postIndex] = {
            ...allPosts[postIndex],
            restaurantName,
            location,
            visitDate,
            rating,
            content,
            imageUrl,
        };
        await writeJSON(allPosts, dataFilePath);
        return res.status(200).json({ message: "Feedback modified successfully!" });
    } catch (error) {
        console.error("Error updating feedback:", error);
        return res.status(500).json({ message: "Error updating feedback." });
    }
}

// Delete feedback by ID
async function deleteFeedback(req, res) {
    try {
        const { id } = req.params;
        const allPosts = await readJSON(dataFilePath);
        const filteredPosts = allPosts.filter((post) => post.id !== id);

        if (allPosts.length === filteredPosts.length) {
            return res.status(404).json({ message: "Feedback not found." });
        }

        await writeJSON(filteredPosts, dataFilePath);
        return res.status(200).json({ message: "Feedback deleted successfully!" });
    } catch (error) {
        console.error("Error deleting feedback:", error);
        return res.status(500).json({ message: "Error deleting feedback." });
    }
}

module.exports = {
    ensureFileExists,
    readJSON,
    writeJSON,
    getFeedback,
    addFeedback,
    updateFeedback,
    deleteFeedback,
    getFeedbackById,
};
