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

import { fireEvent, render } from "@testing-library/react";
import TestUtils from "@tests/TestUtils";

import SetupPageLicence from "./";

describe("SetupPageLicence", () => {
  let defaultProps: SetupPageLicence["props"];

  beforeEach(() => {
    defaultProps = {
      customerInfo: {
        fullName: "John Doe",
        email: "email@email.com",
        company: "Company",
        country: "RO",
      },
      highlightEmail: false,
      highlightEmptyFields: false,
      licenceType: "trial",
      onUpdateCustomerInfo: jest.fn(),
      onSubmit: jest.fn(),
      onLicenceTypeChange: jest.fn(),
    };
  });

  it("renders without crashing", () => {
    render(<SetupPageLicence {...defaultProps} />);
    const fullNameInput = Array.from(
      TestUtils.selectAll("SetupPageInputWrapper__Label"),
    )
      .find(el => el.textContent?.includes("Full name"))!
      .parentElement?.querySelector("input")!;

    expect(fullNameInput).toBeTruthy();
    expect(fullNameInput.value).toBe("John Doe");
  });

  it("submits form", () => {
    render(<SetupPageLicence {...defaultProps} />);
    fireEvent.submit(document.querySelector("form")!);

    expect(defaultProps.onSubmit).toHaveBeenCalled();
  });

  it.each`
    label          | fieldName     | newValue
    ${"Full name"} | ${"fullName"} | ${"New Name"}
    ${"Email"}     | ${"email"}    | ${"new@email.com"}
    ${"Company"}   | ${"company"}  | ${"New Company"}
  `("fires $label change event", ({ label, fieldName, newValue }) => {
    render(<SetupPageLicence {...defaultProps} />);
    const findInputByLabel = (label: string) =>
      Array.from(TestUtils.selectAll("SetupPageInputWrapper__Label"))
        .find(el => el.textContent?.includes(label))!
        .parentElement!.querySelector("input")!;

    const input = findInputByLabel(label);
    fireEvent.change(input, { target: { value: newValue } });

    expect(defaultProps.onUpdateCustomerInfo).toHaveBeenCalledWith(
      fieldName,
      newValue,
    );
  });

  it("fires country change event", async () => {
    render(<SetupPageLicence {...defaultProps} />);
    const countryInput = Array.from(
      TestUtils.selectAll("SetupPageInputWrapper__Label"),
    )
      .find(el => el.textContent?.includes("Country"))!
      .parentElement?.querySelector("input")!;

    fireEvent.change(countryInput, { target: { value: "Unite" } });

    fireEvent.click(TestUtils.selectAll("AutocompleteDropdown__ListItem-")[1]);

    expect(defaultProps.onUpdateCustomerInfo).toHaveBeenCalledWith(
      "country",
      "United Arab Emirates",
    );
  });
});
