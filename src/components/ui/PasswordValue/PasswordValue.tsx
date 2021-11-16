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

import { ThemeProps } from '@src/components/Theme'
import eyeImage from './images/eye.svg'

const EyeIcon = styled.span`
  opacity: 0;
  width: 16px;
  height: 16px;
  display: inline-block;
  background: url('${eyeImage}') no-repeat;
  background-position-y: 2px;
  transition: all ${ThemeProps.animations.swift};
`
const Wrapper = styled.div<any>`
  cursor: ${(props: any) => (props.show ? '' : 'pointer')};
  display: inline-block;
  &:hover > ${EyeIcon} {
    opacity: 1;
  }
`
const Value = styled.span`
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  display: inline-block;
  margin-right: 4px;
`

type Props = {
  value: string,
  onShow?: () => void,
}
type State = {
  show: boolean,
}
@observer
class PasswordValue extends React.Component<Props, State> {
  state = {
    show: false,
  }

  handleShowClick() {
    if (this.props.onShow) {
      this.props.onShow()
    }
    this.setState({ show: true })
  }

  render() {
    return (
      <Wrapper onClick={() => { this.handleShowClick() }} show={this.state.show}>
        <Value data-test-id="passwordValue-value">{this.state.show ? this.props.value : '•••••••••'}</Value>
        {!this.state.show ? <EyeIcon /> : null}
      </Wrapper>
    )
  }
}

export default PasswordValue
