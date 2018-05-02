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

import DropdownLink from '../DropdownLink'
import TextInput from '../../atoms/TextInput'

import Palette from '../../styleUtils/Palette'
import StyleProps from '../../styleUtils/StyleProps'

import arrowImage from './images/arrow'

const Wrapper = styled.div`
  display: flex;
  align-items: center;
  border: 1px solid ${props => props.disabled ? Palette.grayscale[0] : props.highlight ? Palette.alert : Palette.grayscale[3]};
  border-radius: ${StyleProps.borderRadius};
  height: ${StyleProps.inputSizes.regular.height - 2}px;
`
const linkButtonStyle = props => {
  return {
    width: '60px',
    height: '14px',
    padding: '8px',
    background: props.disabled ? Palette.grayscale[0] : Palette.grayscale[1],
    borderTopLeftRadius: StyleProps.borderRadius,
    borderBottomLeftRadius: StyleProps.borderRadius,
    justifyContent: 'center',
  }
}
type ItemType = {
  label: string,
  value: string,
  [string]: any,
}
type Props = {
  items: ItemType[],
  selectedItem: string,
  onItemChange: (item: ItemType) => void,
  inputValue: string,
  onInputChange: (value: string) => void,
  placeholder?: string,
  highlight?: boolean,
  disabled?: boolean,
}
type State = {}
@observer
class DropdownInput extends React.Component<Props, State> {
  render() {
    return (
      <Wrapper highlight={this.props.highlight} disabled={this.props.disabled}>
        <DropdownLink
          linkButtonStyle={linkButtonStyle(this.props)}
          items={this.props.items}
          selectedItem={this.props.selectedItem}
          onChange={this.props.onItemChange}
          listWidth="auto"
          secondary
          disabled={this.props.disabled}
          arrowImage={arrowImage}
        />
        <TextInput
          embedded
          width="146px"
          style={{ paddingLeft: '8px', height: '30px' }}
          value={this.props.inputValue}
          onChange={e => { this.props.onInputChange(e.target.value) }}
          placeholder={this.props.placeholder}
          disabled={this.props.disabled}
        />
      </Wrapper>
    )
  }
}

export default DropdownInput
