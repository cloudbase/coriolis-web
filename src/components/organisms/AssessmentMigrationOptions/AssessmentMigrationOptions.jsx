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

import * as React from 'react'
import { observer } from 'mobx-react'
import styled from 'styled-components'

import Button from '../../atoms/Button'
import FieldInput from '../../molecules/FieldInput'
import ToggleButtonBar from '../../../components/atoms/ToggleButtonBar'

import type { Field } from '../../../types/Field'

import StyleProps from '../../styleUtils/StyleProps'
import LabelDictionary from '../../../utils/LabelDictionary'

import assessmentImage from './images/assessment.svg'

const Wrapper = styled.div`
  padding: 48px 32px 32px 32px;
  display: flex;
  flex-direction: column;
  align-items: center;
  min-height: 0;
`
const Image = styled.div`
  width: 96px;
  height: 96px;
  background: url('${assessmentImage}') center no-repeat;
`
const ToggleButtonBarStyled = styled(ToggleButtonBar)`
  margin-top: 48px;
`
const Fields = styled.div`
  display: flex;
  margin-top: 32px;
  flex-direction: column;
  overflow: auto;
  width: 100%;
  min-height: 0;
`
const FieldStyled = styled(FieldInput)`
  ${StyleProps.exactWidth(`${StyleProps.inputSizes.large.width}px`)}
  margin-bottom: 16px;
`
const Row = styled.div`
  display: flex;
  flex-shrink: 0;
  justify-content: space-between;
`

const Buttons = styled.div`
  display: flex;
  justify-content: space-between;
  width: 100%;
  margin-top: 32px;
`

const generalFields = [
  {
    name: 'use_replica',
    type: 'boolean',
  },
  {
    name: 'separate_vm',
    type: 'boolean',
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
  onExecuteClick: (fieldValues: { [string]: any }) => void,
  executeButtonDisabled: boolean,
  replicaSchema: Field[],
  migrationSchema: Field[],
  onResizeUpdate?: (scrollableRef: HTMLElement, scrollOffset?: number) => void,
}
type State = {
  fieldValues: { [string]: any },
  showAdvancedOptions: boolean,
}
@observer
class AssessmentMigrationOptions extends React.Component<Props, State> {
  state = {
    fieldValues: {
      separate_vm: true,
      use_replica: false,
      shutdown_instances: false,
      skip_os_morphing: false,
    },
    showAdvancedOptions: false,
  }

  scrollableRef: HTMLElement

  componentDidUpdate(prevProps: Props, prevState: State) {
    if (prevState.showAdvancedOptions !== this.state.showAdvancedOptions && this.props.onResizeUpdate) {
      this.props.onResizeUpdate(this.scrollableRef)
    }
  }

  handleValueChange(fieldName: string, value: any) {
    let fieldValues = { ...this.state.fieldValues }
    if (value != null) {
      fieldValues[fieldName] = value
    } else {
      delete fieldValues[fieldName]
    }
    this.setState({ fieldValues })
  }

  getFieldValue(fieldName: string) {
    if (this.state.fieldValues[fieldName] != null) {
      return this.state.fieldValues[fieldName]
    }
    return null
  }

  getObjectFieldValue(fieldName: string, propName: string) {
    return this.state.fieldValues[fieldName] && this.state.fieldValues[fieldName][propName]
  }

  handleObjectValueChange(fieldName: string, propName: string, value: any) {
    let fieldValues = { ...this.state.fieldValues }
    if (!fieldValues[fieldName]) {
      fieldValues[fieldName] = {}
    }
    fieldValues[fieldName][propName] = value
    this.setState({ fieldValues })
  }

  renderFields() {
    let fields = generalFields
    let useReplica = this.getFieldValue('use_replica')
    let skipFields = ['location', 'resource_group', 'network_map', 'storage_map', 'vm_size', 'worker_size']
    let cleanup = fields => fields.filter(f => !skipFields.find(n => n === f.name)).map(f => {
      if (f.type === 'boolean') {
        f.nullableBoolean = true
      }
      return { ...f }
    })

    if (useReplica) {
      fields = [...fields, ...replicaFields]
      if (this.state.showAdvancedOptions) {
        fields = [
          ...fields,
          ...cleanup(this.props.replicaSchema),
        ]
      }
    } else {
      fields = [...fields, ...migrationFields]
      if (this.state.showAdvancedOptions) {
        fields = [
          ...fields,
          ...cleanup(this.props.migrationSchema),
        ]
      }
    }

    const sortPriority: any = {
      boolean: 1,
      string: 2,
      object: 3,
    }
    fields.sort((a, b) => {
      if (sortPriority[a.type] && sortPriority[b.type]) {
        return sortPriority[a.type] - sortPriority[b.type]
      }
      if (sortPriority[a.type]) {
        return -1
      }
      if (sortPriority[b.type]) {
        return 1
      }
      return a.name.localeCompare(b.name)
    })

    const rows = []
    let lastField
    fields.forEach((field, index) => {
      let additionalProps
      if (field.type === 'object' && field.properties) {
        additionalProps = {
          valueCallback: callbackField => this.getObjectFieldValue(field.name, callbackField.name),
          onChange: (value, callbackField) => {
            let propName = callbackField.name.substr(callbackField.name.lastIndexOf('/') + 1)
            this.handleObjectValueChange(field.name, propName, value)
          },
          properties: field.properties.map(p => ({ ...p, required: false })),
        }
      } else {
        let value = this.getFieldValue(field.name)
        additionalProps = {
          value,
          onChange: value => { this.handleValueChange(field.name, value) },
          type: field.type,
        }
      }

      const currentField = (
        <FieldStyled
          width={StyleProps.inputSizes.large.width}
          {...field}
          {...additionalProps}
          label={field.label || LabelDictionary.get(field.name)}
        />
      )
      const pushRow = (field1: React.Node, field2?: React.Node) => {
        rows.push((
          <Row key={field.name}>
            {field1}
            {field2}
          </Row>
        ))
      }
      if (index === fields.length - 1 && index % 2 === 0) {
        pushRow(currentField)
      } else if (index % 2 !== 0) {
        pushRow(lastField, currentField)
      } else {
        lastField = currentField
      }
    })

    return (
      <Fields innerRef={ref => { this.scrollableRef = ref }}>
        {rows}
      </Fields>
    )
  }

  render() {
    return (
      <Wrapper>
        <Image />
        <ToggleButtonBarStyled
          items={[{ label: 'Basic', value: 'basic' }, { label: 'Advanced', value: 'advanced' }]}
          selectedValue={this.state.showAdvancedOptions ? 'advanced' : 'basic'}
          onChange={item => { this.setState({ showAdvancedOptions: item.value === 'advanced' }) }}
        />
        {this.renderFields()}
        <Buttons>
          <Button
            large
            secondary
            onClick={() => { this.props.onCancelClick() }}
          >Cancel</Button>
          <Button
            large
            onClick={() => { this.props.onExecuteClick(this.state.fieldValues) }}
            disabled={this.props.executeButtonDisabled}
          >Execute</Button>
        </Buttons>
      </Wrapper>
    )
  }
}

export default AssessmentMigrationOptions
