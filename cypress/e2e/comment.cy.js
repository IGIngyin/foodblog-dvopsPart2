describe("Comment Management Frontend", () => {
    let baseUrl;
  
    // before(() => {
    //     cy.task('startServer')
    //       .then((url) => {
    //         baseUrl = url;
    //         cy.visit(`${baseUrl}?id=1731077350668711`);
    //       })
    //       .catch((error) => {
    //         console.error("Error starting server:", error);
    //         throw new Error("Server startup failed, skipping tests.");
    //       });
    //   });

    before(() => { 
      cy.task('startServer').then((url) => { 
        baseUrl = url; // Store the base URL 
        cy.visit(`${baseUrl}/post.html?id=1731077350668711`);

      }); 
    }); 
   
    after(() => { 
        return cy.task('stopServer'); // Stop the server after the report is done 
    }); 
      
      
  
    // after(() => {
    //   cy.task("stopServer");
    // });
  
    it("should load post details", () => {
      cy.get("#post-title").should("have.text", "Hawker Center");
      cy.get("#post-location").should("have.text", "Location: Chinatown, Singapore");
      cy.get("#post-content").should("have.text", "A must-visit for authentic Singaporean street food! The satay and laksa were incredible, and the atmosphere was lively.");
    });
  
  
    it("should display comments for the post", () => {
      cy.visit(`${baseUrl}/post.html?id=1731077350668711`);

      cy.get("#comments-container").should("contain.text", "it's rly delicious");
      cy.get("#comments-container").should("contain.text", "This is a valid comment.");
    });
  
    it("should add a new comment", () => {
      cy.visit(`${baseUrl}/post.html?id=1731077350668711`);

      const newComment = "This is a test comment.";
      cy.get("#comment-input").type(newComment);
      cy.get("#add-comment-btn").click();
      cy.get("#comments-container").should("contain.text", newComment);
    });

    it("should add a new comment", () => {
      cy.visit(`${baseUrl}/post.html?id=1731077350668711`);
      const MIN_COMMENT_LENGTH = 5;

      const newComment = "This";
      cy.get("#comment-input").type(newComment);
      cy.get("#add-comment-btn").click();
      cy.on("window:alert", (alertText) => {
        expect(alertText).to.equal(`Comment must be at least ${MIN_COMMENT_LENGTH} characters long!`);
      });
    });
    
  
    it("should handle empty comment input", () => {
      cy.visit(`${baseUrl}/post.html?id=1731077350668711`);

      cy.get("#comment-input").clear();
      cy.get("#add-comment-btn").click();
      cy.on("window:alert", (alertText) => {
        expect(alertText).to.equal("Comment cannot be empty!");
      });
    });
    
  });
  