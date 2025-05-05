/// <reference types="cypress" />

import { routeSelectors } from "../../support/routeSelectors";

describe("Login success", () => {
  it("redirects to home on correct username and password", () => {
    // the app tries to login automatically on load
    // we mock as fail to force the login page
    cy.intercept(routeSelectors.AUTH_TOKENS, {
      statusCode: 401,
      fixture: "auth/fail.json",
    }).as("token-auto");
    cy.visit("/login");
    cy.wait("@token-auto", { timeout: 20000 });

    cy.intercept("POST", routeSelectors.AUTH_TOKENS, {
      fixture: "auth/token-scoped.json",
    }).as("token");
    cy.intercept(routeSelectors.USER, {
      fixture: "users/user.json",
    }).as("user");
    cy.intercept(routeSelectors.PROJECTS, {
      fixture: "projects/projects.json",
    }).as("projects");
    cy.intercept(routeSelectors.ROLE_ASSIGNMENTS, {
      fixture: "auth/role-assignments.json",
    }).as("roles");

    cy.get("input[name='username']").type("admin");
    cy.get("input[name='password']").type("admin");
    cy.get("button").click();

    cy.wait(["@user", "@projects", "@token", "@roles"]);

    cy.url().should("eq", `${Cypress.config().baseUrl}/`);
  });

  it("redirects to login on 401", () => {
    cy.intercept(routeSelectors.AUTH_TOKENS, {
      statusCode: 401,
      fixture: "auth/fail.json",
    }).as("token-auto");
    cy.visit("/endpoints");
    cy.wait("@token-auto");

    cy.url().should("contain", "/login");
    cy.get("button").should("contain.text", "Login");
  });
});
