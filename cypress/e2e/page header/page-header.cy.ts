/// <reference types="cypress" />

import { routeSelectors } from "../../support/routeSelectors";

describe("Page header", () => {
  beforeEach(() => {
    cy.setProjectIdCookie();

    cy.mockAuth();

    cy.intercept(routeSelectors.ENDPOINTS, {
      fixture: "endpoints/endpoints.json",
    }).as("endpoints");
    cy.intercept(routeSelectors.SCHEDULES, {
      fixture: "transfers/schedules-enabled.json",
    }).as("schedules");
  });

  const waitForAll = () => {
    cy.waitMockAuth();

    cy.wait(["@endpoints", "@schedules"]);
  };

  it("switches project", () => {
    cy.visit("/transfers");
    waitForAll();

    cy.get("div[class^='Dropdown__Wrapper']").contains("admin").click();
    cy.setCookie("unscopedToken", "[unscopedToken]");

    cy.intercept("POST", routeSelectors.AUTH_TOKENS).as("login");
    cy.get("div[class^='Dropdown__ListItem']").contains("admin").click();
    cy.wait(["@login"]);

    cy.loadFixtures(["projects/projects"], (results: any[]) => {
      const projects = results[0].projects;
      cy.getCookie("projectId").should(
        "have.property",
        "value",
        projects.find(p => p.name === "admin").id
      );
    });
  });

  it("redirects to user info", () => {
    cy.visit("/transfers");
    waitForAll();
    cy.get("div[class^='UserDropdown__Wrapper']").click();
    cy.get("a[class^='UserDropdown__Username']").click();
    cy.url().should("include", "/users");
  });

  it("shows about coriolis", () => {
    cy.visit("/transfers");
    waitForAll();
    cy.get("div[class^='UserDropdown__Wrapper']").click();

    cy.intercept(routeSelectors.APPLIANCES, {
      fixture: "licences/appliances.json",
    }).as("appliances");
    cy.intercept(routeSelectors.STATUS, {
      fixture: "licences/status.json",
    }).as("status");
    cy.intercept(routeSelectors.APPLIANCE_STATUS, {
      fixture: "licences/appliance-status.json",
    }).as("appliance-status");

    cy.get("div[class^='UserDropdown__ListItem']")
      .contains("About Coriolis")
      .click();

    cy.wait(["@appliances", "@status", "@appliance-status"]);

    cy.loadFixtures(["licences/appliances"], (results: any[]) => {
      const appliances = results[0].appliances;
      cy.get("div[class^='LicenceModule__Wrapper']").should(
        "contain.text",
        `${appliances[0].id}-licencev2`
      );
    });
  });

  it("redirects to help", () => {
    cy.visit("/transfers", {
      onBeforeLoad(win) {
        cy.stub(win, "open").as("winOpen");
      },
    });
    waitForAll();
    cy.get("div[class^='UserDropdown__Wrapper']").click();

    cy.get("div[class^='UserDropdown__ListItem']").contains("Help").click();
    cy.get("@winOpen").should(
      "be.calledWith",
      "https://cloudbase.it/coriolis-overview/"
    );
  });

  it("logs out", () => {
    cy.visit("/transfers");
    waitForAll();

    cy.get("div[class^='UserDropdown__Wrapper']").click();

    cy.intercept("DELETE", routeSelectors.AUTH_TOKENS).as("logout");
    cy.get("div[class^='UserDropdown__ListItem']").contains("Sign Out").click();
    cy.wait(["@logout"]);
    cy.url().should("include", "/login");
  });
});
