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

import WizardOptions from ".";

const fields: any = [
  {
    name: "integer with small min max",
    type: "integer",
    minimum: 10,
    maximum: 20,
  },
  {
    name: "integer with min",
    type: "integer",
    minimum: 10,
  },
  {
    name: "integer with max",
    type: "integer",
    maximum: 20,
  },
  {
    name: "list_all_destination_networks",
    type: "boolean",
  },
  {
    name: "migr_worker_use_config_drive",
    type: "boolean",
  },
  {
    name: "set_dhcp",
    type: "boolean",
  },
  {
    name: "enum_field",
    type: "string",
    enum: ["enum 1", "enum 2", "enum 3"],
  },
  {
    name: "long list",
    type: "string",
    enum: [
      "enum 1",
      "enum 2",
      "enum 3",
      "enum 4",
      "enum 5",
      "enum 6",
      "enum 7",
      "enum 8",
    ],
  },
  {
    name: "enum_field_autocomplete",
    type: "string",
    enum: [
      "enum 1",
      "enum 2",
      "enum 3",
      "enum 4",
      "enum 5",
      "enum 6",
      "enum 7",
      "enum 8",
      "enum 9",
      "enum 10",
    ],
  },
  {
    name: "string_field_with_default",
    type: "string",
    default: "default",
  },
  {
    required: true,
    name: "required_string_field",
    type: "string",
  },
  {
    name: "boolean_field",
    type: "boolean",
  },
  {
    name: "boolean_field_2",
    type: "boolean",
  },
  {
    name: "strict_boolean_field",
    type: "strict-boolean",
  },
];
// configLoader.config = { passwordFields: [] }
const props: any = {};
class Wrapper extends React.Component<any, any> {
  state = {
    useAdvancedOptions: true,
    data: {},
  };

  handleChange(field: any, value: any) {
    this.setState((prevState: any) => {
      const data: any = { ...prevState.data };
      data[field.name] = value;
      return { data };
    });
  }

  render() {
    return (
      <div
        style={{ width: "1024px", display: "flex", justifyContent: "center" }}
      >
        <WizardOptions
          {...this.props}
          data={this.state.data}
          onChange={(field, value) => {
            this.handleChange(field, value);
          }}
          useAdvancedOptions={this.state.useAdvancedOptions}
          onAdvancedOptionsToggle={isAdvanced => {
            this.setState({ useAdvancedOptions: isAdvanced });
          }}
          {...props}
        />
      </div>
    );
  }
}

storiesOf("WizardOptions", module)
  .add("replica", () => (
    <Wrapper fields={fields} selectedInstances={[]} wizardType="replica" />
  ))
  .add("migration", () => (
    <Wrapper fields={fields} selectedInstances={[]} wizardType="migration" />
  ))
  .add("multiple instances", () => (
    <Wrapper fields={fields} selectedInstances={[{}, {}]} />
  ))
  .add("loading", () => (
    <Wrapper
      fields={fields}
      selectedInstances={[]}
      wizardType="replica"
      optionsLoading
    />
  ));
