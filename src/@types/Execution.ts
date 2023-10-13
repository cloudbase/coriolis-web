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

import { Task } from "./Task";

export type Execution = {
  id: string;
  number: number;
  status: string;
  created_at: string;
  updated_at: string;
  deleted_at?: string;
  type:
    | "replica_execution"
    | "replica_disks_delete"
    | "replica_deploy"
    | "replica_update";
};

export type ExecutionTasks = Execution & {
  tasks: Task[];
};
