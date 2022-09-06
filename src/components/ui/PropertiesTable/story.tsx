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
import PropertiesTable from ".";

const properties = [
  { type: "boolean", name: "prop-1", label: "Boolean" },
  { type: "strict-boolean", name: "prop-2", label: "Strict Boolean" },
  { type: "string", name: "prop-3", label: "String" },
  {
    type: "string",
    name: "prop-3a",
    label: "String",
    required: true,
  },
  {
    type: "string",
    enum: ["a", "b", "c"],
    name: "prop-4",
    label: "String enum",
    required: true,
  },
  {
    type: "string",
    enum: ["a", "b", "c", "a", "b", "c", "a", "b", "c", "a"],
    name: "prop-5",
    label: "String enum",
    required: true,
  },
];

class Wrapper extends React.Component<any, any> {
  state: any = {};

  handleChange(prop: any, value: any) {
    const state = this.state;
    state[prop.name] = value;
    this.setState({ ...state });
  }

  valueCallback(prop: any) {
    return this.state[prop.name];
  }

  render() {
    return (
      <div style={{ width: "320px", background: "white", padding: "50px" }}>
        <PropertiesTable
          properties={properties}
          valueCallback={prop => this.valueCallback(prop)}
          onChange={(prop, value) => {
            this.handleChange(prop, value);
          }}
          disabledLoading={this.props.disabledLoading}
        />
      </div>
    );
  }
}

storiesOf("PropertiesTable", module)
  .add("default", () => <Wrapper />)
  .add("disabled loading", () => <Wrapper disabledLoading />);
