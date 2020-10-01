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

import Switch from '../../atoms/Switch'
import TextInput from '../../atoms/TextInput'

import LabelDictionary from '../../../utils/LabelDictionary'
import Palette from '../../styleUtils/Palette'
import StyleProps from '../../styleUtils/StyleProps'
import Dropdown from '../Dropdown'
import AutocompleteDropdown from '../AutocompleteDropdown'
import { Field, EnumItem, isEnumSeparator } from '../../../@types/Field'

const Wrapper = styled.div<any>`
  display: flex;
  ${props => (props.width ? `width: ${props.width - 2}px;` : '')}
  flex-direction: column;
  border: 1px solid ${Palette.grayscale[2]};
  border-radius: ${StyleProps.borderRadius};
  ${props => (props.disabledLoading ? StyleProps.animations.disabledLoading : '')}
`
const Column = styled.div<any>`
  ${StyleProps.exactWidth('calc(50% - 24px)')}
  height: 32px;
  padding: 0 8px 0 16px;
  display: flex;
  align-items: center;
  > span {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    min-width: 0;
  }

  ${props => (props.header ? css`
    color: ${Palette.grayscale[4]};
    background: ${Palette.grayscale[7]};
  ` : '')}
`
const Row = styled.div<any>`
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
  disabledLoading?: boolean,
  labelRenderer?: ((propName: string) => string) | null,
  width?: number,
}
@observer
class PropertiesTable extends React.Component<Props> {
  getName(propName: string): string {
    if (this.props.labelRenderer) {
      return this.props.labelRenderer(propName)
    }

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
        disabled={this.props.disabledLoading}
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
        type={prop.password ? 'password' : 'text'}
        value={this.props.valueCallback(prop)}
        onChange={e => { this.props.onChange(prop, e.target.value) }}
        placeholder={this.getName(prop.name)}
        required={typeof prop.required === 'boolean' && !this.props.hideRequiredSymbol ? prop.required : false}
        disabled={this.props.disabledLoading}
      />
    )
  }

  renderEnumDropdown(prop: Field) {
    if (!prop.enum) {
      return null
    }
    let items = prop.enum.map((e: EnumItem) => {
      if (typeof e === 'string') {
        return {
          label: this.getName(e),
          value: e,
        }
      } if (isEnumSeparator(e)) {
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

    const selectedItem = items.find(i => !i.separator && i.value === this.props.valueCallback(prop))

    const commonProps = {
      embedded: true,
      width: 320,
      selectedItem,
      items,
      disabled: this.props.disabledLoading,
      onChange: (item: { value: any }) => this.props.onChange(prop, item.value),
      required: typeof prop.required === 'boolean' && !this.props.hideRequiredSymbol ? prop.required : false,
    }
    if (items.length < 10) {
      return (
        <Dropdown
          data-test-id={`${baseId}-dropdown-${prop.name}`}
          noSelectionMessage="Choose a value"
          dimFirstItem
          // eslint-disable-next-line react/jsx-props-no-spreading
          {...commonProps}
        />
      )
    }
    return (
      <AutocompleteDropdown
        dimNullValue
        // eslint-disable-next-line react/jsx-props-no-spreading
        {...commonProps}
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
      <Wrapper disabledLoading={this.props.disabledLoading} width={this.props.width}>
        {this.props.properties.map(prop => (
          <Row key={prop.name} data-test-id={`${baseId}-row-${prop.name}`}>
            <Column header data-test-id={`${baseId}-header`}><span title={this.getName(prop.name)}>{this.getName(prop.name)}</span></Column>
            <Column input>{this.renderInput(prop)}</Column>
          </Row>
        ))}
      </Wrapper>
    )
  }
}

export default PropertiesTable
