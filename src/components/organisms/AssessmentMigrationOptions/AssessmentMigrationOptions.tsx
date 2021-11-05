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

import * as React from 'react'
import { observer } from 'mobx-react'
import styled from 'styled-components'

import Button from '../../atoms/Button'
import FieldInput from '../../molecules/FieldInput'
import ToggleButtonBar from '../../atoms/ToggleButtonBar'

import type { Field } from '../../../@types/Field'

import StyleProps from '../../styleUtils/StyleProps'
import LabelDictionary from '../../../utils/LabelDictionary'

import assessmentImage from './images/assessment.svg'

const Wrapper = styled.div<any>`
  padding: 48px 32px 32px 32px;
  display: flex;
  flex-direction: column;
  align-items: center;
  min-height: 0;
`
const Image = styled.div<any>`
  width: 96px;
  height: 96px;
  background: url('${assessmentImage}') center no-repeat;
`
const ToggleButtonBarStyled = styled(ToggleButtonBar)`
  margin-top: 48px;
`
const Fields = styled.div<any>`
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
const Row = styled.div<any>`
  display: flex;
  flex-shrink: 0;
  justify-content: space-between;
`

const Buttons = styled.div<any>`
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
  onExecuteClick: (fieldValues: { [prop: string]: any }) => void,
  executeButtonDisabled: boolean,
  replicaSchema: Field[],
  migrationSchema: Field[],
  onResizeUpdate?: (scrollableRef: HTMLElement, scrollOffset?: number) => void,
}
type State = {
  fieldValues: { [prop: string]: any },
  showAdvancedOptions: boolean,
}
@observer
class AssessmentMigrationOptions extends React.Component<Props, State> {
  state: State = {
    fieldValues: {
      separate_vm: true,
      use_replica: false,
      shutdown_instances: false,
      skip_os_morphing: false,
    },
    showAdvancedOptions: false,
  }

  scrollableRef: HTMLElement | undefined | null

  getFieldValue(fieldName: string) {
    if (this.state.fieldValues[fieldName] != null) {
      return this.state.fieldValues[fieldName]
    }
    return null
  }

  getObjectFieldValue(fieldName: string, propName: string) {
    return this.state.fieldValues[fieldName] && this.state.fieldValues[fieldName][propName]
  }

  handleValueChange(fieldName: string, value: any) {
    this.setState(prevState => {
      const fieldValues = { ...prevState.fieldValues }
      if (value != null) {
        fieldValues[fieldName] = value
      } else {
        delete fieldValues[fieldName]
      }
      return { fieldValues }
    })
  }

  UNSAFE_componentDidUpdate(_: Props, prevState: State) {
    if (prevState.showAdvancedOptions !== this.state.showAdvancedOptions
      && this.props.onResizeUpdate && this.scrollableRef) {
      this.props.onResizeUpdate(this.scrollableRef)
    }
  }

  handleObjectValueChange(fieldName: string, propName: string, value: any) {
    this.setState(prevState => {
      const fieldValues = { ...prevState.fieldValues }
      if (!fieldValues[fieldName]) {
        fieldValues[fieldName] = {}
      }
      fieldValues[fieldName][propName] = value
      return { fieldValues }
    })
  }

  renderFields() {
    let fields: any = generalFields
    const useReplica = this.getFieldValue('use_replica')
    const skipFields = ['location', 'resource_group', 'network_map', 'storage_map', 'vm_size', 'worker_size']
    // eslint-disable-next-line no-shadow
    const cleanup = (cleanupFields: any[]) => cleanupFields.filter((f: {
      name: string
    }) => !skipFields
      .find(n => n === f.name)).map((f: { type: string; nullableBoolean: boolean }) => {
      if (f.type === 'boolean') {
        // eslint-disable-next-line no-param-reassign
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
    fields.sort((a: any, b: any) => {
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

    const rows: JSX.Element[] = []
    let lastField: JSX.Element
    fields.forEach((field: any, index: number) => {
      let additionalProps
      if (field.type === 'object' && field.properties) {
        additionalProps = {
          valueCallback: (
            callbackField: { name: string },
          ) => this.getObjectFieldValue(field.name, callbackField.name),
          onChange: (value: any, callbackField: { name: string }) => {
            const propName = callbackField.name.substr(callbackField.name.lastIndexOf('/') + 1)
            this.handleObjectValueChange(field.name, propName, value)
          },
          properties: field.properties.map((p: any) => ({ ...p, required: false })),
        }
      } else {
        const value = this.getFieldValue(field.name)
        additionalProps = {
          value,
          // eslint-disable-next-line no-shadow
          onChange: (changeValue: any) => { this.handleValueChange(field.name, changeValue) },
          type: field.type,
        }
      }

      const currentField = (
        <FieldStyled
          width={StyleProps.inputSizes.large.width}
          // eslint-disable-next-line react/jsx-props-no-spreading
          {...field}
          // eslint-disable-next-line react/jsx-props-no-spreading
          {...additionalProps}
          label={field.label || LabelDictionary.get(field.name)}
        />
      )
      const pushRow = (field1: React.ReactNode, field2?: React.ReactNode) => {
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
      <Fields ref={(ref: HTMLElement | null | undefined) => { this.scrollableRef = ref }}>
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
          >Cancel
          </Button>
          <Button
            large
            onClick={() => { this.props.onExecuteClick(this.state.fieldValues) }}
            disabled={this.props.executeButtonDisabled}
          >Execute
          </Button>
        </Buttons>
      </Wrapper>
    )
  }
}

export default AssessmentMigrationOptions
