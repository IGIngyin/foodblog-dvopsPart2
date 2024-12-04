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

describe("UpdateDeleteFeedbackUtil Tests - Including Error Handling", () => {
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

    describe("PUT /edit-feedback/:id", () => {
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
    });

    describe("DELETE /delete-feedback/:id", () => {
        it("should delete a feedback", (done) => {
            chai.request(baseUrl)
                .delete(`/delete-feedback/${dynamicId}`)
                .end((err, res) => {
                    expect(res).to.have.status(200); // Expect success status
                    expect(res.body.message).to.equal(
                        "Feedback deleted successfully!"
                    );
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
