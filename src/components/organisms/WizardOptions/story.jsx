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

import React from 'react'
import { storiesOf } from '@storybook/react'
import WizardOptions from './WizardOptions'

let fields = [
  {
    name: 'separate_vm',
    type: 'boolean',
  },
  {
    name: 'string_field',
    type: 'string',
  },
  {
    name: 'string_field_with_default',
    type: 'string',
    default: 'default',
  },
  {
    required: true,
    name: 'required_string_field',
    type: 'string',
  },
  {
    name: 'enum_field',
    type: 'string',
    enum: ['enum 1', 'enum 2', 'enum 3'],
  },
  {
    name: 'boolean_field',
    type: 'boolean',
  },
  {
    name: 'boolean_field_2',
    type: 'boolean',
  },
  {
    name: 'strict_boolean_field',
    type: 'strict-boolean',
  },
]

class Wrapper extends React.Component {
  constructor() {
    super()
    this.state = {
      useAdvancedOptions: true,
      data: {},
    }
  }

  handleChange(field, value) {
    let data = { ...this.state.data }
    data[field.name] = value
    this.setState({ data })
  }

  render() {
    return (
      <div style={{ width: '800px', display: 'flex', justifyContent: 'center' }}>
        <WizardOptions
          {...this.props}
          data={this.state.data}
          onChange={(field, value) => { this.handleChange(field, value) }}
          useAdvancedOptions={this.state.useAdvancedOptions}
          onAdvancedOptionsToggle={isAdvanced => { this.setState({ useAdvancedOptions: isAdvanced }) }}
        />
      </div>
    )
  }
}

storiesOf('WizardOptions', module)
  .add('replica', () => (
    <Wrapper
      fields={fields}
      selectedInstances={[]}
      wizardType="replica"
    />
  ))
  .add('migration', () => (
    <Wrapper
      fields={fields}
      selectedInstances={[]}
      wizardType="migration"
    />
  ))
  .add('multiple instances', () => (
    <Wrapper
      fields={fields}
      selectedInstances={[{}, {}]}
    />
  ))
