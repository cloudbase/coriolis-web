/// <reference types="cypress" />

import { routeSelectors } from "./routeSelectors";

Cypress.Commands.add(
  "loadFixtures",
  (fixtures: string[], finalCallback: (results: any[]) => void) => {
    const loadFixtures = (
      fixtures: string[],
      callback: (results: any[]) => void,
      index = 0,
      results: any[] = []
    ) => {
      if (index >= fixtures.length) {
        callback(results);
        return;
      }
      cy.fixture(fixtures[index]).then(fixture => {
        results.push(fixture);
        loadFixtures(fixtures, callback, index + 1, results);
      });
    };
    loadFixtures(fixtures, finalCallback);
  }
);

const AUTH_RESOURCES = [
  "token",
  "user",
  "users",
  "projects",
  "roles",
  "transfers",
  "deployments",
];

Cypress.Commands.add("mockAuth", (options?: { filterResources?: string[] }) => {
  const { filterResources = [] } = options || {};
  const resources = AUTH_RESOURCES.filter(r => !filterResources.includes(r));

  for (const resource of resources) {
    switch (resource) {
      case "token":
        cy.intercept(routeSelectors.AUTH_TOKENS, {
          fixture: "auth/token-scoped",
        }).as("token");
        break;
      case "user":
        cy.intercept(routeSelectors.USER, {
          fixture: "users/user",
        }).as("user");
        break;
      case "users":
        cy.intercept(routeSelectors.USERS, {
          fixture: "users/users",
        }).as("users");
        break;
      case "projects":
        cy.intercept(routeSelectors.PROJECTS, {
          fixture: "projects/projects",
        }).as("projects");
        break;
      case "roles":
        cy.intercept(routeSelectors.ROLE_ASSIGNMENTS, {
          fixture: "auth/role-assignments",
        }).as("roles");
        break;
      case "transfers":
        cy.intercept(routeSelectors.TRANSFERS, {
          fixture: "transfers/replicas",
        }).as("transfers");
        break;
      case "deployments":
        cy.intercept(routeSelectors.DEPLOYMENTS, {
          fixture: "transfers/migrations",
        }).as("deployments");
        break;
    }
  }
});

Cypress.Commands.add(
  "waitMockAuth",
  (options?: { filterResources?: string[] }) => {
    const { filterResources = [] } = options || {};
    const resources = AUTH_RESOURCES.filter(r => !filterResources.includes(r));
    for (const resource of resources) {
      cy.wait(`@${resource}`);
    }
  }
);

Cypress.Commands.add("setProjectIdCookie", () => {
  cy.setCookie("projectId", "[project-id]");
});

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Cypress {
    interface Chainable {
      loadFixtures(
        fixtures: string[],
        finalCallback: (results: any[]) => void
      ): Chainable<void>;
      mockAuth(options?: { filterResources?: string[] }): Chainable<void>;
      waitMockAuth(options?: { filterResources?: string[] }): Chainable<void>;
      setProjectIdCookie(): Chainable<void>;
    }
  }
}

export {};
