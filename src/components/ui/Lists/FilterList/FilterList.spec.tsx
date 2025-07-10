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

import React, { act } from "react";
import styled from "styled-components";
import { render } from "@testing-library/react";
import FilterList from "@src/components/ui/Lists/FilterList";
import TestUtils from "@tests/TestUtils";
import userEvent from "@testing-library/user-event";
import { ItemComponentProps } from "@src/components/ui/Lists/MainList";

jest.mock("@src/utils/Config", () => ({
  config: { defaultListItemsPerPage: 2 },
}));

const ITEMS = [
  { id: "item-1", label: "Item 1" },
  { id: "item-2", label: "Item 2" },
  { id: "item-3", label: "Item 3" },
  { id: "item-3-a", label: "Item 3-a" },
];

const FILTER_ITEMS = [
  { label: "All", value: "all" },
  { label: "Items 1", value: "item-1" },
  { label: "Items 2", value: "item-2" },
  { label: "Items 3", value: "item-3" },
];

const itemFilterFunction = (
  item: any,
  filterStatus?: string | null,
  filterText?: string,
) => {
  if (
    (filterStatus !== "all" && item.id.indexOf(filterStatus) === -1) ||
    item.label.indexOf(filterText) === -1
  ) {
    return false;
  }

  return true;
};

const MainListItem = styled.div``;

const ItemComponent = (props: ItemComponentProps) => (
  <MainListItem key={props.key} onClick={() => props.onClick()}>
    <input
      type="checkbox"
      defaultChecked={props.selected}
      onChange={e => {
        props.onSelectedChange(e.currentTarget.checked);
      }}
    />
    {props.item.label}
  </MainListItem>
);

const FilterListWrap = (options?: {
  onItemClick?: () => void;
  onSelectedItemsChange?: (items: any[]) => void;
}) => (
  <FilterList
    items={ITEMS}
    filterItems={FILTER_ITEMS}
    itemFilterFunction={itemFilterFunction}
    loading={false}
    onReloadButtonClick={() => {}}
    onItemClick={options?.onItemClick || (() => {})}
    selectionLabel="test item"
    renderItemComponent={ItemComponent}
    onSelectedItemsChange={options?.onSelectedItemsChange || (() => {})}
  />
);

describe("FilterList", () => {
  beforeAll(() => {
    window.HTMLElement.prototype.scrollTo = jest.fn();
  });

  it("renders all elements", () => {
    render(FilterListWrap());
    const filterItems = TestUtils.selectAll("MainListFilter__FilterItem");
    expect(filterItems).toHaveLength(FILTER_ITEMS.length);
    expect(filterItems[2].textContent).toBe(FILTER_ITEMS[2].label);
    const listItems = TestUtils.selectAll("FilterListspec__MainListItem-");
    expect(listItems).toHaveLength(2);
    expect(listItems[1].textContent).toBe(ITEMS[1].label);
    expect(TestUtils.select("Pagination__PageNumber")?.textContent).toBe(
      "1 of 2",
    );
  });

  it("filters items", async () => {
    render(FilterListWrap());
    await act(async () => {
      TestUtils.selectAll("MainListFilter__FilterItem")[3].click();
    });
    const listItems = () =>
      TestUtils.selectAll("FilterListspec__MainListItem-");
    expect(listItems()).toHaveLength(2);
    expect(listItems()[1].textContent).toBe(ITEMS[3].label);

    userEvent.type(
      TestUtils.selectInput(
        "TextInput__Input",
        TestUtils.select("SearchInput__Wrapper")!,
      )!,
      "Item 3-a",
    );
    expect(listItems()).toHaveLength(1);
    expect(listItems()[0].textContent).toBe(ITEMS[3].label);

    userEvent.type(
      TestUtils.selectInput(
        "TextInput__Input",
        TestUtils.select("SearchInput__Wrapper")!,
      )!,
      "gibberish",
    );
    expect(TestUtils.select("MainList__NoResults")).toBeTruthy();
  });

  it("goes to next page", async () => {
    render(FilterListWrap());
    await act(async () => {
      TestUtils.select("Pagination__PageNext")?.click();
    });

    expect(TestUtils.select("Pagination__PageNumber")?.textContent).toBe(
      "2 of 2",
    );
    expect(
      TestUtils.selectAll("FilterListspec__MainListItem-")[1].textContent,
    ).toBe(ITEMS[3].label);
  });

  it("fires item click", () => {
    const onItemClick = jest.fn();
    render(FilterListWrap({ onItemClick }));
    TestUtils.selectAll("FilterListspec__MainListItem-")[1].click();
    expect(onItemClick).toHaveBeenCalledWith(ITEMS[1]);
  });

  it("selects items", async () => {
    const onSelectedItemsChange = jest.fn();
    render(FilterListWrap({ onSelectedItemsChange }));
    const checkbox = TestUtils.selectAll(
      "FilterListspec__MainListItem-",
    )[1].querySelector("input") as HTMLInputElement;
    expect(checkbox.checked).toBe(false);
    await act(async () => {
      checkbox.click();
    });
    expect(checkbox.checked).toBe(true);
    expect(TestUtils.select("MainListFilter__SelectionText")?.textContent).toBe(
      "1 of 4\u00a0test item(s) selected",
    );
    expect(onSelectedItemsChange).toHaveBeenCalledWith([ITEMS[1]]);
  });
});
