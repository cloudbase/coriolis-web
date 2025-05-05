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
import FilterList from ".";

const items: any = [
  { id: "item-1", label: "Item 1" },
  { id: "item-2", label: "Item 2" },
  { id: "item-3", label: "Item 3" },
  { id: "item-3-a", label: "Item 3-a" },
];

const filterItems: any = [
  { label: "All", value: "all" },
  { label: "Items 1", value: "item-1" },
  { label: "Items 2", value: "item-2" },
  { label: "Items 3", value: "item-3" },
];

const actions: any = [{ label: "action", value: "action" }];
const props: any = {};
const itemFilterFunction = (item: any, filterStatus: any, filterText: any) => {
  if (
    (filterStatus !== "all" && item.id.indexOf(filterStatus) === -1) ||
    item.label.toLowerCase().indexOf(filterText) === -1
  ) {
    return false;
  }

  return true;
};

storiesOf("FilterList", module)
  .add("default", () => (
    <div style={{ width: "800px" }}>
      <FilterList
        items={items}
        actions={actions}
        filterItems={filterItems}
        renderItemComponent={options => (
          <div {...options}>{options.item.label}</div>
        )}
        itemFilterFunction={(...args) => itemFilterFunction(...args)}
        {...props}
      />
    </div>
  ))
  .add("empty list", () => (
    <div style={{ width: "800px" }}>
      <FilterList
        items={[]}
        filterItems={filterItems}
        itemFilterFunction={(...args) => itemFilterFunction(...args)}
        emptyListMessage="Empty list message"
        emptyListExtraMessage="Empty list extra message"
        emptyListButtonLabel="Create"
        {...props}
      />
    </div>
  ));
