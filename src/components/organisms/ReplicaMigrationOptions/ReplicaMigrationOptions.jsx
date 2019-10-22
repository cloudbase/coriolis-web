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

// @flow

import React from 'react'
import { observer } from 'mobx-react'
import styled from 'styled-components'

import Button from '../../atoms/Button'
import FieldInput from '../../molecules/FieldInput'

import LabelDictionary from '../../../utils/LabelDictionary'
import KeyboardManager from '../../../utils/KeyboardManager'
import replicaMigrationImage from './images/replica-migration.svg'
import type { Field } from '../../../types/Field'

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
  justify-content: space-between;
  margin: 0 auto 46px auto;
`
const Buttons = styled.div`
  display: flex;
  justify-content: space-between;
  width: 100%;
`
const FieldInputStyled = styled(FieldInput)`
  width: 200px;
  justify-content: space-between;
  margin-bottom: 32px;
`

type Props = {
  onCancelClick: () => void,
  onMigrateClick: (fields: Field[]) => void,
}
type State = {
  fields: Field[],
}
let defaultFields: Field[] = [
  {
    name: 'clone_disks',
    type: 'boolean',
    value: true,
  },
  {
    name: 'force',
    type: 'boolean',
  },
  {
    name: 'skip_os_morphing',
    type: 'boolean',
  },
]
@observer
class ReplicaMigrationOptions extends React.Component<Props, State> {
  state = {
    fields: [...defaultFields],
  }

  componentDidMount() {
    KeyboardManager.onEnter('migration-options', () => { this.props.onMigrateClick(this.state.fields) }, 2)
  }

  componentWillUnmount() {
    KeyboardManager.removeKeyDown('migration-options')
  }

  handleValueChange(field: Field, value: boolean) {
    let fields = this.state.fields.map(f => {
      let newField = { ...f }
      if (f.name === field.name) {
        newField.value = value
      }
      return newField
    })

    this.setState({ fields })
  }

  render() {
    return (
      <Wrapper>
        <Image />
        <Form>
          {this.state.fields.map(field => {
            return (
              <FieldInputStyled
                width={200}
                key={field.name}
                name={field.name}
                type={field.type}
                value={field.value || field.default}
                minimum={field.minimum}
                maximum={field.maximum}
                layout="page"
                label={LabelDictionary.get(field.name)}
                onChange={value => this.handleValueChange(field, value)}
              />
            )
          })}
        </Form>
        <Buttons>
          <Button secondary onClick={this.props.onCancelClick} data-test-id="rmOptions-cancelButton">Cancel</Button>
          <Button onClick={() => { this.props.onMigrateClick(this.state.fields) }} data-test-id="rmOptions-execButton">Migrate</Button>
        </Buttons>
      </Wrapper>
    )
  }
}

export default ReplicaMigrationOptions
