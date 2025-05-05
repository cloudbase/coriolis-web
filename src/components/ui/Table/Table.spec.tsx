/*
Copyright (C) 2021  Cloudbase Solutions SRL
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
import Table from ".";

const ITEMS = [
  ["item-1", "item-2", "item-3", "item-4", "item-5"],
  ["item-6", "item-7", "item-8", "item-9", "item-10"],
];
const HEADER = ["Header 1", "Header 2", "Header 3", "Header 4", "Header 5"];

describe("Table", () => {
  it("renders no items label and no items custom component", () => {
    const { rerender } = render(<Table items={[]} header={[]} />);
    expect(TestUtils.select("Table__NoItems")).toBeTruthy();
    expect(TestUtils.select("Table__NoItems")?.textContent).toBe("No items!");

    rerender(<Table items={[]} header={[]} noItemsLabel="Zero items" />);
    expect(TestUtils.select("Table__NoItems")!.textContent).toBe("Zero items");

    rerender(
      <Table
        items={[]}
        header={[]}
        noItemsComponent={<div className="no-items-component">Zero</div>}
      />,
    );
    expect(document.querySelector(".no-items-component")).toBeTruthy();
    expect(document.querySelector(".no-items-component")!.textContent).toBe(
      "Zero",
    );
  });

  it("renders header", () => {
    render(<Table items={[]} header={HEADER} />);
    expect(TestUtils.select("Table__NoItems")).toBeTruthy();

    expect(TestUtils.selectAll("Table__HeaderData")).toHaveLength(
      HEADER.length,
    );
    HEADER.forEach((headerItem, i) => {
      expect(TestUtils.selectAll("Table__HeaderData")[i]!.textContent).toBe(
        headerItem,
      );
    });
    const style = window.getComputedStyle(
      TestUtils.selectAll("Table__HeaderData")[1]!,
    );
    expect(style.maxWidth).toBe(`${100 / HEADER.length}%`);
  });

  it("renders text items", () => {
    render(<Table items={ITEMS} header={HEADER} />);
    expect(TestUtils.selectAll("Table__Row-")).toHaveLength(ITEMS.length);
    ITEMS.forEach((rowData, rowIndex) => {
      const cellsEl = TestUtils.selectAll(
        "Table__RowData",
        TestUtils.selectAll("Table__Row-")[rowIndex]!,
      );
      rowData.forEach((cellData, cellIndex) => {
        expect(cellsEl[cellIndex]!.textContent).toBe(cellData);
      });
    });
  });

  it("renders items with custom row components", () => {
    const items = [
      [
        <div key="1" className="row-1-data-1">
          Row 1 data 1
        </div>,
        <div key="2" className="row-1-data-2">
          Row 1 data 2
        </div>,
      ],
      [
        <div key="2" className="row-2-data">
          Row 2 data
        </div>,
      ],
    ];
    render(<Table items={items} header={["header 1", "header 2"]} />);
    const rowsEl = TestUtils.selectAll("Table__Row-");
    expect(rowsEl).toHaveLength(2);
    expect(TestUtils.selectAll("Table__RowData", rowsEl[0])).toHaveLength(2);
    expect(TestUtils.selectAll("Table__RowData", rowsEl[1])).toHaveLength(1);
    expect(
      TestUtils.selectAll("Table__RowData", rowsEl[0])[0]!.textContent,
    ).toBe("Row 1 data 1");
    expect(
      TestUtils.selectAll("Table__RowData", rowsEl[0])[1]!.textContent,
    ).toBe("Row 1 data 2");
    expect(
      TestUtils.selectAll("Table__RowData", rowsEl[1])[0]!.textContent,
    ).toBe("Row 2 data");
  });
});
