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
import styled from 'styled-components'
import { observer } from 'mobx-react'
import autobind from 'autobind-decorator'

import StyleProps from '../../styleUtils/StyleProps'
import ToggleButtonBar from '../../atoms/ToggleButtonBar'
import WizardOptionsField from '../../molecules/WizardOptionsField'
import StatusImage from '../../atoms/StatusImage'
import type { Field } from '../../../types/Field'
import type { Instance } from '../../../types/Instance'
import type { StorageBackend } from '../../../types/Endpoint'

import { executionOptions } from '../../../constants'
import LabelDictionary from '../../../utils/LabelDictionary'

const Wrapper = styled.div`
  display: flex;
  min-height: 0;
  flex-direction: column;
`
const Options = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 0;
`
const Fields = styled.div`
  display: flex;
  overflow: auto;
  justify-content: space-between;
`
const OneColumn = styled.div``
const Column = styled.div`
  ${props => props.left ? 'margin-right: 160px;' : ''}
  margin-top: -16px;
`
const WizardOptionsFieldStyled = styled(WizardOptionsField)`
  width: ${props => props.width || StyleProps.inputSizes.wizard.width}px;
  justify-content: space-between;
  margin-top: 16px;
`
const LoadingWrapper = styled.div`
  margin-top: 32px;
  display: flex;
  flex-direction: column;
  align-items: center;
`
const LoadingText = styled.div`
  margin-top: 38px;
  font-size: 18px;
`

export const shouldRenderField = (field: Field) => {
  return (field.type !== 'array' || (field.enum && field.enum.length && field.enum.length > 0)) &&
    (field.type !== 'integer' || (field.minimum && field.maximum)) &&
    (field.type !== 'object' || field.properties)
}

type Props = {
  fields: Field[],
  selectedInstances?: ?Instance[],
  data?: ?{ [string]: mixed },
  getFieldValue?: (fieldName: string, defaultValue: any) => any,
  onChange: (field: Field, value: any) => void,
  useAdvancedOptions?: boolean,
  hasStorageMap: boolean,
  storageBackends?: StorageBackend[],
  onAdvancedOptionsToggle?: (showAdvanced: boolean) => void,
  wizardType: string,
  loading?: boolean,
  columnStyle?: { [string]: mixed },
  oneColumnStyle?: { [string]: mixed },
  fieldWidth?: number,
  onScrollableRef?: (ref: HTMLElement) => void,
  availableHeight?: number,
}
@observer
class WizardOptions extends React.Component<Props> {
  componentDidMount() {
    window.addEventListener('resize', this.handleResize)
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.handleResize, false)
  }

  getFieldValue(fieldName: string, defaultValue: any) {
    if (this.props.getFieldValue) {
      return this.props.getFieldValue(fieldName, defaultValue)
    }

    if (!this.props.data || this.props.data[fieldName] === undefined) {
      return defaultValue
    }

    return this.props.data[fieldName]
  }

  getDefaultFieldsSchema() {
    let fieldsSchema = []

    if (this.props.wizardType === 'migration' || this.props.wizardType === 'replica') {
      fieldsSchema.push({ name: 'description', type: 'string' })
    }

    if (this.props.wizardType === 'migration') {
      fieldsSchema.unshift({ name: 'skip_os_morphing', type: 'strict-boolean', default: false })
    }

    if (this.props.selectedInstances && this.props.selectedInstances.length > 1) {
      let dictionaryLabel = LabelDictionary.get('separate_vm')
      let label = this.props.wizardType === 'migration' ? dictionaryLabel : dictionaryLabel.replace('Migration', 'Replica')
      fieldsSchema.unshift({ name: 'separate_vm', label, type: 'strict-boolean', default: true })
    }

    if (this.props.wizardType === 'replica') {
      fieldsSchema.push({ name: 'execute_now', type: 'strict-boolean', default: true })
      let executeNowValue = this.getFieldValue('execute_now', true)
      if (executeNowValue) {
        fieldsSchema = [
          ...fieldsSchema,
          {
            name: 'execute_now_options',
            type: 'object',
            properties: executionOptions,
          },
        ]
      }
    }

    if (this.props.hasStorageMap && this.props.useAdvancedOptions && this.props.storageBackends && this.props.storageBackends.length > 0) {
      fieldsSchema.push({ name: 'default_storage', type: 'string', enum: this.props.storageBackends.map(s => s.name) })
    }

    return fieldsSchema
  }

  @autobind
  handleResize() {
    this.setState({})
  }

  renderOptionsField(field: Field) {
    let additionalProps
    if (field.type === 'object' && field.properties) {
      additionalProps = {
        valueCallback: f => this.getFieldValue(f.name, f.default),
        onChange: (f, value) => { this.props.onChange(f, value) },
        properties: field.properties,
      }
    } else {
      additionalProps = {
        value: this.getFieldValue(field.name, field.default),
        onChange: value => { this.props.onChange(field, value) },
      }
    }
    return (
      <WizardOptionsFieldStyled
        key={field.name}
        name={field.name}
        type={field.type}
        enum={field.enum}
        required={field.required}
        data-test-id={`wOptions-field-${field.name}`}
        width={this.props.fieldWidth}
        label={field.label}
        {...additionalProps}
      />
    )
  }

  renderOptionsFields() {
    let fieldsSchema = this.getDefaultFieldsSchema()

    fieldsSchema = fieldsSchema.concat(this.props.fields.filter(f => f.required))

    if (this.props.useAdvancedOptions) {
      fieldsSchema = fieldsSchema.concat(this.props.fields.filter(f => !f.required))
    }

    let executeNowColumn
    let fields = fieldsSchema.filter(f => shouldRenderField(f)).map((field, i) => {
      let column = i % 2 === 0 ? 'left' : 'right'
      if (field.name === 'execute_now') {
        executeNowColumn = column
      }
      if (field.name === 'execute_now_options') {
        column = executeNowColumn
      }

      return {
        column,
        component: this.renderOptionsField(field),
      }
    })

    let availableHeight = this.props.availableHeight || (window.innerHeight - 450)

    if (fields.length * 96 < availableHeight) {
      return (
        <Fields>
          <OneColumn style={this.props.oneColumnStyle}>
            {fields.map(f => f.component)}
          </OneColumn>
        </Fields>
      )
    }

    return (
      <Fields innerRef={this.props.onScrollableRef}>
        <Column left style={this.props.columnStyle}>
          {fields.map(f => f.column === 'left' && f.component)}
        </Column>
        <Column right>
          {fields.map(f => f.column === 'right' && f.component)}
        </Column>
      </Fields>
    )
  }

  renderLoading() {
    if (!this.props.loading) {
      return null
    }

    return (
      <LoadingWrapper>
        <StatusImage loading />
        <LoadingText>Loading options...</LoadingText>
      </LoadingWrapper>
    )
  }

  renderOptions() {
    if (this.props.loading) {
      return null
    }

    let onAdvancedOptionsToggle = this.props.onAdvancedOptionsToggle
    return (
      <Options>
        {onAdvancedOptionsToggle ? <ToggleButtonBar
          style={{ marginBottom: '46px' }}
          items={[{ label: 'Simple', value: 'simple' }, { label: 'Advanced', value: 'advanced' }]}
          selectedValue={this.props.useAdvancedOptions ? 'advanced' : 'simple'}
          onChange={item => { onAdvancedOptionsToggle(item.value === 'advanced') }}
        /> : null}
        {this.renderOptionsFields()}
      </Options>
    )
  }

  render() {
    return (
      <Wrapper>
        {this.renderOptions()}
        {this.renderLoading()}
      </Wrapper>
    )
  }
}

export default WizardOptions
