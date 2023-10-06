/// <reference types="cypress" />

import { routeSelectors } from "../../support/routeSelectors";

describe("Login fails", () => {
  beforeEach(() => {
    cy.intercept(routeSelectors.AUTH_TOKENS, {
      statusCode: 401,
      fixture: "auth/fail.json",
    }).as("token-fail");

    cy.visit("/login");
  });

  it("token auto login fails", () => {
    cy.wait("@token-fail")
      .its("response")
      .should((response: any) => {
        console.log(response);
        expect(response.statusCode).to.equal(401);
        expect(response.body.error.code).to.equal(401);
      });
    cy.get("button").should("contain.text", "Login");
  });

  it("shows message on empty inputs", () => {
    cy.wait("@token-fail");
    cy.get("button").click();
    cy.get("*[class='notification-title']").should(
      "contain.text",
      "Please fill in all fields"
    );
  });

  it("shows message on request invalid response", () => {
    cy.wait("@token-fail");
    cy.get("input[name='username']").type("wrong-user");
    cy.get("input[name='password']").type("wrong-pass");

    cy.intercept("POST", routeSelectors.AUTH_TOKENS, {
      body: "invalid",
    }).as("auth-post");
    cy.get("button").click();
    cy.wait("@auth-post").then(interception => {
      expect(
        interception.request.body.auth.identity.password.user.name
      ).to.equal("wrong-user");
      expect(
        interception.request.body.auth.identity.password.user.password
      ).to.equal("wrong-pass");
    });
    cy.get("*[class^='LoginForm__LoginErrorText']").should(
      "contain.text",
      "Request failed, there might be a problem with the connection to the server."
    );
  });

  it("shows message on invalid credentials", () => {
    cy.wait("@token-fail");
    cy.get("input[name='username']").type("wrong-user");
    cy.get("input[name='password']").type("wrong-pass");

    cy.intercept("POST", routeSelectors.AUTH_TOKENS, {
      statusCode: 401,
      fixture: "auth/fail.json",
    }).as("auth-post");
    cy.get("button").click();
    cy.wait("@auth-post").then(interception => {
      expect(
        interception.request.body.auth.identity.password.user.name
      ).to.equal("wrong-user");
      expect(
        interception.request.body.auth.identity.password.user.password
      ).to.equal("wrong-pass");
    });
    cy.get("*[class^='LoginForm__LoginErrorText']").should(
      "contain.text",
      "Incorrect credentials."
    );
  });
});
