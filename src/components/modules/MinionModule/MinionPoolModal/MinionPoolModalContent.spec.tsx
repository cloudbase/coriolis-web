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

import React, { act } from "react";

import { fireEvent, render } from "@testing-library/react";
import { OPENSTACK_ENDPOINT_MOCK } from "@tests/mocks/EndpointsMock";
import TestUtils from "@tests/TestUtils";

import MinionPoolModalContent from "./MinionPoolModalContent";

jest.mock("@src/plugins/default/ContentPlugin", () => jest.fn(() => null));

jest.mock("@src/components/modules/EndpointModule/EndpointLogos", () => ({
  __esModule: true,
  default: (props: any) => <div data-testid={props.endpoint} />,
}));

const DEFAULT_SCHEMA_MOCK = [
  {
    name: "name",
    type: "string",
    required: true,
  },
  {
    name: "endpoint_id",
    type: "string",
    required: true,
  },
  {
    name: "platform",
    type: "string",
    required: true,
  },
];

const ENV_SCHEMA_MOCK = [
  {
    name: "env_option",
    type: "string",
  },
  {
    name: "required_env_option",
    type: "string",
    required: true,
  },
];

describe("MinionPoolModalContent", () => {
  let defaultProps: MinionPoolModalContent["props"];

  beforeEach(() => {
    defaultProps = {
      envOptionsDisabled: false,
      defaultSchema: [...DEFAULT_SCHEMA_MOCK],
      envSchema: [...ENV_SCHEMA_MOCK],
      invalidFields: [ENV_SCHEMA_MOCK[1].name],
      endpoint: OPENSTACK_ENDPOINT_MOCK,
      platform: "source",
      optionsLoading: false,
      optionsLoadingSkipFields: [],
      disabled: false,
      cancelButtonText: "Cancel",
      getFieldValue: jest.fn(),
      onFieldChange: jest.fn(),
      onResizeUpdate: jest.fn(),
      scrollableRef: jest.fn(),
      onCreateClick: jest.fn(),
      onCancelClick: jest.fn(),
    };
  });

  it("renders without crashing", () => {
    const { getByText } = render(<MinionPoolModalContent {...defaultProps} />);
    expect(getByText("Environment Options")).toBeTruthy();
  });

  it("calls resize on simple / advanced toggle", async () => {
    const { getByText } = render(<MinionPoolModalContent {...defaultProps} />);
    await act(async () => {
      getByText("Advanced").click();
    });
    expect(defaultProps.onResizeUpdate).toHaveBeenCalled();
  });

  it("filters non required fields", async () => {
    const { getByText } = render(<MinionPoolModalContent {...defaultProps} />);
    expect(TestUtils.selectAll("FieldInput__LabelText")[1].textContent).toBe(
      "Required Env Option"
    );
    await act(async () => {
      getByText("Advanced").click();
    });
    expect(TestUtils.selectAll("FieldInput__LabelText")[1].textContent).toBe(
      "Env Option"
    );
  });

  it("fires onFieldChange", () => {
    render(<MinionPoolModalContent {...defaultProps} />);
    fireEvent.change(TestUtils.select("TextInput__Input")!, {
      target: { value: "test" },
    });
    expect(defaultProps.onFieldChange).toHaveBeenCalled();
  });
});
