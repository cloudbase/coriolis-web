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
import styled from 'styled-components'
import { observer } from 'mobx-react'
import { toJS } from 'mobx'
import autobind from 'autobind-decorator'

import configLoader from '../../../utils/Config'
import StyleProps from '../../styleUtils/StyleProps'
import ToggleButtonBar from '../../atoms/ToggleButtonBar'
import FieldInput from '../../molecules/FieldInput'
import StatusImage from '../../atoms/StatusImage'
import type { Field } from '../../../@types/Field'
import type { Instance } from '../../../@types/Instance'
import type { StorageBackend } from '../../../@types/Endpoint'

import { executionOptions, migrationFields } from '../../../constants'
import LabelDictionary from '../../../utils/LabelDictionary'
import Palette from '../../styleUtils/Palette'

import endpointImage from './images/endpoint.svg'

const Wrapper = styled.div<any>`
  display: flex;
  min-height: 0;
  flex-direction: column;
  width: 100%;
`
const Options = styled.div<any>`
  display: flex;
  flex-direction: column;
  min-height: 0;
`
const Fields = styled.div<any>`
  ${props => (props.padding ? `padding: ${props.padding}px;` : '')}
  display: flex;
  flex-direction: column;
  overflow: auto;
`
const Group = styled.div<any>`
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
`
const GroupName = styled.div<any>`
  display: flex;
  align-items: center;
  margin: 48px 0 24px 0;
`
const GroupNameText = styled.div<any>`
  margin: 0 32px;
  font-size: 16px;
`
const GroupNameBar = styled.div<any>`
  flex-grow: 1;
  background: ${Palette.grayscale[3]};
  height: 1px;
`
const GroupFields = styled.div<any>`
  display: flex;
  justify-content: space-between;
`
const OneColumn = styled.div<any>``
const Column = styled.div<any>`
  margin-top: -16px;
`
const FieldInputStyled = styled(FieldInput)`
  width: ${props => props.width || StyleProps.inputSizes.wizard.width}px;
  justify-content: space-between;
  margin-top: 16px;
`
const LoadingWrapper = styled.div<any>`
  margin-top: 32px;
  display: flex;
  flex-direction: column;
  align-items: center;
`
const LoadingText = styled.div<any>`
  margin-top: 38px;
  font-size: 18px;
`
const EndpointImage = styled.div<any>`
  ${StyleProps.exactSize('96px')};
  background: url('${endpointImage}') center no-repeat;
`
const NoSourceFieldsWrapper = styled.div<any>`
  margin-top: 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
`
const NoSourceFieldsMessage = styled.div<any>`
  font-size: 18px;
  margin-top: 16px;
`
const NoSourceFieldsSubMessage = styled.div<any>`
  margin-top: 16px;
  color: ${Palette.grayscale[4]};
`

export const shouldRenderField = (field: Field) => (field.type !== 'array' || (field.enum && field.enum.length && field.enum.length > 0))
    && (field.type !== 'object' || field.properties)
type FieldRender = {
  field: Field,
  component: React.ReactNode,
  column: number,
}
type Props = {
  fields: Field[],
  isSource?: boolean,
  selectedInstances?: Instance[] | null,
  data?: { [prop: string]: any } | null,
  getFieldValue?: (fieldName: string, defaultValue: any) => any,
  onChange: (field: Field, value: any) => void,
  useAdvancedOptions?: boolean,
  hasStorageMap: boolean,
  storageBackends?: StorageBackend[],
  storageConfigDefault?: string,
  onAdvancedOptionsToggle?: (showAdvanced: boolean) => void,
  wizardType: string,
  oneColumnStyle?: { [prop: string]: any },
  fieldWidth?: number,
  onScrollableRef?: (ref: HTMLElement) => void,
  availableHeight?: number,
  layout?: 'page' | 'modal',
  loading?: boolean,
  optionsLoading?: boolean,
  optionsLoadingSkipFields?: string[],
  dictionaryKey: string,
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

    if (this.props.wizardType === 'migration' || this.props.wizardType === 'migration-destination-options-edit') {
      fieldsSchema.unshift({ name: 'skip_os_morphing', type: 'boolean', default: false })
    }

    if (this.props.selectedInstances && this.props.selectedInstances.length > 1) {
      const dictionaryLabel = LabelDictionary.get('separate_vm')
      const label = this.props.wizardType === 'migration' ? dictionaryLabel : dictionaryLabel.replace('Migration', 'Replica')
      fieldsSchema.unshift({
        name: 'separate_vm', label, type: 'boolean', default: true,
      })
    }

    if (this.props.wizardType === 'replica') {
      fieldsSchema.push({ name: 'execute_now', type: 'boolean', default: true })
      const executeNowValue = this.getFieldValue('execute_now', true)
      if (executeNowValue) {
        fieldsSchema.push({
          name: 'execute_now_options',
          type: 'object',
          properties: executionOptions,
        })
      }
    } else if (this.props.wizardType === 'migration' || this.props.wizardType === 'migration-destination-options-edit') {
      fieldsSchema = [...fieldsSchema, ...migrationFields]
    }

    return fieldsSchema
  }

  isPassword(fieldName: string): boolean {
    return fieldName.indexOf('password') > -1 || Boolean(configLoader.config.passwordFields.find(f => f === fieldName))
  }

  @autobind
  handleResize() {
    this.setState({})
  }

  generateGroups(fields: FieldRender[]) {
    let groups: Array<{ fields: FieldRender[], name?: string }> = [{ fields }]

    const workerFields = fields.filter(f => f.field.name.indexOf('migr_') === 0)
    if (workerFields.length > 1) {
      groups = [
        { fields: fields.filter(f => f.field.name.indexOf('migr_') === -1) },
        { name: 'Temporary Migration Worker Options', fields: workerFields.map((f, i) => ({ ...f, column: i % 2 })) },
      ]
    }

    fields.forEach(f => {
      if (f.field.groupName) {
        groups[0].fields = groups[0].fields
          ? groups[0].fields.filter(gf => gf.field.name !== f.field.name) : []

        const group = groups.find(g => g.name && g.name === f.field.groupName)
        if (!group) {
          groups.push({
            name: f.field.groupName,
            fields: [f],
          })
        } else {
          group.fields.push(f)
        }
      }
    })

    return groups
  }

  renderOptionsField(field: Field) {
    let additionalProps
    if (field.type === 'object' && field.properties) {
      additionalProps = {
        valueCallback: (f: any) => this.getFieldValue(f.name, f.default),
        onChange: (value: any, f: any) => { this.props.onChange(f, value) },
        properties: field.properties,
      }
    } else {
      additionalProps = {
        value: this.getFieldValue(field.name, field.default),
        onChange: (value: any) => { this.props.onChange(field, value) },
      }
    }
    const optionsLoadingReqFields = this.props.optionsLoadingSkipFields || []
    return (
      <FieldInputStyled
        layout={this.props.layout || 'page'}
        key={field.name}
        name={field.name}
        type={field.type}
        minimum={field.minimum}
        maximum={field.maximum}
        label={field.label || LabelDictionary.get(field.name, this.props.dictionaryKey)}
        description={field.description
          || LabelDictionary.getDescription(field.name, this.props.dictionaryKey)}
        password={this.isPassword(field.name)}
        enum={field.enum}
        addNullValue
        required={field.required}
        data-test-id={`wOptions-field-${field.name}`}
        width={this.props.fieldWidth || StyleProps.inputSizes.wizard.width}
        nullableBoolean={field.nullableBoolean}
        disabledLoading={this.props.optionsLoading
          && !optionsLoadingReqFields.find(fn => fn === field.name)}
        // eslint-disable-next-line react/jsx-props-no-spreading
        {...additionalProps}
      />
    )
  }

  renderNoFieldsMessage() {
    return (
      <NoSourceFieldsWrapper>
        <EndpointImage />
        <NoSourceFieldsMessage>No Source Options</NoSourceFieldsMessage>
        <NoSourceFieldsSubMessage>
          There are no options for the specified source cloud provider.
        </NoSourceFieldsSubMessage>
      </NoSourceFieldsWrapper>
    )
  }

  renderOptionsFields() {
    if (this.props.fields.length === 0 && this.props.isSource) {
      return this.renderNoFieldsMessage()
    }

    let fieldsSchema: Field[] = this.getDefaultFieldsSchema()
    const nonNullableBooleans: string[] = fieldsSchema.filter(f => f.type === 'boolean').map(f => f.name)

    fieldsSchema = fieldsSchema.concat(this.props.fields.filter(f => f.required))

    if (this.props.useAdvancedOptions) {
      fieldsSchema = fieldsSchema.concat(this.props.fields.filter(f => !f.required))
    }

    // Add subfields for enums which have them
    let subFields: any[] = []
    fieldsSchema.forEach(f => {
      if (!f.enum || !f.subFields) {
        return
      }
      const value = this.getFieldValue(f.name, f.default)
      if (!f.subFields) {
        return
      }
      const subField = f.subFields.find(sf => sf.name === `${String(value)}_options`)
      if (subField && subField.properties) {
        subFields = [...subFields, ...subField.properties]
      }
    })
    fieldsSchema = [...fieldsSchema, ...subFields]

    let executeNowColumn: number
    const fields: FieldRender[] = fieldsSchema.filter(f => shouldRenderField(f)).map((field, i) => {
      let column: number = i % 2
      if (field.name === 'execute_now') {
        executeNowColumn = column
      }
      if (field.name === 'execute_now_options') {
        column = executeNowColumn
      }
      const usableField = toJS(field)
      if (field.type === 'boolean' && !nonNullableBooleans.find(name => name === field.name)) {
        usableField.nullableBoolean = true
      }

      return {
        column,
        component: this.renderOptionsField(field),
        field: usableField,
      }
    })

    const availableHeight = this.props.availableHeight || (window.innerHeight - 450)

    if (fields.length * 96 < availableHeight) {
      return (
        <Fields padding={this.props.layout === 'page' ? null : 32}>
          <Group>
            <GroupFields style={{ justifyContent: 'center' }}>
              <OneColumn style={this.props.oneColumnStyle}>
                {fields.map(f => f.component)}
              </OneColumn>
            </GroupFields>
          </Group>
        </Fields>
      )
    }

    const groups = this.generateGroups(fields)

    return (
      <Fields ref={this.props.onScrollableRef} padding={this.props.layout === 'page' ? null : 32}>
        {groups.map(g => (
          <Group key={g.name || 0}>
            {g.name ? (
              <GroupName>
                <GroupNameBar />
                <GroupNameText>{g.name}</GroupNameText>
                <GroupNameBar />
              </GroupName>
            ) : null}
            <GroupFields>
              <Column left>
                {g.fields.map(f => f.column === 0 && f.component)}
              </Column>
              <Column right>
                {g.fields.map(f => f.column === 1 && f.component)}
              </Column>
            </GroupFields>
          </Group>
        ))}
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

    const onAdvancedOptionsToggle = this.props.onAdvancedOptionsToggle
    return (
      <Options>
        {onAdvancedOptionsToggle ? (
          <ToggleButtonBar
            style={{ marginBottom: '46px' }}
            items={[{ label: 'Simple', value: 'simple' }, { label: 'Advanced', value: 'advanced' }]}
            selectedValue={this.props.useAdvancedOptions ? 'advanced' : 'simple'}
            onChange={item => { onAdvancedOptionsToggle(item.value === 'advanced') }}
          />
        ) : null}
        {this.renderOptionsFields()}
      </Options>
    )
  }

  render() {
    return (
      <Wrapper>
        <input type="password" style={{ position: 'absolute', top: '-99999px', left: '-99999px' }} />
        {this.renderOptions()}
        {this.renderLoading()}
      </Wrapper>
    )
  }
}

export default WizardOptions
