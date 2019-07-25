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
import styled, { css } from 'styled-components'

import Switch from '../../atoms/Switch/Switch'
import TextInput from '../../atoms/TextInput/TextInput'
import RadioInput from '../../atoms/RadioInput/RadioInput'
import InfoIcon from '../../atoms/InfoIcon/InfoIcon'
import Dropdown from '../Dropdown/Dropdown'
import DropdownInput from '../DropdownInput/DropdownInput'
import TextArea from '../../atoms/TextArea/TextArea'
import PropertiesTable from '../PropertiesTable/PropertiesTable'
import AutocompleteDropdown from '../../molecules/AutocompleteDropdown'

import type { Field } from '../../../types/Field'

import LabelDictionary from '../../../utils/LabelDictionary'
import StyleProps from '../../styleUtils/StyleProps'
import Palette from '../../styleUtils/Palette'

import asteriskImage from './images/asterisk.svg'

const Wrapper = styled.div`
  ${props => props.layout === 'page' ? css`
    display: flex;
    flex-direction: ${props.inline ? 'row' : 'column'};
    ${props.inline ? '' : css`justify-content: center;`}
  ` : ''}
`

const Label = styled.div`
  font-weight: ${StyleProps.fontWeights.medium};
  ${props => props.layout === 'page' ? css`
    margin-bottom: 8px;
  ` : css`
    margin-bottom: 2px;
    font-size: 10px;
    color: ${Palette.grayscale[3]};
    text-transform: uppercase;
    display: flex;
    align-items: center;
  `}
`
const LabelText = styled.span``
const Asterisk = styled.div`
  ${StyleProps.exactSize('16px')}
  display: inline-block;
  background: url('${asteriskImage}') center no-repeat;
  margin-bottom: -3px;
  margin-left: ${props => props.marginLeft || '0px'};
`

type Props = {
  name: string,
  type: string,
  value: any,
  onChange?: (value: any, field?: Field) => void,
  valueCallback?: (field: Field) => any,
  getFieldValue?: (fieldName: string) => string,
  onFieldChange?: (fieldName: string, fieldValue: string) => void,
  className?: string,
  properties?: Field[],
  // $FlowIgnore
  enum?: string[] | { label: string, value: string }[] | { name: string, id: string }[],
  required?: boolean,
  minimum?: number,
  maximum?: number,
  password?: boolean,
  highlight?: boolean,
  disabled?: boolean,
  items?: any[],
  useTextArea?: boolean,
  noSelectionMessage?: string,
  noItemsMessage?: string,
  layout: 'modal' | 'page',
  width?: number,
  label?: string,
  addNullValue?: boolean,
  nullableBoolean?: boolean,
  style?: { [string]: mixed },
}
@observer
class FieldInput extends React.Component<Props> {
  renderSwitch(propss: { triState: boolean }) {
    return (
      <Switch
        width={this.props.layout === 'page' ? '112px' : ''}
        height={this.props.layout === 'page' ? 16 : 24}
        justifyContent={this.props.layout === 'page' ? 'flex-end' : ''}
        disabled={this.props.disabled}
        triState={propss.triState}
        checked={this.props.value}
        onChange={checked => { if (this.props.onChange) this.props.onChange(checked) }}
        leftLabel={this.props.layout === 'page'}
        style={this.props.layout === 'page' ? { marginTop: '-8px' } : {}}
      />
    )
  }

  renderTextInput() {
    return (
      <TextInput
        width={this.props.width}
        highlight={this.props.highlight}
        type={this.props.password ? 'password' : 'text'}
        value={this.props.value}
        onChange={e => { if (this.props.onChange) this.props.onChange(e.target.value) }}
        placeholder={LabelDictionary.get(this.props.name)}
        disabled={this.props.disabled}
        required={this.props.layout === 'page' ? false : this.props.required}
      />
    )
  }

  renderIntInput() {
    return (
      <TextInput
        highlight={this.props.highlight}
        width={this.props.width}
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
        valueCallback={field => this.props.valueCallback && this.props.valueCallback(field)}
        onChange={(field, value) => {
          if (this.props.onChange) {
            this.props.onChange(value, field)
          }
        }}
        hideRequiredSymbol={this.props.layout === 'page'}
      />
    )
  }

  renderTextArea() {
    return (
      <TextArea
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
    const useDictionary = LabelDictionary.enumFields.find(f => f === this.props.name)
    let items = this.props.enum.map(e => {
      if (typeof e !== 'string' && e.separator === true) {
        return e
      }

      return {
        label: typeof e === 'string' ? (useDictionary ? LabelDictionary.get(e) : e) : e.name || e.label,
        value: typeof e === 'string' ? e : e.id || e.value,
      }
    })
    if (this.props.addNullValue) {
      items = [
        { label: 'Choose a value', value: null },
        ...items,
      ]
    }

    let selectedItem = items.find(i => i.value === this.props.value)
    let commonProps = {
      width: this.props.width,
      selectedItem,
      items,
      onChange: item => this.props.onChange && this.props.onChange(item.value),
    }

    if (items.length < 10) {
      return (
        <Dropdown
          {...commonProps}
          noSelectionMessage="Choose a value"
          dimFirstItem={this.props.addNullValue}
        />
      )
    }
    return (
      <AutocompleteDropdown
        {...commonProps}
        dimNullValue
      />
    )
  }

  renderArrayDropdown() {
    let items = this.props.enum.map(e => {
      if (typeof e !== 'string' && e.separator === true) {
        return e
      }

      return {
        label: typeof e === 'string' ? LabelDictionary.get(e) : e.name || e.label,
        value: typeof e === 'string' ? e : e.id || e.value,
      }
    })
    let selectedItems = this.props.value || []
    return (
      <Dropdown
        multipleSelection
        width={this.props.width}
        disabled={this.props.disabled}
        noSelectionMessage="Choose values"
        noItemsMessage={this.props.noItemsMessage}
        items={items}
        selectedItems={selectedItems}
        onChange={item => { if (this.props.onChange) this.props.onChange(item.value) }}
        highlight={this.props.highlight}
        required={this.props.layout === 'page' ? false : this.props.required}
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
        width={this.props.width}
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
        return this.renderSwitch({ triState: Boolean(this.props.nullableBoolean) })
      case 'string':
        if (this.props.enum && this.props.enum.length) {
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
    let marginRight = this.props.layout === 'modal' || description || this.props.required ? '24px' : 0

    return (
      <Label layout={this.props.layout}>
        <LabelText style={{ marginRight }}>
          {this.props.label || LabelDictionary.get(this.props.name)}
        </LabelText>
        {description ? <InfoIcon text={description} marginLeft={-20} marginBottom={this.props.layout === 'page' ? null : 0} /> : null}
        {this.props.layout === 'page' && Boolean(this.props.required) ? <Asterisk marginLeft={description ? '4px' : '-16px'} /> : null}
      </Label>
    )
  }

  render() {
    return (
      <Wrapper
        className={this.props.className}
        inline={this.props.type === 'boolean'}
        style={this.props.style}
        layout={this.props.layout}
      >
        {this.renderLabel()}
        {this.renderInput()}
      </Wrapper>
    )
  }
}

export default FieldInput
