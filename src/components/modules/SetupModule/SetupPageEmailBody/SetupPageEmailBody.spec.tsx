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

import { CustomerInfoBasic, CustomerInfoTrial } from "@src/@types/InitialSetup";
import DomUtils from "@src/utils/DomUtils";
import { render } from "@testing-library/react";
import TestUtils from "@tests/TestUtils";

import SetupPageEmailBody from "./";

jest.mock("@src/utils/Config", () => ({
  config: {
    providerSortPriority: {},
    providerNames: {
      openstack: "OpenStack",
      vmware_vsphere: "VMware vSphere",
    },
  },
}));

jest.mock("@src/utils/DomUtils", () => ({
  copyTextToClipboard: jest.fn(),
}));

const CUSTOMER_INFO_BASIC: CustomerInfoBasic = {
  fullName: "John Doe",
  email: "email@email.com",
  company: "Company",
  country: "Country",
};

const customerInfoTrial: CustomerInfoTrial = {
  interestedIn: "migrations",
  sourcePlatform: "vmware_vsphere",
  destinationPlatform: "openstack",
};

describe("SetupPageEmailBody", () => {
  let defaultProps: SetupPageEmailBody["props"];

  beforeEach(() => {
    defaultProps = {
      customerInfoBasic: CUSTOMER_INFO_BASIC,
      customerInfoTrial: customerInfoTrial,
      licenceType: "trial",
      applianceId: "appliance-id",
    };
  });

  it("renders without crashing", () => {
    render(<SetupPageEmailBody {...defaultProps} />);
    expect(
      Array.from(document.querySelectorAll("*")).find(el =>
        el.textContent?.includes(CUSTOMER_INFO_BASIC.fullName),
      ),
    ).toBeTruthy();
  });

  it("handles copy", () => {
    render(<SetupPageEmailBody {...defaultProps} />);
    TestUtils.select("CopyButton__Wrapper")!.click();
    expect(DomUtils.copyTextToClipboard).toHaveBeenCalled();
  });

  it("copy is not called if no email template", () => {
    const component = new SetupPageEmailBody(defaultProps);
    component.handleCopy();
    expect(DomUtils.copyTextToClipboard).not.toHaveBeenCalled();
  });
});
