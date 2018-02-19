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
import styled from 'styled-components'
import PropTypes from 'prop-types'

import { Button, WizardOptionsField } from 'components'

import LabelDictionary from '../../../utils/LabelDictionary'
import KeyboardManager from '../../../utils/KeyboardManager'
import replicaMigrationImage from './images/replica-migration.svg'

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0 32px 32px 32px;
`
const Image = styled.div`
  width: 288px;
  height: 96px;
  background: url('${replicaMigrationImage}') center no-repeat;
  margin: 80px 0;
`
const Form = styled.div`
  display: flex;
  flex-wrap: wrap;
  margin-left: -64px;
  width: 300px;
  margin: 0 auto 46px auto;
`
const Buttons = styled.div`
  display: flex;
  justify-content: space-between;
  width: 100%;
`
const WizardOptionsFieldStyled = styled(WizardOptionsField)`
  width: 319px;
  justify-content: space-between;
  margin-bottom: 32px;
`

class ReplicaMigrationOptions extends React.Component {
  static propTypes = {
    onCancelClick: PropTypes.func,
    onMigrateClick: PropTypes.func,
  }

  constructor() {
    super()

    this.state = {
      fields: [
        {
          name: 'clone_disks',
          type: 'strict-boolean',
          value: true,
        },
        {
          name: 'force',
          type: 'strict-boolean',
        },
        {
          name: 'skip_os_morphing',
          type: 'strict-boolean',
        },
      ],
    }
  }

  componentDidMount() {
    KeyboardManager.onEnter('migration-options', () => { this.props.onMigrateClick(this.state.fields) }, 2)
  }

  componentWillUnmount() {
    KeyboardManager.removeKeyDown('migration-options')
  }

  handleValueChange(field, value) {
    this.state.fields.find(f => f.name === field.name).value = value
    this.setState({ fields: this.state.fields })
  }

  render() {
    return (
      <Wrapper>
        <Image />
        <Form>
          {this.state.fields.map(field => {
            return (
              <WizardOptionsFieldStyled
                key={field.name}
                name={field.name}
                type={field.type}
                value={field.value}
                label={LabelDictionary.get(field.name)}
                onChange={value => this.handleValueChange(field, value)}
              />
            )
          })}
        </Form>
        <Buttons>
          <Button secondary onClick={this.props.onCancelClick}>Cancel</Button>
          <Button onClick={() => { this.props.onMigrateClick(this.state.fields) }}>Migrate</Button>
        </Buttons>
      </Wrapper>
    )
  }
}

export default ReplicaMigrationOptions
