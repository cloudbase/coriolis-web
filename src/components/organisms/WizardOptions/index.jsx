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

import Tooltip from '../../atoms/Tooltip'
import StyleProps from '../../styleUtils/StyleProps'
import ToggleButtonBar from '../../atoms/ToggleButtonBar'
import WizardOptionsField from '../../molecules/WizardOptionsField'
import StatusImage from '../../atoms/StatusImage'
import type { Field } from '../../../types/Field'
import type { Instance } from '../../../types/Instance'

import { executionOptions } from '../../../config'

const Wrapper = styled.div``
const Options = styled.div``
const Fields = styled.div`
  margin-top: 46px;
  display: flex;
`
const OneColumn = styled.div``
const Column = styled.div`
  ${props => props.left ? 'margin-right: 160px;' : ''}
`
const WizardOptionsFieldStyled = styled(WizardOptionsField) `
  width: ${StyleProps.inputSizes.wizard.width}px;
  justify-content: space-between;
  margin-bottom: 39px;
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

type Props = {
  fields: Field[],
  selectedInstances: ?Instance[],
  data: ?{ [string]: mixed },
  onChange: (field: Field, value: any) => void,
  useAdvancedOptions: boolean,
  onAdvancedOptionsToggle: (showAdvanced: boolean) => void,
  wizardType: string,
  loading: boolean,
}
@observer
class WizardOptions extends React.Component<Props> {
  getFieldValue(fieldName: string, defaultValue: any) {
    if (!this.props.data || this.props.data[fieldName] === undefined) {
      return defaultValue
    }

    return this.props.data[fieldName]
  }

  getDefaultFieldsSchema() {
    let fieldsSchema = [
      { name: 'description', type: 'string' },
    ]

    if (this.props.wizardType === 'migration') {
      fieldsSchema.unshift({ name: 'skip_os_morphing', type: 'strict-boolean', default: false })
    }

    if (this.props.selectedInstances && this.props.selectedInstances.length > 1) {
      fieldsSchema.unshift({ name: 'separate_vm', type: 'strict-boolean', default: true })
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

    return fieldsSchema
  }

  renderOptionsField(field: Field) {
    if (field.type === 'object' && field.properties) {
      return (
        <WizardOptionsFieldStyled
          key={field.name}
          name={field.name}
          type={field.type}
          valueCallback={f => this.getFieldValue(f.name, f.default)}
          properties={field.properties}
          onChange={(f, value) => { this.props.onChange(f, value) }}
        />
      )
    }
    return (
      <WizardOptionsFieldStyled
        key={field.name}
        name={field.name}
        type={field.type}
        enum={field.enum}
        required={field.required}
        value={this.getFieldValue(field.name, field.default)}
        onChange={value => { this.props.onChange(field, value) }}
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
    let fields = fieldsSchema.map((field, i) => {
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

    if (fields.length < 8) {
      return (
        <Fields>
          <OneColumn>
            {fields.map(f => f.component)}
          </OneColumn>
          <Tooltip />
        </Fields>
      )
    }

    return (
      <Fields>
        <Column left>
          {fields.map(f => f.column === 'left' && f.component)}
        </Column>
        <Column right>
          {fields.map(f => f.column === 'right' && f.component)}
        </Column>
        <Tooltip />
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

    return (
      <Options>
        <ToggleButtonBar
          items={[{ label: 'Simple', value: 'simple' }, { label: 'Advanced', value: 'advanced' }]}
          selectedValue={this.props.useAdvancedOptions ? 'advanced' : 'simple'}
          onChange={item => { this.props.onAdvancedOptionsToggle(item.value === 'advanced') }}
        />
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
