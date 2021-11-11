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
import styled from 'styled-components'

import DropdownLink from '@src/components/ui/Dropdowns/DropdownLink'
import TextInput from '@src/components/ui/TextInput'

import { ThemePalette, ThemeProps } from '@src/components/Theme'

import arrowImage from './images/arrow'
import requiredImage from './images/required.svg'

const Wrapper = styled.div<any>`
  display: flex;
  align-items: center;
  border: 1px solid ${(props: any) => (props.disabled ? ThemePalette.grayscale[0] : props.highlight ? ThemePalette.alert : ThemePalette.grayscale[3])};
  border-radius: ${ThemeProps.borderRadius};
  height: ${ThemeProps.inputSizes.regular.height - 2}px;
  position: relative;
`
const Required = styled.div<any>`
  position: absolute;
  width: 8px;
  height: 8px;
  right: -16px;
  top: 12px;
  background: url('${requiredImage}') center no-repeat;
`
const linkButtonStyle = (props: any) => ({
  width: '60px',
  height: '14px',
  padding: '8px',
  background: props.disabled ? ThemePalette.grayscale[0] : ThemePalette.grayscale[1],
  borderTopLeftRadius: ThemeProps.borderRadius,
  borderBottomLeftRadius: ThemeProps.borderRadius,
  justifyContent: 'center',
})
type ItemType = {
  label: string,
  value: string,
  [other: string]: any,
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
  disabledLoading?: boolean,
  required?: boolean,
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
        {this.props.required ? <Required /> : null}
      </Wrapper>
    )
  }
}

export default DropdownInput
