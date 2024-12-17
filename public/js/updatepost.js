// Retrieve and populate form data on update.html page load
document.addEventListener("DOMContentLoaded", () => {
    const feedbackData = JSON.parse(localStorage.getItem("feedbackToUpdate"));
    if (feedbackData) {
        if (document.getElementById("restaurantName"))
            document.getElementById("restaurantName").value =
                feedbackData.restaurantName || "";
        if (document.getElementById("location"))
            document.getElementById("location").value =
                feedbackData.location || "";
        if (document.getElementById("visitDate"))
            document.getElementById("visitDate").value =
                feedbackData.visitDate || "";
        if (document.getElementById("rating"))
            document.getElementById("rating").value = feedbackData.rating || "";
        if (document.getElementById("content"))
            document.getElementById("content").value =
                feedbackData.content || "";
        if (document.getElementById("imageFile"))
            document.getElementById("imageFile").value =
                feedbackData.imageUrl || "";

        localStorage.setItem("feedbackIdToUpdate", feedbackData.id);
    } else {
        console.error("No feedback data found in localStorage.");
    }
});

// Update feedback function with validation
function updateFeedback() {
    // Get form elements
    const restaurantName = document
        .getElementById("restaurantName")
        .value.trim();
    const location = document.getElementById("location").value.trim();
    const visitDate = document.getElementById("visitDate").value;
    const rating = document.getElementById("rating").value;
    const content = document.getElementById("content").value.trim();
    const imageUrl = document.getElementById("imageFile").value.trim();

    // Validate required fields
    if (
        !restaurantName ||
        !location ||
        !visitDate ||
        !rating ||
        !content ||
        !imageUrl
    ) {
        alert("Please fill in all required fields.");
        return;
    }

    // Validate rating (1-5 range)
    if (rating < 1 || rating > 5) {
        alert("Please enter a rating between 1 and 5.");
        return;
    }

    // Optional: Validate image URL format
    const imageUrlPattern = /\.(jpg|jpeg|png|gif)$/i; // Valid image file extensions
    if (!imageUrlPattern.test(imageUrl)) {
        alert(
            "Please provide a valid image URL with a valid file extension (e.g., .jpg, .png, .gif)."
        );
        return;
    }

    // Validate no special characters in restaurant name and location
    const specialCharPattern = /[!@#$%^&*(),.?":{}|<>]/g; // Detect special characters
    if (specialCharPattern.test(restaurantName)) {
        alert(
            "Please fill a proper name of the restaurant. Special characters cannot be included in the name of the restaurant."
        );
        return;
    }
    if (specialCharPattern.test(location)) {
        alert(
            "Please fill a proper name of the location. Special characters cannot be included in the location."
        );
        return;
    }

    // Validate feedback length
    if (content.split(" ").filter(Boolean).length < 5) {
        alert("Feedback must be at least 5 words long.");
        return;
    }

    // Retrieve feedback ID and prepare data
    const feedbackId = localStorage.getItem("feedbackIdToUpdate");
    const feedbackData = {
        restaurantName,
        location,
        visitDate,
        rating,
        content,
        imageUrl,
    };

    // Send update request
    fetch(`/edit-feedback/${feedbackId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(feedbackData),
    }).then((response) => {
        if (response.ok) {
            alert("Feedback updated successfully!");
            window.location.href = "index.html";
        } else {
            return response.json().then((data) => {
                const errorMessage =
                    data.message || "Failed to update feedback!";
                alert(errorMessage);
            });
        }
    });
    // .catch((error) => {
    //     console.error("Error updating feedback:", error);
    //     alert(
    //         error.message || "An error occurred while updating feedback."
    //     );
    // });
}

// Cancel function to return to the main page without saving changes
function cancelPost() {
    window.location.href = "index.html";
}
