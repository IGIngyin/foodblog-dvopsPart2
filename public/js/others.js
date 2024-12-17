

//Fetch and display post details
async function loadPostDetails(postId) {
    toggleSpinner(true);
    try {
        const response = await fetch(`/get-post/${postId}`);
        // if (!response.ok) throw new Error("Failed to load post");

        const post = await response.json();

        document.getElementById("post-title").textContent = post.restaurantName;
        document.getElementById("post-location").textContent = `Location: ${post.location}`;
        document.getElementById("post-content").textContent = post.content;

        const imageElement = document.getElementById("post-image");
        imageElement.src =  "images/NoImag.jpg";
        if (post.imageUrl) imageElement.src = post.imageUrl 
        // imageElement.onerror = () => {
        //     imageElement.src = "images/NoImage.jpg";
        // };

        await loadComments(postId);
    } catch (error) {
        //console.error("Error loading post details:", error);
        //displayErrorMessage("Failed to load post details.");
    } finally {
        toggleSpinner(false);
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
    } 
    // else {
    //     displayErrorMessage("Post ID is missing in the URL.");
    // }
});