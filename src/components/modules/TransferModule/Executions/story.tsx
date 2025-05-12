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
import Executions from ".";

const tasks: any = [
  {
    progress_updates: [
      { message: "the task has a progress of 10%", created_at: new Date() },
    ],
    exception_details: "Exception details",
    status: "RUNNING",
    created_at: new Date(),
    depends_on: ["depends on id"],
    id: "abcdefg-abcdefg-abcdefg-abcdefg-abcdefg",
    task_type: "Task name 1",
  },
  {
    progress_updates: [
      { message: "the task has a progress of 10%", created_at: new Date() },
    ],
    exception_details: "Exception details",
    status: "COMPLETED",
    created_at: new Date(),
    depends_on: ["depends on id"],
    id: "hijklmn-hijklmn-hijklmn-hijklmn-hijklmn",
    task_type: "Task name 1",
  },
  {
    progress_updates: [
      { message: "the task has a progress of 10%", created_at: new Date() },
    ],
    exception_details: "Exception details",
    status: "COMPLETED",
    created_at: new Date(),
    depends_on: ["depends on id"],
    id: "opqrst-opqrst-opqrst-opqrst-opqrst",
    task_type: "Task name 1",
  },
  {
    progress_updates: [
      { message: "the task has a progress of 10%", created_at: new Date() },
    ],
    exception_details: "Exception details",
    status: "COMPLETED",
    created_at: new Date(),
    depends_on: ["depends on id"],
    id: "uvwxyz-uvwxyz-uvwxyz-uvwxyz-uvwxyz",
    task_type: "Task name 1",
  },
  {
    progress_updates: [
      { message: "the task has a progress of 10%", created_at: new Date() },
    ],
    exception_details: "Exception details",
    status: "COMPLETED",
    created_at: new Date(),
    depends_on: ["task-2"],
    id: "01234-01234-01234-01234-01234",
    task_type: "Task name 1",
  },
  {
    progress_updates: [
      { message: "the task has a progress of 50%", created_at: new Date() },
      { message: "the task is almost done", created_at: new Date() },
    ],
    exception_details: "Exception details",
    status: "UNSCHEDULED",
    created_at: new Date(),
    depends_on: ["depends on id"],
    id: "task-2",
    task_type: "Task name 2",
  },
  {
    progress_updates: [
      { message: "the task has a progress of 50%", created_at: new Date() },
      { message: "the task is almost done", created_at: new Date() },
    ],
    exception_details: "Exception details",
    status: "DEADLOCKED",
    created_at: new Date(),
    depends_on: ["depends on id"],
    id: "task-2",
    task_type: "Task name 2",
  },
  {
    progress_updates: [
      { message: "the task has a progress of 50%", created_at: new Date() },
      { message: "the task is almost done", created_at: new Date() },
    ],
    exception_details: "Exception details",
    status: "CANCELLING",
    created_at: new Date(),
    depends_on: [
      "abcdefg-abcdefg-abcdefg-abcdefg-abcdefg",
      "hijklmn-hijklmn-hijklmn-hijklmn-hijklmn",
      "opqrst-opqrst-opqrst-opqrst-opqrst",
      "uvwxyz-uvwxyz-uvwxyz-uvwxyz-uvwxyz",
      "01234-01234-01234-01234-01234",
    ],
    // depends_on: ['', 0, 's'],
    id: "67890-67890-67890-67890",
    task_type: "Task name 2",
  },
];

const item: any = {
  executions: [
    { id: "execution-1", status: "ERROR", created_at: new Date() },
    { id: "execution-2", status: "COMPLETED", created_at: new Date() },
    { id: "execution-2-1", status: "CANCELED", created_at: new Date() },
    {
      id: "execution-3",
      status: "RUNNING",
      created_at: new Date(),
      tasks,
    },
  ],
};
const props: any = {};

storiesOf("Executions", module)
  .add("default", () => (
    <div style={{ width: "800px" }}>
      <Executions item={item} {...props} />
    </div>
  ))
  .add("no executions", () => (
    <div style={{ width: "800px" }}>
      <Executions item={{}} {...props} />
    </div>
  ));
