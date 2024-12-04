// Submit Post Function
function submitPost() {
    const restaurantName = document
        .getElementById("restaurantName")
        .value.trim();
    const location = document.getElementById("location").value.trim();
    const visitDate = document.getElementById("visitDate").value;
    const content = document.getElementById("content").value.trim();
    const imageUrl =
        document.getElementById("imageUrl").value.trim() ||
        "images/NoImage.jpg"; // Set default image if empty
    const rating = document.querySelector(
        'input[name="rating"]:checked'
    )?.value;

    const MIN_CONTENT_LENGTH = 5; // Minimum word count for feedback section
    const urlRegex = /(https?:\/\/|www\.)/i;

    // Validate required fields
    if (!restaurantName || !location || !visitDate || !content || !rating) {
        alert("All fields are required!");
        return;
    }

    // Validate restaurant name (no URLs)
    if (urlRegex.test(restaurantName)) {
        alert("Restaurant name should not contain URLs.");
        return;
    }

    // Validate content length
    const wordCount = content.trim().split(/\s+/).filter(Boolean).length;
    if (wordCount < MIN_CONTENT_LENGTH) {
        alert(`Feedback must be at least ${MIN_CONTENT_LENGTH} words.`);
        return;
    }

    const feedbackData = {
        restaurantName,
        location,
        visitDate,
        rating,
        content,
        imageUrl,
    };

    // Send POST request to add the post
    fetch("/add-blogpost", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(feedbackData),
    })
        .then((response) => {
            // Log raw response for debugging
            console.log("Raw response:", response);
            // alert("Post added successfully!");
            window.location.href = "index.html";

            if (!response.ok) {
                return response.text().then((message) => {
                    throw new Error(message);
                });
            }
            return response.json();
        })
        .then((response) => {
            // Log parsed response for debugging
            console.log("Parsed response JSON:", response);

            if (response.success) {
                window.location.href = "index.html";

                // Optional: Dynamically update the UI without refreshing
                addPostToDOM(feedbackData);

                // Redirect to the index page after a short delay

                // Delay for better user experience
            } else {
                alert(response.message || "Failed to add the post!");
            }
        })
        .catch((error) => {
            alert(error.message);
            console.error("Error occurred:", error);
        });
}

// Add the new post to the DOM dynamically (Optional, for better UX)
function addPostToDOM(feedbackData) {
    const postContainer = document.getElementById("post-list"); // Assuming you have a container with id "post-list"
    if (postContainer) {
        const newPost = document.createElement("div");
        newPost.className = "post"; // Update class as per your styling
        newPost.innerHTML = `
            <h3>${feedbackData.restaurantName}</h3>
            <p>${feedbackData.content}</p>
            <p>Rating: ${feedbackData.rating}</p>
            <p>Location: ${feedbackData.location}</p>
            <p>Visited on: ${feedbackData.visitDate}</p>
            <img src="${feedbackData.imageUrl}" alt="${feedbackData.restaurantName}" style="max-width: 100%; height: auto;">
        `;
        postContainer.appendChild(newPost);
    }
}

// Cancel Function
function cancelPost() {
    window.location.href = "index.html";
}
