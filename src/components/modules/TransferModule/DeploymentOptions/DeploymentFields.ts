/*
Copyright (C) 2024 Cloudbase Solutions SRL
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

import { Field } from "@src/@types/Field";

const deploymentFields: Field[] = [
  {
    name: "clone_disks",
    type: "boolean",
    value: true,
  },
  {
    name: "force",
    type: "boolean",
  },
  {
    name: "skip_os_morphing",
    type: "boolean",
  },
];

export default deploymentFields;
