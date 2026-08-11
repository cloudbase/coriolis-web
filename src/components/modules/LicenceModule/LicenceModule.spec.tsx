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

import {
  Licence,
  LicenceServerStatus,
  LicenceStats,
} from "@src/@types/Licence";
import LicenceUtils from "@src/utils/LicenceUtils";
import { fireEvent, render, waitFor } from "@testing-library/react";
import TestUtils from "@tests/TestUtils";

import LicenceModule from "./LicenceModule";

jest.mock("@src/components/ui/StatusComponents/StatusImage", () => ({
  __esModule: true,
  default: (props: any) => (
    <div data-testid="StatusImage">
      {props.loading ? "loading" : props.status}
    </div>
  ),
}));

const STANDARD_STATS: LicenceStats = {
  currentPerformedReplicas: 5,
  currentPerformedMigrations: 3,
  lifetimePerformedMigrations: 4,
  lifetimePerformedReplicas: 6,
  currentAvailableReplicas: 10,
  currentAvailableMigrations: 5,
  lifetimeAvailableReplicas: 15,
  lifetimeAvailableMigrations: 10,
};

const SAP_STATS: LicenceStats = {
  currentPerformedReplicas: 2,
  currentPerformedMigrations: 1,
  lifetimePerformedMigrations: 1,
  lifetimePerformedReplicas: 2,
  currentAvailableReplicas: 4,
  currentAvailableMigrations: 8,
  lifetimeAvailableReplicas: 4,
  lifetimeAvailableMigrations: 8,
};

const FUTURE_LICENCE: Licence = {
  applianceId: "test-id",
  earliestLicenceExpiryDate: DateTime.now().plus({ years: 1 }).toJSDate(),
  latestLicenceExpiryDate: DateTime.now().plus({ years: 1 }).toJSDate(),
  standardStats: STANDARD_STATS,
  sapStats: LicenceUtils.emptyStats(),
};

const SERVER_STATUS: LicenceServerStatus = {
  hostname: "test-hostname",
  multi_appliance: false,
  supported_licence_versions: ["v2"],
  server_local_time: DateTime.now().toISO()!,
};

describe("LicenceModule", () => {
  let defaultProps: LicenceModule["props"];

  beforeEach(() => {
    defaultProps = {
      licenceInfo: FUTURE_LICENCE,
      licenceServerStatus: SERVER_STATUS,
      licenceError: null,
      loadingLicenceInfo: false,
      addMode: false,
      addingLicence: false,
      backButtonText: "Back",
      onAddLicence: jest.fn(),
      onRequestClose: jest.fn(),
      onAddModeChange: jest.fn(),
    };
  });

  it("renders without crashing", () => {
    const { getByText } = render(<LicenceModule {...defaultProps} />);
    getByText("test-id-licencev2");
  });

  it("renders the Standard edition for an appliance with no SAP licence", () => {
    const { getByText } = render(<LicenceModule {...defaultProps} />);
    getByText("Standard");
  });

  it("renders both editions for an appliance holding an SAP licence too", () => {
    const { getByText } = render(
      <LicenceModule
        {...defaultProps}
        licenceInfo={{ ...FUTURE_LICENCE, sapStats: SAP_STATS }}
      />,
    );
    getByText("Standard, SAP");
  });

  it("keeps the non-SAP licence version in the appliance ID", () => {
    const { getByText } = render(
      <LicenceModule
        {...defaultProps}
        licenceServerStatus={{
          ...SERVER_STATUS,
          supported_licence_versions: ["v2-sap", "v2", "v1"],
        }}
      />,
    );
    getByText("test-id-licencev2");
  });

  it("changes to add mode when add button is clicked", () => {
    const { getByText } = render(<LicenceModule {...defaultProps} />);
    getByText("Add Licence").click();
    expect(defaultProps.onAddModeChange).toHaveBeenCalledWith(true);
  });

  it("renders add mode", () => {
    const { getByText } = render(<LicenceModule {...defaultProps} addMode />);
    expect(getByText("Drag the Licence file", { exact: false })).toBeTruthy();
  });

  it("validates invalid licence", async () => {
    const { getByText } = render(<LicenceModule {...defaultProps} addMode />);
    fireEvent.change(document.querySelector("textarea")!, {
      target: { value: "test" },
    });
    await waitFor(() => {
      const addLicenceButton = getByText("Add Licence");
      expect(addLicenceButton.hasAttribute("disabled")).toBeTruthy();
    });
  });

  it("validates valid licence", async () => {
    const { getByText } = render(<LicenceModule {...defaultProps} addMode />);
    fireEvent.change(document.querySelector("textarea")!, {
      target: {
        value: `-----BEGIN CORIOLIS LICENCE-----
Version: 2.0
-----END CORIOLIS LICENCE-----`,
      },
    });
    await waitFor(() => {
      const addLicenceButton = getByText("Add Licence");
      expect(addLicenceButton.hasAttribute("disabled")).toBeFalsy();
    });
  });

  it("shows loading", () => {
    const { getByTestId } = render(
      <LicenceModule {...defaultProps} loadingLicenceInfo />,
    );
    expect(getByTestId("StatusImage").textContent).toBe("loading");
  });

  it("shows licence expires today", () => {
    render(
      <LicenceModule
        {...defaultProps}
        licenceInfo={{
          ...FUTURE_LICENCE,
          earliestLicenceExpiryDate: DateTime.now()
            .plus({ hours: 1 })
            .toJSDate(),
          latestLicenceExpiryDate: DateTime.now().plus({ hours: 1 }).toJSDate(),
        }}
      />,
    );

    expect(
      TestUtils.selectAll("LicenceModule__LicenceRowDescription")[0]
        .textContent,
    ).toContain("today at");
  });

  it("shows licence expired", () => {
    render(
      <LicenceModule
        {...defaultProps}
        licenceInfo={{
          ...FUTURE_LICENCE,
          earliestLicenceExpiryDate: DateTime.now()
            .minus({ hours: 1 })
            .toJSDate(),
          latestLicenceExpiryDate: DateTime.now()
            .minus({ hours: 1 })
            .toJSDate(),
        }}
      />,
    );

    expect(
      TestUtils.select("LicenceModule__LicenceRowContent")?.textContent,
    ).toContain("Please contact your Coriolis representative");
  });

  it("renders licence error", () => {
    const { getByText } = render(
      <LicenceModule {...defaultProps} licenceError="test-error" />,
    );
    expect(getByText("test-error")).toBeTruthy();
  });
});
