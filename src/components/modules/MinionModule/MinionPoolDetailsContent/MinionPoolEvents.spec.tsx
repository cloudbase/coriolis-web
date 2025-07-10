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

import { render } from "@testing-library/react";
import { MINION_POOL_DETAILS_MOCK } from "@tests/mocks/MinionPoolMock";
import TestUtils from "@tests/TestUtils";

import MinionPoolEvents from "./MinionPoolEvents";

jest.mock("@src/utils/Config", () => ({
  config: {
    maxMinionPoolEventsPerPage: 1,
  },
}));

describe("MinionPoolEvents", () => {
  let defaultProps: MinionPoolEvents["props"];

  beforeEach(() => {
    defaultProps = {
      item: MINION_POOL_DETAILS_MOCK,
    };
  });

  it("renders without crashing", () => {
    render(<MinionPoolEvents {...defaultProps} />);
    expect(TestUtils.select("MinionPoolEvents__Message")?.textContent).toBe(
      MINION_POOL_DETAILS_MOCK.events[0].message,
    );
  });

  it.each`
    fromLabel             | toLabel
    ${"Events"}           | ${"Progress Updates"}
    ${"Events"}           | ${"Events & Progress Updates"}
    ${"INFO Event Level"} | ${"DEBUG Event Level"}
    ${"INFO Event Level"} | ${"ERROR Event Level"}
    ${"Descending Order"} | ${"Ascending Order"}
  `("filters by $fromLabel to $toLabel", async ({ fromLabel, toLabel }) => {
    render(<MinionPoolEvents {...defaultProps} />);
    let filterDropdown: HTMLElement | null = null;
    TestUtils.selectAll("DropdownLink__Label").forEach(element => {
      if (element.textContent === fromLabel) {
        filterDropdown = element;
      }
    });
    expect(filterDropdown).toBeTruthy();
    await act(async () => {
      filterDropdown!.click();
    });
    let listItem: HTMLElement | null = null;
    TestUtils.selectAll("DropdownLink__ListItem-").forEach(element => {
      if (element.textContent === toLabel) {
        listItem = element;
      }
    });
    expect(listItem).toBeTruthy();

    await act(async () => {
      listItem!.click();
    });

    TestUtils.selectAll("DropdownLink__Label").forEach(element => {
      if (element.textContent === toLabel) {
        filterDropdown = element;
      }
    });
    expect(filterDropdown).toBeTruthy();
  });

  describe("ArrowPagination", () => {
    const showAllEvents = async () => {
      let showAllEvents: HTMLElement | null = null;
      TestUtils.selectAll("DropdownLink__Label").forEach(element => {
        if (element.textContent === "Events") {
          showAllEvents = element;
        }
      });
      expect(showAllEvents).toBeTruthy();
      await act(async () => {
        showAllEvents!.click();
      });
      let listItem: HTMLElement | null = null;
      TestUtils.selectAll("DropdownLink__ListItem-").forEach(element => {
        if (element.textContent === "Events & Progress Updates") {
          listItem = element;
        }
      });
      expect(listItem).toBeTruthy();
      await act(async () => {
        listItem!.click();
      });
    };

    it("has pagination", async () => {
      render(<MinionPoolEvents {...defaultProps} />);

      // pagination is not visible for 1 event
      expect(TestUtils.select("ArrowPagination__Wrapper")!).toBeFalsy();

      await showAllEvents();

      // pagination is visible for more than 1 event
      expect(TestUtils.select("ArrowPagination__Wrapper")!).toBeTruthy();
    });

    it("goes to next page and back", async () => {
      render(<MinionPoolEvents {...defaultProps} />);

      await showAllEvents();

      expect(
        TestUtils.select("ArrowPagination__PagePrevious")!.hasAttribute(
          "disabled",
        ),
      ).toBeTruthy();
      expect(TestUtils.select("ArrowPagination__PageNumber")!.textContent).toBe(
        "1 of 3",
      );

      await act(async () => {
        TestUtils.select("ArrowPagination__PageNext")!.click();
      });

      expect(
        TestUtils.select("ArrowPagination__PagePrevious")!.hasAttribute(
          "disabled",
        ),
      ).toBeFalsy();
      expect(TestUtils.select("ArrowPagination__PageNumber")!.textContent).toBe(
        "2 of 3",
      );

      await act(async () => {
        TestUtils.select("ArrowPagination__PagePrevious")!.click();
      });
      expect(TestUtils.select("ArrowPagination__PageNumber")!.textContent).toBe(
        "1 of 3",
      );
    });
  });
});
