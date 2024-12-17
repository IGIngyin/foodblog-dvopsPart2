// Function to prepare feedback data for editing
function editFeedback(id) {
    fetch(`/get-feedback/${id}`)
        .then((response) => response.json())
        .then((data) => {
            if (data) {
                localStorage.setItem("feedbackToUpdate", JSON.stringify(data));
                window.location.href = "update.html"; // Navigate to update page
            } else {
                alert("Failed to load feedback data for editing.");
            }
        })
        .catch((error) =>
            console.error("Error fetching feedback data:", error)
        );
}

// Function to delete feedback
function deleteFeedback(id) {
    const confirmDelete = confirm("Are you sure you want to delete this post?");
    if (confirmDelete) {
        fetch(`/delete-feedback/${id}`, {
            method: "DELETE",
        })
            .then((response) => response.json())
            .then((data) => {
                if (data.message === "Feedback deleted successfully!") {
                    alert("Post deleted successfully!");
                    const postElement = document.getElementById(`post-${id}`);
                    if (postElement) {
                        postElement.remove(); // Remove the element from the DOM
                    }
                } else {
                    alert("Failed to delete the post!");
                }
            })
            .catch((error) => console.error("Error deleting feedback:", error));
    }
}
