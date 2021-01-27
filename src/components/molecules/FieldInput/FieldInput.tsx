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
import AutocompleteDropdown from '../AutocompleteDropdown'
import Stepper from '../../atoms/Stepper'

import type { Field, EnumItem } from '../../../@types/Field'
import { isEnumSeparator } from '../../../@types/Field'

import LabelDictionary from '../../../utils/LabelDictionary'
import StyleProps from '../../styleUtils/StyleProps'
import Palette from '../../styleUtils/Palette'

import asteriskImage from './images/asterisk.svg'

const Wrapper = styled.div<any>`
  ${props => (props.layout === 'page' ? css`
    display: flex;
    flex-direction: ${props.inline ? 'row' : 'column'};
    ${props.inline ? '' : css`justify-content: center;`}
  ` : '')}
`

const Label = styled.div<any>`
  ${props => (props.width ? `width: ${props.width}px;` : '')}
  font-weight: ${StyleProps.fontWeights.medium};
  flex-grow: 1;
  ${props => (props.layout === 'page' ? css`
    margin-bottom: 8px;
  ` : css`
    margin-bottom: 2px;
    font-size: 10px;
    color: ${Palette.grayscale[3]};
    text-transform: uppercase;
    display: flex;
    align-items: center;
  `)}
  ${props => (props.disabledLoading ? StyleProps.animations.disabledLoading : '')}
  ${props => (props.disabled ? css`
    opacity: 0.5;
  ` : '')}
`
const LabelText = styled.span``
const Asterisk = styled.div<any>`
  ${StyleProps.exactSize('16px')}
  display: inline-block;
  background: url('${asteriskImage}') center no-repeat;
  margin-bottom: -3px;
  margin-left: ${props => props.marginLeft || '0px'};
`

type Props = {
  name: string,
  type?: string,
  value?: any,
  onChange?: (value: any, field?: Field) => void,
  valueCallback?: (field: Field) => any,
  getFieldValue?: (fieldName: string) => string,
  onFieldChange?: (fieldName: string, fieldValue: string) => void,
  className?: string,
  properties?: Field[],
  enum?: EnumItem[],
  required?: boolean,
  minimum?: number,
  maximum?: number,
  password?: boolean,
  highlight?: boolean,
  disabled?: boolean,
  disabledLoading?: boolean,
  items?: any[],
  useTextArea?: boolean,
  noSelectionMessage?: string,
  noItemsMessage?: string,
  layout?: 'modal' | 'page',
  width?: number,
  label?: string,
  description?: string,
  addNullValue?: boolean,
  nullableBoolean?: boolean,
  labelRenderer?: ((prop: string) => string) | null,
  style?: React.CSSProperties,
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
        disabledLoading={this.props.disabledLoading}
        triState={propss.triState}
        checked={this.props.value}
        onChange={checked => { if (this.props.onChange) this.props.onChange(checked) }}
        leftLabel={this.props.layout === 'page'}
        style={this.props.layout === 'page' ? { marginTop: '-8px' } : {}}
        required={this.props.required}
        highlight={this.props.highlight}
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
        placeholder={this.props.label}
        disabled={this.props.disabled}
        required={this.props.layout === 'page' ? false : this.props.required}
        disabledLoading={this.props.disabledLoading}
      />
    )
  }

  renderIntInput() {
    if (this.props.minimum && this.props.maximum && this.props.maximum - this.props.minimum <= 10) {
      const items = []

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
          disabledLoading={this.props.disabledLoading}
          highlight={this.props.highlight}
          required={this.props.layout === 'page' ? false : this.props.required}
        />
      )
    }

    return (
      <Stepper
        highlight={Boolean(this.props.highlight)}
        width={this.props.width ? `${this.props.width}px` : undefined}
        value={this.props.value}
        disabled={this.props.disabled}
        disabledLoading={this.props.disabledLoading}
        onChange={value => { if (this.props.onChange) this.props.onChange(value) }}
        minimum={this.props.minimum}
        maximum={this.props.maximum}
      />
    )
  }

  renderObjectTable() {
    if (!this.props.properties || !this.props.properties.length) {
      return null
    }

    return (
      <PropertiesTable
        width={this.props.width}
        properties={this.props.properties}
        valueCallback={field => this.props.valueCallback && this.props.valueCallback(field)}
        onChange={(field, value) => {
          if (!this.props.disabled && this.props.onChange) {
            this.props.onChange(value, field)
          }
        }}
        labelRenderer={this.props.labelRenderer}
        hideRequiredSymbol={this.props.layout === 'page'}
        disabledLoading={this.props.disabledLoading}
        disabled={this.props.disabled}
      />
    )
  }

  renderTextArea() {
    return (
      <TextArea
        style={{ width: '100%' }}
        highlight={this.props.highlight}
        value={this.props.value}
        onChange={(e: { target: { value: any } }) => {
          if (this.props.onChange) this.props.onChange(e.target.value)
        }}
        placeholder={this.props.label}
        disabled={this.props.disabled}
        disabledLoading={this.props.disabledLoading}
        required={this.props.layout === 'page' ? false : this.props.required}
      />
    )
  }

  renderEnumDropdown(enumItems: EnumItem[]) {
    const useDictionary = LabelDictionary.enumFields.find(f => f === this.props.name)
    let items = enumItems.map(e => {
      if (isEnumSeparator(e)) {
        return e
      }

      return {
        label: typeof e === 'string' ? (useDictionary ? LabelDictionary.get(e) : e) : e.name || e.label,
        value: typeof e === 'string' ? e : e.id || e.value,
        disabled: typeof e !== 'string' ? Boolean(e.disabled) : false,
        subtitleLabel: typeof e !== 'string' ? e.subtitleLabel || '' : false,
      }
    })
    if (this.props.addNullValue) {
      items = [
        {
          label: 'Choose a value', value: null, disabled: false, subtitleLabel: '',
        },
        ...items,
      ]
    }

    const selectedItem = items.find(i => !isEnumSeparator(i) && i.value === this.props.value)
    const commonProps = {
      width: this.props.width,
      required: this.props.layout === 'page' ? false : this.props.required,
      selectedItem,
      items,
      disabledLoading: this.props.disabledLoading,
      disabled: this.props.disabled,
      highlight: this.props.highlight,
      onChange: (item: { value: any }) => this.props.onChange && this.props.onChange(item.value),
    }

    if (items.length < 10) {
      return (
        <Dropdown
          // eslint-disable-next-line react/jsx-props-no-spreading
          {...commonProps}
          noSelectionMessage="Choose a value"
          dimFirstItem={this.props.addNullValue}
        />
      )
    }
    return (
      <AutocompleteDropdown
        // eslint-disable-next-line react/jsx-props-no-spreading
        {...commonProps}
        dimNullValue
      />
    )
  }

  renderArrayDropdown(enumItems: EnumItem[]) {
    const items = enumItems.map(e => {
      if (isEnumSeparator(e)) {
        return e
      }

      return {
        label: typeof e === 'string' ? e : e.name || e.label,
        value: typeof e === 'string' ? e : e.id || e.value,
      }
    })
    const selectedItems = this.props.value || []
    return (
      <Dropdown
        multipleSelection
        width={this.props.width}
        disabled={this.props.disabled}
        disabledLoading={this.props.disabledLoading}
        noSelectionMessage={this.props.noSelectionMessage || 'Choose values'}
        noItemsMessage={this.props.noItemsMessage}
        items={items}
        selectedItems={selectedItems}
        onChange={item => { if (this.props.onChange) this.props.onChange(item.value) }}
        highlight={this.props.highlight}
        required={this.props.layout === 'page' ? false : this.props.required}
      />
    )
  }

  renderRadioInput() {
    return (
      <RadioInput
        checked={this.props.value}
        label={this.props.label || ''}
        onChange={checked => { if (this.props.onChange) this.props.onChange(checked) }}
        disabled={this.props.disabled}
        disabledLoading={this.props.disabledLoading}
      />
    )
  }

  renderDropdownInput() {
    if (!this.props.items) {
      return null
    }

    const items = this.props.items.map(field => ({
      value: field.name,
      label: field.label || LabelDictionary.get(field.name),
    }))
    const fieldName = this.props.value || items[0].value

    return (
      <DropdownInput
        items={items}
        selectedItem={fieldName}
        onItemChange={item => { if (this.props.onChange) this.props.onChange(item.value) }}
        inputValue={this.props.getFieldValue ? this.props.getFieldValue(fieldName) : ''}
        onInputChange={value => {
          if (this.props.onFieldChange) this.props.onFieldChange(fieldName, value)
        }}
        placeholder={this.props.label}
        highlight={this.props.highlight}
        disabled={this.props.disabled}
        disabledLoading={this.props.disabledLoading}
        required={this.props.layout === 'page' ? false : this.props.required}
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
          return this.renderEnumDropdown(this.props.enum)
        }
        if (this.props.useTextArea) {
          return this.renderTextArea()
        }
        return this.renderTextInput()
      case 'integer':
        return this.renderIntInput()
      case 'radio':
        return this.renderRadioInput()
      case 'array':
        return this.renderArrayDropdown(this.props.enum || [])
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

    const description = this.props.description
    const marginRight = this.props.layout === 'modal' || description || this.props.required ? '24px' : 0

    return (
      <Label
        layout={this.props.layout}
        disabledLoading={this.props.disabledLoading}
        width={this.props.width}
        disabled={this.props.disabled}
      >
        <LabelText style={{ marginRight }}>
          {this.props.label}
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
