const fs = require("fs").promises;
const path = require("path");
const { v4: uuidv4 } = require("uuid");

const commentsFilePath = path.join(__dirname, "comments.json");
const foodblogsFilePath = path.join(__dirname, "foodblogs.json");
const bannedWordsFilePath = path.join(__dirname, "bannedWords.json");

// Utility to read JSON files
async function readJSON(filePath) {
    try {
        const data = await fs.readFile(filePath, "utf8");
        return JSON.parse(data);
    } catch (error) {
        if (error.code === "ENOENT") {
            console.warn(`File ${filePath} not found. Initializing.`);
            await fs.writeFile(filePath, JSON.stringify({}, null, 2), "utf8");
            return {}; // Return an empty object
        }
        throw error;
    }
}

// Utility to write JSON files
async function writeJSON(filePath, data) {
    try {
        await fs.writeFile(filePath, JSON.stringify(data, null, 2), "utf8");
    } catch (error) {
        console.error(`Error writing to file ${filePath}:`, error);
        throw error;
    }
}

// Load banned words dynamically from JSON
async function loadBannedWords() {
    try {
        const data = await fs.readFile(bannedWordsFilePath, "utf8");
        return JSON.parse(data);
    } catch (error) {
        console.error("Error loading banned words:", error);
        return []; // Return an empty list if the file cannot be read
    }
}

// Check for banned words
async function containsBannedWords(text) {
    const bannedWords = await loadBannedWords();
    console.log("Banned words:", bannedWords);
    console.log("Comment to check:", text);

    if (!bannedWords || bannedWords.length === 0) {
        console.warn("No banned words loaded.");
        return false;
    }

    const regex = new RegExp(`\\b(${bannedWords.join("|")})\\b`, "i");
    return regex.test(text);
}


// Add a new comment
async function addComment(req, res) {
    const { id } = req.params;
    const { text } = req.body;

    const MAX_COMMENT_LENGTH = 200;

    try {
        // Validate post ID format
        if (!/^[a-zA-Z0-9-_]+$/.test(id)) {
            return res.status(400).json({ message: "Invalid post ID format." });
        }

        // Validate post existence
        const posts = await readJSON(foodblogsFilePath);
        const postExists = posts.some((post) => post.id === id);
        if (!postExists) {
            return res.status(404).json({ message: "Post ID does not exist." });
        }

        // Validate empty or missing comment
        if (!text || text.trim() === "") {
            return res.status(400).json({ message: "Comment cannot be empty." });
        }

        // Validate inappropriate language
        if (await containsBannedWords(text)) {
            return res.status(400).json({
                message: "Your comment contains inappropriate language.",
            });
        }

        // Validate comment length
        if (text.length > MAX_COMMENT_LENGTH) {
            return res.status(400).json({
                message: `Comment exceeds maximum allowed length of ${MAX_COMMENT_LENGTH} characters.`,
            });
        }

        // Add comment to JSON
        const comments = await readJSON(commentsFilePath);
        if (!comments[id]) comments[id] = [];
        const newComment = {
            id: uuidv4(),
            text,
            timestamp: new Date().toISOString(),
        };
        comments[id].push(newComment);
        await writeJSON(commentsFilePath, comments);

        return res.status(201).json({
            message: "Comment added successfully.",
            comment: newComment,
        });
    } catch (error) {
        console.error("Error adding comment:", error);
        return res.status(500).json({ message: "Internal server error." });
    }
}


// Get comments for a post
async function getComments(req, res) {
    const { id } = req.params;

    try {
        const comments = await readJSON(commentsFilePath);
        if (!comments[id] || comments[id].length === 0) {
            return res.status(404).json({ message: "No comments found for this post." });
        }
        return res.status(200).json(comments[id]);
    } catch (error) {
        console.error("Error fetching comments:", error);
        return res.status(500).json({ message: "Internal server error." });
    }
}

// Get post by ID
async function getPostById(req, res) {
    const { id } = req.params;
    try {
        const posts = await readJSON(foodblogsFilePath);
        const post = posts.find((p) => p.id === id);

        if (post) {
            res.status(200).json(post);
        } else {
            res.status(404).json({ message: "Post not found." });
        }
    } catch (error) {
        console.error("Error retrieving post by ID:", error);
        res.status(500).json({ message: "Internal server error." });
    }
}

module.exports = {
    getPostById,
    getComments,
    addComment,
};
