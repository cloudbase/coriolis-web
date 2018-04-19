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
  ${StyleProps.exactWidth('calc(50% - 16px)')}
  height: 32px;
  display: flex;
  align-items: center;
  padding-left: 16px;
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

type Props = {
  properties: Field[],
  onChange: (property: Field, value: any) => void,
  valueCallback: (property: Field) => any,
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
        width="100%"
        embedded
        value={this.props.valueCallback(prop)}
        onChange={e => { this.props.onChange(prop, e.target.value) }}
        placeholder={this.getName(prop.name)}
        required={typeof prop.required === 'boolean' ? prop.required : false}
      />
    )
  }

  renderEnumDropdown(prop: Field) {
    if (!prop.enum) {
      return null
    }
    let items = prop.enum.map(e => {
      return {
        label: this.getName(e),
        value: e,
      }
    })

    items = [
      { label: 'Choose a value', value: null },
      ...items,
    ]

    let selectedItem = items.find(i => i.value === this.props.valueCallback(prop))

    return (
      <Dropdown
        width={320}
        noSelectionMessage="Choose a value"
        selectedItem={selectedItem ? selectedItem.label : null}
        items={items}
        onChange={item => this.props.onChange(prop, item.value)}
      />
    )
  }

  renderInput(prop: Field) {
    let input = null
    switch (prop.type) {
      case 'boolean':
        input = this.renderSwitch(prop, { triState: true })
        break
      case 'strict-boolean':
        input = this.renderSwitch(prop, { triState: false })
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
            <Row key={prop.name}>
              <Column header>{this.getName(prop.name)}</Column>
              <Column input>{this.renderInput(prop)}</Column>
            </Row>
          )
        })}
      </Wrapper>
    )
  }
}

export default PropertiesTable
