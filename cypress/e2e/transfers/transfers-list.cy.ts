/// <reference types="cypress" />

import { routeSelectors } from "../../support/routeSelectors";

describe("Replicas list", () => {
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
    cy.intercept(routeSelectors.TRANSFERS, {
      body: { transfers: [] },
    }).as("transfers");

    cy.visit("/transfers");

    waitForAll();
    cy.wait(["@transfers"]);

    cy.get("div[class^='MainList__EmptyListMessage']").should(
      "contain.text",
      "don't have any Transfers in this project"
    );
    cy.get("button").should("contain.text", "Create a Transfer");
  });

  it("renders list with scheduled icon", () => {
    const scheduleAliases: string[] = [];
    let schedules: any[] = [];
    cy.loadFixtures(
      [
        "transfers/replicas",
        "transfers/schedules-enabled",
        "transfers/schedules-disabled",
      ],
      (results: any[]) => {
        const transfers = results[0].transfers;
        schedules = transfers.map((_, index) =>
          index % 2 === 0 ? results[1].schedules : results[2].schedules
        );

        for (const [index, transfer] of transfers.entries()) {
          const scheduleAlias = `schedule-${index}`;
          cy.intercept(`**/coriolis/**/transfers/${transfer.id}/schedules`, {
            body: {
              schedules: schedules[index],
            },
          }).as(scheduleAlias);
          scheduleAliases.push(`@${scheduleAlias}`);
        }
      }
    );

    cy.visit("/transfers");
    waitForAll();
    cy.wait(scheduleAliases);

    cy.get("div[class^='MainList__EmptyListMessage']").should("not.exist");

    for (const [index, schedule] of schedules.entries()) {
      const shouldHaveIcon = schedule.find(s => s.enabled);
      const scheduleImage = cy
        .get("div[class^='TransferListItem__StatusWrapper']")
        .eq(index)
        .get("div[class^='TransferListItem__ScheduleImage']");
      if (shouldHaveIcon) {
        scheduleImage.should("exist");
      } else {
        scheduleImage.should("not.exist");
      }
    }
  });

  it("filters list", () => {
    cy.intercept(routeSelectors.SCHEDULES, {
      fixture: "transfers/schedules-enabled.json",
    }).as("schedules");
    cy.visit("/transfers");
    waitForAll();
    cy.wait(["@schedules"]);

    cy.loadFixtures(["transfers/replicas"], (results: any[]) => {
      const transfers = results[0].transfers;

      cy.get("div[class^='MainListFilter__FilterItem']")
        .contains("Error")
        .click();
      cy.get("div[class^='MainList__NoResults']").should("exist");

      cy.get("div[class^='MainListFilter__FilterItem']")
        .contains("Completed")
        .click();
      cy.get("div[class^='TransferListItem__Wrapper']").should(
        "have.length",
        transfers.filter(r => r.last_execution_status === "COMPLETED").length
      );

      cy.get("div[class^='MainListFilter__FilterItem']")
        .contains("All")
        .click();
      cy.get("div[class^='TransferListItem__Wrapper']").should(
        "have.length",
        transfers.length
      );

      cy.get("div[class^='SearchButton__Wrapper']").click();
      cy.get("input[class*='SearchInput']").type("ol88");
      cy.get("div[class^='TransferListItem__Wrapper']").should(
        "have.length",
        transfers.filter(r => r.instances.find(i => i.includes("ol88"))).length
      );

      cy.get("div[class^='TextInput__Close']").click();
      cy.get("div[class^='TransferListItem__Wrapper']").should(
        "have.length",
        transfers.length
      );
    });
  });

  it("does bulk actions", () => {
    cy.intercept(routeSelectors.SCHEDULES, {
      fixture: "transfers/schedules-enabled.json",
    }).as("schedules");
    cy.visit("/transfers");
    waitForAll();
    cy.wait(["@schedules"]);

    cy.get("div[class*='TransferListItem__Checkbox']").eq(0).click();
    cy.get("div[class*='MainListFilter__SelectionText']").should(
      "contain.text",
      "1 of 3"
    );

    cy.get("div[class^='ActionDropdown__Wrapper']").click();
    cy.loadFixtures(["transfers/replicas"], (results: any[]) => {
      const transfers = results[0].transfers;
      cy.intercept(`**/coriolis/**/transfers/${transfers[0].id}`, {
        fixture: "transfers/replica-unexecuted",
      }).as("transfer");

      cy.get("div[class^='ActionDropdown__ListItem']")
        .contains("Delete Transfers")
        .click();
      cy.wait(["@transfer"]);

      cy.intercept("DELETE", `**/coriolis/**/transfers/${transfers[0].id}`, {
        fixture: "transfers/replica-unexecuted",
      }).as("delete-transfer");
      cy.get("button").contains("Delete Transfer").click();
      cy.wait(["@delete-transfer"]);
    });
  });
});
