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
import AutocompleteDropdown from ".";

const generateItem = (item: string, value?: string) => ({
  value: value || item.replace(/ /g, "_").toLowerCase(),
  label: item,
});

const itemsLong = [
  generateItem("Item 1"),
  generateItem("Item 2"),
  generateItem("Item 3"),
  generateItem("Item 4"),
  generateItem("Item 5"),
  generateItem("Item 6"),
  generateItem("Item 7"),
  generateItem("Item 8"),
  generateItem("Item 8", "item_8_2"),
  generateItem("Item 9"),
  generateItem("Item 10"),
  generateItem("Item 11"),
  generateItem("Item 12"),
  generateItem("Item 13"),
  generateItem("Item 14"),
  generateItem("Item 15"),
  generateItem("Item 16"),
  generateItem("Item 17"),
  generateItem("Item 18"),
  generateItem("Item 19"),
  generateItem("Item 20"),
];

const itemsShort = [
  generateItem("Item 1"),
  generateItem("Item 2"),
  generateItem("Item 3"),
];

type State = {
  selectedItem: string;
};
type Props = {
  items: { value: string; label: string }[];
  required?: boolean;
};
class Wrapper extends React.Component<Props, State> {
  state = {
    selectedItem: "",
  };

  render() {
    return (
      <AutocompleteDropdown
        items={this.props.items}
        selectedItem={this.state.selectedItem}
        onChange={selectedItem => {
          this.setState({ selectedItem });
        }}
        required={this.props.required}
        onInputChange={(value, filteredItems) => {
          if (filteredItems.length === 0) {
            console.log("input value", value);
          }
        }}
      />
    );
  }
}

storiesOf("AutocompleteDropdown", module)
  .add("default", () => <Wrapper items={itemsLong} />)
  .add("short list", () => <Wrapper items={itemsShort} />)
  .add("required", () => <Wrapper items={itemsShort} required />);
