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
import MainMultiFilterList from ".";

const items = [
  { label: "Item 1", value: "item-1" },
  { label: "Item 2", value: "item-2" },
  { label: "Item 3", value: "item-3" },
];

const actions = [
  { label: "Action 1", value: "action-1" },
  { label: "Action 2", value: "action-2" },
];

class Wrapper extends React.Component<any> {
  state = { selectedValue: "item-1", selectAllSelected: false };

  handleChange(selectedValue: string) {
    this.setState({ selectedValue });
  }

  handleSelectAllChange(selectAllSelected: boolean) {
    this.setState({ selectAllSelected });
  }

  render() {
    return (
      <MainMultiFilterList
        onReloadButtonClick={() => {}}
        onSearchChange={() => {}}
        selectionInfo={{ total: 0, selected: 0, label: "" }}
        items={[]}
        dropdownActions={[]}
        // eslint-disable-next-line react/jsx-props-no-spreading
        {...this.props}
        selectedValue={this.state.selectedValue}
        selectAllSelected={this.state.selectAllSelected}
        onFilterItemClick={item => {
          this.handleChange(item.value);
        }}
        onSelectAllChange={checked => {
          this.handleSelectAllChange(checked);
        }}
      />
    );
  }
}

storiesOf("MainMultiFilterList", module).add("default", () => (
  <Wrapper
    items={items}
    actions={actions}
    selectionInfo={{ selected: 2, total: 7, label: "items" }}
  />
));
