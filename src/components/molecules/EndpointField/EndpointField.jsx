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
import styled from 'styled-components'
import PropTypes from 'prop-types'

import { Switch, TextInput, Dropdown, RadioInput, InfoIcon } from 'components'

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

class Field extends React.Component {
  static propTypes = {
    name: PropTypes.string,
    type: PropTypes.string,
    value: PropTypes.any,
    onChange: PropTypes.func,
    className: PropTypes.string,
    minimum: PropTypes.number,
    maximum: PropTypes.number,
    password: PropTypes.bool,
    required: PropTypes.bool,
    large: PropTypes.bool,
    highlight: PropTypes.bool,
    disabled: PropTypes.bool,
  }

  renderSwitch() {
    return (
      <Switch
        disabled={this.props.disabled}
        checked={this.props.value}
        onChange={checked => { this.props.onChange(checked) }}
      />
    )
  }

  renderTextInput() {
    return (
      <TextInput
        required={this.props.required}
        highlight={this.props.highlight}
        type={this.props.password ? 'password' : 'text'}
        large={this.props.large}
        value={this.props.value}
        onChange={e => { this.props.onChange(e.target.value) }}
        placeholder={LabelDictionary.get(this.props.name)}
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
        large={this.props.large}
        selectedItem={this.props.value}
        items={items}
        onChange={item => this.props.onChange(item.value)}
        disabled={this.props.disabled}
      />
    )
  }

  renderRadioInput() {
    return (
      <RadioInput
        checked={this.props.value}
        label={LabelDictionary.get(this.props.name)}
        onChange={e => this.props.onChange(e.target.checked)}
        disabled={this.props.disabled}
      />
    )
  }

  renderInput() {
    switch (this.props.type) {
      case 'boolean':
        return this.renderSwitch()
      case 'string':
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
        <LabelText>{LabelDictionary.get(this.props.name)}</LabelText>
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
