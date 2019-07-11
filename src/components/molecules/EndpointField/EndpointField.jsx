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

import Switch from '../../atoms/Switch'
import TextInput from '../../atoms/TextInput'
import RadioInput from '../../atoms/RadioInput'
import InfoIcon from '../../atoms/InfoIcon'
import Dropdown from '../../molecules/Dropdown'
import DropdownInput from '../../molecules/DropdownInput'
import TextArea from '../../atoms/TextArea'
import PropertiesTable from '../../molecules/PropertiesTable'

import type { Field as FieldType } from '../../../types/Field'

import LabelDictionary from '../../../utils/LabelDictionary'
import StyleProps from '../../styleUtils/StyleProps'
import Palette from '../../styleUtils/Palette'

const Wrapper = styled.div``
const Label = styled.div`
  font-size: 10px;
  font-weight: ${StyleProps.fontWeights.medium};
  color: ${Palette.grayscale[3]};
  text-transform: uppercase;
  margin-bottom: 2px;
  display: flex;
  align-items: center;
`
const LabelText = styled.span`
  margin-right: 24px;
`

type Props = {
  name: string,
  type: string,
  value: any,
  onChange?: (value: any, fieldName?: string) => void,
  valueCallback?: (fieldName: string) => void,
  getFieldValue?: (fieldName: string) => string,
  onFieldChange?: (fieldName: string, fieldValue: string) => void,
  className?: string,
  minimum?: number,
  maximum?: number,
  password?: boolean,
  required?: boolean,
  large?: boolean,
  highlight?: boolean,
  properties?: FieldType[],
  disabled?: boolean,
  // $FlowIssue
  enum?: string[] | { label: string, value: string }[],
  items?: any[],
  useTextArea?: boolean,
  noSelectionMessage?: string,
  noItemsMessage?: string,
  selectedItems?: string[],
  'data-test-id'?: string,
}
@observer
class Field extends React.Component<Props> {
  renderSwitch(propss: { triState: boolean }) {
    return (
      <Switch
        data-test-id={`endpointField-switch-${this.props.name}`}
        disabled={this.props.disabled}
        triState={propss.triState}
        checked={this.props.value}
        onChange={checked => { if (this.props.onChange) this.props.onChange(checked) }}
      />
    )
  }

  renderTextInput() {
    return (
      <TextInput
        data-test-id={`endpointField-textInput-${this.props.name}`}
        highlight={this.props.highlight}
        type={this.props.password ? 'password' : 'text'}
        large={this.props.large}
        value={this.props.value}
        onChange={e => { if (this.props.onChange) this.props.onChange(e.target.value) }}
        placeholder={LabelDictionary.get(this.props.name)}
        disabled={this.props.disabled}
        required={this.props.required}
      />
    )
  }

  renderIntInput() {
    return (
      <TextInput
        highlight={this.props.highlight}
        large={this.props.large}
        value={this.props.value}
        onChange={e => {
          let value = Number(e.target.value.replace(/\D/g, '')) || ''
          if (this.props.onChange) {
            this.props.onChange(value)
          }
        }}
        placeholder={LabelDictionary.get(this.props.name)}
        disabled={this.props.disabled}
      />
    )
  }

  renderObjectTable() {
    if (!this.props.properties || !this.props.properties.length) {
      return null
    }

    return (
      <PropertiesTable
        properties={this.props.properties}
        valueCallback={field => { if (this.props.valueCallback) { this.props.valueCallback(field.name) } }}
        onChange={(field, value) => {
          let fieldName = field.name.substr(field.name.lastIndexOf('/') + 1)
          if (this.props.onChange) {
            this.props.onChange(value, fieldName)
          }
        }}
      />
    )
  }

  renderTextArea() {
    return (
      <TextArea
        data-test-id={`endpointField-textArea-${this.props.name}`}
        style={{ width: '100%' }}
        highlight={this.props.highlight}
        value={this.props.value}
        onChange={e => { console.log('changing', e); if (this.props.onChange) this.props.onChange(e.target.value) }}
        placeholder={LabelDictionary.get(this.props.name)}
        disabled={this.props.disabled}
        required={this.props.required}
      />
    )
  }

  renderEnumDropdown() {
    if (!this.props.enum) {
      return null
    }

    let items = this.props.enum.map(e => {
      if (typeof e === 'string') {
        return {
          label: LabelDictionary.get(e),
          value: e,
        }
      }
      return e
    })
    let selectedItem = items.find(i => i.value === this.props.value)

    return (
      <Dropdown
        data-test-id={`endpointField-dropdown-${this.props.name}`}
        large={this.props.large}
        selectedItem={selectedItem}
        noSelectionMessage={this.props.noSelectionMessage}
        noItemsMessage={this.props.noItemsMessage}
        items={items}
        onChange={item => { if (this.props.onChange) this.props.onChange(item.value) }}
        disabled={this.props.disabled}
        highlight={this.props.highlight}
        required={this.props.required}
      />
    )
  }

  renderArrayDropdown() {
    return (
      <Dropdown
        data-test-id={`endpointField-multidropdown-${this.props.name}`}
        multipleSelection
        large={this.props.large}
        disabled={this.props.disabled}
        noSelectionMessage={this.props.noSelectionMessage}
        noItemsMessage={this.props.noItemsMessage}
        items={this.props.items}
        selectedItems={this.props.selectedItems}
        onChange={item => { if (this.props.onChange) this.props.onChange(item.value) }}
        highlight={this.props.highlight}
        required={this.props.required}
      />
    )
  }

  renderIntDropdown() {
    if (!this.props.minimum || !this.props.maximum) {
      return null
    }

    let items = []

    for (let i = this.props.minimum; i <= this.props.maximum; i += 1) {
      items.push({
        label: i.toString(),
        value: i,
      })
    }

    return (
      <Dropdown
        data-test-id={`endpointField-dropdown-${this.props.name}`}
        large={this.props.large}
        selectedItem={this.props.value}
        items={items}
        onChange={item => { if (this.props.onChange) this.props.onChange(item.value) }}
        disabled={this.props.disabled}
        highlight={this.props.highlight}
        required={this.props.required}
      />
    )
  }

  renderRadioInput() {
    return (
      <RadioInput
        data-test-id={`endpointField-radioInput-${this.props.name}`}
        checked={this.props.value}
        label={LabelDictionary.get(this.props.name)}
        onChange={e => { if (this.props.onChange) this.props.onChange(e.target.checked) }}
        disabled={this.props.disabled}
      />
    )
  }

  renderDropdownInput() {
    if (!this.props.items) {
      return null
    }

    let items = this.props.items.map(field => {
      return {
        value: field.name,
        label: field.label || LabelDictionary.get(field.name),
      }
    })
    let fieldName = this.props.value || items[0].value

    return (
      <DropdownInput
        items={items}
        selectedItem={fieldName}
        onItemChange={item => { if (this.props.onChange) this.props.onChange(item.value) }}
        inputValue={this.props.getFieldValue ? this.props.getFieldValue(fieldName) : ''}
        onInputChange={value => { if (this.props.onFieldChange) this.props.onFieldChange(fieldName, value) }}
        placeholder={LabelDictionary.get(fieldName)}
        highlight={this.props.highlight}
        disabled={this.props.disabled}
        required={this.props.required}
      />
    )
  }

  renderInput() {
    switch (this.props.type) {
      case 'input-choice':
        return this.renderDropdownInput()
      case 'boolean':
        return this.renderSwitch({ triState: false })
      case 'optional-boolean':
        return this.renderSwitch({ triState: true })
      case 'string':
        if (this.props.enum) {
          return this.renderEnumDropdown()
        }
        if (this.props.useTextArea) {
          return this.renderTextArea()
        }
        return this.renderTextInput()
      case 'integer':
        if (this.props.minimum || this.props.maximum) {
          return this.renderIntDropdown()
        }
        return this.renderIntInput()
      case 'radio':
        return this.renderRadioInput()
      case 'array':
        return this.renderArrayDropdown()
      case 'object':
        return this.renderObjectTable()
      default:
        return null
    }
  }

  renderLabel() {
    if (this.props.type === 'radio') {
      return null
    }

    let description = LabelDictionary.getDescription(this.props.name)
    let infoIcon = null
    if (description) {
      infoIcon = <InfoIcon text={description} marginLeft={-20} marginBottom={0} />
    }

    return (
      <Label>
        <LabelText data-test-id="endpointField-label">{LabelDictionary.get(this.props.name)}</LabelText>
        {infoIcon}
      </Label>
    )
  }

  render() {
    return (
      <Wrapper data-test-id={this.props['data-test-id'] || 'endpointField-wrapper'} className={this.props.className}>
        {this.renderLabel()}
        {this.renderInput()}
      </Wrapper>
    )
  }
}

export default Field
