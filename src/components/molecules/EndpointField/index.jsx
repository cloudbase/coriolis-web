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
  margin-bottom: 4px;
`
const LabelText = styled.span`
  margin-right: 24px;
`

type Props = {
  name: string,
  type: string,
  value: any,
  onChange?: (value: any) => void,
  getFieldValue?: (fieldName: string) => string,
  onFieldChange?: (fieldName: string, fieldValue: string) => void,
  className?: string,
  minimum: number,
  maximum: number,
  password: boolean,
  required: boolean,
  large: boolean,
  highlight: boolean,
  disabled: boolean,
  enum?: string[],
  items?: FieldType[],
}
@observer
class Field extends React.Component<Props> {
  renderSwitch() {
    return (
      <Switch
        data-test-id={`endpointField-switch-${this.props.name}`}
        disabled={this.props.disabled}
        checked={this.props.value || false}
        onChange={checked => { if (this.props.onChange) this.props.onChange(checked) }}
      />
    )
  }

  renderTextInput() {
    return (
      <TextInput
        data-test-id={`endpointField-textInput-${this.props.name}`}
        required={this.props.required}
        highlight={this.props.highlight}
        type={this.props.password ? 'password' : 'text'}
        large={this.props.large}
        value={this.props.value}
        onChange={e => { if (this.props.onChange) this.props.onChange(e.target.value) }}
        placeholder={LabelDictionary.get(this.props.name)}
        disabled={this.props.disabled}
      />
    )
  }

  renderEnumDropdown() {
    if (!this.props.enum) {
      return null
    }

    let items = this.props.enum.map(e => {
      return {
        label: LabelDictionary.get(e),
        value: e,
      }
    })
    let selectedItem = items.find(i => i.value === this.props.value)

    return (
      <Dropdown
        data-test-id={`endpointField-dropdown-${this.props.name}`}
        large={this.props.large}
        selectedItem={selectedItem}
        items={items}
        onChange={item => { if (this.props.onChange) this.props.onChange(item.value) }}
        disabled={this.props.disabled}
      />
    )
  }

  renderIntDropdown() {
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

    return (
      <DropdownInput
        items={items}
        selectedItem={this.props.value}
        onItemChange={item => { if (this.props.onChange) this.props.onChange(item.value) }}
        inputValue={this.props.getFieldValue ? this.props.getFieldValue(this.props.value) : ''}
        onInputChange={value => { if (this.props.onFieldChange) this.props.onFieldChange(this.props.value, value) }}
        placeholder={LabelDictionary.get(this.props.value)}
        required={this.props.required}
        highlight={this.props.highlight}
        disabled={this.props.disabled}
      />
    )
  }

  renderInput() {
    switch (this.props.type) {
      case 'input-choice':
        return this.renderDropdownInput()
      case 'boolean':
        return this.renderSwitch()
      case 'string':
        if (this.props.enum) {
          return this.renderEnumDropdown()
        }
        return this.renderTextInput()
      case 'integer':
        if (this.props.minimum || this.props.maximum) {
          return this.renderIntDropdown()
        }
        return this.renderTextInput()
      case 'radio':
        return this.renderRadioInput()
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
      infoIcon = <InfoIcon text={description} marginLeft={-20} />
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
      <Wrapper className={this.props.className}>
        {this.renderLabel()}
        {this.renderInput()}
      </Wrapper>
    )
  }
}

export default Field
