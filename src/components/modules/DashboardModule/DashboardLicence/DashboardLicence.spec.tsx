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

import { DateTime } from "luxon";
import React from "react";

import { Licence, LicenceServerStatus } from "@src/@types/Licence";
import { render } from "@testing-library/react";
import TestUtils from "@tests/TestUtils";

import DashboardLicence from "./DashboardLicence";

describe("DashboardLicence", () => {
  const futureLicence: Licence = {
    applianceId: "test-id",
    earliestLicenceExpiryDate: DateTime.now().plus({ years: 1 }).toJSDate(),
    latestLicenceExpiryDate: DateTime.now().plus({ years: 1 }).toJSDate(),
    currentPerformedReplicas: 5,
    currentPerformedMigrations: 3,
    lifetimePerformedMigrations: 4,
    lifetimePerformedReplicas: 6,
    currentAvailableReplicas: 10,
    currentAvailableMigrations: 5,
    lifetimeAvailableReplicas: 15,
    lifetimeAvailableMigrations: 10,
  };

  const status: LicenceServerStatus = {
    hostname: "test-hostname",
    multi_appliance: false,
    supported_licence_versions: ["v2"],
    server_local_time: DateTime.now().toISO()!,
  };

  let defaultProps: DashboardLicence["props"];

  beforeEach(() => {
    defaultProps = {
      licence: futureLicence,
      licenceServerStatus: status,
      licenceError: null,
      loading: false,
      onAddClick: jest.fn(),
    };
  });

  it("renders licence status text when licence and licenceServerStatus are provided and the licence has not expired", () => {
    render(<DashboardLicence {...defaultProps} />);
    const futureDate = DateTime.now().plus({ years: 1 });
    expect(
      TestUtils.select("DashboardLicence__TopInfoDateTop-")?.textContent
    ).toBe(`${futureDate.toFormat("LLL")} '${futureDate.toFormat("yy")}`);
    expect(
      TestUtils.select("DashboardLicence__TopInfoDateBottom-")?.textContent
    ).toBe(futureDate.toFormat("dd"));

    expect(
      TestUtils.selectAll("DashboardLicence__ChartHeaderCurrent-")[0]
        .textContent
    ).toBe("5 Used Replicas ");
    expect(
      TestUtils.selectAll("DashboardLicence__ChartHeaderTotal-")[0].textContent
    ).toBe("Total 10");
    expect(
      TestUtils.selectAll("DashboardLicence__ChartHeaderCurrent-")[1]
        .textContent
    ).toBe("3 Used Migrations ");
    expect(
      TestUtils.selectAll("DashboardLicence__ChartHeaderTotal-")[1].textContent
    ).toBe("Total 5");
  });

  it("renders licence error when licenceError prop is provided and there's no licence", () => {
    const newProps = {
      ...defaultProps,
      licence: null,
      licenceError: "An error occurred.",
    };
    render(<DashboardLicence {...newProps} />);

    expect(TestUtils.select("DashboardLicence__LicenceError-")).toBeTruthy();
    expect(
      TestUtils.select("DashboardLicence__LicenceError-")?.textContent
    ).toBe("An error occurred.");
  });

  it("renders expired licence details when licence has expired", () => {
    const newProps = {
      ...defaultProps,
      licence: {
        ...futureLicence,
        earliestLicenceExpiryDate: DateTime.now().minus({ days: 2 }).toJSDate(),
      },
    };

    render(<DashboardLicence {...newProps} />);

    expect(TestUtils.select("DashboardLicence__LicenceError-")).toBeTruthy();
    expect(
      TestUtils.select("DashboardLicence__LicenceError-")?.textContent
    ).toContain("Please contact Cloudbase Solutions with your Appliance ID");
    expect(
      TestUtils.select("DashboardLicence__ApplianceId-")?.textContent
    ).toBe("Appliance ID:test-id-licencev2");
    expect(TestUtils.select("Button__")?.textContent).toBe("Add Licence");
  });

  it("renders loading status when loading prop is true and there's no licence", () => {
    const newProps = {
      ...defaultProps,
      licence: null,
      loading: true,
    };
    render(<DashboardLicence {...newProps} />);
    expect(TestUtils.select("StatusImage__Wrapper-")).toBeTruthy();
  });

  it("does not render anything when no props are provided", () => {
    const newProps = {
      ...defaultProps,
      licence: null,
    };
    render(<DashboardLicence {...newProps} />);
    expect(document.body.innerHTML).toBe("<div></div>");
  });

  it("hides licenceLogoRef if buttonWrapperRef width is less than 370", async () => {
    const newProps = {
      ...defaultProps,
      licence: {
        ...futureLicence,
        earliestLicenceExpiryDate: DateTime.now().minus({ days: 2 }).toJSDate(),
      },
    };
    render(<DashboardLicence {...newProps} />);

    const button = TestUtils.select(
      "DashboardLicence__AddLicenceButtonWrapper"
    );
    const logo = TestUtils.select("DashboardLicence__Logo");

    button!.getBoundingClientRect = jest.fn().mockReturnValue({ width: 400 });
    window.dispatchEvent(new Event("resize"));

    expect(button).toBeTruthy();
    expect(logo).toBeTruthy();
    expect(logo!.style.display).toBe("block");

    button!.getBoundingClientRect = jest.fn().mockReturnValue({ width: 360 });
    window.dispatchEvent(new Event("resize"));

    expect(logo!.style.display).toBe("none");
  });

  it("renders singular label when current is 1", () => {
    const newProps = {
      ...defaultProps,
      licence: {
        ...futureLicence,
        currentPerformedReplicas: 1,
      },
    };

    render(<DashboardLicence {...newProps} />);
    expect(
      TestUtils.selectAll("DashboardLicence__ChartHeaderCurrent-")[0]
        .textContent
    ).toBe("1 Used Replica ");
  });
});
