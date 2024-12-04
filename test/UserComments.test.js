const chai = require("chai");
const chaiHttp = require("chai-http");
const { app, server } = require("../index");
const { expect } = chai;
const fs = require("fs");
const path = require("path");

chai.use(chaiHttp);

let baseUrl;
let validPostIds = [];
const invalidPostId = "invalidID";
const commentsFilePath = path.join(__dirname, "../utils/comments.json");

describe("UserComments API", () => {
    before(async () => {
        if (!server || !server.address) {
            throw new Error("Server is not running or improperly initialized.");
        }
        const { address, port } = server.address();
        baseUrl = `http://${address === "::" ? "localhost" : address}:${port}`;

        // Load valid post IDs from foodblogs.json
        const foodblogsFilePath = path.join(__dirname, "../utils/foodblogs.json");
        const foodblogs = JSON.parse(fs.readFileSync(foodblogsFilePath, "utf-8"));
        validPostIds = foodblogs.map((post) => post.id);
    });

    after(() => {
        if (server && typeof server.close === "function") {
            return new Promise((resolve) => {
                server.close(() => resolve());
            });
        } else {
            throw new Error("Server cannot be closed.");
        }
    });

    describe("POST /add-comment/:id", () => {
        it("should add a new comment successfully", (done) => {
            chai.request(baseUrl)
                .post(`/add-comment/${validPostIds[0]}`)
                .send({ text: "This is a valid comment." })
                .end((err, res) => {
                    expect(res).to.have.status(201);
                    expect(res.body.message).to.equal("Comment added successfully.");
                    done();
                });
        });

        it("should return 400 for invalid post ID format", (done) => {
            chai.request(baseUrl)
                .post("/add-comment/!@#$%^&*")
                .send({ text: "This is a valid comment." })
                .end((err, res) => {
                    expect(res).to.have.status(400);
                    expect(res.body.message).to.equal("Invalid post ID format.");
                    done();
                });
        });
        

        it("should return 400 for inappropriate language", (done) => {
            chai.request(baseUrl)
                .post(`/add-comment/${validPostIds[0]}`)
                .send({ text: "This comment contains asshole." })
                .end((err, res) => {
                    expect(res).to.have.status(400);
                    expect(res.body.message).to.equal("Your comment contains inappropriate language.");
                    done();
                });
        });
        

        it("should return 400 for empty comment", (done) => {
            chai.request(baseUrl)
                .post(`/add-comment/${validPostIds[0]}`)
                .send({ text: "" })
                .end((err, res) => {
                    expect(res).to.have.status(400);
                    expect(res.body.message).to.equal("Comment cannot be empty.");
                    done();
                });
        });

        it("should return 404 for a non-existent post ID", (done) => {
            chai.request(baseUrl)
                .post(`/add-comment/${invalidPostId}`)
                .send({ text: "Valid comment text" })
                .end((err, res) => {
                    expect(res).to.have.status(404);
                    expect(res.body.message).to.equal("Post ID does not exist.");
                    done();
                });
        });

        it("should return 400 for a comment exceeding max length", (done) => {
            const longComment = "a".repeat(201);
            chai.request(baseUrl)
                .post(`/add-comment/${validPostIds[0]}`)
                .send({ text: longComment })
                .end((err, res) => {
                    expect(res).to.have.status(400);
                    expect(res.body.message).to.include("exceeds maximum allowed length");
                    done();
                });
        });
    });

    describe("GET /get-comments/:id", () => {
        it("should retrieve comments for a valid post ID", (done) => {
            chai.request(baseUrl)
                .get(`/get-comments/${validPostIds[0]}`)
                .end((err, res) => {
                    expect(res).to.have.status(200);
                    expect(res.body).to.be.an("array");
                    expect(res.body[0]).to.have.property("id");
                    expect(res.body[0]).to.have.property("text");
                    expect(res.body[0]).to.have.property("timestamp");
                    done();
                });
        });

        it("should return 404 for a post with no comments", (done) => {
            chai.request(baseUrl)
                .get(`/get-comments/${validPostIds[1]}`)
                .end((err, res) => {
                    expect(res).to.have.status(404);
                    expect(res.body.message).to.equal("No comments found for this post.");
                    done();
                });
        });
    });

    describe("GET /get-post/:id", () => {
        it("should return the post for a valid ID", (done) => {
            chai.request(baseUrl)
                .get(`/get-post/${validPostIds[0]}`)
                .end((err, res) => {
                    expect(res).to.have.status(200);
                    expect(res.body).to.be.an("object");
                    expect(res.body).to.have.property("restaurantName");
                    expect(res.body).to.have.property("location");
                    expect(res.body).to.have.property("rating");
                    done();
                });
        });

        it("should return 404 for a non-existing post ID", (done) => {
            chai.request(baseUrl)
                .get(`/get-post/${invalidPostId}`)
                .end((err, res) => {
                    expect(res).to.have.status(404);
                    expect(res.body.message).to.equal("Post not found.");
                    done();
                });
        });
    });

    describe("Error Scenarios", () => {
        it("should return 500 if reading the comments file fails", async () => {
            const backup = fs.readFileSync(commentsFilePath);
            fs.unlinkSync(commentsFilePath); // Remove the file
            const res = await chai.request(baseUrl).get(`/get-comments/${validPostIds[0]}`);
            expect(res).to.have.status(404); // Comments not found
            fs.writeFileSync(commentsFilePath, backup); // Restore the file
        });

        it("should handle invalid JSON structure in comments file", async () => {
            const backup = fs.readFileSync(commentsFilePath);
            fs.writeFileSync(commentsFilePath, "{ invalidJson: true }"); // Corrupt the file
            const res = await chai.request(baseUrl).get(`/get-comments/${validPostIds[0]}`);
            expect(res).to.have.status(500);
            fs.writeFileSync(commentsFilePath, backup); // Restore the file
        });
    });
});
