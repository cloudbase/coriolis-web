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
import MainList, {
  ItemComponentProps,
} from "@src/components/ui/Lists/MainList";
import styled from "styled-components";
import TestUtils from "@tests/TestUtils";

const ITEMS: any[] = [
  { id: "item-1", label: "Item 1" },
  { id: "item-2", label: "Item 2" },
  { id: "item-3", label: "Item 3" },
  { id: "item-3-a", label: "Item 3-a" },
];
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

const MainListWrap = (options?: {
  onItemClick?: () => void;
  onSelectedItemsChange?: (items: any[]) => void;
  onEmptyListButtonClick?: () => void;
  loading?: boolean;
  showEmptyList?: boolean;
}) => (
  <MainList
    items={ITEMS}
    selectedItems={[ITEMS[2], ITEMS[3]]}
    loading={Boolean(options?.loading)}
    onItemClick={options?.onItemClick || (() => {})}
    onSelectedChange={options?.onSelectedItemsChange || (() => {})}
    renderItemComponent={ItemComponent}
    showEmptyList={Boolean(options?.showEmptyList)}
    emptyListButtonLabel="New item"
    onEmptyListButtonClick={options?.onEmptyListButtonClick || (() => {})}
  />
);
describe("MainList", () => {
  it("renders items", () => {
    render(<MainListWrap />);
    const items = TestUtils.selectAll("MainListspec__MainListItem-");
    expect(items).toHaveLength(ITEMS.length);
    expect(items[0].querySelector("input")!.checked).toBe(false);
    expect(items[1].querySelector("input")!.checked).toBe(false);
    expect(items[2].querySelector("input")!.checked).toBe(true);
    expect(items[3].querySelector("input")!.checked).toBe(true);
  });

  it("fires item click", () => {
    const onItemClick = jest.fn();
    render(<MainListWrap onItemClick={onItemClick} />);
    TestUtils.selectAll("MainListspec__MainListItem-")[1].click();
    expect(onItemClick).toHaveBeenCalledWith(ITEMS[1]);
  });

  it("fires selection change", () => {
    const onSelectedItemsChange = jest.fn();
    render(<MainListWrap onSelectedItemsChange={onSelectedItemsChange} />);
    TestUtils.selectAll("MainListspec__MainListItem-")[1]
      .querySelector("input")!
      .click();
    expect(onSelectedItemsChange).toHaveBeenCalledWith(ITEMS[1], true);
    TestUtils.selectAll("MainListspec__MainListItem-")[1]
      .querySelector("input")!
      .click();
    expect(onSelectedItemsChange).toHaveBeenCalledWith(ITEMS[1], false);
  });

  it("shows loading", () => {
    const { rerender } = render(<MainListWrap loading />);
    expect(TestUtils.select("MainList__LoadingText")).toBeTruthy();
    rerender(<MainListWrap />);
    expect(TestUtils.select("MainList__LoadingText")).toBeFalsy();
  });

  it("shows empty list", () => {
    const { rerender } = render(<MainListWrap />);
    expect(TestUtils.select("MainList__EmptyList")).toBeFalsy();

    const onEmptyListButtonClick = jest.fn();
    rerender(
      <MainListWrap
        showEmptyList
        onEmptyListButtonClick={onEmptyListButtonClick}
      />
    );
    expect(TestUtils.select("MainList__EmptyList")).toBeTruthy();

    const button = TestUtils.select("MainList__EmptyList")?.querySelector(
      "button"
    );
    expect(button).toBeTruthy();
    expect(button!.textContent).toBe("New item");
    button?.click();
    expect(onEmptyListButtonClick).toHaveBeenCalled();
  });
});
