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

import Switch from '../../atoms/Switch'
import TextInput from '../../atoms/TextInput'
import Dropdown from '../../molecules/Dropdown'
import InfoIcon from '../../atoms/InfoIcon'
import PropertiesTable from '../../molecules/PropertiesTable'

import StyleProps from '../../styleUtils/StyleProps'
import LabelDictionary from '../../../utils/LabelDictionary'

import type { Field } from '../../../types/Field'

import asteriskImage from './images/asterisk.svg'

const getDirection = props => {
  if (props.type === 'strict-boolean' || props.type === 'boolean') {
    return 'row'
  }

  return 'column'
}
const Wrapper = styled.div`
  display: flex;
  flex-direction: ${props => getDirection(props)};
  ${props => getDirection(props) === 'row' ? '' : 'justify-content: center;'}
`
const Label = styled.div`
  font-weight: ${StyleProps.fontWeights.medium};
  ${props => getDirection(props) === 'column' ? 'margin-bottom: 8px;' : ''}
`
const LabelText = styled.span`
  margin-right: 24px;
`
const Asterisk = styled.div`
  ${StyleProps.exactSize('16px')}
  display: inline-block;
  background: url('${asteriskImage}') center no-repeat;
  margin-bottom: -3px;
  margin-left: ${props => props.marginLeft || '0px'};
`

type Props = {
  type: 'replica' | 'migration',
  name: string,
  value: any,
  onChange: (value: any) => void,
  valueCallback: (prop: Field, value: any) => void,
  className?: string,
  properties: Field[],
  enum: string[],
  required: boolean,
  width?: number,
  skipNullValue?: boolean,
}
@observer
class WizardOptionsField extends React.Component<Props> {
  renderSwitch(propss: { triState: boolean }) {
    return (
      <Switch
        width="112px"
        justifyContent="flex-end"
        triState={propss.triState}
        checked={this.props.value}
        onChange={checked => { this.props.onChange(checked) }}
        style={{ marginTop: '-8px' }}
        leftLabel
        data-test-id="wOptionsField-switch"
      />
    )
  }

  renderTextInput() {
    return (
      <TextInput
        width={`${StyleProps.inputSizes.wizard.width}px`}
        value={this.props.value}
        onChange={e => { this.props.onChange(e.target.value) }}
        placeholder={LabelDictionary.get(this.props.name)}
        data-test-id="wOptionsField-textInput"
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
        valueCallback={this.props.valueCallback}
        onChange={this.props.onChange}
        data-test-id="wOptionsField-propertiesTable"
      />
    )
  }

  renderEnumDropdown() {
    let items = this.props.enum.map(e => {
      if (typeof e !== 'string' && e.separator === true) {
        return e
      }

      return {
        label: typeof e === 'string' ? e : e.name,
        value: typeof e === 'string' ? e : e.id,
      }
    })

    if (!this.props.skipNullValue) {
      items = [
        { label: 'Choose a value', value: null },
        ...items,
      ]
    }

    let selectedItem = items.find(i => i.value === this.props.value)

    return (
      <Dropdown
        width={this.props.width || StyleProps.inputSizes.wizard.width}
        data-test-id={`wOptionsField-dropdown-${this.props.name}`}
        noSelectionMessage="Choose a value"
        selectedItem={selectedItem}
        items={items}
        onChange={item => this.props.onChange(item.value)}
      />
    )
  }

  renderField() {
    let field = null
    switch (this.props.type) {
      case 'strict-boolean':
        field = this.renderSwitch({ triState: false })
        break
      case 'boolean':
        field = this.renderSwitch({ triState: true })
        break
      case 'string':
        if (this.props.enum) {
          field = this.renderEnumDropdown()
        } else {
          field = this.renderTextInput()
        }
        break
      case 'object':
        field = this.renderObjectTable()
        break
      default:
    }

    return field
  }

  renderLabel() {
    let description = LabelDictionary.getDescription(this.props.name)
    return (
      <Label>
        <LabelText data-test-id="wOptionsField-label">
          {LabelDictionary.get(this.props.name)}
        </LabelText>
        {description ? <InfoIcon text={description} marginLeft={-20} /> : null}
        {this.props.required ? <Asterisk marginLeft={description ? '4px' : '-16px'} /> : null}
      </Label>
    )
  }

  render() {
    let field = this.renderField()

    if (!field) {
      return null
    }

    return (
      <Wrapper type={this.props.type} className={this.props.className}>
        {this.renderLabel()}
        {field}
      </Wrapper>
    )
  }
}

export default WizardOptionsField
