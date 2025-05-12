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
import WizardSummary from ".";

const data: any = {
  options: {
    description: "A description",
    field_name: "Field name value",
  },
  selectedInstances: [
    {
      flavor_name: "flavor name",
      id: "i-1",
      name: "name",
      num_cpu: 2,
      memory_mb: 1024,
    },
  ],
  networks: [
    {
      sourceNic: { id: "s-1", network_name: "n-1" },
      targetNetwork: { name: "target network" },
    },
  ],
  source: {
    type: "openstack",
    name: "source name",
  },
  target: {
    type: "azure",
    name: "target name",
  },
  schedules: [
    {
      id: "s-1",
      schedule: {
        month: 2,
        dom: 14,
        dow: 3,
        minute: 0,
        hour: 17,
      },
    },
  ],
};
const props: any = {};
storiesOf("WizardSummary", module)
  .add("replica", () => (
    <div style={{ width: "800px" }}>
      <WizardSummary wizardType="replica" data={data} {...props} />
    </div>
  ))
  .add("migration", () => (
    <div style={{ width: "800px" }}>
      <WizardSummary wizardType="migration" data={data} {...props} />
    </div>
  ));
