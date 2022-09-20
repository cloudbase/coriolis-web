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

/* eslint-disable react/jsx-props-no-spreading */

import React from "react";
import { storiesOf } from "@storybook/react";
import EndpointValidation from ".";

const props: any = {};
storiesOf("EndpointValidation", module)
  .add("validating", () => (
    <div style={{ width: "526px" }}>
      <EndpointValidation loading {...props} />
    </div>
  ))
  .add("valid", () => (
    <div style={{ width: "526px" }}>
      <EndpointValidation validation={{ valid: true }} {...props} />
    </div>
  ))
  .add("failed", () => (
    <div style={{ width: "526px" }}>
      <EndpointValidation validation={{}} {...props} />
    </div>
  ))
  .add("failed custom message", () => (
    <div style={{ width: "526px" }}>
      <EndpointValidation
        validation={{ message: "Failed because of reasons" }}
        {...props}
      />
    </div>
  ));
