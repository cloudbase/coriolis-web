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
import TestUtils from "@tests/TestUtils";

import SetupPageLegal from "./";

jest.mock("@src/utils/Config", () => ({
  config: {
    providerSortPriority: {
      openstack: 2,
      vmware_vsphere: 1,
    },
    providerNames: {
      openstack: "OpenStack",
      vmware_vsphere: "VMware vSphere",
    },
  },
}));

describe("SetupPageLegal", () => {
  let defaultProps: SetupPageLegal["props"];

  beforeEach(() => {
    defaultProps = {
      licenceType: "trial",
      customerInfoTrial: {
        interestedIn: "migrations",
        sourcePlatform: "vmware_vsphere",
        destinationPlatform: "openstack",
      },
      onCustomerInfoChange: jest.fn(),
      onLegalChange: jest.fn(),
    };
  });

  it("renders without crashing", () => {
    const { getByText } = render(<SetupPageLegal {...defaultProps} />);
    expect(getByText("Coriolis® Trial License")).toBeTruthy();
  });

  it("fires interestedIn change event", () => {
    const { rerender } = render(<SetupPageLegal {...defaultProps} />);
    const findInputByLabel = (label: string) =>
      Array.from(document.querySelectorAll("label"))
        .find(el => el.textContent?.includes(label))!
        .querySelector("input")!;

    const replicasInput = findInputByLabel("Replicas");
    expect(replicasInput).toBeTruthy();
    replicasInput.click();

    expect(defaultProps.onCustomerInfoChange).toHaveBeenCalledWith(
      "interestedIn",
      "replicas"
    );

    const bothInput = findInputByLabel("Both");
    expect(bothInput).toBeTruthy();
    bothInput.click();

    expect(defaultProps.onCustomerInfoChange).toHaveBeenCalledWith(
      "interestedIn",
      "both"
    );

    rerender(
      <SetupPageLegal
        {...defaultProps}
        customerInfoTrial={{
          ...defaultProps.customerInfoTrial,
          interestedIn: "replicas",
        }}
      />
    );

    const migrationsInput = findInputByLabel("Migrations");
    expect(migrationsInput).toBeTruthy();
    migrationsInput.click();

    expect(defaultProps.onCustomerInfoChange).toHaveBeenCalledWith(
      "interestedIn",
      "migrations"
    );
  });

  it("fires legal agreement change event", () => {
    render(<SetupPageLegal {...defaultProps} />);
    const findCheckboxByText = (text: string) =>
      Array.from(TestUtils.selectAll("Checkbox__Wrapper")).find(el =>
        el.parentElement?.textContent?.includes(text)
      )!;

    const privacyCheckbox = findCheckboxByText("Privacy Policy");
    expect(privacyCheckbox).toBeTruthy();

    privacyCheckbox.click();
    expect(defaultProps.onLegalChange).toHaveBeenCalledWith(false);

    const eulaCheckbox = findCheckboxByText("EULA");
    expect(eulaCheckbox).toBeTruthy();

    eulaCheckbox.click();
    expect(defaultProps.onLegalChange).toHaveBeenCalledWith(true);

    const findLabelByText = (text: string) =>
      Array.from(TestUtils.selectAll("SetupPageLegal__CheckboxLabel")).find(
        el => el.textContent?.includes(text)
      )!;

    const privacyLabel = findLabelByText("Privacy Policy");
    expect(privacyLabel).toBeTruthy();
    privacyLabel.click();
    expect(defaultProps.onLegalChange).toHaveBeenCalledWith(false);

    const eulaLabel = findLabelByText("EULA");
    expect(eulaLabel).toBeTruthy();
    eulaLabel.click();
    expect(defaultProps.onLegalChange).toHaveBeenCalledWith(false);
  });

  it.each`
    platformType     | itemIndex | expectedProvider
    ${"Source"}      | ${2}      | ${"openstack"}
    ${"Destination"} | ${3}      | ${"aws"}
  `(
    "fires $platformType platform change event",
    ({ platformType, itemIndex, expectedProvider }) => {
      render(<SetupPageLegal {...defaultProps} />);
      const platformDropdown = Array.from(
        TestUtils.selectAll("Dropdown__Wrapper")
      ).find(el =>
        el.parentElement?.parentElement?.textContent?.includes(
          `${platformType} Platform`
        )
      )!;

      expect(platformDropdown).toBeTruthy();
      TestUtils.select("DropdownButton__Wrapper", platformDropdown)!.click();
      TestUtils.selectAll("Dropdown__ListItem-")[itemIndex].click();

      expect(defaultProps.onCustomerInfoChange).toHaveBeenCalledWith(
        `${platformType.toLowerCase()}Platform`,
        expectedProvider
      );
    }
  );
});
