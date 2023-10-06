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
    cy.intercept(routeSelectors.REPLICAS, {
      body: { replicas: [] },
    }).as("replicas");
    cy.intercept(routeSelectors.MIGRATIONS, {
      body: { migrations: [] },
    }).as("migrations");
    cy.intercept(routeSelectors.ENDPOINTS, {
      body: { endpoints: [] },
    }).as("endpoints");

    cy.visit("/");
    waitForAll();
    cy.wait(["@replicas", "@migrations", "@endpoints"]);

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

    cy.get("button").should("contain.text", "New Replica / Migration");
    cy.get("button").should("contain.text", "New Endpoint");
  });

  it("renders dashboard with data", () => {
    cy.intercept(routeSelectors.REPLICAS, {
      fixture: "transfers/replicas.json",
    }).as("replicas");
    cy.intercept(routeSelectors.MIGRATIONS, {
      fixture: "transfers/migrations.json",
    }).as("migrations");
    cy.intercept(routeSelectors.ENDPOINTS, {
      fixture: "endpoints/endpoints.json",
    }).as("endpoints");

    cy.visit("/");
    waitForAll();
    cy.wait(["@replicas", "@migrations", "@endpoints"]);

    cy.loadFixtures(
      [
        "transfers/replicas.json",
        "transfers/migrations.json",
        "endpoints/endpoints.json",
      ],
      results => {
        const [replicasFixture, migrationsFixture, endpointsFixture] = results;
        cy.get("div[class^='DashboardInfoCount__CountBlock']").should(
          "contain.text",
          `${replicasFixture.replicas.length}Replicas${migrationsFixture.migrations.length}Migrations${endpointsFixture.endpoints.length}Endpoints`
        );

        const checkItem = (type: "migration" | "replica", item: any) => {
          cy.get("div[class^='NotificationDropdown__ItemDescription']").should(
            "contain.text",
            `New ${type} ${item.id.substr(
              0,
              7
            )}... status: ${item.last_execution_status.toLowerCase()}`
          );
        };

        migrationsFixture.migrations.forEach((migration: any) => {
          checkItem("migration", migration);
        });

        replicasFixture.replicas.forEach((replica: any) => {
          checkItem("replica", replica);
        });
      }
    );
  });
});
