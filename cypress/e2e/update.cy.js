describe("Update and Delete Feedback - Frontend Tests", () => {
    let feedbackId;

    before(() => {
        // Start the server and navigate to the update page
        cy.task("startServer").then((baseUrl) => {
            cy.visit(`${baseUrl}/update.html`);
            // Simulate setting the feedbackId in localStorage
            feedbackId = "test-feedback-id"; // Replace this with actual ID for testing
            localStorage.setItem("feedbackIdToUpdate", feedbackId);
        });
    });

    after(() => {
        // Stop the server after tests
        cy.task("stopServer");
    });

    it("should update feedback successfully", () => {
        // Fill in the form with valid data and submit
        cy.get("#restaurantName").clear().type("Updated Restaurant Name");
        cy.get("#location").clear().type("Updated Location");
        cy.get("#visitDate").clear().type("2024-12-01");
        cy.get("#rating").clear().type("4");
        cy.get("#content")
            .clear()
            .type("Updated feedback for restaurant, good food.");
        cy.get("#imageFile").clear().type("https://example.com/image.jpg");

        // Click save changes button
        cy.contains("Save Changes").click();

        // Assert the success message
        cy.on("window:alert", (text) => {
            expect(text).to.equal("Feedback updated successfully!");
        });
    });

    it("should show validation error for missing fields", () => {
        // Clear all fields to trigger validation
        cy.get("#restaurantName").clear();
        cy.get("#location").clear();
        cy.get("#visitDate").clear();
        cy.get("#rating").clear();
        cy.get("#content").clear();
        cy.get("#imageFile").clear();

        // Click save changes button
        cy.contains("Save Changes").click();

        // Assert the alert message for validation
        cy.on("window:alert", (text) => {
            expect(text).to.equal("Please fill in all required fields.");
        });
    });

    it("should delete feedback successfully", () => {
        // Confirm delete action
        cy.window().then((win) => {
            cy.stub(win, "confirm").returns(true);
        });

        // Click delete button
        cy.get(`#post-${feedbackId}`).within(() => {
            cy.contains("Delete").click();
        });

        // Assert the success message
        cy.on("window:alert", (text) => {
            expect(text).to.equal("Post deleted successfully!");
        });
    });

    it("should cancel the update process", () => {
        // Click the cancel button
        cy.contains("Cancel").click();

        // Assert that the URL is redirected to index.html
        cy.url().should("include", "index.html");
    });
});
