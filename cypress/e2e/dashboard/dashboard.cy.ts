/// <reference types="cypress" />

import { DateTime } from "luxon";
import { routeSelectors } from "../../support/routeSelectors";

describe("Dashboard", () => {
  beforeEach(() => {
    cy.setProjectIdCookie();

    cy.mockAuth();

    cy.intercept(routeSelectors.APPLIANCES, {
      fixture: "licences/appliances.json",
    }).as("appliances");
    cy.intercept(routeSelectors.STATUS, {
      fixture: "licences/status.json",
    }).as("status");
    cy.intercept(routeSelectors.APPLIANCE_STATUS, {
      fixture: "licences/appliance-status.json",
    }).as("appliance-status");
  });

  const waitForAll = () => {
    cy.waitMockAuth();

    cy.wait(["@appliances", "@status", "@appliance-status"]);
  };

  it("renders empty dashboard", () => {
    cy.intercept(routeSelectors.TRANSFERS, {
      body: { transfers: [] },
    }).as("transfers");
    cy.intercept(routeSelectors.DEPLOYMENTS, {
      body: { deployments: [] },
    }).as("deployments");
    cy.intercept(routeSelectors.ENDPOINTS, {
      body: { endpoints: [] },
    }).as("endpoints");

    cy.visit("/");
    waitForAll();
    cy.wait(["@transfers", "@deployments", "@endpoints"]);

    cy.get("*[class^='DashboardActivity__Message']").should(
      "contain.text",
      "There is no recent activity"
    );

    cy.fixture("licences/appliance-status.json").then(applianceStatus => {
      cy.get("*[class^='DashboardLicence__TopInfoDateTop']").should(
        "contain.text",
        `${DateTime.fromISO(
          applianceStatus.appliance_licence_status.earliest_licence_expiry_time
        )
          .toFormat("LLL |yy")
          .replace("|", "'")}`
      );

      cy.get("*[class^='DashboardLicence__ChartHeaderCurrent']").should(
        "contain.text",
        `${applianceStatus.appliance_licence_status.current_performed_replicas} Used Replica ${applianceStatus.appliance_licence_status.current_performed_migrations} Used Migrations`
      );
    });

    cy.get("button").should("contain.text", "New Transfer");
    cy.get("button").should("contain.text", "New Endpoint");
  });

  it("renders dashboard with data", () => {
    cy.intercept(routeSelectors.TRANSFERS, {
      fixture: "transfers/replicas.json",
    }).as("transfers");
    cy.intercept(routeSelectors.ENDPOINTS, {
      fixture: "endpoints/endpoints.json",
    }).as("endpoints");

    cy.visit("/");
    waitForAll();
    cy.wait(["@transfers", "@endpoints"]);

    cy.loadFixtures(
      ["transfers/replicas.json", "endpoints/endpoints.json"],
      results => {
        const [transfersFixture, endpointsFixture] = results;
        const replicasCount = transfersFixture.transfers.filter(
          transfer => transfer.scenario === "replica"
        ).length;
        const migrationsCount = transfersFixture.transfers.filter(
          transfer => transfer.scenario === "live_migration"
        ).length;

        cy.get("div[class^='DashboardInfoCount__CountBlock']").should(
          "contain.text",
          `${replicasCount}Replicas${migrationsCount}Migrations${endpointsFixture.endpoints.length}Endpoints`
        );

        const checkItem = (type: "transfer", item: any) => {
          cy.get("div[class^='NotificationDropdown__ItemDescription']").should(
            "contain.text",
            `New ${type} ${item.id.substr(
              0,
              7
            )}... status: ${item.last_execution_status.toLowerCase()}`
          );
        };

        transfersFixture.transfers.forEach((transfer: any) => {
          checkItem("transfer", transfer);
        });
      }
    );
  });
});
