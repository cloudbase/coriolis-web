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
import styled from 'styled-components'
import WizardOptionsField from '.'

const WizardOptionsFieldStyled = styled(WizardOptionsField) `
  width: 319px;
  justify-content: space-between;
`

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
      <div style={{ width: '800px' }}>
        <WizardOptionsFieldStyled
          {...this.props}
          value={this.state.value}
          onChange={value => { this.handleChange(value) }}
        />
      </div>
    )
  }
}

storiesOf('WizardOptionsField', module)
  .add('string', () => (
    <Wrapper
      name="String input"
      type="string"
    />
  ))
  .add('switch with boolean', () => (
    <Wrapper
      name="Switch"
      type="boolean"
    />
  ))
  .add('switch with strict-boolean', () => (
    <Wrapper
      name="Switch"
      type="strict-boolean"
    />
  ))
  .add('enum dropdown', () => (
    <Wrapper
      type="string"
      name="Port Reuse"
      enum={['keep_mac', 'reuse_ports', 'replace_mac']}
    />
  ))
  .add('object table', () => (
    <Wrapper
      type="object"
      name="Object table"
      properties={[
        { type: 'boolean', name: 'prop-1', label: 'Property 1' },
        { type: 'boolean', name: 'prop-2', label: 'Property 2' },
      ]}
      valueCallback={prop => prop.name === 'prop-2'}
    />
  ))
