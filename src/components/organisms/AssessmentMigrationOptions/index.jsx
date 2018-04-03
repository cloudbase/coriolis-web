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
import WizardOptionsField from '../../molecules/WizardOptionsField'

import LabelDictionary from '../../../utils/LabelDictionary'
import type { Field } from '../../../types/Field'

import assessmentImage from './images/assessment.svg'

const Wrapper = styled.div`
  padding: 48px 32px 32px 32px;
  display: flex;
  flex-direction: column;
  align-items: center;
`
const Image = styled.div`
  width: 96px;
  height: 96px;
  background: url('${assessmentImage}') center no-repeat;
`
const Fields = styled.div`
  margin-top: 64px;
`
const WizardOptionsFieldStyled = styled(WizardOptionsField) `
  width: 319px;
  justify-content: space-between;
  margin-bottom: 32px;
  &:last-child {
    margin-bottom: 0;
  }
`
const Buttons = styled.div`
  display: flex;
  justify-content: space-between;
  width: 100%;
  margin-top: 48px;
`

const generalFields = [
  {
    name: 'use_replica',
    type: 'boolean',
  },
  {
    name: 'separate_vm',
    type: 'boolean',
    value: true,
  },
]
const replicaFields = [
  {
    name: 'shutdown_instances',
    type: 'boolean',
  },
]
const migrationFields = [
  {
    name: 'skip_os_morphing',
    type: 'boolean',
  },
]

type Props = {
  onCancelClick: () => void,
  onExecuteClick: (fields: Field[]) => void,
  executeButtonDisabled: boolean,
}
type State = {
  generalFields: Field[],
  migrationFields: Field[],
  replicaFields: Field[],
}
@observer
class AssessmentMigrationOptions extends React.Component<Props, State> {
  constructor() {
    super()

    this.state = {
      generalFields: [...generalFields],
      migrationFields: [...migrationFields],
      replicaFields: [...replicaFields],
    }
  }

  handleValueChange(field: Field, value: any) {
    let mapFields = fields => {
      let mappedFields = fields.map(f => {
        if (f.name === field.name) {
          return { ...f, value }
        }
        return { ...f }
      })
      return mappedFields
    }
    this.setState({
      generalFields: mapFields(this.state.generalFields),
      migrationFields: mapFields(this.state.migrationFields),
      replicaFields: mapFields(this.state.replicaFields),
    })
  }

  renderField(field: Field) {
    return (
      <WizardOptionsFieldStyled
        key={field.name}
        name={field.name}
        type="strict-boolean"
        value={field.value}
        label={LabelDictionary.get(field.name)}
        onChange={value => this.handleValueChange(field, value)}
      />
    )
  }

  render() {
    let fields = this.state.generalFields
    let useReplicaField = fields.find(f => f.name === 'use_replica')

    if (useReplicaField && useReplicaField.value) {
      fields = [...fields, ...this.state.replicaFields]
    } else {
      fields = [...fields, ...this.state.migrationFields]
    }

    return (
      <Wrapper>
        <Image />
        <Fields>
          {fields.map(field => {
            return this.renderField(field)
          })}
        </Fields>
        <Buttons>
          <Button secondary onClick={() => { this.props.onCancelClick() }}>Cancel</Button>
          <Button
            onClick={() => { this.props.onExecuteClick(fields) }}
            disabled={this.props.executeButtonDisabled}
          >Execute</Button>
        </Buttons>
      </Wrapper>
    )
  }
}

export default AssessmentMigrationOptions
