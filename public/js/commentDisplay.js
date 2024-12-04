// Toggle spinner visibility
function toggleSpinner(show) {
    const spinner = document.getElementById("loading-spinner");
    if (spinner) {
        spinner.style.display = show ? "block" : "none";
    } else {
        console.warn("Spinner element not found in the DOM.");
    }
}

// Display an error message in the UI
function displayErrorMessage(message) {
    const errorMessage = document.getElementById("error-message");
    if (!errorMessage) {
        console.error("Error message element not found in the DOM.");
        return;
    }
    errorMessage.textContent = message;
    errorMessage.style.display = "block";
    setTimeout(() => {
        errorMessage.style.display = "none";
    }, 5000);
}

// Fetch and display post details
async function loadPostDetails(postId) {
    toggleSpinner(true);
    try {
        const response = await fetch(`/get-post/${postId}`);
        if (!response.ok) throw new Error("Failed to load post");

        const post = await response.json();

        document.getElementById("post-title").textContent = post.restaurantName;
        document.getElementById("post-location").textContent = `Location: ${post.location}`;
        document.getElementById("post-content").textContent = post.content;

        const imageElement = document.getElementById("post-image");
        imageElement.src = post.imageUrl || "images/NoImage.jpg";
        imageElement.onerror = () => {
            imageElement.src = "images/NoImage.jpg";
        };

        await loadComments(postId);
    } catch (error) {
        console.error("Error loading post details:", error);
        displayErrorMessage("Failed to load post details.");
    } finally {
        toggleSpinner(false);
    }
}

// Load comments for a post
async function loadComments(postId) {
    try {
        const response = await fetch(`/get-comments/${postId}`);
        if (!response.ok) throw new Error("Failed to load comments");

        const comments = await response.json();
        const commentsContainer = document.getElementById("comments-container");
        commentsContainer.innerHTML = ""; // Clear previous comments

        comments.forEach((comment) => {
            if (!comment.text) comment.text = "[No comment provided]";
            if (!comment.timestamp) comment.timestamp = new Date().toISOString();

            const commentDiv = document.createElement("div");
            commentDiv.classList.add("comment");
            commentDiv.textContent = `${comment.text} (Posted on: ${new Date(
                comment.timestamp
            ).toLocaleString()})`;
            commentsContainer.appendChild(commentDiv);
        });
    } catch (error) {
        console.error("Error loading comments:", error);
        displayErrorMessage("Failed to load comments.");
    }
}

// Add a new comment
let isSubmitting = false;
async function addComment(postId) {
    if (isSubmitting) return; // Prevent multiple submissions
    isSubmitting = true;

    const commentInput = document.getElementById("comment-input");
    const commentText = commentInput.value.trim();
    const addCommentBtn = document.getElementById("add-comment-btn");

    const MIN_COMMENT_LENGTH = 5;

    // Validate input on the frontend
    if (commentText === "") {
        alert("Comment cannot be empty!");
        isSubmitting = false;
        return;
    }
    if (commentText.length < MIN_COMMENT_LENGTH) {
        alert(`Comment must be at least ${MIN_COMMENT_LENGTH} characters long!`);
        isSubmitting = false;
        return;
    }

    addCommentBtn.disabled = true; // Disable button during submission
    try {
        const response = await fetch(`/add-comment/${postId}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ text: commentText }),
        });

        // Handle backend errors
        if (!response.ok) {
            const result = await response.json();
            if (result.message) {
                alert(result.message); // Display the backend's error message
            } else {
                throw new Error("Failed to add comment");
            }
            return;
        }

        // If successful, reload comments and clear input
        commentInput.value = "";
        await loadComments(postId);
        document
            .getElementById("comments-container")
            .lastElementChild.scrollIntoView({
                behavior: "smooth",
            });
    } catch (error) {
        console.error("Error adding comment:", error);
        displayErrorMessage("Failed to add comment.");
    } finally {
        addCommentBtn.disabled = false; // Re-enable button
        isSubmitting = false;
    }
}

// Initialize post details and comments on page load
document.addEventListener("DOMContentLoaded", () => {
    const postId = new URLSearchParams(window.location.search).get("id");
    if (postId) {
        loadPostDetails(postId);
        document
            .getElementById("add-comment-btn")
            .addEventListener("click", () => addComment(postId));
    } else {
        displayErrorMessage("Post ID is missing in the URL.");
    }
});
