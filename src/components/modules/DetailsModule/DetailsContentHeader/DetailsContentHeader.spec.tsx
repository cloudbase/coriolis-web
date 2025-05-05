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

import { render } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import TestUtils from "@tests/TestUtils";

import DetailsContentHeader from "./DetailsContentHeader";

jest.mock("react-router", () => ({ Link: "a" }));

describe("DetailsContentHeader", () => {
  let defaultProps: DetailsContentHeader["props"];

  beforeEach(() => {
    defaultProps = {
      dropdownActions: [{ label: "Test Action", action: () => {} }],
      backLink: "/list",
      typeImage: "type-image.jpeg",
      primaryInfoPill: true,
      statusPill: "COMPLETED",
      statusLabel: "status-label",
      itemTitle: "item-title",
      itemType: "item-type",
      itemDescription: "item-description",
    };
  });

  it("renders back button correctly", () => {
    render(<DetailsContentHeader {...defaultProps} />);
    expect(
      TestUtils.select(
        "DetailsContentHeader__BackButton"
      )?.attributes.getNamedItem("to")?.value
    ).toBe("/list");
  });

  it("renders type image when prop is provided", () => {
    render(<DetailsContentHeader {...defaultProps} />);
    expect(
      window.getComputedStyle(
        TestUtils.select("DetailsContentHeader__TypeImage")!
      ).background
    ).toBe(`url(${defaultProps.typeImage}) no-repeat center`);
  });

  it("renders item title correctly", () => {
    render(<DetailsContentHeader {...defaultProps} />);
    expect(TestUtils.select("DetailsContentHeader__Text")?.textContent).toBe(
      defaultProps.itemTitle
    );
  });

  it("does not render status pill when statusPill prop is not provided", () => {
    const newProps = {
      ...defaultProps,
      statusPill: undefined,
    };
    render(<DetailsContentHeader {...newProps} />);
    expect(TestUtils.select("StatusPill__Wrapper")).toBeNull();
  });

  it("renders status pill when statusPill prop is provided", () => {
    render(<DetailsContentHeader {...defaultProps} />);
    expect(TestUtils.selectAll("StatusPill__Wrapper")).toHaveLength(2);
    expect(TestUtils.selectAll("StatusPill__Wrapper")[0].textContent).toBe(
      defaultProps.itemType
    );
    expect(TestUtils.selectAll("StatusPill__Wrapper")[1].textContent).toBe(
      defaultProps.statusLabel
    );
  });

  it("renders mock button when dropdownActions is not provided", () => {
    const newProps = {
      ...defaultProps,
      dropdownActions: undefined,
    };
    render(<DetailsContentHeader {...newProps} />);
    expect(TestUtils.select("DetailsContentHeader__MockButton")).toBeTruthy();
  });

  it("renders ActionDropdown when dropdownActions is provided", () => {
    render(<DetailsContentHeader {...defaultProps} />);
    expect(TestUtils.select("DetailsContentHeader__MockButton")).toBeNull();
    expect(TestUtils.select("DropdownButton__Wrapper")).toBeTruthy();
    userEvent.click(TestUtils.select("DropdownButton__Wrapper")!);
    expect(TestUtils.selectAll("ActionDropdown__ListItem")[0].textContent).toBe(
      "Test Action"
    );
  });

  it("does not render description when itemDescription is not provided", () => {
    const newProps = {
      ...defaultProps,
      itemDescription: undefined,
    };
    render(<DetailsContentHeader {...newProps} />);
    expect(TestUtils.select("DetailsContentHeader__Description")).toBeNull();
  });

  it("renders description when itemDescription is provided", () => {
    render(<DetailsContentHeader {...defaultProps} />);
    expect(TestUtils.select("DetailsContentHeader__Description")).toBeTruthy();
    expect(
      TestUtils.select("DetailsContentHeader__Description")?.textContent
    ).toBe(defaultProps.itemDescription);
  });
});
