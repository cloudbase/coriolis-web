/// <reference types="cypress" />

import { routeSelectors } from "../../support/routeSelectors";

describe("Deployments list", () => {
  beforeEach(() => {
    cy.setProjectIdCookie();

    cy.mockAuth();

    cy.intercept(routeSelectors.ENDPOINTS, {
      fixture: "endpoints/endpoints.json",
    }).as("endpoints");
  });

  const waitForAll = () => {
    cy.waitMockAuth();

    cy.wait(["@endpoints"]);
  };

  it("renders empty list", () => {
    cy.intercept(routeSelectors.DEPLOYMENTS, {
      body: { deployments: [] },
    }).as("deployments");

    cy.visit("/deployments");
    waitForAll();

    cy.wait(["@deployments"]);

    cy.get("div[class^='MainList__EmptyListMessage']").should(
      "contain.text",
      "don't have any Deployments in this project"
    );
  });

  it("filters list", () => {
    cy.visit("/deployments");
    waitForAll();

    cy.loadFixtures(["transfers/migrations"], (results: any[]) => {
      const deployments = results[0].deployments;

      cy.get("div[class^='MainListFilter__FilterItem']")
        .contains("Running")
        .click();
      cy.get("div[class^='MainList__NoResults']").should("exist");

      cy.get("div[class^='MainListFilter__FilterItem']")
        .contains("Error")
        .click();
      cy.get("div[class^='TransferListItem__Wrapper']").should(
        "have.length",
        deployments.filter(r => r.last_execution_status === "ERROR").length
      );

      cy.get("div[class^='MainListFilter__FilterItem']")
        .contains("Completed")
        .click();
      cy.get("div[class^='TransferListItem__Wrapper']").should(
        "have.length",
        deployments.filter(r => r.last_execution_status === "COMPLETED").length
      );

      cy.get("div[class^='MainListFilter__FilterItem']")
        .contains("Canceled")
        .click();
      cy.get("div[class^='TransferListItem__Wrapper']").should(
        "have.length",
        deployments.filter(r => r.last_execution_status === "CANCELED").length
      );

      cy.get("div[class^='MainListFilter__FilterItem']")
        .contains("All")
        .click();
      cy.get("div[class^='TransferListItem__Wrapper']").should(
        "have.length",
        deployments.length
      );

      cy.get("div[class^='SearchButton__Wrapper']").click();
      cy.get("input[class*='SearchInput']").type("ol88-uefi");
      cy.get("div[class^='TransferListItem__Wrapper']").should(
        "have.length",
        deployments.filter(r => r.instances.find(i => i.includes("ol88-uefi")))
          .length
      );
      cy.get("div[class^='TextInput__Close']").click();
    });
  });

  it("does bulk actions", () => {
    cy.visit("/deployments");
    waitForAll();

    cy.loadFixtures(["transfers/migrations"], (results: any[]) => {
      const deployments: any[] = results[0].deployments;

      cy.get("div[class*='TransferListItem__Checkbox']").eq(0).click();
      cy.get("div[class^='SearchButton__Wrapper']").click();
      cy.get("input[class*='SearchInput']").type("ol88-uefi");
      cy.get("div[class^='TransferListItem__Wrapper']").should(
        "have.length",
        deployments.filter(r => r.instances.find(i => i.includes("ol88-uefi")))
          .length
      );
      cy.get("div[class*='TransferListItem__Checkbox']").eq(0).click();
      cy.get("div[class*='MainListFilter__SelectionText']").should(
        "contain.text",
        "2 of 1"
      );

      cy.get("div[class^='ActionDropdown__Wrapper']").click();
      cy.get("div[class^='ActionDropdown__ListItem']")
        .contains("Recreate Deployments")
        .click();
      cy.get("div[class^='AlertModal__Message']").should(
        "contain.text",
        "Are you sure you want to recreate"
      );

      cy.intercept("POST", routeSelectors.DEPLOYMENTS, req => {
        expect(
          req.body.deployment.transfer_id,
          "Transfer ID should be present in the request body"
        ).to.exist;
      }).as("deployments-recreate");

      cy.get("button").contains("Yes").click();
      cy.wait(["@deployments-recreate"]);
    });
  });
});
