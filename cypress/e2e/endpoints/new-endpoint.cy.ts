/// <reference types="cypress" />

import { routeSelectors } from "../../support/routeSelectors";

const clickOpenstack = () => {
  cy.intercept(routeSelectors.CONN_SCHEMA_OPENSTACK, {
    fixture: "endpoints/openstack-connection-schema",
  }).as("openstack-schema");

  let matchFound = false;
  return cy
    .get("div[class^=EndpointLogos__Logo]")
    .each(logo => {
      const style = window.getComputedStyle(logo[0]);
      const matches = style.backgroundImage.match(/\/api\/logos\/(.*?)\//);

      if (matches?.[1] === "openstack") {
        matchFound = true;
        cy.wrap(logo).click();
        cy.wait("@openstack-schema");
      }
    })
    .then(() => {
      if (!matchFound) {
        throw new Error("Openstack logo not found");
      }
    });
};

describe("New endpoint", () => {
  beforeEach(() => {
    cy.setProjectIdCookie();

    cy.mockAuth({ filterResources: ["users"] });
    cy.intercept(routeSelectors.ENDPOINTS, {
      body: { endpoints: [] },
    }).as("endpoints");
    cy.intercept(routeSelectors.PROVIDERS, {
      fixture: "endpoints/providers",
    }).as("providers");
    cy.intercept(routeSelectors.REGIONS, {
      fixture: "endpoints/regions",
    }).as("regions");

    cy.visit("/endpoints");
    waitForAll();
    cy.get("button").contains("Add Endpoint").click();
    cy.wait(["@providers", "@regions"]);
  });

  const waitForAll = () => {
    cy.waitMockAuth({ filterResources: ["users"] });
    cy.wait(["@endpoints"]);
  };

  it("shows all providers", () => {
    cy.get("div[class^=Modal__Title]").should(
      "contain.text",
      "New Cloud Endpoint",
    );

    cy.fixture("endpoints/providers").then(providersFixture => {
      const providers = providersFixture.providers;
      cy.get("div[class^=EndpointLogos__Logo]").should(
        "have.length",
        Object.keys(providers).length,
      );

      cy.get("div[class^=EndpointLogos__Logo]").each(logo => {
        const style = window.getComputedStyle(logo[0]);
        const matches = style.backgroundImage.match(/\/api\/logos\/(.*?)\//);

        expect(Object.keys(providers)).to.include(matches?.[1]);
      });
    });
  });

  it("validates the form for a new openstack endpoint", () => {
    clickOpenstack().then(() => {
      cy.get("input[placeholder='Password']").should(
        "have.attr",
        "type",
        "password",
      );

      cy.get("div[class^=FieldInput__Wrapper]")
        .contains("Username")
        .not("div[class^=FieldInput__HighlightLabel]");
      cy.get("button").contains("Validate and save").click();
      cy.get("div[class^=notifications-wrapper]").should(
        "contain.text",
        "Please fill all the required fields",
      );
      cy.get("div[class^=FieldInput__Wrapper]")
        .contains("Username")
        .get("div[class^=FieldInput__HighlightLabel]")
        .should("exist");

      cy.get("input[placeholder='Username']").type("username");
      cy.get("button").contains("Validate and save").click();
      cy.get("div[class^=FieldInput__Wrapper]")
        .contains("Username")
        .not("div[class^=FieldInput__HighlightLabel]");
    });
  });

  it("toggles simple and advanced mode", () => {
    clickOpenstack().then(() => {
      cy.get("div[class^=FieldInput__Wrapper]")
        .contains("Allow Untrusted")
        .should("not.exist");
      cy.get("div[class^=ToggleButtonBar__Item]").contains("Advanced").click();
      cy.get("div[class^=FieldInput__Wrapper]")
        .contains("Allow Untrusted")
        .should("exist");
    });
  });

  it("saves the endpoint", () => {
    clickOpenstack().then(() => {
      cy.get("input[placeholder='Name']").type("new openstack");
      cy.get("input[placeholder='Username']").type("username");
      cy.get("input[placeholder='Password']").type("password");
      cy.get("input[placeholder='Authentication URL']").type("auth url");
      cy.get("input[placeholder='Project Name']").type("project name");

      cy.intercept("POST", routeSelectors.SECRETS, req => {
        expect(req.body).to.have.property("algorithm", "aes");
        expect(req.body).to.have.property("payload");
        expect(JSON.parse(req.body.payload)).to.have.property(
          "auth_url",
          "auth url",
        );
        req.reply({ fixture: "endpoints/secret-ref" });
      }).as("secrets-post");

      cy.intercept("POST", routeSelectors.ENDPOINTS, req => {
        expect(req.body).to.have.property("endpoint");
        expect(req.body.endpoint).to.have.property("name", "new openstack");
        expect(req.body.endpoint).to.have.property("type", "openstack");
        expect(req.body.endpoint).to.have.property("connection_info");
        expect(req.body.endpoint.connection_info).to.have.property(
          "secret_ref",
          "http://127.0.0.1:9311/v1/secrets/secret-ref-1",
        );
        req.reply({ fixture: "endpoints/endpoint" });
      }).as("endpoints-post");

      cy.intercept(`${routeSelectors.SECRETS}/secret-ref-1`, {
        body: { status: "ACTIVE" },
      }).as("secrets-active");
      cy.intercept(`${routeSelectors.SECRETS}/secret-ref-1/payload`, {
        body: { username: "username", password: "password" },
      }).as("secrets-payload");
      cy.intercept("POST", `${routeSelectors.ENDPOINTS}/**/actions`, {
        fixture: "endpoints/validation-fail",
      }).as("endpoints-validate");

      cy.get("button").contains("Validate and save").click();
      cy.wait([
        "@secrets-post",
        "@endpoints-post",
        "@secrets-active",
        "@secrets-payload",
        "@endpoints-validate",
      ]);
    });
  });

  it("fails validation", () => {
    clickOpenstack().then(() => {
      cy.get("input[placeholder='Name']").type("new openstack");
      cy.get("input[placeholder='Username']").type("username");
      cy.get("input[placeholder='Password']").type("password");
      cy.get("input[placeholder='Authentication URL']").type("auth url");
      cy.get("input[placeholder='Project Name']").type("project name");

      cy.intercept("POST", routeSelectors.SECRETS, {
        fixture: "endpoints/secret-ref",
      }).as("secrets-post");
      cy.intercept("POST", routeSelectors.ENDPOINTS, {
        fixture: "endpoints/endpoint",
      }).as("endpoints-post");
      cy.intercept(`${routeSelectors.SECRETS}/secret-ref-1`, {
        body: { status: "ACTIVE" },
      }).as("secrets-active");
      cy.intercept(`${routeSelectors.SECRETS}/secret-ref-1/payload`, {
        body: { username: "username", password: "password" },
      }).as("secrets-payload");
      cy.intercept("POST", `${routeSelectors.ENDPOINTS}/**/actions`, {
        fixture: "endpoints/validation-fail",
      }).as("endpoints-validate");

      cy.get("button").contains("Validate and save").click();
      cy.wait([
        "@secrets-post",
        "@endpoints-post",
        "@secrets-active",
        "@secrets-payload",
        "@endpoints-validate",
      ]);

      cy.get("div[class^=EndpointModal__StatusMessage]").should(
        "contain.text",
        "Validation failed",
      );

      cy.get("span[class^=EndpointModal__ShowErrorButton]").click();

      cy.fixture("endpoints/validation-fail").then(validationFailFixture => {
        cy.get("div[class^=EndpointModal__StatusError]").should(
          "contain.text",
          validationFailFixture["validate-connection"].message,
        );
      });
    });
  });

  it("validates successfully", () => {
    clickOpenstack().then(() => {
      cy.get("input[placeholder='Name']").type("new openstack");
      cy.get("input[placeholder='Username']").type("username");
      cy.get("input[placeholder='Password']").type("password");
      cy.get("input[placeholder='Authentication URL']").type("auth url");
      cy.get("input[placeholder='Project Name']").type("project name");

      cy.intercept("POST", routeSelectors.SECRETS, {
        fixture: "endpoints/secret-ref",
      }).as("secrets-post");
      cy.intercept("POST", routeSelectors.ENDPOINTS, {
        fixture: "endpoints/endpoint",
      }).as("endpoints-post");
      cy.intercept(`${routeSelectors.SECRETS}/secret-ref-1`, {
        body: { status: "ACTIVE" },
      }).as("secrets-active");
      cy.intercept(`${routeSelectors.SECRETS}/secret-ref-1/payload`, {
        body: { username: "username", password: "password" },
      }).as("secrets-payload");

      cy.intercept("POST", `${routeSelectors.ENDPOINTS}/**/actions`, req => {
        expect(req.body).to.have.property("validate-connection", null);
        req.reply({ fixture: "endpoints/validation-success" });
      }).as("endpoints-validate");

      cy.get("button").contains("Validate and save").click();
      cy.wait([
        "@secrets-post",
        "@endpoints-post",
        "@secrets-active",
        "@secrets-payload",
        "@endpoints-validate",
      ]);

      cy.get("div[class^=EndpointModal__StatusMessage]").should(
        "contain.text",
        "Endpoint is Valid",
      );
    });
  });
});
