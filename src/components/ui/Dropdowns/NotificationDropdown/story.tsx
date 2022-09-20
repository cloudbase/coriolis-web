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

import type { NotificationItemData } from "@src/@types/NotificationItem";
import NotificationDropdown from ".";

const items: NotificationItemData[] = [
  {
    id: "1111",
    name: "ubtuntu-1804-bionic",
    type: "replica",
    status: "COMPLETED",
    unseen: true,
    description: "This is a description",
  },
  {
    id: "2222",
    name: "centos7-8VCPU",
    type: "migration",
    status: "ERROR",
    description: "This is a description",
  },
];

const itemsWithLoading: NotificationItemData[] = [
  ...items,
  {
    id: "3333",
    name: "ubuntu-1804-bionic",
    type: "replica",
    status: "RUNNING",
    description: "This is a description",
  },
];

storiesOf("NotificationDropdown", module)
  .add("default", () => (
    <div style={{ marginLeft: "200px" }}>
      <NotificationDropdown items={items} onClose={() => {}} />
    </div>
  ))
  .add("white", () => (
    <div style={{ marginLeft: "200px" }}>
      <NotificationDropdown white items={itemsWithLoading} onClose={() => {}} />
    </div>
  ))
  .add("loading", () => (
    <div style={{ marginLeft: "200px" }}>
      <NotificationDropdown items={itemsWithLoading} onClose={() => {}} />
    </div>
  ));
