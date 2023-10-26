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

import DateUtils from "@src/utils/DateUtils";
import { render } from "@testing-library/react";
import { METALHUB_SERVER_MOCK } from "@tests/mocks/MetalHubServerMock";
import TestUtils from "@tests/TestUtils";

import MetalHubServerDetailsContent from "./MetalHubServerDetailsContent";

jest.mock("@src/components/ui/Arrow", () => ({
  __esModule: true,
  default: (props: any) => (
    <div data-testid="Arrow">Orientation: {props.orientation}</div>
  ),
}));

describe("MetalHubServerDetailsContent", () => {
  let defaultProps: MetalHubServerDetailsContent["props"];

  beforeEach(() => {
    defaultProps = {
      server: { ...METALHUB_SERVER_MOCK },
      loading: false,
      creatingMigration: false,
      creatingReplica: false,
      onCreateReplicaClick: jest.fn(),
      onCreateMigrationClick: jest.fn(),
      onDeleteClick: jest.fn(),
    };
  });

  it("renders without crashing", () => {
    render(<MetalHubServerDetailsContent {...defaultProps} />);
    const getText = (text: string) => {
      let element: Element | null = null;
      document.querySelectorAll("*").forEach(el => {
        if (el.textContent && el.textContent.includes(text)) {
          element = el;
        }
      });
      if (!element) throw new Error(`Element with text "${text}" not found`);
      return element;
    };
    expect(getText(METALHUB_SERVER_MOCK.hostname!)).toBeTruthy();
    expect(getText(METALHUB_SERVER_MOCK.api_endpoint)).toBeTruthy();
    expect(
      getText(
        DateUtils.getLocalDate(METALHUB_SERVER_MOCK.created_at).toFormat(
          "yyyy-LL-dd HH:mm:ss"
        )
      )
    ).toBeTruthy();

    expect(
      getText(`${METALHUB_SERVER_MOCK.physical_cores} physical`)
    ).toBeTruthy();
    expect(
      getText(`${METALHUB_SERVER_MOCK.logical_cores} logical`)
    ).toBeTruthy();
    expect(
      getText(
        `${METALHUB_SERVER_MOCK.os_info.os_name} ${METALHUB_SERVER_MOCK.os_info.os_version}`
      )
    ).toBeTruthy();
  });

  it("handles row click", () => {
    const { getAllByTestId } = render(
      <MetalHubServerDetailsContent {...defaultProps} />
    );
    const row = TestUtils.select("TransferDetailsTable__Row-")!;
    expect(row).toBeTruthy();
    expect(getAllByTestId("Arrow")[0].textContent).toBe("Orientation: down");
    row.click();
    expect(getAllByTestId("Arrow")[0].textContent).toBe("Orientation: up");

    row.click();
    expect(getAllByTestId("Arrow")[0].textContent).toBe("Orientation: down");
  });

  it("renders loading", () => {
    render(<MetalHubServerDetailsContent {...defaultProps} loading />);
    expect(
      TestUtils.select("MetalHubServerDetailsContent__LoadingWrapper")
    ).toBeTruthy();
  });
});
