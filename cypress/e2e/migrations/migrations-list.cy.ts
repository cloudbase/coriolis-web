/// <reference types="cypress" />

import { routeSelectors } from "../../support/routeSelectors";

describe("Migrations list", () => {
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
    cy.intercept(routeSelectors.MIGRATIONS, {
      body: { replicas: [] },
    }).as("migrations");

    cy.visit("/migrations");
    waitForAll();

    cy.wait(["@migrations"]);

    cy.get("div[class^='MainList__EmptyListMessage']").should(
      "contain.text",
      "don't have any Migrations in this project"
    );
    cy.get("button").should("contain.text", "Create a Migration");
  });

  it("filters list", () => {
    cy.visit("/migrations");
    waitForAll();

    cy.loadFixtures(["transfers/migrations"], (results: any[]) => {
      const migrations = results[0].migrations;

      cy.get("div[class^='MainListFilter__FilterItem']")
        .contains("Running")
        .click();
      cy.get("div[class^='MainList__NoResults']").should("exist");

      cy.get("div[class^='MainListFilter__FilterItem']")
        .contains("Error")
        .click();
      cy.get("div[class^='TransferListItem__Wrapper']").should(
        "have.length",
        migrations.filter(r => r.last_execution_status === "ERROR").length
      );

      cy.get("div[class^='MainListFilter__FilterItem']")
        .contains("Completed")
        .click();
      cy.get("div[class^='TransferListItem__Wrapper']").should(
        "have.length",
        migrations.filter(r => r.last_execution_status === "COMPLETED").length
      );

      cy.get("div[class^='MainListFilter__FilterItem']")
        .contains("Canceled")
        .click();
      cy.get("div[class^='TransferListItem__Wrapper']").should(
        "have.length",
        migrations.filter(r => r.last_execution_status === "CANCELED").length
      );

      cy.get("div[class^='MainListFilter__FilterItem']")
        .contains("All")
        .click();
      cy.get("div[class^='TransferListItem__Wrapper']").should(
        "have.length",
        migrations.length
      );

      cy.get("div[class^='SearchButton__Wrapper']").click();
      cy.get("input[class*='SearchInput']").type("ol88-uefi");
      cy.get("div[class^='TransferListItem__Wrapper']").should(
        "have.length",
        migrations.filter(r => r.instances.find(i => i.includes("ol88-uefi")))
          .length
      );
      cy.get("div[class^='TextInput__Close']").click();
    });
  });

  it("does bulk actions", () => {
    cy.visit("/migrations");
    waitForAll();

    cy.loadFixtures(["transfers/migrations"], (results: any[]) => {
      const migrations: any[] = results[0].migrations;

      cy.get("div[class*='TransferListItem__Checkbox']").eq(0).click();
      cy.get("div[class^='SearchButton__Wrapper']").click();
      cy.get("input[class*='SearchInput']").type("ol88-uefi");
      cy.get("div[class^='TransferListItem__Wrapper']").should(
        "have.length",
        migrations.filter(r => r.instances.find(i => i.includes("ol88-uefi")))
          .length
      );
      cy.get("div[class*='TransferListItem__Checkbox']").eq(0).click();
      cy.get("div[class*='MainListFilter__SelectionText']").should(
        "contain.text",
        "2 of 1"
      );

      cy.get("div[class^='ActionDropdown__Wrapper']").click();
      cy.get("div[class^='ActionDropdown__ListItem']")
        .contains("Recreate Migrations")
        .click();
      cy.get("div[class^='AlertModal__Message']").should(
        "contain.text",
        "Are you sure you want to recreate"
      );

      let postCount = 0;
      cy.intercept("POST", routeSelectors.MIGRATIONS, req => {
        postCount += 1;
        if (postCount === 1) {
          expect(req.body.migration.instances).to.deep.eq([
            "Datacenter/ol88-bios",
          ]);
        } else if (postCount === 2) {
          expect(req.body.migration.instances).to.deep.eq([
            "Datacenter/ol88-uefi",
          ]);
        }
      }).as("migrations-recreate");

      cy.get("button").contains("Yes").click();
      cy.wait(["@migrations-recreate"]);
    });
  });
});
