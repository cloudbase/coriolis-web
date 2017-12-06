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
import EndpointField from './EndpointField'

class Wrapper extends React.Component {
  constructor() {
    super()
    this.state = { value: null }
  }

  handleChange(value) {
    this.setState({ value })
  }

  render() {
    return (
      <EndpointField
        {...this.props}
        value={this.state.value}
        onChange={value => { this.handleChange(value) }}
      />
    )
  }
}

storiesOf('EndpointField', module)
  .add('text input', () => (
    <Wrapper name="field_name" type="string" />
  ))
  .add('text input large', () => (
    <Wrapper large name="field_name" type="string" />
  ))
  .add('text input disabled', () => (
    <Wrapper name="field_name" type="string" disabled />
  ))
  .add('text input highlight', () => (
    <Wrapper name="field_name" type="string" highlight />
  ))
  .add('text input password', () => (
    <Wrapper name="field_name" type="string" password />
  ))
  .add('switch', () => (
    <Wrapper name="migr_worker_use_config_drive" type="boolean" />
  ))
  .add('number dropdown', () => (
    <Wrapper name="field_name" type="integer" minimum={1} maximum={5} />
  ))
  .add('number dropdown large', () => (
    <Wrapper name="field_name" type="integer" minimum={1} maximum={5} large />
  ))
  .add('number dropdown disabled', () => (
    <Wrapper name="field_name" type="integer" minimum={1} maximum={5} disabled />
  ))
  .add('radio', () => (
    <Wrapper name="field_name" type="radio" />
  ))
  .add('radio disabled', () => (
    <Wrapper name="field_name" type="radio" disabled />
  ))
