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
import Panel from "@src/components/ui/Panel";
import TestUtils from "@tests/TestUtils";
import { ThemePalette } from "@src/components/Theme";

const NAVIGATION_ITEMS: Panel["props"]["navigationItems"] = [
  { label: "Item 1", value: "item1" },
  { label: "Item 2", value: "item2", title: "Item 2 title" },
  { label: "Item 3", value: "item3", disabled: true },
  { label: "Item 4", value: "item4", loading: true },
];

const PanelWithDefaultProps = (props: Partial<Panel["props"]>) => (
  <Panel
    navigationItems={NAVIGATION_ITEMS}
    content={<div>Content</div>}
    selectedValue="item2"
    onChange={props.onChange || (() => {})}
    reloadLabel="Reload"
    onReloadClick={props.onReloadClick || (() => {})}
  />
);

describe("Panel", () => {
  it("renders the items", () => {
    render(<PanelWithDefaultProps />);
    const items = TestUtils.selectAll("Panel__NavigationItem");
    expect(items.length).toBe(NAVIGATION_ITEMS.length);
    expect(items[0].textContent).toBe(NAVIGATION_ITEMS[0].label);
    expect(items[1].getAttribute("title")).toBe(NAVIGATION_ITEMS[1].title);
    expect(items[2].hasAttribute("disabled")).toBe(true);
    expect(TestUtils.select("Panel__Loading", items[3])).toBeTruthy();
    expect(TestUtils.select("Panel__Content")!.textContent).toBe("Content");

    const selectedStyle = window.getComputedStyle(items[1]);
    const notSelectedStyle = window.getComputedStyle(items[0]);
    expect(TestUtils.rgbToHex(selectedStyle.color)).toBe(ThemePalette.primary);
    expect(notSelectedStyle.color).toBe("black");

    const disabledStyle = window.getComputedStyle(items[2]);
    const notDisabledStyle = window.getComputedStyle(items[0]);
    expect(TestUtils.rgbToHex(disabledStyle.color)).toBe(
      ThemePalette.grayscale[3]
    );
    expect(notDisabledStyle.color).toBe("black");
  });

  it("fires change", () => {
    const items = () => TestUtils.selectAll("Panel__NavigationItem");

    let onChange = jest.fn();
    const { rerender } = render(<PanelWithDefaultProps onChange={onChange} />);
    items()[0].click();

    onChange = jest.fn();
    rerender(<PanelWithDefaultProps onChange={onChange} />);
    items()[1].click(); // currently selected
    items()[2].click(); // disabled
    expect(onChange).not.toHaveBeenCalled();
  });

  it("fires reload", () => {
    const onReloadClick = jest.fn();
    render(<PanelWithDefaultProps onReloadClick={onReloadClick} />);
    TestUtils.select("Panel__ReloadButton")!.click();
    expect(onReloadClick).toHaveBeenCalled();
  });
});
