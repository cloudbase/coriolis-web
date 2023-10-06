/// <reference types="cypress" />

import { routeSelectors } from "../../support/routeSelectors";

describe("Endpoints list", () => {
  beforeEach(() => {
    cy.setProjectIdCookie();

    cy.mockAuth({ filterResources: ["users"] });
    cy.intercept(routeSelectors.ENDPOINTS, {
      fixture: "endpoints/endpoints",
    }).as("endpoints");
  });

  const waitForAll = () => {
    cy.waitMockAuth({ filterResources: ["users"] });
    cy.wait(["@endpoints"]);
  };

  it("renders empty list", () => {
    cy.intercept(routeSelectors.ENDPOINTS, {
      body: { endpoints: [] },
    }).as("endpoints-empty");

    cy.visit("/endpoints");
    cy.wait(["@endpoints-empty"]);
    cy.waitMockAuth({ filterResources: ["users"] });

    cy.get("div[class^='MainList__EmptyListMessage']").should(
      "contain.text",
      "don't have any Cloud Endpoints in this project"
    );
    cy.get("button").should("contain.text", "Add Endpoint");
  });

  it("filters list", () => {
    cy.visit("/endpoints");
    waitForAll();

    cy.fixture("endpoints/endpoints").then((endpointsFixture: any) => {
      const endpoints = endpointsFixture.endpoints;

      cy.get("div[class^='MainListFilter__FilterItem']")
        .contains("Azure")
        .click();
      cy.get("div[class^='EndpointListItem__Wrapper']").should(
        "have.length",
        endpoints.filter(r => r.type === "azure").length
      );

      cy.get("div[class^='MainListFilter__FilterItem']")
        .contains("VMware")
        .click();
      cy.get("div[class^='EndpointListItem__Wrapper']").should(
        "have.length",
        endpoints.filter(r => r.type === "vmware_vsphere").length
      );

      cy.get("div[class^='SearchButton__Wrapper']").click();
      cy.get("input[class*='SearchInput']").type("cor");
      cy.get("div[class^='EndpointListItem__Wrapper']").should(
        "have.length",
        endpoints.filter(
          e => e.type === "vmware_vsphere" && e.name.includes("cor")
        ).length
      );
      cy.get("div[class^='TextInput__Close']").click();

      cy.get("div[class^='MainListFilter__FilterItem']")
        .contains("All")
        .click();
      cy.get("div[class^='EndpointListItem__Wrapper']").should(
        "have.length",
        endpoints.length
      );

      cy.get("div[class^='SearchButton__Wrapper']").click();
      cy.get("input[class*='SearchInput']").type("cor");
      cy.get("div[class^='EndpointListItem__Wrapper']").should(
        "have.length",
        endpoints.filter(e => e.name.includes("cor")).length
      );
    });
  });

  it("does bulk actions", () => {
    cy.visit("/endpoints");
    waitForAll();

    cy.get("div[class^='SearchButton__Wrapper']").click();
    cy.get("input[class*='SearchInput']").type("cor");
    cy.get(
      "div[class^='MainListFilter__Wrapper'] div[class^='Checkbox__Wrapper']"
    ).click();

    cy.fixture("endpoints/endpoints").then((endpointsFixture: any) => {
      const endpoints = endpointsFixture.endpoints;
      const corEndpoints = endpoints.filter(e => e.name.includes("cor"));
      cy.get("div[class^='MainListFilter__SelectionText']").should(
        "contain.text",
        `${corEndpoints.length} of ${corEndpoints.length}`
      );

      cy.get("div[class^='ActionDropdown__Wrapper']").click();
      cy.get("div[class^='ActionDropdown__ListItem']")
        .contains("Delete")
        .click();

      cy.get("div[class^='AlertModal__Message']").should(
        "contain.text",
        "they are in use by replicas or migrations"
      );
    });
  });
});
