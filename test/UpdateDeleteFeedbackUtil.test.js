const { describe, it, before, after } = require("mocha");
const { expect } = require("chai");
const chai = require("chai");
const chaiHttp = require("chai-http");
const fs = require("fs").promises;
const path = require("path");
const { app, server } = require("../index");

chai.use(chaiHttp);

let baseUrl;
const corruptFilePath = path.join(__dirname, "../corrupt.json");
const originalFilePath = path.join(__dirname, "../foodblogs.json");

describe("UpdateDeleteFeedbackUtil Tests - Including Validation and Error Handling", () => {
    before(async () => {
        const { address, port } = await server.address();
        baseUrl = `http://${address === "::" ? "localhost" : address}:${port}`;
    });

    after(() => {
        return new Promise((resolve) => {
            server.close(() => {
                resolve();
            });
        });
    });

    let dynamicId;

    describe("GET /get-feedback", () => {
        it("should return all feedback", (done) => {
            chai.request(baseUrl)
                .get("/get-feedback")
                .end((err, res) => {
                    dynamicId = res.body[0]?.id; // Capture a valid ID
                    expect(res).to.have.status(200);
                    expect(res.body).to.be.an("array");
                    done();
                });
        });
    });

    describe("PUT /edit-feedback/:id - Validation Tests", () => {
        it("should update an existing feedback", (done) => {
            chai.request(baseUrl)
                .put(`/edit-feedback/${dynamicId}`)
                .send({
                    restaurantName: "Updated Restaurant",
                    location: "Updated Location",
                    visitDate: "2024-12-01", // Updated date
                    rating: 4,
                    content:
                        "Updated feedback for authentic Singaporean street food. Great experience!",
                    imageUrl: "https://example.com/updated-image.jpg",
                })
                .end((err, res) => {
                    expect(res).to.have.status(201); // Expect success status
                    expect(res.body.message).to.equal(
                        "Feedback updated successfully!"
                    );
                    done();
                });
        });

        it("should return error for missing required fields", (done) => {
            chai.request(baseUrl)
                .put(`/edit-feedback/${dynamicId}`)
                .send({
                    restaurantName: "", // Missing
                    location: "", // Missing
                    visitDate: "",
                    rating: "",
                    content: "",
                    imageUrl: "",
                })
                .end((err, res) => {
                    expect(res).to.have.status(500);
                    expect(res.body.message).to.equal(
                        "All fields are required."
                    );
                    done();
                });
        });

        it("should return error for invalid rating", (done) => {
            chai.request(baseUrl)
                .put(`/edit-feedback/${dynamicId}`)
                .send({
                    restaurantName: "Valid Name",
                    location: "Valid Location",
                    visitDate: "2024-12-01",
                    rating: 6, // Invalid
                    content: "This is a valid feedback.",
                    imageUrl: "https://example.com/image.jpg",
                })
                .end((err, res) => {
                    expect(res).to.have.status(500);
                    expect(res.body.message).to.equal(
                        "Rating must be between 1 and 5."
                    );
                    done();
                });
        });

        it("should return error for invalid image URL", (done) => {
            chai.request(baseUrl)
                .put(`/edit-feedback/${dynamicId}`)
                .send({
                    restaurantName: "Valid Name",
                    location: "Valid Location",
                    visitDate: "2024-12-01",
                    rating: 4,
                    content: "This is a valid feedback.",
                    imageUrl: "https://example.com/image.txt", // Invalid extension
                })
                .end((err, res) => {
                    expect(res).to.have.status(500);
                    expect(res.body.message).to.equal(
                        "Invalid image URL. Must be a .jpg, .jpeg, .png, or .gif file."
                    );
                    done();
                });
        });

        it("should return error for special characters in restaurant name", (done) => {
            chai.request(baseUrl)
                .put(`/edit-feedback/${dynamicId}`)
                .send({
                    restaurantName: "Invalid@Name!", // Invalid characters
                    location: "Valid Location",
                    visitDate: "2024-12-01",
                    rating: 4,
                    content: "This is a valid feedback.",
                    imageUrl: "https://example.com/image.jpg",
                })
                .end((err, res) => {
                    expect(res).to.have.status(500);
                    expect(res.body.message).to.equal(
                        "Restaurant name cannot contain special characters."
                    );
                    done();
                });
        });

        it("should return error for feedback content less than 5 words", (done) => {
            chai.request(baseUrl)
                .put(`/edit-feedback/${dynamicId}`)
                .send({
                    restaurantName: "Valid Name",
                    location: "Valid Location",
                    visitDate: "2024-12-01",
                    rating: 4,
                    content: "Too short", // Less than 5 words
                    imageUrl: "https://example.com/image.jpg",
                })
                .end((err, res) => {
                    expect(res).to.have.status(500);
                    expect(res.body.message).to.equal(
                        "Feedback content must be at least 5 words long."
                    );
                    done();
                });
        });
    });

    describe("DELETE /delete-feedback/:id - Validation and Error Handling", () => {
        it("should delete feedback successfully for valid ID", (done) => {
            chai.request(baseUrl)
                .delete(`/delete-feedback/${dynamicId}`)
                .end((err, res) => {
                    expect(res).to.have.status(200); // Success status
                    expect(res.body.message).to.equal(
                        "Feedback deleted successfully!"
                    );
                    done();
                });
        });

        it("should return error for invalid ID during delete", (done) => {
            chai.request(baseUrl)
                .delete(`/delete-feedback/invalid-id`)
                .end((err, res) => {
                    expect(res).to.have.status(404);
                    expect(res.body.message).to.equal("Feedback not found.");
                    done();
                });
        });
    });

    describe("Error Handling", () => {
        before(async () => {
            // Corrupt the file
            await fs.rename(originalFilePath, corruptFilePath);
            await fs.writeFile(originalFilePath, "invalid-json", "utf8");
        });

        after(async () => {
            // Restore the original file
            await fs.unlink(originalFilePath);
            await fs.rename(corruptFilePath, originalFilePath);
        });

        it("should handle JSON parsing error for GET /get-feedback/:id", (done) => {
            chai.request(baseUrl)
                .get(`/get-feedback/${dynamicId}`)
                .end((err, res) => {
                    expect(res).to.have.status(500);
                    expect(res.body.message).to.equal(
                        "Error fetching feedback by ID."
                    );
                    done();
                });
        });

        it("should handle JSON parsing error for PUT /edit-feedback/:id", (done) => {
            chai.request(baseUrl)
                .put(`/edit-feedback/${dynamicId}`)
                .send({ content: "Testing error handling" })
                .end((err, res) => {
                    expect(res).to.have.status(500);
                    expect(res.body.message).to.equal(
                        "Error updating feedback."
                    );
                    done();
                });
        });

        it("should handle JSON parsing error for DELETE /delete-feedback/:id", (done) => {
            chai.request(baseUrl)
                .delete(`/delete-feedback/${dynamicId}`)
                .end((err, res) => {
                    expect(res).to.have.status(500);
                    expect(res.body.message).to.equal(
                        "Error deleting feedback."
                    );
                    done();
                });
        });
    });
});
