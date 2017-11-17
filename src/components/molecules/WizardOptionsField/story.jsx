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
import WizardOptionsField from './WizardOptionsField'

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
      <WizardOptionsField
        {...this.props}
        value={this.state.value}
        onChange={value => { this.handleChange(value) }}
      />
    )
  }
}

storiesOf('WizardOptionsField', module)
  .add('enum dropdown', () => (
    <WizardOptionsField
      type="string"
      name="Port Reuse"
      value="keep_mac"
      enum={['keep_mac', 'reuse_ports', 'replace_mac']}
    />
  ))
  .add('switch with strict-boolean', () => (
    <Wrapper
      name="Switch"
      type="boolean"
      value={undefined}
    />
  ))
