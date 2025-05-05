/*
Copyright (C) 2023  Cloudbase Solutions SRL
This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as
published by the Free Software Foundation, either version 3 of the
License, or (at your option) any later version.
This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU Affero General Public License for more details.
You should have received a copy of the GNU Affero General Public License
along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/

import React from "react";

import { Endpoint } from "@src/@types/Endpoint";
import DomUtils from "@src/utils/DomUtils";
import { fireEvent, render } from "@testing-library/react";
import TestUtils from "@tests/TestUtils";

import EndpointDetailsContent from "./EndpointDetailsContent";

jest.mock("@src/utils/Config", () => ({
  config: {
    providerSortPriority: {},
    providerNames: {
      openstack: "OpenStack",
      vmware_vsphere: "VMware vSphere",
    },
    passwordFields: ["secret_key"],
  },
}));

jest.mock("react-router", () => ({
  Link: "div",
}));

const OPENSTACK_ENDPOINT: Endpoint = {
  name: "Openstack",
  type: "openstack",
  id: "1",
  description: "openstack description",
  created_at: new Date().toISOString(),
  mapped_regions: [],
  connection_info: {},
};

const USAGE = {
  migrations: [
    {
      type: "migration",
      id: "mig-1",
      instances: [],
      notes: "Migration 1",
    },
    {
      type: "migration",
      id: "mig-2",
      instances: ["mig-vm1"],
    },
  ],
  replicas: [
    {
      type: "replica",
      id: "rep-1",
      instances: [],
      notes: "Replica 1",
    },
  ],
};

describe("EndpointDetailsContent", () => {
  let defaultProps: EndpointDetailsContent["props"];
  let domDownload: jest.SpyInstance;

  beforeEach(() => {
    domDownload = jest.spyOn(DomUtils, "download");

    defaultProps = {
      item: OPENSTACK_ENDPOINT,
      regions: [
        {
          id: "1",
          name: "Region 1",
          description: "region description",
          enabled: true,
          mapped_endpoints: [],
        },
      ],
      connectionInfo: null,
      transfers: USAGE as any,
      loading: false,
      connectionInfoSchema: [],
      onDeleteClick: jest.fn(),
      onValidateClick: jest.fn(),
    };
  });

  it("renders without crashing", () => {
    const { getByText } = render(<EndpointDetailsContent {...defaultProps} />);
    expect(getByText("openstack description")).toBeTruthy();
  });

  it("renders loading state correctly", () => {
    render(<EndpointDetailsContent {...defaultProps} loading />);
    expect(
      TestUtils.select("EndpointDetailsContent__LoadingWrapper"),
    ).toBeTruthy();
  });

  it("handles the delete button click", () => {
    render(<EndpointDetailsContent {...defaultProps} />);
    document.querySelectorAll("button").forEach(button => {
      if (button.textContent === "Delete Endpoint") {
        fireEvent.click(button);
      }
    });
    expect(defaultProps.onDeleteClick).toBeCalled();
  });

  it("downloads file field", () => {
    const { getByText } = render(
      <EndpointDetailsContent
        {...defaultProps}
        connectionInfoSchema={[
          {
            name: "file",
            type: "string",
            useFile: true,
          },
        ]}
        connectionInfo={{
          file: "file content",
        }}
      />,
    );
    fireEvent.click(getByText("Download"));

    expect(domDownload).toBeCalledWith("file content", "file");
  });

  it("fails to download if no endpoint", () => {
    const instance = new EndpointDetailsContent({
      ...defaultProps,
      item: null,
    });
    const result = instance.renderDownloadValue("file", "content");
    expect(result).toBe(null);
  });

  it("doesn't render secret_ref", () => {
    render(
      <EndpointDetailsContent
        {...defaultProps}
        connectionInfoSchema={[
          {
            name: "secret_ref",
            type: "string",
          },
        ]}
        connectionInfo={{
          secret_ref: "secret_ref",
        }}
      />,
    );
    let secretRef;
    TestUtils.selectAll("CopyValue__Value").forEach(element => {
      if (element.textContent === "secret_ref") {
        secretRef = element;
      }
    });
    expect(secretRef).toBe(undefined);
  });

  it("renders objects in connection info", () => {
    const { getByText } = render(
      <EndpointDetailsContent
        {...defaultProps}
        connectionInfoSchema={[
          {
            name: "object_field",
            type: "object",
            fields: [
              {
                name: "nested_prop",
                type: "string",
              },
            ],
          },
        ]}
        connectionInfo={{
          object_field: {
            nested_prop: "nested prop's value",
          },
        }}
      />,
    );
    expect(getByText("Nested Prop")).toBeTruthy();
    expect(getByText("nested prop's value")).toBeTruthy();
  });

  it("doesn't render the same key twice", () => {
    const connInfo = {
      field1: "value1",
    };
    const instance = new EndpointDetailsContent({
      ...defaultProps,
      connectionInfoSchema: [
        {
          name: "field1",
          type: "string",
        },
      ],
    });
    instance.renderedKeys = {};

    let result: any = instance.renderConnectionInfo(connInfo);
    expect(result[0]).not.toBeNull();

    result = instance.renderConnectionInfo(connInfo);
    expect(result[0]).toBeNull();
  });

  it("renders booleans correctly", () => {
    const { getByText, rerender } = render(
      <EndpointDetailsContent
        {...defaultProps}
        connectionInfoSchema={[
          {
            name: "bool_field",
            type: "boolean",
          },
        ]}
        connectionInfo={{
          bool_field: true,
        }}
      />,
    );
    expect(getByText("Bool Field")).toBeTruthy();
    expect(getByText("Yes")).toBeTruthy();

    rerender(
      <EndpointDetailsContent
        {...defaultProps}
        connectionInfoSchema={[
          {
            name: "bool_field",
            type: "boolean",
          },
        ]}
        connectionInfo={{
          bool_field: false,
        }}
      />,
    );
    expect(getByText("Bool Field")).toBeTruthy();
    expect(getByText("No")).toBeTruthy();

    rerender(
      <EndpointDetailsContent
        {...defaultProps}
        connectionInfoSchema={[
          {
            name: "bool_field",
            type: "boolean",
          },
        ]}
        connectionInfo={{
          bool_field: "",
        }}
      />,
    );
    let boolValue;
    TestUtils.selectAll("CopyValue__Value").forEach(element => {
      if (element.textContent === "-") {
        boolValue = element;
      }
    });
    expect(boolValue).toBeTruthy();
    expect(getByText("Bool Field")).toBeTruthy();
  });

  it("renders password fields correctly", () => {
    const { getByText } = render(
      <EndpointDetailsContent
        {...defaultProps}
        connectionInfoSchema={[
          {
            name: "password_field",
            type: "string",
          },
        ]}
        connectionInfo={{
          password_field: "password",
        }}
      />,
    );
    expect(getByText("Password Field")).toBeTruthy();
    expect(getByText("•••••••••")).toBeTruthy();
  });

  it("renders passwords from config correctly", () => {
    const { getByText } = render(
      <EndpointDetailsContent
        {...defaultProps}
        connectionInfoSchema={[
          {
            name: "secret_key",
            type: "string",
          },
        ]}
        connectionInfo={{
          secret_key: "password",
        }}
      />,
    );
    expect(getByText("Secret Key")).toBeTruthy();
    expect(getByText("•••••••••")).toBeTruthy();
  });

  it("renders regions correctly", () => {
    const { getByText } = render(
      <EndpointDetailsContent
        {...defaultProps}
        item={{
          ...OPENSTACK_ENDPOINT,
          mapped_regions: ["1"],
        }}
      />,
    );
    expect(getByText("Region 1")).toBeTruthy();
  });
});
