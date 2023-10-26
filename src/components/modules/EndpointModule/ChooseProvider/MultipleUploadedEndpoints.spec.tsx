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
import EndpointLogos from "@src/components/modules/EndpointModule/EndpointLogos";
import DropdownLink from "@src/components/ui/Dropdowns/DropdownLink";
import DomUtils from "@src/utils/DomUtils";
import { fireEvent, render } from "@testing-library/react";
import TestUtils from "@tests/TestUtils";

import MultipleUploadedEndpoints from "./MultipleUploadedEndpoints";

jest.mock("@src/components/modules/EndpointModule/EndpointLogos", () => ({
  __esModule: true,
  default: (props: EndpointLogos["props"]) => <div>{props.endpoint}</div>,
}));

jest.mock("@src/components/ui/Dropdowns/DropdownLink", () => ({
  __esModule: true,
  default: (props: DropdownLink["props"]) => (
    <div>
      {props.items.map(item => (
        <div
          data-testid="DropdownLink__Item"
          onClick={() => {
            props.onChange && props.onChange(item);
          }}
          key={item.value}
        >
          {item.label} - {item.value}
          {props.getLabel && props.getLabel()}
        </div>
      ))}
    </div>
  ),
}));

jest.mock("@src/utils/DomUtils", () => ({
  copyTextToClipboard: jest.fn(),
}));

const OPENSTACK_ENDPOINT: Endpoint = {
  name: "Openstack",
  type: "openstack",
  id: "1",
  description: "",
  created_at: new Date().toISOString(),
  mapped_regions: [],
  connection_info: {},
};

const AWS_ENDPOINT: Endpoint = {
  name: "AWS",
  type: "aws",
  id: "2",
  description: "",
  created_at: new Date().toISOString(),
  mapped_regions: [],
  connection_info: {},
};

describe("MultipleUploadedEndpoints", () => {
  let defaultProps: MultipleUploadedEndpoints["props"];
  let copyTextToClipboard: jest.SpyInstance;

  beforeEach(() => {
    copyTextToClipboard = jest.spyOn(DomUtils, "copyTextToClipboard");

    defaultProps = {
      endpoints: [OPENSTACK_ENDPOINT, AWS_ENDPOINT],
      regions: [
        {
          id: "default",
          name: "Default",
          description: "",
          enabled: true,
          mapped_endpoints: [],
        },
      ],
      invalidRegionsEndpointIds: [],
      multiValidation: [
        {
          endpoint: OPENSTACK_ENDPOINT,
          validating: false,
          validation: { valid: true, message: "" },
        },
        {
          endpoint: AWS_ENDPOINT,
          validating: false,
          validation: { valid: false, message: "Invalid" },
        },
      ],
      validating: false,
      onRegionsChange: jest.fn(),
      onBackClick: jest.fn(),
      onRemove: jest.fn(),
      onValidateClick: jest.fn(),
      onDone: jest.fn(),
    };
  });

  it("renders without crashing", () => {
    render(<MultipleUploadedEndpoints {...defaultProps} />);

    expect(
      TestUtils.selectAll("MultipleUploadedEndpoints__EndpointName")[0]
        .textContent
    ).toBe("Openstack");
    expect(
      TestUtils.selectAll("MultipleUploadedEndpoints__EndpointName")[1]
        .textContent
    ).toBe("AWS");
  });

  it('handles the "Back" button click', () => {
    render(<MultipleUploadedEndpoints {...defaultProps} />);
    document.querySelectorAll("button").forEach(button => {
      if (button.textContent === "Back") {
        fireEvent.click(button);
      }
    });
    expect(defaultProps.onBackClick).toHaveBeenCalled();
  });

  it('handles the "Validate and Save" button click', () => {
    render(<MultipleUploadedEndpoints {...defaultProps} />);
    document.querySelectorAll("button").forEach(button => {
      if (button.textContent === "Validate and save") {
        fireEvent.click(button);
      }
    });
    expect(defaultProps.onValidateClick).toHaveBeenCalled();
  });

  it('changes to "Done" button after validation', async () => {
    const { rerender, getByText } = render(
      <MultipleUploadedEndpoints {...defaultProps} validating={true} />
    );
    expect(TestUtils.select("LoadingButton__Loading")).toBeTruthy();
    rerender(
      <MultipleUploadedEndpoints {...defaultProps} validating={false} />
    );
    expect(TestUtils.select("LoadingButton__Loading")).toBeFalsy();
    expect(getByText("Done")).toBeTruthy();
  });

  it('handles the "Done" button click', () => {
    const { rerender, getByText } = render(
      <MultipleUploadedEndpoints {...defaultProps} validating={true} />
    );
    rerender(
      <MultipleUploadedEndpoints {...defaultProps} validating={false} />
    );
    fireEvent.click(getByText("Done"));
    expect(defaultProps.onDone).toHaveBeenCalled();
  });

  it("removes an endpoint", () => {
    render(<MultipleUploadedEndpoints {...defaultProps} />);
    const deleteButtons = TestUtils.selectAll(
      "MultipleUploadedEndpoints__DeleteButton"
    );
    fireEvent.click(deleteButtons[0]);
    expect(defaultProps.onRemove).toHaveBeenCalledWith(
      defaultProps.endpoints[0],
      true
    );
  });

  it("copies an error message to the clipboard", () => {
    copyTextToClipboard.mockImplementation(() => Promise.resolve(true));
    render(<MultipleUploadedEndpoints {...defaultProps} />);
    fireEvent.click(TestUtils.selectAll("StatusIcon__Wrapper")[1]);
    expect(DomUtils.copyTextToClipboard).toHaveBeenCalled();
  });

  it("removes an uploaded non multi endpoint", () => {
    const newProps = {
      ...defaultProps,
      multiValidation: [],
    };

    render(<MultipleUploadedEndpoints {...newProps} />);
    const deleteButtons = TestUtils.selectAll(
      "MultipleUploadedEndpoints__DeleteButton"
    );
    fireEvent.click(deleteButtons[0]);
    expect(defaultProps.onRemove).toHaveBeenCalledWith(
      defaultProps.endpoints[0],
      false
    );
  });

  it("selects valid region when there's invalid regions", () => {
    const newProps = {
      ...defaultProps,
      multiValidation: [],
      invalidRegionsEndpointIds: [
        { id: "openstackOpenstack", regions: ["default"] },
      ],
    };

    render(<MultipleUploadedEndpoints {...newProps} />);
    fireEvent.click(
      document.querySelector("[data-testid='DropdownLink__Item']")!
    );
    expect(defaultProps.onRegionsChange).toHaveBeenCalledWith(
      OPENSTACK_ENDPOINT,
      ["default"]
    );
  });

  it("selects valid region when there's invalid regions with endpoints mapped regions", () => {
    const newOpenstackEndpoint = {
      ...OPENSTACK_ENDPOINT,
      mapped_regions: ["default"],
    };
    const newProps = {
      ...defaultProps,
      endpoints: [newOpenstackEndpoint],
      multiValidation: [],
      invalidRegionsEndpointIds: [
        { id: "openstackOpenstack", regions: ["default"] },
      ],
    };

    render(<MultipleUploadedEndpoints {...newProps} />);
    fireEvent.click(
      document.querySelector("[data-testid='DropdownLink__Item']")!
    );
    expect(defaultProps.onRegionsChange).toHaveBeenCalledWith(
      newOpenstackEndpoint,
      []
    );
  });

  it("shows validating status when validating an endpoint", () => {
    const newProps = {
      ...defaultProps,
      multiValidation: [
        {
          endpoint: OPENSTACK_ENDPOINT,
          validating: true,
          validation: { valid: true, message: "" },
        },
      ],
    };

    render(<MultipleUploadedEndpoints {...newProps} />);
    expect(TestUtils.selectAll("StatusIcon__Wrapper")).toHaveLength(1);
  });

  it("shows no status if no validation", () => {
    const newProps = {
      ...defaultProps,
      multiValidation: [{ endpoint: OPENSTACK_ENDPOINT, validating: false }],
    };

    render(<MultipleUploadedEndpoints {...newProps} />);
    expect(TestUtils.selectAll("StatusIcon__Wrapper")).toHaveLength(0);
  });

  it("shows invalid endpoint for unsupported endpoint type", () => {
    const newProps = {
      ...defaultProps,
      endpoints: ["invalid"],
    };

    render(<MultipleUploadedEndpoints {...newProps} />);
    expect(
      TestUtils.select("MultipleUploadedEndpoints__InvalidEndpoint")
        ?.textContent
    ).toContain("unsupported provider type: invalid");
  });
});
