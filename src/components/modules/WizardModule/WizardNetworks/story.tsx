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
import WizardNetworks from ".";

const networks: any = [
  { name: "network 1", value: "n-1" },
  { name: "network 2", value: "n-2" },
];

const instancesDetails: any = [
  {
    devices: { nics: [{ network_name: "network 1", id: "n-1" }] },
    instance_name: "Instance name 1",
  },
  {
    devices: { nics: [{ network_name: "network 2", id: "n-2" }] },
    instance_name: "Instance name 2",
  },
];

const selectedNetworks: any = [
  {
    sourceNic: { id: "n-2" },
    targetNetwork: { name: "network 1" },
  },
];
const props: any = {};
storiesOf("WizardNetworks", module)
  .add("default", () => (
    <WizardNetworks
      networks={networks}
      instancesDetails={instancesDetails}
      selectedNetworks={selectedNetworks}
      {...props}
    />
  ))
  .add("loading", () => (
    <WizardNetworks
      networks={networks}
      instancesDetails={instancesDetails}
      selectedNetworks={selectedNetworks}
      {...props}
      loading
    />
  ))
  .add("render no nics", () => (
    <WizardNetworks
      networks={networks}
      instancesDetails={[{ ...instancesDetails[0], devices: { nics: [] } }]}
      {...props}
      selectedNetworks={selectedNetworks}
    />
  ));
