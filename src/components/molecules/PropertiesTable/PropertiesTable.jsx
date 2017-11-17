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
import styled, { css } from 'styled-components'
import PropTypes from 'prop-types'

import { Switch, TextInput } from 'components'

import LabelDictionary from '../../../utils/LabelDictionary'
import Palette from '../../styleUtils/Palette'
import StyleProps from '../../styleUtils/StyleProps'

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  border: 1px solid ${Palette.grayscale[2]};
  border-radius: ${StyleProps.borderRadius};
`
const Column = styled.div`
  width: 50%;
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
    border-bottom-color: transparent;
  }
  &:first-child ${Column} {
    border-top-left-radius: ${StyleProps.borderRadius};
  }
  &:last-child ${Column} {
    border-bottom-left-radius: ${StyleProps.borderRadius};
  }
`

class PropertiesTable extends React.Component {
  static propTypes = {
    properties: PropTypes.array,
    onChange: PropTypes.func,
    valueCallback: PropTypes.func,
  }

  renderSwitch(prop) {
    return (
      <Switch
        secondary
        height={16}
        checked={this.props.valueCallback(prop)}
        onChange={checked => { this.props.onChange(prop, checked) }}
      />
    )
  }

  renderTextInput() {
    return (
      <TextInput />
    )
  }

  renderInput(prop) {
    let input = null
    switch (prop.type) {
      case 'boolean':
        input = this.renderSwitch(prop)
        break
      case 'string':
        input = this.renderTextInput(prop)
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
              <Column header>{LabelDictionary.get(prop.name)}</Column>
              <Column input>{this.renderInput(prop)}</Column>
            </Row>
          )
        })}
      </Wrapper>
    )
  }
}

export default PropertiesTable
