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

import * as React from 'react'
import { observer } from 'mobx-react'
import styled, { css } from 'styled-components'

import { ThemePalette, ThemeProps } from '@src/components/Theme'

import checkmarkImage from './images/checkmark.svg'

const CheckmarkImage = styled.div<any>`
  width: 10px;
  height: 7px;
  background: url('${checkmarkImage}') no-repeat center;
  transform: scale(0);
  transition: transform 250ms cubic-bezier(0, 1.4, 1, 1);
`
const Wrapper = styled.div<any>`
  display: flex;
  ${(props: any) => (props.disabled ? '' : 'cursor: pointer;')}
  ${(props: any) => (props.disabled ? 'opacity: 0.9;' : '')}
  justify-content: center;
  align-items: center;
  ${ThemeProps.exactSize('16px')}
  border: 1px solid ${ThemePalette.grayscale[3]};
  border-radius: 3px;
  background: white;
  transition: all ${ThemeProps.animations.swift};
  ${(props: any) => (props.checked ? css`
    border-color: ${ThemePalette.primary};
    background: ${ThemePalette.primary};
    ${CheckmarkImage} {
      transform: scale(1);
    }
  ` : '')}
  :focus {
    border: 1px solid ${ThemePalette.primary};
    outline: none;
  }
`

type Props = {
  className?: string,
  checked?: boolean,
  disabled?: boolean,
  onChange?: (checked: boolean) => void,
  'data-test-id'?: string,
  onMouseDown?: (e: React.MouseEvent<HTMLDivElement>) => void,
  onMouseUp?: (e: React.MouseEvent<HTMLDivElement>) => void,
}
@observer
class Checkbox extends React.Component<Props> {
  handleClick() {
    if (this.props.disabled || !this.props.onChange) {
      return
    }

    this.props.onChange(!this.props.checked)
  }

  handleKeyDown(e: React.KeyboardEvent<HTMLDivElement>) {
    if (e.key !== ' ') {
      return
    }
    e.preventDefault()
    this.handleClick()
  }

  render() {
    return (
      <Wrapper
        data-test-id={this.props['data-test-id'] || 'checkbox'}
        className={this.props.className}
        onClick={() => { this.handleClick() }}
        checked={this.props.checked}
        disabled={this.props.disabled}
        tabIndex={0}
        onKeyDown={(e: React.KeyboardEvent<HTMLDivElement>) => { this.handleKeyDown(e) }}
        onMouseDown={this.props.onMouseDown}
        onMouseUp={this.props.onMouseUp}
      >
        <CheckmarkImage />
      </Wrapper>
    )
  }
}

export default Checkbox
