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

import React, { useState, act } from "react";
import { render } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import MainListFilter from "@src/components/ui/Lists/MainListFilter";
import { DropdownAction } from "@src/components/ui/Dropdowns/ActionDropdown";
import TestUtils from "@tests/TestUtils";
import { ThemePalette } from "@src/components/Theme";

const FILTER_ITEMS = [
  { label: "All", value: "all" },
  { label: "Items 1", value: "item-1" },
  { label: "Items 2", value: "item-2" },
  { label: "Items 3", value: "item-3" },
];

const ACTIONS: DropdownAction[] = [
  {
    label: "Action 1",
    title: "Action 1 Description",
    action: jest.fn(),
  },
  {
    label: "Action 2",
    disabled: true,
    action: jest.fn(),
  },
];

const MainListFilterWrapper = (props?: {
  onFilterItemClick?: (item: any) => void;
  onReloadButtonClick?: () => void;
  onSearchChange?: (value: string) => void;
  onSelectAllChange?: (checked: boolean) => void;
}) => {
  const [selectAllSelected, setSelectAllSelected] = useState(false);
  return (
    <MainListFilter
      onFilterItemClick={props?.onFilterItemClick || (() => {})}
      onReloadButtonClick={props?.onReloadButtonClick || (() => {})}
      onSearchChange={props?.onSearchChange || (() => {})}
      onSelectAllChange={checked => {
        setSelectAllSelected(checked);
        if (props?.onSelectAllChange) {
          props.onSelectAllChange(checked);
        }
      }}
      selectedValue="item-2"
      selectionInfo={{ total: 3, selected: 1, label: "test item" }}
      selectAllSelected={selectAllSelected}
      items={FILTER_ITEMS}
      dropdownActions={ACTIONS}
      searchValue="test"
    />
  );
};

describe("MainListFilter", () => {
  it("renders all basic elements", () => {
    render(<MainListFilterWrapper />);
    const items = TestUtils.selectAll("MainListFilter__FilterItem-");
    expect(items).toHaveLength(FILTER_ITEMS.length);
    expect(items[2].textContent).toBe(FILTER_ITEMS[2].label);
    expect(
      TestUtils.select("SearchInput__Wrapper")?.querySelector("input")?.value
    ).toBe("test");
    expect(TestUtils.select("MainListFilter__SelectionText")?.textContent).toBe(
      "1 of 3\u00a0test item(s) selected"
    );
  });

  it("renders actions", async () => {
    render(<MainListFilterWrapper />);
    await act(async () => {
      TestUtils.select("DropdownButton__Wrapper")?.click();
    });
    const actions = TestUtils.selectAll("ActionDropdown__ListItem-");
    expect(actions).toHaveLength(ACTIONS.length);
    expect(actions[0].textContent).toBe(ACTIONS[0].label);
    expect(actions[0].hasAttribute("disabled")).toBeFalsy();
    expect(actions[1].hasAttribute("disabled")).toBeTruthy();
    await act(async () => {
      actions[0].click();
      actions[1].click();
    });
    expect(ACTIONS[0].action).toHaveBeenCalled();
    expect(ACTIONS[1].action).not.toHaveBeenCalled();
  });

  it("fires filter item click", () => {
    const onFilterItemClick = jest.fn();
    render(<MainListFilterWrapper onFilterItemClick={onFilterItemClick} />);
    TestUtils.selectAll("MainListFilter__FilterItem-")[1].click();
    expect(onFilterItemClick).toHaveBeenCalledWith(FILTER_ITEMS[1]);
  });

  it("has select all change", async () => {
    const onSelectAllChange = jest.fn();
    render(<MainListFilterWrapper onSelectAllChange={onSelectAllChange} />);

    const checkbox = TestUtils.select("Checkbox__Wrapper")!;
    const style = () => window.getComputedStyle(checkbox);
    expect(TestUtils.rgbToHex(style().backgroundColor)).toBe("white");
    await act(async () => {
      checkbox.click();
    });
    expect(TestUtils.rgbToHex(style().backgroundColor)).toBe(
      ThemePalette.primary
    );

    expect(onSelectAllChange).toHaveBeenCalledWith(true);
    await act(async () => {
      checkbox.click();
    });
    expect(onSelectAllChange).toHaveBeenCalledWith(false);
    expect(TestUtils.rgbToHex(style().backgroundColor)).toBe("white");
  });

  it("fires reload button click", () => {
    const onReloadButtonClick = jest.fn();
    render(<MainListFilterWrapper onReloadButtonClick={onReloadButtonClick} />);
    TestUtils.select("ReloadButton__Wrapper")!.click();
    expect(onReloadButtonClick).toHaveBeenCalled();
  });

  it("fires search change", () => {
    const onSearchChange = jest.fn();
    render(<MainListFilterWrapper onSearchChange={onSearchChange} />);
    userEvent.type(
      TestUtils.select("SearchInput__Wrapper")?.querySelector("input")!,
      "test2"
    );
    expect(onSearchChange).toHaveBeenCalledWith("test2");
  });
});
