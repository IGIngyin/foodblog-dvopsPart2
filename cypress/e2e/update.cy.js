describe("Update and Delete Feedback - Frontend Tests", () => {
    let feedbackId;
    let url;

    before(() => {
        // Start the server and navigate to the update page
        cy.task("startServer", { timeout: 120000 }).then((baseUrl) => {
            url = baseUrl;
            cy.visit(`${baseUrl}/update.html`, {
                onBeforeLoad(win) {
                    localStorage.setItem(
                        "feedbackToUpdate",
                        JSON.stringify({
                            id: "1731264673358",
                            restaurantName: "Test Restaurant",
                            location: "Test Location",
                            visitDate: "2024-12-01",
                            rating: "4",
                            content: "Test feedback content.",
                            imageUrl: "https://example.com/image.jpg",
                        })
                    );
                },
            });
            // feedbackId = "test-feedback-id";
            // localStorage.setItem("feedbackIdToUpdate", feedbackId);
        });
    });

    beforeEach(() => {
        feedbackId = "1731264673358";
        localStorage.setItem("feedbackIdToUpdate", feedbackId);
    });

    after(() => {
        // Stop the server after tests
        cy.task("stopServer");
    });

    it("should update feedback successfully", () => {
        cy.visit(`${url}/update.html`);

        // Ensure form loads with initial data from session storage
        // cy.get("#restaurantName").should("have.value", "Test Restaurant");
        // cy.get("#location").should("have.value", "Test Location");
        // cy.get("#visitDate").should("have.value", "2024-12-01");
        // cy.get("#rating").should("have.value", "4");
        // cy.get("#content").should("have.value", "Test feedback content.");
        // cy.get("#imageFile").should(
        //     "have.value",
        //     "https://example.com/image.jpg"
        // );

        // Update form fields
        cy.get("#restaurantName")
            .clear()
            .type("Updated Restaurant", { force: true });
        cy.get("#location").clear().type("Updated Location", { force: true });
        cy.get("#visitDate").clear().type("2024-12-01", { force: true });
        cy.get("#rating").clear().type("5", { force: true });
        cy.get("#content")
            .clear()
            .type("Updated feedback content with five words.", { force: true });
        cy.get("#imageFile")
            .clear()
            .type("https://example.com/updated.jpg", { force: true });

        // Submit the form
        cy.contains("Save Changes").click();

        // Assert the success message
        cy.on("window:alert", (text) => {
            expect(text).to.equal("Feedback updated successfully!");
        });
    });

    it("should ask to fill in all required fields.", () => {
        cy.visit(`${url}/update.html`);

        // Update form fields
        cy.get("#restaurantName").clear();
        cy.get("#location").clear();
        cy.get("#visitDate").clear().type("2024-12-02");
        cy.get("#rating").clear().type("5");
        cy.get("#content")
            .clear()
            .type("Updated feedback content with five words.");
        cy.get("#imageFile").clear().type("https://example.com/updated.jpg");

        // Submit the form
        cy.contains("Save Changes").click();

        // Assert the success message
        cy.on("window:alert", (text) => {
            expect(text).to.equal("Please fill in all required fields.");
        });
    });

    it("should ask to enter a rating between 1 and 5.", () => {
        cy.visit(`${url}/update.html`);

        // Update form fields
        cy.get("#restaurantName").clear().type("Updated Restaurant");
        cy.get("#location").clear().type("Updated location");
        cy.get("#visitDate").clear().type("2024-12-02");
        cy.get("#rating").clear().type("8");
        cy.get("#content")
            .clear()
            .type("Updated feedback content with five words.");
        cy.get("#imageFile").clear().type("https://example.com/updated.jpg");

        // Submit the form
        cy.contains("Save Changes").click();

        // Assert the success message
        cy.on("window:alert", (text) => {
            expect(text).to.equal("Please enter a rating between 1 and 5.");
        });
    });

    it("should ask to fill in feedback must be at least 5 words long", () => {
        cy.visit(`${url}/update.html`);

        // Update form fields
        cy.get("#restaurantName").clear().type("Updated Restaurant");
        cy.get("#location").clear().type("Updated location");
        cy.get("#visitDate").clear().type("2024-12-02");
        cy.get("#rating").clear().type("5");
        cy.get("#content").clear().type("Updated feedback content.");
        cy.get("#imageFile").clear().type("https://example.com/updated.jpg");

        // Submit the form
        cy.contains("Save Changes").click();

        // Assert the success message
        cy.on("window:alert", (text) => {
            expect(text).to.equal("Feedback must be at least 5 words long.");
        });
    });

    it("should ask to fill a proper name of the restaurant", () => {
        cy.visit(`${url}/update.html`);

        // Update form fields
        cy.get("#restaurantName").clear().type("Updat$%ed Restaurant");
        cy.get("#location").clear().type("Updated location");
        cy.get("#visitDate").clear().type("2024-12-02");
        cy.get("#rating").clear().type("5");
        cy.get("#content")
            .clear()
            .type("Updated feedback content with five words.");
        cy.get("#imageFile").clear().type("https://example.com/updated.jpg");

        // Submit the form
        cy.contains("Save Changes").click();

        // Assert the success message
        cy.on("window:alert", (text) => {
            expect(text).to.equal(
                "Please fill a proper name of the restaurant. Special characters cannot be included in the name of the restaurant."
            );
        });
    });

    it("should ask to fill a proper name of the location", () => {
        cy.visit(`${url}/update.html`);

        // Update form fields
        cy.get("#restaurantName").clear().type("Updated Restaurant");
        cy.get("#location").clear().type("Updated$%^location");
        cy.get("#visitDate").clear().type("2024-12-02");
        cy.get("#rating").clear().type("5");
        cy.get("#content")
            .clear()
            .type("Updated feedback content with five words.");
        cy.get("#imageFile").clear().type("https://example.com/updated.jpg");

        // Submit the form
        cy.contains("Save Changes").click();

        // Assert the success message
        cy.on("window:alert", (text) => {
            expect(text).to.equal(
                "Please fill a proper name of the location. Special characters cannot be included in the location."
            );
        });
    });

    it("should ask to provide a valid image URL with a valid file extension", () => {
        cy.visit(`${url}/update.html`);

        // Update form fields
        cy.get("#restaurantName").clear().type("Updated Restaurant");
        cy.get("#location").clear().type("Updated location");
        cy.get("#visitDate").clear().type("2024-12-02");
        cy.get("#rating").clear().type("5");
        cy.get("#content")
            .clear()
            .type("Updated feedback content with five words.");
        cy.get("#imageFile").clear().type("https://example.com");

        // Submit the form
        cy.contains("Save Changes").click();

        // Assert the success message
        cy.on("window:alert", (text) => {
            expect(text).to.equal(
                "Please provide a valid image URL with a valid file extension (e.g., .jpg, .png, .gif)."
            );
        });
    });

    it("should cancel the update process", () => {
        cy.visit(`${url}/update.html`);
        // Click the cancel button
        cy.contains("Cancel").click();

        // Assert that the URL redirects to index.html
        cy.url().should("include", "index.html");
    });
});
