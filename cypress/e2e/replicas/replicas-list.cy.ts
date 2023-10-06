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
    cy.intercept(routeSelectors.REPLICAS, {
      body: { replicas: [] },
    }).as("replicas");

    cy.visit("/replicas");

    waitForAll();
    cy.wait(["@replicas"]);

    cy.get("div[class^='MainList__EmptyListMessage']").should(
      "contain.text",
      "don't have any Replicas in this project"
    );
    cy.get("button").should("contain.text", "Create a Replica");
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
        const replicas = results[0].replicas;
        schedules = replicas.map((_, index) =>
          index % 2 === 0 ? results[1].schedules : results[2].schedules
        );

        for (const [index, replica] of replicas.entries()) {
          const scheduleAlias = `schedule-${index}`;
          cy.intercept(`**/coriolis/**/replicas/${replica.id}/schedules`, {
            body: {
              schedules: schedules[index],
            },
          }).as(scheduleAlias);
          scheduleAliases.push(`@${scheduleAlias}`);
        }
      }
    );

    cy.visit("/replicas");
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
    cy.visit("/replicas");
    waitForAll();
    cy.wait(["@schedules"]);

    cy.loadFixtures(["transfers/replicas"], (results: any[]) => {
      const replicas = results[0].replicas;

      cy.get("div[class^='MainListFilter__FilterItem']")
        .contains("Error")
        .click();
      cy.get("div[class^='MainList__NoResults']").should("exist");

      cy.get("div[class^='MainListFilter__FilterItem']")
        .contains("Completed")
        .click();
      cy.get("div[class^='TransferListItem__Wrapper']").should(
        "have.length",
        replicas.filter(r => r.last_execution_status === "COMPLETED").length
      );

      cy.get("div[class^='MainListFilter__FilterItem']")
        .contains("All")
        .click();
      cy.get("div[class^='TransferListItem__Wrapper']").should(
        "have.length",
        replicas.length
      );

      cy.get("div[class^='SearchButton__Wrapper']").click();
      cy.get("input[class*='SearchInput']").type("ol88");
      cy.get("div[class^='TransferListItem__Wrapper']").should(
        "have.length",
        replicas.filter(r => r.instances.find(i => i.includes("ol88"))).length
      );

      cy.get("div[class^='TextInput__Close']").click();
      cy.get("div[class^='TransferListItem__Wrapper']").should(
        "have.length",
        replicas.length
      );
    });
  });

  it("does bulk actions", () => {
    cy.intercept(routeSelectors.SCHEDULES, {
      fixture: "transfers/schedules-enabled.json",
    }).as("schedules");
    cy.visit("/replicas");
    waitForAll();
    cy.wait(["@schedules"]);

    cy.get("div[class*='TransferListItem__Checkbox']").eq(0).click();
    cy.get("div[class*='MainListFilter__SelectionText']").should(
      "contain.text",
      "1 of 2"
    );

    cy.get("div[class^='ActionDropdown__Wrapper']").click();
    cy.loadFixtures(["transfers/replicas"], (results: any[]) => {
      const replicas = results[0].replicas;
      cy.intercept(`**/coriolis/**/replicas/${replicas[0].id}`, {
        fixture: "transfers/replica-unexecuted",
      }).as("replica");

      cy.get("div[class^='ActionDropdown__ListItem']")
        .contains("Delete Replicas")
        .click();
      cy.wait(["@replica"]);

      cy.intercept("DELETE", `**/coriolis/**/replicas/${replicas[0].id}`, {
        fixture: "transfers/replica-unexecuted",
      }).as("delete-replica");
      cy.get("button").contains("Delete Replica").click();
      cy.wait(["@delete-replica"]);
    });
  });
});
