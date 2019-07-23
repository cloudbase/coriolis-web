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

import Switch from '../../atoms/Switch'
import TextInput from '../../atoms/TextInput'

import LabelDictionary from '../../../utils/LabelDictionary'
import Palette from '../../styleUtils/Palette'
import StyleProps from '../../styleUtils/StyleProps'
import Dropdown from '../../molecules/Dropdown'
import type { Field } from '../../../types/Field'

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  border: 1px solid ${Palette.grayscale[2]};
  border-radius: ${StyleProps.borderRadius};
`
const Column = styled.div`
  ${StyleProps.exactWidth('calc(50% - 24px)')}
  height: 32px;
  padding: 0 8px 0 16px;
  display: flex;
  align-items: center;
  ${props => props.header ? css`
    color: ${Palette.grayscale[4]};
    background: ${Palette.grayscale[7]};
  ` : ''}
`
const Row = styled.div`
  display: flex;
  align-items: center;
  border-bottom: 1px solid ${Palette.grayscale[2]};
  &:last-child {
    border-bottom: 0;
  }
  &:first-child ${Column} {
    border-top-left-radius: ${StyleProps.borderRadius};
  }
  &:last-child ${Column} {
    border-bottom-left-radius: ${StyleProps.borderRadius};
  }
`
const baseId = 'propertiesTable'
type Props = {
  properties: Field[],
  onChange: (property: Field, value: any) => void,
  valueCallback: (property: Field) => any,
  hideRequiredSymbol?: boolean,
}
@observer
class PropertiesTable extends React.Component<Props> {
  getName(propName: string): string {
    if (propName.indexOf('/') > -1) {
      return LabelDictionary.get(propName.substr(propName.lastIndexOf('/') + 1))
    }
    return LabelDictionary.get(propName)
  }

  renderSwitch(prop: Field, opts: { triState: boolean }) {
    return (
      <Switch
        data-test-id={`${baseId}-switch-${prop.name}`}
        secondary
        triState={opts.triState}
        height={16}
        checked={this.props.valueCallback(prop)}
        onChange={checked => { this.props.onChange(prop, checked) }}
      />
    )
  }

  renderTextInput(prop: Field) {
    return (
      <TextInput
        data-test-id={`${baseId}-textInput-${prop.name}`}
        width="100%"
        embedded
        value={this.props.valueCallback(prop)}
        onChange={e => { this.props.onChange(prop, e.target.value) }}
        placeholder={this.getName(prop.name)}
        required={typeof prop.required === 'boolean' && !this.props.hideRequiredSymbol ? prop.required : false}
      />
    )
  }

  renderEnumDropdown(prop: Field) {
    if (!prop.enum) {
      return null
    }
    let items = prop.enum.map(e => {
      if (typeof e === 'string') {
        return {
          label: this.getName(e),
          value: e,
        }
      } else if (e.separator === true) {
        return { separator: true }
      }
      return {
        label: e.name,
        value: e.id,
      }
    })

    items = [
      { label: 'Choose a value', value: null },
      ...items,
    ]

    let selectedItem = items.find(i => !i.separator && i.value === this.props.valueCallback(prop))

    return (
      <Dropdown
        embedded
        data-test-id={`${baseId}-dropdown-${prop.name}`}
        width={320}
        noSelectionMessage="Choose a value"
        selectedItem={selectedItem}
        items={items}
        onChange={item => this.props.onChange(prop, item.value)}
        required={typeof prop.required === 'boolean' && !this.props.hideRequiredSymbol ? prop.required : false}
      />
    )
  }

  renderInput(prop: Field) {
    let input = null
    switch (prop.type) {
      case 'boolean':
        input = this.renderSwitch(prop, { triState: Boolean(prop.nullableBoolean) })
        break
      case 'string':
        if (prop.enum) {
          input = this.renderEnumDropdown(prop)
        } else {
          input = this.renderTextInput(prop)
        }
        break
      default:
    }

    return input
  }

  render() {
    return (
      <Wrapper>
        {this.props.properties.map(prop => {
          return (
            <Row key={prop.name} data-test-id={`${baseId}-row-${prop.name}`}>
              <Column header data-test-id={`${baseId}-header`}>{this.getName(prop.name)}</Column>
              <Column input>{this.renderInput(prop)}</Column>
            </Row>
          )
        })}
      </Wrapper>
    )
  }
}

export default PropertiesTable
