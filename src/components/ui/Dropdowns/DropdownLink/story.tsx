/*
Copyright (C) 2017  Cloudbase Solutions SRL
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
import { storiesOf } from "@storybook/react";
import { ThemePalette } from "@src/components/Theme";
import DropdownLink from ".";

type State = {
  items: { label: string; value: string }[];
  selectedItem: string;
  selectedItems: string[];
};
class Wrapper extends React.Component<any, State> {
  state = {
    items: [
      { label: "Item 1", value: "item-1" },
      { label: "Item 2", value: "item-2" },
      { label: "Item 3", value: "item-3" },
    ],
    selectedItem: "item-1",
    selectedItems: [],
  };

  handleItemChange(selectedItem: string) {
    if (this.props.multipleSelection) {
      const selectedItems = this.state.selectedItems;
      if (selectedItems.find(i => i === selectedItem)) {
        this.setState({
          selectedItems: selectedItems.filter(i => i !== selectedItem),
        });
      } else {
        this.setState({ selectedItems: [...selectedItems, selectedItem] });
      }
    } else {
      this.setState({ selectedItem });
    }
  }

  render() {
    return (
      <div style={{ marginLeft: "100px" }}>
        <DropdownLink
          items={this.state.items}
          selectedItem={this.state.selectedItem}
          selectedItems={this.state.selectedItems}
          onChange={item => {
            this.handleItemChange(item.value);
          }}
          getLabel={
            this.props.getLLabel
              ? () =>
                  this.props.getLLabel
                    ? this.props.getLLabel(this.state.selectedItems)
                    : ""
              : undefined
          }
          // eslint-disable-next-line react/jsx-props-no-spreading
          {...this.props}
        />
      </div>
    );
  }
}

storiesOf("DropdownLink", module)
  .add("default", () => <Wrapper />)
  .add("searchable", () => <Wrapper searchable />)
  .add("multiple selection", () => (
    <Wrapper
      width="200px"
      getLLabel={(items: any[]) =>
        items.length > 0 ? items.join(", ") : "Choose something"
      }
      listWidth="120px"
      itemStyle={(item: { value: string }) =>
        `color: ${
          item.value === "remove" ? ThemePalette.alert : ThemePalette.black
        };`
      }
      multipleSelection
      items={[
        { value: "owner" },
        { value: "admin" },
        { value: "member", label: "member" },
      ]}
      labelStyle={{ color: ThemePalette.black }}
    />
  ));
